import React, { useEffect, useState, useMemo } from 'react';
import { useAlbumStore } from '../store/useAlbumStore';
import type { Sticker } from '../types';

export default function StickerShowcaseOverlay({ isPlaying }: { isPlaying: boolean }) {
  const { stickers, slots, presentationStickerTime, presentationStickerScale, presentationAnimationSpeed, presentationPackTime } = useAlbumStore();
  const [activeSticker, setActiveSticker] = useState<Sticker | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  useEffect(() => {
    if (activeSticker) {
      const img = new Image();
      img.onload = () => {
        setImageRatio(img.width / img.height);
      };
      img.src = activeSticker.imageBase64 || activeSticker.imageObjectUrl || '';
    } else {
      setImageRatio(null);
    }
  }, [activeSticker]);

  const isPresentationPaused = useAlbumStore(state => state.isPresentationPaused);
  const isPaused = !isPlaying || isPresentationPaused;

  // Considerar apenas figurinhas que estão coladas em algum slot
  const placedStickers = useMemo(() => stickers.filter(s => slots.some(slot => slot.stickerId === s.id)), [stickers, slots]);

  useEffect(() => {
    if (placedStickers.length === 0 || isPaused) {
      setActiveSticker(null);
      return;
    }

    let isCancelled = false;
    let rAF: number;
    let lastTime = performance.now();

    // Ref state to prevent any closure staleness or React state queue spam
    const stateRef = {
      phase: 0, // 0=espera inicial, 1=animando, 2=intervalo
      elapsed: 0,
      hasFlipped: false
    };

    const loop = (time: number) => {
      if (isCancelled) return;
      
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const storeState = useAlbumStore.getState();
      const currentIsPaused = !isPlaying || storeState.isPresentationPaused;

      if (!currentIsPaused) {
        stateRef.elapsed += dt;

        const entranceTime = 1.2;
        const exitTime = 1.5;
        const openTime = storeState.presentationStickerTime || 10;
        const flipTime = storeState.presentationAnimationSpeed || 1;
        const packTime = storeState.presentationPackTime || 2;
        const intervalTime = storeState.presentationStickerInterval || 2;

        const flipDelay = entranceTime + packTime;
        const totalDuration = entranceTime + packTime + flipTime + openTime + exitTime;

        if (stateRef.phase === 0 && stateRef.elapsed > 2) {
          const rand = placedStickers[Math.floor(Math.random() * placedStickers.length)];
          setActiveSticker(rand);
          setIsFlipped(false);
          stateRef.hasFlipped = false;
          stateRef.elapsed = 0;
          stateRef.phase = 1;
        } else if (stateRef.phase === 1) {
          // Dispara o flip apenas uma vez
          if (!stateRef.hasFlipped && stateRef.elapsed > flipDelay && stateRef.elapsed < totalDuration) {
             stateRef.hasFlipped = true;
             setIsFlipped(true);
          }
          // Termina
          if (stateRef.elapsed > totalDuration) {
             setActiveSticker(null);
             setIsFlipped(false);
             stateRef.hasFlipped = false;
             stateRef.elapsed = 0;
             stateRef.phase = 2; // vai pro intervalo
          }
        } else if (stateRef.phase === 2 && stateRef.elapsed > intervalTime) {
          // Passou o intervalo, solta proxima carta
          const rand = placedStickers[Math.floor(Math.random() * placedStickers.length)];
          setActiveSticker(rand);
          setIsFlipped(false);
          stateRef.hasFlipped = false;
          stateRef.elapsed = 0;
          stateRef.phase = 1;
        }
      }

      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rAF);
    };
  }, [placedStickers, isPaused, isPlaying]);

  if (!activeSticker) return null;

  const rarityMap: Record<string, { label: string, color: string }> = {
    common: { label: 'COMUM', color: '#95a5a6' },
    rare: { label: 'INCOMUM', color: '#c084fc' },
    epic: { label: 'RARA', color: '#b45309' },
    legendary: { label: 'ÉPICA', color: '#d1d5db' },
    mythic: { label: 'LENDÁRIA', color: '#fbbf24' }
  };

  const rarityInfo = rarityMap[activeSticker.rarity] || rarityMap.common;

  // Calcula a dimensão dinâmica baseada na imagem real para evitar qualquer corte (crop)
  const getDynamicDimensions = () => {
    if (!imageRatio) {
      return { 
        width: activeSticker.isLandscape ? '455px' : '343px', 
        height: activeSticker.isLandscape ? '343px' : '455px' 
      };
    }
    
    // Limite máximo de tamanho
    const maxSize = 455;
    if (imageRatio > 1) {
      // Paisagem: prende a largura no máximo, calcula a altura
      return { width: `${maxSize}px`, height: `${maxSize / imageRatio}px` };
    } else {
      // Retrato/Quadrado: prende a altura no máximo, calcula a largura
      return { width: `${maxSize * imageRatio}px`, height: `${maxSize}px` };
    }
  };

  const dynamicDims = getDynamicDimensions();

  const entranceTime = 1.2;
  const exitTime = 1.5;
  const totalDuration = entranceTime + presentationPackTime + presentationAnimationSpeed + presentationStickerTime + exitTime;

  return (
    <React.Fragment key={activeSticker.id}>
      <div 
        className="showcase-glow" 
        style={{ 
          animation: `glowIn ${entranceTime}s ease-out forwards, glowOut ${exitTime}s ease-in ${totalDuration - exitTime}s forwards`,
          '--sticker-scale': presentationStickerScale 
        } as React.CSSProperties}
      ></div>
      <div 
        className="showcase-anim-container" 
        style={{ 
          animation: `popIn ${entranceTime}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, dropOut ${exitTime}s cubic-bezier(0.34, 1.56, 0.64, 1) ${totalDuration - exitTime}s forwards`,
          '--sticker-scale': presentationStickerScale 
        } as React.CSSProperties}
      >
        {/* THE 3D CARD */}
        <div style={{
          position: 'relative',
          width: dynamicDims.width, 
          height: dynamicDims.height,
          transformStyle: 'preserve-3d',
          zIndex: 10,
          animation: isFlipped ? 
            (activeSticker.rarity === 'mythic' ? `gachaFlipLegendary ${presentationAnimationSpeed}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards` :
             activeSticker.rarity === 'legendary' ? `gachaFlipEpic ${presentationAnimationSpeed}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards` :
             (activeSticker.rarity === 'epic' || activeSticker.rarity === 'rare') ? `gachaFlipRare ${presentationAnimationSpeed}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards` :
             `gachaFlipCommon ${presentationAnimationSpeed}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`) 
            : 'gachaShake 2s ease-in-out infinite'
        }}>
          {/* FRENTE DA CARTA */}
          <div 
            style={{ 
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              borderRadius: '20px', overflow: 'hidden',
              backgroundColor: 'transparent',
              boxShadow: isFlipped ? `0 0 100px ${
                activeSticker.rarity === 'mythic' ? 'rgba(251, 191, 36, 0.8)' : 
                activeSticker.rarity === 'legendary' ? 'rgba(209, 213, 219, 0.8)' : 
                activeSticker.rarity === 'epic' ? 'rgba(180, 83, 9, 0.8)' : 
                activeSticker.rarity === 'rare' ? 'rgba(192, 132, 252, 0.7)' : 
                'rgba(255, 255, 255, 0.1)'
              }, 0 20px 50px rgba(0,0,0,0.8)` : 'none'
            }}
          >
            <div 
              className={`${activeSticker.rarity !== 'common' ? `rarity-${activeSticker.rarity}` : ''}`}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0) 100%)', zIndex: 10, mixBlendMode: 'overlay', pointerEvents: 'none', animation: 'stickerShine 2s infinite linear' }}></div>
              <img src={activeSticker.imageBase64 || activeSticker.imageObjectUrl} alt={activeSticker.playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* COSTAS DA CARTA (Pacotinho) */}
          <div
            style={{
               position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
               transform: 'rotateY(180deg)',
               borderRadius: '16px',
               backgroundImage: 'url("/pacotinho.png")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
            }}
          >
          </div>
        </div>
        {/* Rarity label colocada dentro do container para ficar relativa à carta */}
        {isFlipped && (
          <div className={`expanded-rarity-label ${activeSticker.rarity === 'common' ? 'common' : activeSticker.rarity}`}>
            {rarityInfo.label}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
