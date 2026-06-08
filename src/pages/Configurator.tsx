import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAlbumStore, defaultConfig } from '../store/useAlbumStore';
import type { AlbumConfig } from '../types';
import { buildDefaultPages, buildDefaultSlots } from '../utils/albumBuilder';
import { AlbumSpreadRenderer } from '../components/AlbumSpreadRenderer';
import { v4 as uuidv4 } from 'uuid';

export default function Configurator() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.state?.isNew;
  
  const storeConfig = useAlbumStore(state => state.albumConfig);
  const createOrUpdateAlbum = useAlbumStore(state => state.createOrUpdateAlbum);

  const [config, setLocalConfig] = useState<AlbumConfig>(
    isNew ? { ...defaultConfig, id: uuidv4() } : storeConfig
  );
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [windowScale, setWindowScale] = useState(1);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isNew]);

  // Resize Observer for dynamic scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.38);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Calcula a escala: Álbum original tem 800px. Adicionamos uma pequena margem (width - 16)
        const scale = Math.max(0.1, Math.min((width - 16) / 800, 1));
        setPreviewScale(scale);
      }
    });

    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPreviewExpanded) {
      const updateScale = () => {
        setWindowScale(Math.min((window.innerWidth - 80) / 800, (window.innerHeight - 150) / 560, 1.5));
      };
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [isPreviewExpanded]);

  const isNameValid = config.albumName.trim().length > 0;

  const handleSave = async () => {
    if (!isNameValid) {
      setHasInteracted(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    await createOrUpdateAlbum(config);
    navigate('/editor');
  };



  // Build actual pages list for preview
  const previewPages = useMemo(() => buildDefaultPages(config), [config]);
  const previewSlots = useMemo(() => {
    return buildDefaultSlots(previewPages, config);
  }, [previewPages, config]);
  const totalSpreads = Math.ceil((previewPages.length + 1) / 2);

  useEffect(() => {
    if (currentPreviewIndex >= totalSpreads) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPreviewIndex(Math.max(0, totalSpreads - 1));
    }
  }, [totalSpreads, currentPreviewIndex]);

  const leftPageIndex = currentPreviewIndex === 0 ? -1 : (currentPreviewIndex * 2) - 1;
  const rightPageIndex = currentPreviewIndex === 0 ? 0 : currentPreviewIndex * 2;

  const leftPage = leftPageIndex >= 0 && leftPageIndex < previewPages.length ? previewPages[leftPageIndex] : null;
  const rightPage = rightPageIndex >= 0 && rightPageIndex < previewPages.length ? previewPages[rightPageIndex] : null;

  return (
    <div className="configurator">
      <div className="config-header">
        <button className="btn btn-secondary btn-sm" id="btn-back-landing" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <div>
          <h1 className="config-title">Configurar Álbum</h1>
          <p className="config-subtitle">Personalize seu álbum de figurinhas antes de começar</p>
        </div>
      </div>

      <div className="config-body">
        {/* Left: Form */}
        <div className="config-form glass-panel">

          <div className="config-section">
            <h2 className="config-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Informações Gerais
            </h2>
            <div className="input-group">
              <label className="input-label" htmlFor="cfg-name">Nome do Álbum</label>
              <input 
                type="text" 
                ref={nameInputRef}
                className={`input-field ${!isNameValid && hasInteracted ? 'input-error' : ''}`} 
                id="cfg-name" 
                value={config.albumName} 
                onChange={e => {
                  setLocalConfig({...config, albumName: e.target.value});
                  setHasInteracted(true);
                }} 
                placeholder="Ex: Copa do Mundo, Álbum da Família..." 
                style={!isNameValid && hasInteracted ? { borderColor: 'var(--danger, #ef4444)', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {}}
              />
              {!isNameValid && hasInteracted && (
                <span className="error-text" style={{ color: 'var(--danger, #ef4444)', fontSize: '0.82rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  O nome do álbum é obrigatório.
                </span>
              )}
            </div>
          </div>

          <div className="config-section">
            <h2 className="config-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Layout & Estrutura
            </h2>
            <div className="config-grid">
              <div className="input-group">
                <label className="input-label">Número de Páginas</label>
                <div className="segmented-control" id="cfg-pages-group">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <label className="segment" key={num}>
                      <input type="radio" name="cfg-pages" value={num} checked={config.totalPages === num} onChange={() => setLocalConfig({...config, totalPages: num})} />
                      <span>{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="cfg-stickers">Figurinhas por Página</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <input 
                    type="range" 
                    id="cfg-stickers-range"
                    min="1" 
                    max="12" 
                    value={config.stickersPerPage} 
                    onChange={e => setLocalConfig({...config, stickersPerPage: parseInt(e.target.value)})}
                    style={{ flex: 1, accentColor: 'var(--blob-teal)', height: '6px', borderRadius: '3px', outline: 'none' }}
                  />
                  <input 
                    type="number" 
                    id="cfg-stickers"
                    min="1" 
                    max="12" 
                    value={config.stickersPerPage} 
                    onChange={e => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 1;
                      if (val > 12) val = 12;
                      if (val < 1) val = 1;
                      setLocalConfig({...config, stickersPerPage: val});
                    }}
                    className="input-field"
                    style={{ width: '60px', textAlign: 'center', padding: '6px', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
              </div>


            </div>
          </div>

          <div className="config-section">
            <h2 className="config-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
              Páginas Inclusas
            </h2>

            <div className="config-toggles-grid">
              {[
                { id: 'includeCover', label: 'Incluir Capa', gold: false },
                { id: 'includeBackCover', label: 'Incluir Contracapa', gold: false },
                { id: 'includeIntro', label: 'Pág. Abertura', gold: true },
                { id: 'includeClassPage', label: 'Pág. da Turma', gold: true },
                { id: 'includeLabsPage', label: 'Pág. Laboratórios', gold: true },
                { id: 'includeCoordPage', label: 'Pág. Coordenação', gold: true },
                { id: 'includeEndPage', label: 'Pág. Encerramento', gold: true }
              ].map(t => (
                <div key={t.id} className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="toggle-label" style={{ fontSize: '0.8rem', fontWeight: t.gold ? 700 : 400, color: t.gold ? 'var(--copa-gold-300)' : 'var(--text-primary)' }}>{t.label}</span>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={config[t.id as keyof AlbumConfig] as boolean} onChange={e => setLocalConfig({...config, [t.id]: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>



          <div className="config-actions">
            <button 
              className="btn btn-primary btn-lg w-full" 
              onClick={handleSave}
              style={!isNameValid && hasInteracted ? { opacity: 0.6 } : {}}
              id="btn-create-album"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Criar Álbum e Ir para o Editor
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="config-preview">
          <h3 className="preview-title">Preview Interativo</h3>
          <div 
            className="preview-album glass-panel" 
            id="preview-album" 
            ref={previewContainerRef}
            onClick={() => setIsPreviewExpanded(true)}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              overflow: 'hidden', 
              padding: 0,
              height: `${560 * previewScale + 16}px`,
              transition: 'height 0.2s ease-out, transform 0.2s, box-shadow 0.2s',
              cursor: 'zoom-in'
            }}
          >
            <div style={{ transform: `scale(${previewScale})`, width: '800px', height: '560px', transformOrigin: 'center center', display: 'flex', alignItems: 'center', justifyItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%' }}>
                <AlbumSpreadRenderer 
                  leftPage={leftPage} rightPage={rightPage} 
                  leftPageIndex={leftPageIndex} rightPageIndex={rightPageIndex} 
                  config={config} 
                  previewSlots={previewSlots}
                />
              </div>
            </div>
          </div>
          <div className="preview-nav-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" id="btn-prev-preview" style={{ borderRadius: 'var(--radius-full)', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span id="preview-page-indicator" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', flex: 1 }}>
              {currentPreviewIndex === 0 ? "Capa do Álbum" : `Páginas ${leftPageIndex} e ${rightPageIndex}`}
            </span>
            <button className="btn btn-secondary btn-sm" id="btn-next-preview" style={{ borderRadius: 'var(--radius-full)', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setCurrentPreviewIndex(Math.min(totalSpreads - 1, currentPreviewIndex + 1))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="preview-info" id="preview-info-text">
            {config.totalPages} páginas · {config.stickersPerPage} fig/pág · {config.totalPages * config.stickersPerPage} total
          </div>
        </div>
      </div>

      {/* Modal Fullscreen Preview */}
      {isPreviewExpanded && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }} onClick={() => setIsPreviewExpanded(false)}>
          
          <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1001, borderRadius: '50%', width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }} onClick={(e) => { e.stopPropagation(); setIsPreviewExpanded(false); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          
          <div 
          className="expanded-preview-content"
          style={{ transform: `scale(${windowScale})`, transformOrigin: 'center center', width: '800px', height: '560px' }}
        >
          <AlbumSpreadRenderer 
            leftPage={leftPage} rightPage={rightPage} 
            leftPageIndex={leftPageIndex} rightPageIndex={rightPageIndex} 
            config={config} 
            previewSlots={previewSlots}
          />
        </div>
          
          <div className="preview-nav-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', position: 'absolute', bottom: '40px', background: 'rgba(20,20,20,0.9)', padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', width: '220px', textAlign: 'center' }}>
              {currentPreviewIndex === 0 ? "Capa do Álbum" : `Páginas ${leftPageIndex} e ${rightPageIndex}`}
            </span>
            <button className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setCurrentPreviewIndex(Math.min(totalSpreads - 1, currentPreviewIndex + 1))}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
