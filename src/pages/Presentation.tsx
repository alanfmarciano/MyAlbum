import { useEffect, useState, useRef } from 'react';
import { useAlbumStore } from '../store/useAlbumStore';
import { useNavigate } from 'react-router-dom';
import CoverPage from '../components/CoverPage';
import AlbumPage from '../components/AlbumPage';
import StickerShowcaseOverlay from '../components/StickerShowcaseOverlay';
import HTMLFlipBook from 'react-pageflip';
import React from 'react';
import '../styles/presentation.css';

const Page = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div className="page" ref={ref} style={{ backgroundColor: '#fff', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' }}>
      {props.children}
    </div>
  );
});

export default function Presentation() {
  const { 
    albumConfig, 
    pages, 
    presentationInterval, 
    setPresentationInterval,
    presentationStickerTime,
    setPresentationStickerTime,
    presentationAnimationSpeed,
    setPresentationAnimationSpeed,
    manualZoomTime,
    setManualZoomTime,
    presentationStickerScale,
    setPresentationStickerScale,
    presentationStickerInterval,
    setPresentationStickerInterval,
    presentationPackTime,
    setPresentationPackTime,
    isPresentationPaused
  } = useAlbumStore();
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const flipBookRef = useRef<any>(null);

  // Mudar página no autoplay usando a API do react-pageflip
  useEffect(() => {
    if (!isPlaying || isPresentationPaused) return;
    const interval = setInterval(() => {
      if (flipBookRef.current && flipBookRef.current.pageFlip()) {
        const flip = flipBookRef.current.pageFlip();
        // Se estiver na última página, volta pro começo
        if (flip.getCurrentPageIndex() >= pages.length - 1) {
          flip.turnToPage(0);
        } else {
          flip.flipNext();
        }
      }
    }, Math.max(2, presentationInterval) * 1000); // Mínimo 2s
    return () => clearInterval(interval);
  }, [isPlaying, isPresentationPaused, presentationInterval, pages.length]);

  // Retomar apresentação automaticamente se pausada manualmente
  useEffect(() => {
    if (!isPlaying && manualZoomTime > 0) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, manualZoomTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, manualZoomTime]);

  // Bloqueio de clique nas bordas (Exigindo arrasto)
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onDown = (e: MouseEvent | TouchEvent) => {
      if ((e.target as HTMLElement).closest('.presentation-settings-modal') || (e.target as HTMLElement).closest('.presentation-controls') || (e.target as HTMLElement).closest('.showcase-anim-container')) return;

      if (e instanceof MouseEvent) {
        startX = e.clientX;
        startY = e.clientY;
      } else if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const onUpCapture = (e: MouseEvent | TouchEvent) => {
      if ((e.target as HTMLElement).closest('.presentation-settings-modal') || (e.target as HTMLElement).closest('.presentation-controls') || (e.target as HTMLElement).closest('.showcase-anim-container')) return;

      let endX = startX;
      let endY = startY;

      if (e instanceof MouseEvent) {
        endX = e.clientX;
        endY = e.clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
      }
      
      const dx = Math.abs(endX - startX);
      const dy = Math.abs(endY - startY);
      
      // Se moveu menos de 5px, é um clique simples.
      if (dx < 5 && dy < 5) {
        // Disparamos um 'mousemove' falso de 10px antes de deixar o mouseup chegar no album.
        // Isso engana a biblioteca fazendo-a pensar que o usuário arrastou e soltou no mesmo lugar (cancelando o flip).
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: startX + 10, clientY: startY + 10, bubbles: true }));

        // Se o clique não foi em uma figurinha, pausamos/despausamos a apresentação
        if (!(e.target as HTMLElement).closest('.sticker-slot') && !(e.target as HTMLElement).closest('.sticker')) {
          setIsPlaying(prev => !prev);
        }
      }
    };

    window.addEventListener('mousedown', onDown, true);
    window.addEventListener('touchstart', onDown, true);
    window.addEventListener('mouseup', onUpCapture, true);
    window.addEventListener('touchend', onUpCapture, true);

    return () => {
      window.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('touchstart', onDown, true);
      window.removeEventListener('mouseup', onUpCapture, true);
      window.removeEventListener('touchend', onUpCapture, true);
    };
  }, []);

  // Esconder controles no mouse idle
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }, 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [showSettings]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    navigate('/editor');
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
  const handleZoomReset = () => setZoom(1);

  const sortedPages = React.useMemo(() => {
    return pages
      .filter(p => p.albumId === albumConfig.id)
      .sort((a, b) => a.order - b.order);
  }, [pages, albumConfig.id]);

  return (
    <div ref={containerRef} className="presentation-container" style={{ cursor: showControls ? 'default' : 'none' }}>
      
      {albumConfig.bgImage && (
        <div style={{
          position: 'absolute',
          top: -50, left: -50, right: -50, bottom: -50,
          backgroundImage: `url(${albumConfig.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px) brightness(0.4)',
          zIndex: 0
        }} />
      )}

      <div className="presentation-album-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.3s ease-out' }}>
         {/* @ts-expect-error react-pageflip TS defs require all optional props */}
         <HTMLFlipBook 
           width={400} 
           height={560} 
           size="stretch"
           minWidth={100}
           maxWidth={3000}
           minHeight={140}
           maxHeight={4200}
           maxShadowOpacity={0.5}
           showCover={true}
           mobileScrollSupport={true}
           className="presentation-flipbook"
           ref={flipBookRef}
           style={{ margin: '0 auto' }}
           usePortrait={false}
           disableFlipByClick={true}
           clickEventForward={false}
         >
           {sortedPages.map((page, index) => (
             <Page key={index}>
               {page.isCover ? (
                 <CoverPage config={albumConfig} />
               ) : page.isBackCover ? (
                 <CoverPage config={albumConfig} isBack />
               ) : (
                 <AlbumPage page={page} pageIndex={index} previewConfig={albumConfig} isPresentation={true} />
               )}
             </Page>
           ))}
         </HTMLFlipBook>
      </div>

      <StickerShowcaseOverlay isPlaying={isPlaying} />

      <div className={`presentation-controls ${showControls ? 'visible' : ''}`}>
        <button className="btn btn-secondary" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸️ Pausar' : '▶️ Tocar'}
        </button>
        <button className="btn btn-secondary" onClick={toggleFullscreen}>
          ⛶ Tela Cheia
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '20px' }}>
          <button className="btn btn-icon btn-secondary btn-sm" onClick={handleZoomOut} title="Afastar" style={{ borderRadius: '50%', padding: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px', width: '38px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button className="btn btn-icon btn-secondary btn-sm" onClick={handleZoomIn} title="Aproximar" style={{ borderRadius: '50%', padding: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button className="btn btn-icon btn-secondary btn-sm" onClick={handleZoomReset} title="Resetar Zoom" style={{ borderRadius: '50%', padding: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>

        <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          ⚙️ Configurar
        </button>
        <button className="btn btn-primary" onClick={handleExit}>
          Sair
        </button>
      </div>

      {showSettings && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100 }} 
            onClick={() => setShowSettings(false)}
          />
          <div className="presentation-settings-modal">
            <h3 style={{ margin: '0', fontSize: '18px' }}>Configurar Apresentação</h3>
            
            <div className="settings-grid">
              <div className="settings-item">
                <label>Tempo por página (segundos)</label>
                <input 
                  type="number" 
                  min="2" 
                  max="30" 
                  value={presentationInterval} 
                  onChange={e => setPresentationInterval(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Tempo da figurinha na tela (segundos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  value={presentationStickerTime} 
                  onChange={e => setPresentationStickerTime(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Tempo de suspense do pacotinho (segundos)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={presentationPackTime} 
                  onChange={e => setPresentationPackTime(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Tamanho da figurinha 3D (0.5 a 3.0)</label>
                <input 
                  type="number" 
                  min="0.5" 
                  max="3" 
                  step="0.1"
                  value={presentationStickerScale} 
                  onChange={e => setPresentationStickerScale(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Intervalo entre figurinhas 3D (segundos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30" 
                  value={presentationStickerInterval} 
                  onChange={e => setPresentationStickerInterval(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Velocidade de giro 3D (segundos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  step="0.5"
                  value={presentationAnimationSpeed} 
                  onChange={e => setPresentationAnimationSpeed(Number(e.target.value))} 
                />
              </div>

              <div className="settings-item">
                <label>Pausa da apresentação ao ver detalhes (0 = manual)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="30" 
                  value={manualZoomTime} 
                  onChange={e => setManualZoomTime(Number(e.target.value))} 
                />
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => setShowSettings(false)}>Fechar</button>
          </div>
        </>
      )}
    </div>
  );
}
