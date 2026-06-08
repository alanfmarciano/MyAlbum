import React from 'react';
import type { Page, Slot, AlbumConfig } from '../types';
import StickerSlot from './StickerSlot';
import { useAlbumStore } from '../store/useAlbumStore';
import '../styles/legacy-pages.css';

interface AlbumPageProps {
  page: Page;
  pageIndex: number;
  previewConfig?: AlbumConfig;
  previewSlots?: Slot[];
  isPresentation?: boolean;
}

export default function AlbumPage({ page, pageIndex, previewConfig, previewSlots, isPresentation }: AlbumPageProps) {
  const storeConfig = useAlbumStore(state => state.albumConfig);
  const storeSlots = useAlbumStore(state => state.slots).filter(s => s.pageId === page.id);

  const getFlexContainerStyle = (): React.CSSProperties => {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'center',
      gap: '6px 8px',
      flex: 1,
      padding: '8px 4px',
      width: '100%',
    };
  };

  const getSlotContainerStyle = (perPage: number): React.CSSProperties => {
    let width = '30.5%';
    if (perPage === 1) width = '40%';
    else if (perPage === 2) width = '42%';
    else if (perPage === 3) width = '30.5%';
    else if (perPage === 4) width = '42%';
    else if (perPage === 5) width = '30.5%';
    else if (perPage === 6) width = '30.5%';
    else if (perPage === 7) width = '23%';
    else if (perPage === 8) width = '23%';
    else if (perPage === 9) width = '28%';
    else if (perPage >= 10) width = '22%';
    
    return {
      width,
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center'
    };
  };

  const config = previewConfig || storeConfig;
  const slots: Slot[] = previewSlots ? previewSlots.filter(s => s.pageId === page.id) : storeSlots;

  const customBg = config.bgImage ? { backgroundImage: `url(${config.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  if (page.pageTheme === 'abertura-left') {
    return (
      <div className="album-page-content" style={{ background: 'linear-gradient(160deg, #0a0e18 0%, #1a2a4f 100%)', ...customBg }}>
        <div className="page-header" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
          <span className="page-num" style={{ color: 'var(--gold)' }}>01</span>
          <span className="page-section" style={{ color: 'rgba(255,255,255,.4)' }}>INTRODUÇÃO</span>
        </div>
        <div className="page-welcome">
          <div className="welcome-icon" style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,.4))' }}>🏆</div>
          <h2 className="welcome-title" style={{ color: 'var(--gold)' }}>BEM-VINDO!</h2>
          <p className="welcome-text" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Este é o seu álbum oficial da<br/><strong style={{ color: '#fff' }}>Copa do Mundo + SENAI 2026</strong>.<br/><br/>Guarde aqui as fotos dos laboratórios e os melhores momentos da sua turma para sempre.
          </p>
        </div>
        <div className="page-footer"><span className="footer-line" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,215,0,.3),transparent)' }}></span></div>
      </div>
    );
  }

  if (page.pageTheme === 'abertura-right') {
    return (
      <div className="album-page-content" style={{ background: config.bgStyle, ...customBg }}>
        <div className="page-header">
          <span className="page-section">IDENTIFICAÇÃO</span>
          <span className="page-num">02</span>
        </div>
        <div className="turma-id-block">
          <div className="turma-id-icon">🎓</div>
          <div className="turma-id-label">TURMA / CURSO</div>
          <h2 className="turma-id-name">{config.albumName}</h2>
          <div className="turma-id-sub">Copa do Mundo + SENAI 2026</div>
          <div className="turma-id-badges">
            <span className="turma-badge">⚽ Copa 2026</span>
            <span className="turma-badge">🎓 SENAI</span>
            <span className="turma-badge">🏆 Turma</span>
          </div>
        </div>
        <div className="page-footer"><span className="footer-line"></span></div>
      </div>
    );
  }

  if (page.pageTheme === 'turma-left') {
    return (
      <div className="album-page-content theme-turma-especial" style={{ ...customBg }}>
        <div className="turma-especial-deco" aria-hidden="true">
          <div className="te-circle te-circle-1"></div>
          <div className="te-circle te-circle-2"></div>
          <div className="te-circle te-circle-3"></div>
          <div className="te-lines"></div>
        </div>
        <div className="turma-especial-content">
          <div className="te-badge">📸 FOTO OFICIAL</div>
          <h2 className="te-title">FOTO DA<br/>TURMA</h2>
          <p className="te-subtitle">{config.albumName}</p>
          <p className="te-desc">Adicione aqui a foto oficial da turma completa</p>
        </div>
      </div>
    );
  }

  if (page.pageTheme === 'turma-right') {
    return (
      <div className="album-page-content theme-turma-especial" style={{ ...customBg }}>
        <div className="turma-especial-deco" aria-hidden="true">
          <div className="te-circle te-circle-1"></div>
          <div className="te-circle te-circle-2"></div>
        </div>
        <div className="turma-foto-wrap photo-grid-turma">
          {slots.map((slot, i) => (
            <div key={slot.id} className="te-slot-group">
              <StickerSlot slot={slot} index={i} customClass="photo-slot--turma-full" isPresentation={isPresentation} />
            </div>
          ))}
        </div>
        <div className="page-vert-label page-vert-label--gold">{config.albumName}</div>
      </div>
    );
  }

  if (page.pageTheme === 'alunos-left' || page.pageTheme === 'alunos-right') {
    const isLeft = page.pageTheme === 'alunos-left';
    return (
      <div className="album-page-content theme-alunos" style={{ ...customBg }}>
        <div className="page-header">
          {isLeft ? (
            <>
              <span className="page-num">{String(page.order).padStart(2, '0')}</span>
              <span className="page-section">👤 ALUNOS {page.startNum}–{page.endNum}</span>
            </>
          ) : (
            <>
              <span className="page-section">👤 ALUNOS {page.startNum}–{page.endNum}</span>
              <span className="page-num">{String(page.order).padStart(2, '0')}</span>
            </>
          )}
        </div>
        <div className="turma-alunos-label">{config.albumName}</div>
        <div style={getFlexContainerStyle()}>
          {slots.map((slot, i) => (
            <div key={slot.id} style={getSlotContainerStyle(config.stickersPerPage)}>
              <StickerSlot slot={slot} index={i} isPresentation={isPresentation} />
            </div>
          ))}
        </div>
        <div className="page-footer"><span className="footer-line"></span></div>
      </div>
    );
  }

  if (page.pageTheme === 'labs-left') {
    return (
      <div className="album-page-content theme-labs-especial" style={{ ...customBg }}>
        <div className="labs-especial-deco" aria-hidden="true">
          <div className="le-circle le-circle-1"></div>
          <div className="le-circle le-circle-2"></div>
          <div className="le-circle le-circle-3"></div>
        </div>
        <div className="labs-especial-content">
          <div className="le-badge">🏟️ ESPAÇOS</div>
          <h2 className="le-title">LABORATÓRIOS<br/>&amp; ESTÁDIOS</h2>
          <p className="le-subtitle">{config.albumName}</p>
          <p className="le-desc">Os espaços onde a aprendizagem e o futebol se encontram</p>
          <div className="le-deco-text">SENAI</div>
        </div>
      </div>
    );
  }

  if (page.pageTheme === 'labs-right') {
    return (
      <div className="album-page-content theme-labs-especial" style={{ ...customBg }}>
        <div className="labs-especial-deco" aria-hidden="true">
          <div className="le-circle le-circle-2"></div>
        </div>
        <div className="page-header" style={{ borderColor: 'rgba(255,215,0,.4)' }}>
          <span className="page-num" style={{ color: 'var(--gold)' }}>LABS</span>
          <span className="page-section" style={{ color: 'rgba(255,255,255,.4)' }}>🏟️ ESPAÇOS</span>
        </div>
        <div className="labs-slots-wrap">
          {slots.map((slot, i) => (
            <div key={slot.id} className="lab-slot-group">
              <StickerSlot slot={slot} index={i} customClass="photo-slot--lab" isPresentation={isPresentation} />
            </div>
          ))}
        </div>
        <div className="page-vert-label page-vert-label--teal">ESTÁDIOS</div>
      </div>
    );
  }

  if (page.pageTheme === 'coord-left') {
    return (
      <div className="album-page-content theme-coord-especial" style={{ ...customBg }}>
        <div className="coord-especial-deco" aria-hidden="true">
          <div className="co-circle co-circle-1"></div>
          <div className="co-circle co-circle-2"></div>
          <div className="co-circle co-circle-3"></div>
        </div>
        <div className="coord-especial-content">
          <div className="co-badge">🎖️ EQUIPE</div>
          <h2 className="co-title">COORDENAÇÃO<br/>&amp; GESTÃO</h2>
          <p className="co-subtitle">{config.albumName}</p>
          <p className="co-desc">Os profissionais que tornam tudo possível</p>
          <div className="co-deco-text">SENAI</div>
        </div>
      </div>
    );
  }

  if (page.pageTheme === 'coord-right') {
    return (
      <div className="album-page-content theme-coord-especial" style={{ ...customBg }}>
        <div className="coord-especial-deco" aria-hidden="true">
          <div className="co-circle co-circle-2"></div>
        </div>
        <div className="page-header" style={{ borderColor: 'rgba(255,215,0,.4)' }}>
          <span className="page-num" style={{ color: 'var(--gold)' }}>COORDENAÇÃO</span>
          <span className="page-section" style={{ color: 'rgba(255,255,255,.4)' }}>🎖️ COORDENAÇÃO</span>
        </div>
        <div className="coord-slots-wrap">
          {slots.map((slot, i) => (
            <div key={slot.id} className="coord-slot-group">
              <StickerSlot slot={slot} index={i} customClass="photo-slot--coord" isPresentation={isPresentation} />
            </div>
          ))}
        </div>
        <div className="page-vert-label page-vert-label--purple">COORDENAÇÃO</div>
      </div>
    );
  }

  if (page.pageTheme === 'final-left') {
    return (
      <div className="album-page-content theme-final" style={{ ...customBg }}>
        <div className="page-header">
          <span className="page-num" style={{ color: 'var(--gold)' }}>{String(page.order).padStart(2, '0')}</span>
          <span className="page-section" style={{ color: 'rgba(255,255,255,.38)' }}>🏅 FINAL</span>
        </div>
        <div className="closing-block">
          <div className="closing-icon">🌟</div>
          <h3 className="closing-title">Álbum Completo!</h3>
          <p className="closing-text">Parabéns por registrar todos os momentos históricos de<br/><strong style={{ color: 'var(--gold)' }}>{config.albumName}</strong><br/>na Copa do Mundo + SENAI 2026!</p>
          <div className="closing-badges">
            <span className="badge">⚽ Copa 2026</span>
            <span className="badge">🎓 SENAI</span>
            <span className="badge">🏆 Turma</span>
          </div>
        </div>
        <div className="page-footer"><span className="footer-line" style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }}></span></div>
      </div>
    );
  }

  if (page.pageTheme === 'final-right') {
    return (
      <div className="album-page-content theme-final" style={{ ...customBg }}>
        <div className="page-header">
          <span className="page-section" style={{ color: 'rgba(255,255,255,.38)' }}>🏅 ENCERRAMENTO</span>
          <span className="page-num" style={{ color: 'var(--gold)' }}>{String(page.order).padStart(2, '0')}</span>
        </div>
        <div className="closing-right-block">
          <div className="cr-trophy">🏆</div>
          <h3 className="cr-title">{config.albumName}</h3>
          <p className="cr-sub">Copa do Mundo + SENAI 2026</p>
          <div className="champion-stars">⭐⭐⭐⭐⭐</div>
          <div className="cr-barcode">▌▌▌▌▌▌▌▌▌▌ SENAI-2026</div>
        </div>
        <div className="page-footer"><span className="footer-line" style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }}></span></div>
      </div>
    );
  }

  // Fallback (e.g., standard pages without themes)
  const isLeftPage = pageIndex % 2 !== 0; // Se a capa for 0, as da esquerda são ímpares (1, 3, 5...)
  const pageNum = String(page.order).padStart(2, '0');

  return (
    <div className="album-page-content" style={{ background: config.bgStyle || '#eadecb', color: '#1e3a8a', ...customBg, display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER CLASSIC PANINI STYLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 8px 32px', fontWeight: '800', fontSize: '15px', letterSpacing: '2px', color: '#1e3a8a', textTransform: 'uppercase' }}>
        {isLeftPage ? (
          <>
            <span style={{ fontSize: '24px' }}>{pageNum}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {page.title}
            </span>
          </>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {page.title}
            </span>
            <span style={{ fontSize: '24px' }}>{pageNum}</span>
          </>
        )}
      </div>
      
      {/* BLUE LINE */}
      <div style={{ margin: '0 32px 16px 32px', height: '2px', backgroundColor: '#1e3a8a' }}></div>

      <div style={getFlexContainerStyle()}>
        {slots.map((slot, i) => (
          <div key={slot.id} style={getSlotContainerStyle(config.stickersPerPage)}>
            <StickerSlot slot={slot} index={i} customClass="photo-slot--classic" isPresentation={isPresentation} />
          </div>
        ))}
      </div>
    </div>
  );
}
