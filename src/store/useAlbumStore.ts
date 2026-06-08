import { create } from 'zustand';
import type { Page, Slot, Sticker, AlbumConfig } from '../types';
import { db } from './db';
import { buildDefaultPages, buildDefaultSlots } from '../utils/albumBuilder';
import { v4 as uuidv4 } from 'uuid';

interface AlbumState {
  albumConfig: AlbumConfig;
  currentPageIndex: number;
  pages: Page[];
  slots: Slot[];
  stickers: Sticker[];
  isLoaded: boolean;
  presentationInterval: number; // in seconds
  presentationStickerTime: number; // tempo da figurinha na tela em segundos
  presentationAnimationSpeed: number; // velocidade do giro em segundos
  manualZoomTime: number; // tempo que o zoom manual (ao clicar) fica na tela (0 = infinito)
  presentationStickerScale: number; // tamanho da figurinha na apresentacao (1 = 100%)
  presentationStickerInterval: number; // tempo de espera entre o fim de uma e o comeco de outra
  presentationPackTime: number; // tempo de suspense exibindo o pacote antes de virar
  isPresentationPaused: boolean; // se a apresentacao esta pausada devido ao zoom manual

  setAlbumConfig: (config: AlbumConfig) => void;
  createOrUpdateAlbum: (config: AlbumConfig) => Promise<void>;
  setCurrentPage: (index: number) => void;
  setPresentationInterval: (seconds: number) => void;
  setPresentationStickerTime: (seconds: number) => void;
  setPresentationAnimationSpeed: (seconds: number) => void;
  setManualZoomTime: (seconds: number) => void;
  setPresentationStickerScale: (scale: number) => void;
  setPresentationStickerInterval: (seconds: number) => void;
  setPresentationPackTime: (seconds: number) => void;
  setIsPresentationPaused: (paused: boolean) => void;
  loadAlbum: () => Promise<void>;
  addStickers: (files: FileList) => Promise<void>;
  moveStickerToSlot: (stickerId: string, slotId: string | null) => Promise<void>;
  updateSlot: (slotId: string, partial: Partial<Slot>) => void;
  updatePage: (pageId: string, partial: Partial<Page>) => void;
  autoFillCurrentSpread: (slotIds: string[]) => Promise<void>;
  randomizeRarities: () => Promise<void>;
  resetRarities: () => Promise<void>;
  setStickerRarity: (id: string, rarity: Sticker['rarity']) => Promise<void>;
  deleteSticker: (id: string) => Promise<void>;
  unstickAllStickers: () => Promise<void>;
  deleteAllStickers: () => Promise<void>;
  deleteUnplacedStickers: () => Promise<void>;
  exportToJson: () => Promise<void>;
  importFromJson: (file: File) => Promise<void>;
  loadAlbumById: (id: string) => Promise<void>;
}

const migrateAndFilterStickers = async (albumId: string) => {
  const allStickers = await db.stickers.toArray();
  const needsMigration = allStickers.filter(s => !s.albumId);
  if (needsMigration.length > 0) {
    const migrated = needsMigration.map(s => ({ ...s, albumId }));
    await db.stickers.bulkPut(migrated);
    allStickers.forEach(s => { if (!s.albumId) s.albumId = albumId; });
  }
  const validStickers = allStickers.filter(s => s.albumId === albumId);
  const stickersToMigrateLandscape = validStickers.filter(s => s.isLandscape === undefined && (s.imageBlob || s.imageBase64));
  if (stickersToMigrateLandscape.length > 0) {
    await Promise.all(stickersToMigrateLandscape.map(s => {
      return new Promise<void>((resolve) => {
        const url = s.imageBlob ? URL.createObjectURL(s.imageBlob) : s.imageBase64;
        const img = new Image();
        img.onload = () => {
          s.isLandscape = img.width > img.height;
          resolve();
        };
        img.onerror = () => {
          s.isLandscape = false;
          resolve();
        };
        img.src = url;
      });
    }));
    await db.stickers.bulkPut(stickersToMigrateLandscape);
  }

  return validStickers.map(s => {
    if (s.imageBlob && !s.imageObjectUrl) {
      s.imageObjectUrl = URL.createObjectURL(s.imageBlob);
    }
    return s;
  });
};

