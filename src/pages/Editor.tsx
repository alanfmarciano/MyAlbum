import { useState } from 'react';
import { useAlbumStore } from '../store/useAlbumStore';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SidebarGallery } from '../components/SidebarGallery';
import { StickerCard } from '../components/StickerCard';
import { AlbumSpreadRenderer } from '../components/AlbumSpreadRenderer';
import type { Sticker, Page } from '../types';
import '../styles/editor.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExportPdfModal } from '../components/ExportPdfModal';

export default function Editor() {
  const navigate = useNavigate();
  const config = useAlbumStore(state => state.albumConfig);
  const pages = useAlbumStore(state => state.pages);
  const moveStickerToSlot = useAlbumStore(state => state.moveStickerToSlot);
  const exportToJson = useAlbumStore(state => state.exportToJson);
  const slots = useAlbumStore(state => state.slots);
  
  const totalSlots = slots.length;
  const filledSlots = slots.filter(s => s.stickerId !== null).length;
  const progressPercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
  
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [activeSticker, setActiveSticker] = useState<Sticker | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState<'a4' | 'booklet' | null>(null);
  const [exportCurrentSpread, setExportCurrentSpread] = useState<{ left: number, right: number } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const sticker = useAlbumStore.getState().stickers.find(s => s.id === active.id);
    if (sticker) setActiveSticker(sticker);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSticker(null);
    const { active, over } = event;
    if (over && over.data.current?.accepts === 'sticker') {
      const slotId = over.id as string;
      // remove o prefixo slot- se existir
      const cleanSlotId = slotId.replace('slot-', '');
      const stickerId = active.id as string;
      moveStickerToSlot(stickerId, cleanSlotId);
    } else if (over && over.id === 'gallery-droppable') {
      // Return to gallery
      const stickerId = active.id as string;
      moveStickerToSlot(stickerId, null);
    }
  };

  const handleExportPDFClick = () => {
    setIsExportModalOpen(true);
  };

  const executePdfExport = async (format: 'a4' | 'booklet') => {
    setIsExportModalOpen(false);
    setIsExporting(format);
    
    let exportPages: (Page | null)[] = [...pages];
    let spreadsToExport: { left: number, right: number }[] = [];
    
    if (format === 'a4') {
      const totalA4Spreads = Math.ceil((exportPages.length + 1) / 2);
      for (let i = 0; i < totalA4Spreads; i++) {
        spreadsToExport.push({ left: i === 0 ? -1 : (i * 2) - 1, right: i === 0 ? 0 : i * 2 });
      }
    } else if (format === 'booklet') {
      const N = Math.ceil(exportPages.length / 4) * 4;
      const blanksNeeded = N - exportPages.length;
      
      if (blanksNeeded > 0) {
        const lastPage = exportPages[exportPages.length - 1];
        if (lastPage && lastPage.isBackCover) {
          exportPages.pop();
          for (let b = 0; b < blanksNeeded; b++) { exportPages.push(null); }
          exportPages.push(lastPage);
        } else {
          for (let b = 0; b < blanksNeeded; b++) { exportPages.push(null); }
        }
      }

      for (let i = 0; i < N / 2; i++) {
        if (i % 2 === 0) {
          spreadsToExport.push({ left: N - 1 - i, right: i });
        } else {
          spreadsToExport.push({ left: i, right: N - 1 - i });
        }
      }
    }

    if (spreadsToExport.length === 0) {
      setIsExporting(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: format === 'a4' ? 'portrait' : 'landscape',
        unit: 'mm',
        format: format === 'a4' ? [210, 297] : [297, 420]
      });

      let pagesAdded = 0;

      for (let i = 0; i < spreadsToExport.length; i++) {
        const spread = spreadsToExport[i];
        
        setExportCurrentSpread(spread);
        
        await new Promise(resolve => setTimeout(resolve, 300));

        const el = document.querySelector('#album-spread .album-spread-container') as HTMLElement;
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: config.bgStyle || '#ffffff',
          scrollY: 0,
          scrollX: 0,
          width: 990,
          height: 700,
          windowWidth: 990,
          windowHeight: 700,
          onclone: (clonedDoc) => {
            const spreadWrapper = clonedDoc.querySelector('#album-spread') as HTMLElement;
            if (spreadWrapper) {
              spreadWrapper.style.transform = 'none';
              spreadWrapper.style.padding = '0';
            }
            const clonedEl = clonedDoc.querySelector('#album-spread .album-spread-container') as HTMLElement;
            if (clonedEl) {
              clonedEl.style.width = '990px';
              clonedEl.style.height = '700px';
              clonedEl.style.maxWidth = 'none';
              clonedEl.style.maxHeight = 'none';
              clonedEl.style.position = 'relative';
              clonedEl.style.transform = 'none';
            }
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        
        if (format === 'a4') {
          if (spread.left >= 0 && spread.left < exportPages.length) {
            if (pagesAdded > 0) pdf.addPage([210, 297], 'portrait');
            pdf.addImage(imgData, 'JPEG', 0, 0, 420, 297);
            pagesAdded++;
          }
          if (spread.right >= 0 && spread.right < exportPages.length) {
            if (pagesAdded > 0) pdf.addPage([210, 297], 'portrait');
            pdf.addImage(imgData, 'JPEG', -210, 0, 420, 297);
            pagesAdded++;
          }
        } else {
          if (pagesAdded > 0) {
            pdf.addPage([420, 297], 'landscape');
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, 420, 297);
          pagesAdded++;
        }
      }

      pdf.save(`${config.albumName.replace(/\s+/g, '_')}_${format}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsExporting(null);
      setExportCurrentSpread(null);
    }
  };

  const displayPages = (() => {
    let exportPages: (Page | null)[] = [...pages];
    if (isExporting === 'booklet') {
      const N = Math.ceil(exportPages.length / 4) * 4;
      const blanksNeeded = N - exportPages.length;
      if (blanksNeeded > 0) {
        const lastPage = exportPages[exportPages.length - 1];
        if (lastPage && lastPage.isBackCover) {
          exportPages.pop();
          for (let b = 0; b < blanksNeeded; b++) { exportPages.push(null); }
          exportPages.push(lastPage);
        } else {
          for (let b = 0; b < blanksNeeded; b++) { exportPages.push(null); }
        }
      }
    }
    return exportPages;
  })();

  const normalLeftPageIndex = currentSpreadIndex === 0 ? -1 : (currentSpreadIndex * 2) - 1;
  const normalRightPageIndex = currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2;
  
  const visualLeftPageIndex = exportCurrentSpread ? exportCurrentSpread.left : normalLeftPageIndex;
  const visualRightPageIndex = exportCurrentSpread ? exportCurrentSpread.right : normalRightPageIndex;

  const leftPage = visualLeftPageIndex >= 0 && visualLeftPageIndex < displayPages.length ? displayPages[visualLeftPageIndex] : null;
  const rightPage = visualRightPageIndex >= 0 && visualRightPageIndex < displayPages.length ? displayPages[visualRightPageIndex] : null;

  const totalSpreads = Math.ceil((pages.length + 1) / 2);

  const isSinglePage = !leftPage || !rightPage;
  const singlePageTranslate = isSinglePage ? (leftPage ? '25%' : '-25%') : '0%';

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="editor">
        <nav className="editor-navbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="navbar-left" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary flex-shrink-0" 
              id="btn-back-config" 
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', padding: '4px 10px', fontSize: '10px', height: '30px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              MENU
            </button>
            <button className="btn btn-outline flex-shrink-0" id="btn-export-json" onClick={exportToJson} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', padding: '4px 10px', fontSize: '10px', height: '30px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              BACKUP
            </button>
            <button 
              className="btn flex-shrink-0" 
              onClick={() => navigate('/presentation')} 
              style={{ background: 'linear-gradient(to right, #8a2be2, #4b0082)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', padding: '4px 10px', fontSize: '10px', height: '30px', color: 'white', border: 'none' }}
            >
              ▶️ APRESENTAÇÃO
            </button>
            <div className="editor-title font-outfit text-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', marginLeft: '8px', flex: 1, minWidth: 0 }}>
              <span style={{ flexShrink: 0 }}>⚽</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{config.albumName}</span>
            </div>
          </div>
          
          <div className="navbar-center" style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--gold)' }}>🏆 {filledSlots}/{totalSlots} Coladas</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
          
          <div className="navbar-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button 
              onClick={handleExportPDFClick} 
              style={{ 
                background: 'linear-gradient(to right, #FFD700, #F5A623)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontWeight: 'bold', 
                padding: '0 16px', 
                fontSize: '11px', 
                height: '30px', 
                color: '#111', 
                border: 'none',
                borderRadius: '15px',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              IMPRIMIR PDF
            </button>
          </div>
        </nav>

        <div className="editor-body">
          <main className="editor-main">
            <div className="editor-page-header" style={{ justifyContent: 'center' }}>
              <div className="page-nav glass-panel" style={{ padding: '4px', borderRadius: 'var(--radius-full)', gap: '4px', display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-icon btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => setCurrentSpreadIndex(p => Math.max(0, p - 1))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <select 
                  id="page-jump-select" 
                  className="input-field" 
                  style={{ height:'32px', padding:'0 30px 0 10px', fontWeight:700, borderRadius: 'var(--radius-full)', border: 'none', background: 'rgba(255,255,255,0.1)' }}
                  value={currentSpreadIndex}
                  onChange={e => setCurrentSpreadIndex(Number(e.target.value))}
                >
                  {Array.from({ length: totalSpreads }).map((_, i) => {
                    const l = (i * 2) - 1;
                    const r = i * 2;
                    return (
                      <option key={i} value={i} style={{ background: '#111', color: '#fff' }}>
                        {i === 0 ? 'Capa' : `Páginas ${l} e ${r}`}
                      </option>
                    );
                  })}
                </select>
                <button className="btn btn-icon btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => setCurrentSpreadIndex(p => Math.min(totalSpreads - 1, p + 1))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                
                <button className="btn btn-icon btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={handleZoomOut} title="Afastar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <span style={{ fontSize: '12px', fontWeight: 'bold', width: '36px', textAlign: 'center', color: '#fff' }}>{Math.round(zoom * 100)}%</span>
                <button className="btn btn-icon btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={handleZoomIn} title="Aproximar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <button className="btn btn-icon btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)', marginLeft: '4px' }} onClick={() => setZoom(1)} title="Resetar Zoom">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              </div>
            </div>
            
            <div className="album-page-container" id="album-page-container" style={{ display:'flex', flexDirection:'column', gap:'12px', alignItems:'center', overflow: 'auto' }}>
              <div 
                className="album-spread" 
                id="album-spread" 
                style={{ 
                  width: '100%', 
                  maxWidth: '1000px', 
                  padding: '0 20px',
                  transform: `translateX(${singlePageTranslate}) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <AlbumSpreadRenderer 
                  leftPage={leftPage} rightPage={rightPage} 
                  leftPageIndex={visualLeftPageIndex} rightPageIndex={visualRightPageIndex} 
                  config={config} 
                  hideSpine={isExporting === 'a4'}
                  isEditor={!isExporting}
                />
              </div>
            </div>
          </main>

          <aside className="editor-sidebar-right glass-panel">
            <SidebarGallery currentSpreadIndex={currentSpreadIndex} />
          </aside>
        </div>
      </div>

      <DragOverlay>
        {activeSticker ? <StickerCard sticker={activeSticker} /> : null}
      </DragOverlay>

      {isExporting && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-white font-outfit mb-2">Gerando PDF de Alta Qualidade...</h2>
          <p className="text-white/60 text-center max-w-md">Renderizando todas as páginas e figurinhas. Isso pode levar alguns instantes. Por favor, não feche a janela.</p>
        </div>
      )}

      <ExportPdfModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={executePdfExport} 
      />
    </DndContext>
  );
}
