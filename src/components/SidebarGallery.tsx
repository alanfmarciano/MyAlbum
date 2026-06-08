import { StickerCard } from './StickerCard';

import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useAlbumStore } from '../store/useAlbumStore';

export function SidebarGallery({ currentSpreadIndex = 0 }: { currentSpreadIndex?: number }) {
  const addStickers = useAlbumStore(state => state.addStickers);
  const autoFillCurrentSpread = useAlbumStore(state => state.autoFillCurrentSpread);
  const randomizeRarities = useAlbumStore(state => state.randomizeRarities);
  const resetRarities = useAlbumStore(state => state.resetRarities);
  const unstickAllStickers = useAlbumStore(state => state.unstickAllStickers);
  const deleteUnplacedStickers = useAlbumStore(state => state.deleteUnplacedStickers);
  const slots = useAlbumStore(state => state.slots);
  const pages = useAlbumStore(state => state.pages);
  const stickers = useAlbumStore(state => state.stickers);
  
  const unplacedStickers = stickers
    .filter(s => !slots.some(slot => slot.stickerId === s.id))
    .sort((a, b) => {
      const aLand = a.isLandscape ? 1 : 0;
      const bLand = b.isLandscape ? 1 : 0;
      if (aLand !== bLand) return aLand - bLand;
      return b.createdAt - a.createdAt;
    });

  // A galeria também é um lugar onde podemos "soltar" a figurinha de volta
  const { isOver, setNodeRef } = useDroppable({
    id: 'gallery-droppable',
    data: { type: 'Gallery' }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addStickers(e.target.files);
    }
  };

  const handleAutoFill = () => {
    const leftPageIndex = currentSpreadIndex === 0 ? -1 : (currentSpreadIndex * 2) - 1;
    const rightPageIndex = currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2;
    const leftPage = leftPageIndex >= 0 && leftPageIndex < pages.length ? pages[leftPageIndex] : null;
    const rightPage = rightPageIndex >= 0 && rightPageIndex < pages.length ? pages[rightPageIndex] : null;

    const pageIds: string[] = [];
    if (leftPage) pageIds.push(leftPage.id);
    if (rightPage) pageIds.push(rightPage.id);

    const slotIds = slots.filter(s => pageIds.includes(s.pageId)).map(s => s.id);
    autoFillCurrentSpread(slotIds);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#111111]">
      <div className="px-6 pt-4 pb-5 border-b border-gray-800">
        <h3 className="text-[18px] font-extrabold text-gray-100 uppercase text-center w-full drop-shadow-sm" style={{ letterSpacing: '0.15em', marginBottom: '12px' }}>
          Suas Figurinhas
        </h3>
        
        <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="flex items-center justify-center w-full p-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 border border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] rounded-full cursor-pointer transition-all transform hover:-translate-y-0.5 active:scale-95 gap-2">
            <span className="text-[14px]">🎁</span>
            <span className="text-black font-bold text-[12px] uppercase tracking-wider text-shadow-sm">Importar Figurinhas</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>

          {unplacedStickers.length > 0 && (
            <button 
              className="w-full text-white text-[12px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.4)] rounded-full font-bold uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2" 
              onClick={handleAutoFill}
              title="Colar automaticamente nesta página"
            >
              <span className="text-[14px]">⚡</span>
              <span>Colar Rápido</span>
            </button>
          )}
          
          <button 
            className="flex items-center justify-center w-full p-2.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] rounded-full cursor-pointer transition-all transform hover:-translate-y-0.5 active:scale-95 text-white font-bold text-[12px] uppercase tracking-wider gap-2"
            onClick={randomizeRarities}
            title="Adicionar efeitos visuais de cartas raras às figurinhas!"
          >
            <span className="text-[14px]">✨</span>
            <span>Sortear Raridades</span>
          </button>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className={clsx(
          "flex-1 overflow-y-auto p-4 flex flex-wrap gap-4 items-start justify-center content-start transition-colors",
          isOver && "bg-white/5"
        )}
      >
        {unplacedStickers.length === 0 ? (
          <div className="text-center text-white/30 mt-10">
            <p className="text-xs">Nenhuma figurinha disponível.</p>
          </div>
        ) : (
          unplacedStickers.map(sticker => (
            <div key={sticker.id} className={clsx(
              "w-[calc(50%-8px)]", 
              sticker.isLandscape ? "aspect-[65/49]" : "aspect-[49/65]",
              "hover:-translate-y-2 hover:drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all duration-300"
            )}>
              <StickerCard sticker={sticker} />
            </div>
          ))
        )}
      </div>

      <div className="p-4 pb-6 border-t border-gray-800 bg-[#0a0a0a] flex flex-col gap-2 w-full shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-10">
        <button 
          className="w-full p-2 bg-orange-900/30 hover:bg-orange-800 text-orange-400 hover:text-white rounded text-[10px] uppercase font-bold transition-colors border border-orange-900/50 flex justify-center items-center gap-1.5"
          onClick={() => {
            if(window.confirm('Tem certeza que deseja remover a raridade de TODAS as figurinhas do estoque? Elas voltarão a ser comuns.')) {
              resetRarities();
            }
          }}
          title="Remove os efeitos especiais das figurinhas do estoque"
        >
          <span className="text-[14px]">🔄</span> Remover Raridades
        </button>

        <div className="flex gap-2 w-full">
          <button 
            className="flex-1 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-[10px] uppercase font-bold transition-colors border border-gray-700 flex justify-center items-center gap-1.5"
            onClick={() => {
              if(window.confirm('Quer descolar TODAS as figurinhas coladas no álbum e devolvê-las para o estoque?')) {
                unstickAllStickers();
              }
            }}
            title="Devolve todas as figurinhas para o estoque"
          >
            <span className="text-[14px]">↩️</span> Descolar Todas
          </button>
          <button 
            className="flex-1 p-2 bg-red-900/20 hover:bg-red-800 text-red-400 hover:text-white rounded text-[10px] uppercase font-bold transition-colors border border-red-900/40 flex justify-center items-center gap-1.5"
            onClick={() => {
              if(window.confirm('ATENÇÃO: Isso vai apagar APENAS as figurinhas que estão no estoque (não coladas). Tem certeza?')) {
                deleteUnplacedStickers();
              }
            }}
            title="Apagar permanentemente figurinhas do estoque"
          >
            <span className="text-[14px]">🗑️</span> Apagar Estoque
          </button>
        </div>
      </div>
    </div>
  );
}