const compressImage = (file: File, maxWidth = 800): Promise<{ blob: Blob, isLandscape: boolean, base64: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const isLandscape = img.width > img.height;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const base64 = canvas.toDataURL('image/webp', 0.85);
            resolve({ blob, isLandscape, base64 });
          } else {
            reject(new Error('Falha na compressão da imagem'));
          }
        }, 'image/webp', 0.85);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const initialConfig: AlbumConfig = {
  id: 'album-001',
  themeName: 'copa2026',
  albumName: 'Álbum Digital da Copa do Mundo SENAI',
  totalPages: 4,
  stickersPerPage: 9,
  bgStyle: '#eadecb',
  bgImage: null,
  borderStyle: 'modern',
  stickerSize: 'medium',
  includeCover: true,
  includeBackCover: true,
  includeIntro: true,
  includeClassPage: true,
  includeLabsPage: true,
  includeCoordPage: true,
  includeEndPage: true,
  pageNames: ['Alunos 1-5', 'Alunos 6-10', 'Alunos 11-15', 'Alunos 16-20'],
};

export const defaultConfig: AlbumConfig = {
  id: 'album-default',
  themeName: 'copa2026',
  albumName: '',
  totalPages: 4,
  stickersPerPage: 9,
  bgStyle: '#eadecb',
  bgImage: null,
  borderStyle: 'none',
  stickerSize: 'medium',
  includeCover: true,
  includeBackCover: true,
  includeIntro: true,
  includeClassPage: true,
  includeLabsPage: true,
  includeCoordPage: true,
  includeEndPage: true,
  pageNames: ['Seleção Brasileira', 'Argentina', 'Alemanha', 'França']
};

