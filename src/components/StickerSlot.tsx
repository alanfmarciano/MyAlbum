import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Slot } from '../types';
import { useAlbumStore } from '../store/useAlbumStore';

interface StickerSlotProps {
  slot: Slot;
  index: number;
  customClass?: string;
  isPresentation?: boolean;
}

export default function StickerSlot({ slot, index, customClass, isPresentation }: StickerSlotProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `slot-${slot.id}`,
    data: { slot, accepts: 'sticker' },
    disabled: (slot.stickerId !== null)
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: slot.stickerId || `empty-drag-${slot.id}`,
    disabled: (slot.stickerId === null)
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const updateSlot = useAlbumStore(state => state.updateSlot);
  const moveStickerToSlot = useAlbumStore(state => state.moveStickerToSlot);

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSlot(slot.id, { rotation: (slot.rotation || 0) + 90 });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slot.stickerId) {
      moveStickerToSlot(slot.stickerId, null);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const manualZoomTime = useAlbumStore(state => state.manualZoomTime);
  const setIsPresentationPaused = useAlbumStore(state => state.setIsPresentationPaused);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  useEffect(() => {
    if (isPresentation) {
      setIsPresentationPaused(isExpanded);
    }
  }, [isExpanded, isPresentation, setIsPresentationPaused]);

  useEffect(() => {
    if (isExpanded && manualZoomTime > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, manualZoomTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, manualZoomTime]);

  const [justPlaced, setJustPlaced] = useState(false);
  const previousStickerIdRef = useRef<string | null>(slot.stickerId);

  useEffect(() => {
    if (previousStickerIdRef.current === null && slot.stickerId !== null) {
      setJustPlaced(true);
      const timer = setTimeout(() => setJustPlaced(false), 800);
      return () => clearTimeout(timer);
    }
    previousStickerIdRef.current = slot.stickerId;
  }, [slot.stickerId]);

  const stickers = useAlbumStore(state => state.stickers);
  const stickerObj = (slot.stickerId !== null) ? stickers.find(s => s.id === slot.stickerId) : null;
  const stickerUrl = stickerObj ? (stickerObj.imageBase64 || stickerObj.imageObjectUrl) : null;
  
  const rarity = stickerObj?.rarity || 'common';

  const rarityClass = ((slot.stickerId !== null) && rarity !== 'common') ? `rarity-${rarity}` : 'rarity-common';
  let rarityStyle: React.CSSProperties = {};
  if ((slot.stickerId !== null) && rarity !== 'common') {
    const rarityColors: Record<string, string> = { 
      mythic: '#fbbf24', // Ouro
      legendary: '#d1d5db', // Prata
      epic: '#b45309', // Bronze
      rare: '#c084fc', // Roxa
      common: '#0f172a' 
    };
    rarityStyle = {
      border: `0.15em solid ${rarityColors[rarity] || rarityColors.rare}`,
      boxShadow: `0 0 0.5em ${rarityColors[rarity] || rarityColors.rare}`
    };
  }

  const isSlotLandscape = customClass?.includes('turma') || customClass?.includes('lab') || customClass?.includes('coord');
  const isLandscape = (stickerObj && stickerObj.isLandscape !== undefined) ? stickerObj.isLandscape : isSlotLandscape;
  const isDarkBg = customClass?.includes('turma') || customClass?.includes('lab') || customClass?.includes('coord');
  const emptyColor = isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(26, 61, 170, 0.22)';

  const style: React.CSSProperties = {
    ...rarityStyle,
    aspectRatio: isLandscape ? '65 / 49' : '49 / 65',
    width: '100%',
    borderColor: slot.stickerId === null ? emptyColor : 'transparent',
    borderStyle: slot.stickerId === null ? 'dashed' : 'solid',
    borderWidth: slot.stickerId === null ? '2px' : '0px',
    borderRadius: slot.stickerId === null ? '8px' : '4px',
    background: isDarkBg ? 'rgba(255,215,0,0.04)' : 'rgba(0,0,0,0.04)',
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef}
      className={`sticker-slot border-classic ${customClass || ''} ${rarityClass} ${isOver ? 'ring-4 ring-green-500' : ''} ${justPlaced ? 'sticker-placed-flash' : ''} ${slot.stickerId ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={style}
      {...(slot.stickerId ? attributes : {})}
      {...(slot.stickerId ? listeners : {})}
    >
      {(slot.stickerId === null) ? (
        <div className="slot-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '8px', background: 'transparent' }}>
          <div style={{ fontSize: '2.2rem', opacity: isDarkBg ? 0.3 : 0.6, color: isDarkBg ? '#fff' : 'rgba(26, 61, 170, 0.6)', marginBottom: '8px', filter: isDarkBg ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'none' }}>
            {slot.playerName?.includes('Turma') ? '👥' : slot.playerName?.includes('Lab') ? '🏟️' : slot.playerName?.includes('Coord') ? '🎖️' : '👤'}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: emptyColor, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.08em' }}>
            {slot.playerName || `ALUNO ${index + 1}`}
          </div>
        </div>
      ) : (
        <>
          <div 
            style={{ width: '100%', height: '100%', transform: `rotate(${slot.rotation || 0}deg)`, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative', cursor: 'zoom-in' }}
            onClick={handleExpand}
            onPointerDown={(e) => {
              if (isPresentation) {
                e.stopPropagation(); // Evita que o react-pageflip mude de página ao clicar na figurinha
              }
            }}
          >
            <img src={stickerUrl || ''} alt={slot.playerName || ''} className="slot-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          {/* Action Overlay */}
          {!isDragging && (
            <div className="slot-actions-overlay glass-panel">
              <button 
                className="btn btn-icon btn-sm" 
                title="Girar 90°" 
                onPointerDown={handleRotate} 
                style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0, background: 'rgba(0,0,0,0.6)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/></svg>
              </button>
              <button 
                className="btn btn-icon btn-sm btn-danger" 
                title="Devolver ao pacote" 
                onPointerDown={handleRemove}
                style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0, background: 'rgba(220,38,38,0.8)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
          )}

          {/* Modal Expanded */}
          {isExpanded && createPortal(
            <div 
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onPointerDown={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            >
              <button className="btn btn-icon" style={{ position: 'absolute', top: '20px', right: '20px', borderRadius: '50%', width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)' }} onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>

              <div 
                className={rarityClass}
                style={{ 
                  width: '90vw', maxWidth: '400px', aspectRatio: isLandscape ? '65/49' : '49/65', 
                  ...rarityStyle, borderRadius: '16px', overflow: 'hidden', position: 'relative',
                  transform: `rotate(${slot.rotation || 0}deg)`,
                  boxShadow: `0 0 100px ${
                    rarity === 'mythic' ? 'rgba(251, 191, 36, 0.8)' : 
                    rarity === 'legendary' ? 'rgba(209, 213, 219, 0.8)' : 
                    rarity === 'epic' ? 'rgba(180, 83, 9, 0.8)' : 
                    rarity === 'rare' ? 'rgba(192, 132, 252, 0.7)' : 
                    'rgba(255, 255, 255, 0.1)'
                  }, 0 20px 50px rgba(0,0,0,0.8)`,
                  animation: 
                    rarity === 'mythic' ? 'stickerPopLegendary 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                    rarity === 'legendary' ? 'stickerPopEpic 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                    (rarity === 'epic' || rarity === 'rare') ? 'stickerPopRare 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                    'stickerPopOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0) 100%)', zIndex: 10, mixBlendMode: 'overlay', pointerEvents: 'none', animation: 'stickerShine 2s infinite linear' }}></div>
                <img src={stickerUrl || ''} alt={slot.playerName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {rarity === 'common' && <div className="expanded-rarity-label common" style={{ background: '#0f172a' }}>COMUM</div>}
              {rarity === 'rare' && <div className="expanded-rarity-label rare">INCOMUM</div>}
              {rarity === 'epic' && <div className="expanded-rarity-label epic">RARA</div>}
              {rarity === 'legendary' && <div className="expanded-rarity-label legendary">ÉPICA</div>}
              {rarity === 'mythic' && <div className="expanded-rarity-label mythic">LENDÁRIA</div>}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