export const useAlbumStore = create<AlbumState>((set, get) => ({
  albumConfig: initialConfig,
  currentPageIndex: 0,
  pages: [],
  slots: [],
  stickers: [],
  isLoaded: false,
  presentationInterval: 20,
  presentationStickerTime: 10,
  presentationAnimationSpeed: 3,
  manualZoomTime: 10, // 0 = manual, só fecha no clique
  presentationStickerScale: 1,
  presentationStickerInterval: 2,
  presentationPackTime: 1.5,
  isPresentationPaused: false,

  setAlbumConfig: (config: AlbumConfig) => set({ albumConfig: config }),
  setIsPresentationPaused: (paused: boolean) => set({ isPresentationPaused: paused }),
  
  createOrUpdateAlbum: async (config) => {
    // Salva/Atualiza o config específico
    await db.config.put(config);
    localStorage.setItem('activeAlbumId', config.id);

    // Encontra as páginas antigas deste álbum e seus respectivos slots
    const oldPages = await db.pages.where('albumId').equals(config.id).toArray();
    const oldPageIds = oldPages.map(p => p.id);
    
    if (oldPageIds.length > 0) {
      const oldSlots = await db.slots.where('pageId').anyOf(oldPageIds).toArray();
      await db.slots.bulkDelete(oldSlots.map(s => s.id));
      await db.pages.bulkDelete(oldPageIds);
    }

    const pages = buildDefaultPages(config);
    const slots = buildDefaultSlots(pages, config);

    await db.pages.bulkAdd(pages);
    await db.slots.bulkAdd(slots);

    const stickers = await migrateAndFilterStickers(config.id);

    set({ albumConfig: config, pages, slots, currentPageIndex: 0, stickers });
  },

  setCurrentPage: (index: number) => set({ currentPageIndex: index }),

  setPresentationInterval: async (seconds: number) => {
    set({ presentationInterval: seconds });
    const config = { ...get().albumConfig, presentationInterval: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setPresentationStickerTime: async (seconds: number) => {
    set({ presentationStickerTime: seconds });
    const config = { ...get().albumConfig, presentationStickerTime: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setPresentationAnimationSpeed: async (seconds: number) => {
    set({ presentationAnimationSpeed: seconds });
    const config = { ...get().albumConfig, presentationAnimationSpeed: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setManualZoomTime: async (seconds: number) => {
    set({ manualZoomTime: seconds });
    const config = { ...get().albumConfig, manualZoomTime: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setPresentationStickerScale: async (scale: number) => {
    set({ presentationStickerScale: scale });
    const config = { ...get().albumConfig, presentationStickerScale: scale };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setPresentationStickerInterval: async (seconds: number) => {
    set({ presentationStickerInterval: seconds });
    const config = { ...get().albumConfig, presentationStickerInterval: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },
  setPresentationPackTime: async (seconds: number) => {
    set({ presentationPackTime: seconds });
    const config = { ...get().albumConfig, presentationPackTime: seconds };
    set({ albumConfig: config });
    await db.config.put(config);
  },

  loadAlbumById: async (id: string) => {
    const config = await db.config.get(id);
    if (config) {
      localStorage.setItem('activeAlbumId', config.id);
      const pages = await db.pages.where('albumId').equals(id).sortBy('order');
      const pageIds = pages.map(p => p.id);
      const slots = pageIds.length > 0 ? await db.slots.where('pageId').anyOf(pageIds).toArray() : [];
      const stickers = await migrateAndFilterStickers(id);
      set({ 
        albumConfig: config, 
        pages, 
        slots, 
        stickers, 
        isLoaded: true, 
        currentPageIndex: 0,
        presentationInterval: config.presentationInterval ?? 20,
        presentationStickerTime: config.presentationStickerTime ?? 10,
        presentationAnimationSpeed: config.presentationAnimationSpeed ?? 3,
        manualZoomTime: config.manualZoomTime ?? 10,
        presentationStickerScale: config.presentationStickerScale ?? 1,
        presentationStickerInterval: config.presentationStickerInterval ?? 2,
        presentationPackTime: config.presentationPackTime ?? 1.5
      });
    }
  },

  loadAlbum: async () => {
    // Carrega o primeiro álbum se houver algum, para manter compatibilidade com o startup
    const configs = await db.config.toArray();
    if (configs.length > 0) {
      const activeId = localStorage.getItem('activeAlbumId');
      const config = configs.find(c => c.id === activeId) || configs[configs.length - 1];
      const pages = await db.pages.where('albumId').equals(config.id).sortBy('order');
      const pageIds = pages.map(p => p.id);
      const slots = pageIds.length > 0 ? await db.slots.where('pageId').anyOf(pageIds).toArray() : [];
      const stickers = await migrateAndFilterStickers(config.id);
      set({ 
        albumConfig: config, 
        pages, 
        slots, 
        stickers, 
        isLoaded: true,
        presentationInterval: config.presentationInterval ?? 20,
        presentationStickerTime: config.presentationStickerTime ?? 10,
        presentationAnimationSpeed: config.presentationAnimationSpeed ?? 3,
        manualZoomTime: config.manualZoomTime ?? 10,
        presentationStickerScale: config.presentationStickerScale ?? 1,
        presentationStickerInterval: config.presentationStickerInterval ?? 2,
        presentationPackTime: config.presentationPackTime ?? 1.5
      });
    } else {
      const stickers = await migrateAndFilterStickers(defaultConfig.id);
      set({ albumConfig: defaultConfig, pages: [], slots: [], stickers, isLoaded: true });
    }
  },

  addStickers: async (files: FileList) => {
    const newStickers: Sticker[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { blob, isLandscape, base64 } = await compressImage(file);

      newStickers.push({
        id: uuidv4(),
        albumId: get().albumConfig.id,
        imageBase64: base64,
        imageBlob: blob,
        rarity: 'common',
        isLandscape,
        createdAt: Date.now(),
      });
    }

    await db.stickers.bulkAdd(newStickers);
    set({ stickers: await migrateAndFilterStickers(get().albumConfig.id) });
  },

  moveStickerToSlot: async (stickerId: string, targetSlotId: string | null) => {
    const state = get();
    const sourceSlot = state.slots.find(s => s.stickerId === stickerId);
    const targetSlot = targetSlotId ? state.slots.find(s => s.id === targetSlotId) : null;
    
    // Se jogar no mesmo lugar, não faz nada
    if (sourceSlot && sourceSlot.id === targetSlotId) return;

    // Figurinha que já estava no alvo (se houver) vai para a origem (swap)
    const targetStickerId = targetSlot ? targetSlot.stickerId : null;

    const updatedSlots = state.slots.map(slot => {
      if (sourceSlot && slot.id === sourceSlot.id) {
        return { ...slot, stickerId: targetStickerId, rotation: 0 };
      }
      if (targetSlotId && slot.id === targetSlotId) {
        return { ...slot, stickerId, rotation: 0 }; // Reseta a rotação ao mover
      }
      return slot;
    });

    await db.transaction('rw', db.slots, async () => {
      const slotsToUpdate = updatedSlots.filter(s => 
        (sourceSlot && s.id === sourceSlot.id) || 
        (targetSlotId && s.id === targetSlotId)
      );
      for (const s of slotsToUpdate) await db.slots.put(s);
    });

    set({ slots: updatedSlots });
  },

  updateSlot: (slotId: string, partial: Partial<Slot>) => {
    const state = get();
    const updatedSlots = state.slots.map(slot => slot.id === slotId ? { ...slot, ...partial } : slot);
    db.slots.update(slotId, partial);
    set({ slots: updatedSlots });
  },

  updatePage: (pageId: string, partial: Partial<Page>) => {
    const state = get();
    const updatedPages = state.pages.map(page => page.id === pageId ? { ...page, ...partial } : page);
    db.pages.update(pageId, partial);
    set({ pages: updatedPages });
  },

  autoFillCurrentSpread: async (slotIds: string[]) => {
    const state = get();
    const unplacedStickers = state.stickers.filter(s => !state.slots.some(slot => slot.stickerId === s.id));
    
    let stickerIndex = 0;
    const updatedSlots = state.slots.map(slot => {
      if (slotIds.includes(slot.id) && slot.stickerId === null && stickerIndex < unplacedStickers.length) {
        const s = { ...slot, stickerId: unplacedStickers[stickerIndex].id, playerName: unplacedStickers[stickerIndex].playerName || slot.playerName };
        stickerIndex++;
        return s;
      }
      return slot;
    });

    await db.transaction('rw', db.slots, async () => {
      const slotsToUpdate = updatedSlots.filter(s => slotIds.includes(s.id));
      for (const s of slotsToUpdate) await db.slots.put(s);
    });

    set({ slots: updatedSlots });
  },

  randomizeRarities: async () => {
    const state = get();
    // Filtra apenas as figurinhas que estão no estoque (não colocadas no álbum)
    const unplacedStickers = state.stickers.filter(s => !state.slots.some(slot => slot.stickerId === s.id));
    const total = unplacedStickers.length;
    
    if (total === 0) return;

    const updatedStickers = state.stickers.map((sticker) => {
      // Se a figurinha não estiver no álbum (estiver no estoque), aplicamos a nova raridade
      if (unplacedStickers.some(s => s.id === sticker.id)) {
        const rand = Math.random();
        let newRarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' = 'common';
        
        // 15% Ouro, 20% Prata, 25% Bronze, 20% Roxa, 20% Comum
        if (rand < 0.15) newRarity = 'mythic';
        else if (rand < 0.35) newRarity = 'legendary';
        else if (rand < 0.60) newRarity = 'epic';
        else if (rand < 0.80) newRarity = 'rare';
        else newRarity = 'common';
        
        return { ...sticker, rarity: newRarity };
      }
      // Se já estiver no álbum, mantém a raridade original intocada
      return sticker;
    });

    await db.stickers.bulkPut(updatedStickers);
    set({ stickers: updatedStickers });
  },

  resetRarities: async () => {
    const state = get();
    const unplacedStickers = state.stickers.filter(s => !state.slots.some(slot => slot.stickerId === s.id));
    
    if (unplacedStickers.length === 0) return;

    const updatedStickers = state.stickers.map(sticker => {
      if (unplacedStickers.some(s => s.id === sticker.id)) {
        return { ...sticker, rarity: 'common' as const };
      }
      return sticker;
    });

    await db.stickers.bulkPut(updatedStickers);
    set({ stickers: updatedStickers });
  },

  setStickerRarity: async (id: string, rarity: Sticker['rarity']) => {
    const state = get();
    const sticker = state.stickers.find(s => s.id === id);
    if (sticker && sticker.rarity !== rarity) {
      const updatedSticker = { ...sticker, rarity };
      await db.stickers.put(updatedSticker);
      set({ stickers: state.stickers.map(s => s.id === id ? updatedSticker : s) });
    }
  },

  deleteSticker: async (id: string) => {
    const state = get();
    await db.stickers.delete(id);
    
    const updatedSlots = state.slots.map(slot => slot.stickerId === id ? { ...slot, stickerId: null, rotation: 0 } : slot);
    if (state.slots.some(slot => slot.stickerId === id)) {
      await db.transaction('rw', db.slots, async () => {
        for (const s of updatedSlots) await db.slots.put(s);
      });
    }

    set({ 
      stickers: state.stickers.filter(s => s.id !== id),
      slots: updatedSlots
    });
  },

  unstickAllStickers: async () => {
    const state = get();
    const updatedSlots = state.slots.map(slot => ({ ...slot, stickerId: null, rotation: 0 }));
    await db.transaction('rw', db.slots, async () => {
      for (const s of updatedSlots) await db.slots.put(s);
    });
    set({ slots: updatedSlots });
  },

  deleteAllStickers: async () => {
    const state = get();
    // Remove from DB
    await db.transaction('rw', db.stickers, db.slots, async () => {
      const stickersToDelete = state.stickers.map(s => s.id);
      await db.stickers.bulkDelete(stickersToDelete);
      
      const updatedSlots = state.slots.map(slot => ({ ...slot, stickerId: null, rotation: 0 }));
      for (const s of updatedSlots) await db.slots.put(s);
      
      set({ stickers: [], slots: updatedSlots });
    });
  },

  deleteUnplacedStickers: async () => {
    const state = get();
    await db.transaction('rw', db.stickers, async () => {
      // Pega todos os IDs de figurinhas que estão atualmente coladas em algum slot
      const placedStickerIds = new Set(state.slots.filter(s => s.stickerId !== null).map(s => s.stickerId));
      
      // Filtra as figurinhas que não estão coladas
      const stickersToDelete = state.stickers.filter(s => !placedStickerIds.has(s.id)).map(s => s.id);
      
      if (stickersToDelete.length > 0) {
        await db.stickers.bulkDelete(stickersToDelete);
        
        // Atualiza o estado apenas com as figurinhas que estão coladas
        const updatedStickers = state.stickers.filter(s => placedStickerIds.has(s.id));
        set({ stickers: updatedStickers });
      }
    });
  },

  exportToJson: async () => {
    const state = get();
    const data = {
      config: state.albumConfig,
      pages: state.pages,
      slots: state.slots,
      stickers: state.stickers
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${state.albumConfig.albumName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importFromJson: async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.config && data.pages && data.slots && data.stickers) {
        const albumId = data.config.id;
        
        await db.transaction('rw', db.config, db.pages, db.slots, db.stickers, async () => {
          const oldPages = await db.pages.where('albumId').equals(albumId).toArray();
          const oldPageIds = oldPages.map(p => p.id);
          
          if (oldPageIds.length > 0) {
            const oldSlots = await db.slots.where('pageId').anyOf(oldPageIds).toArray();
            await db.slots.bulkDelete(oldSlots.map(s => s.id));
          }
          await db.pages.where('albumId').equals(albumId).delete();
          
          const allStickers = await db.stickers.toArray();
          const oldStickers = allStickers.filter(s => s.albumId === albumId);
          await db.stickers.bulkDelete(oldStickers.map(s => s.id));
          
          await db.config.delete(albumId);

          await db.config.put(data.config);
          localStorage.setItem('activeAlbumId', data.config.id);
          await db.pages.bulkPut(data.pages);
          await db.slots.bulkPut(data.slots);
          await db.stickers.bulkPut(data.stickers);
        });

        set({ 
          albumConfig: data.config, 
          pages: data.pages, 
          slots: data.slots, 
          stickers: data.stickers,
          currentPageIndex: 0,
          presentationInterval: data.config.presentationInterval ?? 20,
          presentationStickerTime: data.config.presentationStickerTime ?? 10,
          presentationAnimationSpeed: data.config.presentationAnimationSpeed ?? 3,
          manualZoomTime: data.config.manualZoomTime ?? 10,
          presentationStickerScale: data.config.presentationStickerScale ?? 1,
          presentationStickerInterval: data.config.presentationStickerInterval ?? 2,
          presentationPackTime: data.config.presentationPackTime ?? 1.5
        });
      } else {
        alert("Arquivo JSON inválido ou corrompido.");
      }
    } catch (e) {
      alert("Erro ao ler arquivo JSON.");
      console.error(e);
    }
  }
}));
