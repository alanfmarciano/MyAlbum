import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AlbumConfig } from '../types';
import { useAlbumStore } from '../store/useAlbumStore';
import { db } from '../store/db';

export default function Landing() {
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFromJson = useAlbumStore(state => state.importFromJson);
  const loadAlbumById = useAlbumStore(state => state.loadAlbumById);

  const [albums, setAlbums] = useState<(AlbumConfig & { pageCount?: number, totalSlots?: number, filledSlots?: number, progress?: number, date?: string })[]>([]);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      const configs = await db.config.toArray();
      const albumsData = await Promise.all(configs.map(async (config) => {
        const pages = await db.pages.where('albumId').equals(config.id).toArray();
        const pageIds = pages.map(p => p.id);
        const slots = pageIds.length > 0 ? await db.slots.where('pageId').anyOf(pageIds).toArray() : [];
        const totalSlots = slots.length;
        const filledSlots = slots.filter(s => s.stickerId !== null).length;
        const progress = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
        
        return {
          ...config,
          pageCount: pages.length,
          totalSlots,
          filledSlots,
          progress,
          date: new Date().toLocaleDateString('pt-BR')
        };
      }));
      setAlbums(albumsData);
    };
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (!particlesRef.current) return;
    const container = particlesRef.current;
    container.innerHTML = '';
    const emojis = ['⚽', '🥅', '🏆', '🎽', '⭐'];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${8 + Math.random() * 10}s`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.fontSize = `${12 + Math.random() * 16}px`;
      particle.style.opacity = `${0.08 + Math.random() * 0.15}`;
      if (Math.random() > 0.6) {
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      } else {
        particle.style.width = particle.style.height = `${2 + Math.random() * 4}px`;
        particle.style.background = 'var(--copa-gold-500)';
        particle.style.borderRadius = '50%';
      }
      container.appendChild(particle);
    }
  }, []);

  const confirmDeleteAlbum = async () => {
    if (!albumToDelete) return;
    
    await db.transaction('rw', [db.config, db.pages, db.slots, db.stickers], async () => {
      await db.config.delete(albumToDelete);
      
      const oldPages = await db.pages.where('albumId').equals(albumToDelete).toArray();
      const oldPageIds = oldPages.map(p => p.id);
      if (oldPageIds.length > 0) {
        const oldSlots = await db.slots.where('pageId').anyOf(oldPageIds).toArray();
        await db.slots.bulkDelete(oldSlots.map(s => s.id));
        await db.pages.bulkDelete(oldPageIds);
      }
      
      const oldStickers = await db.stickers.toArray();
      const stickersToDelete = oldStickers.filter(s => s.albumId === albumToDelete).map(s => s.id);
      if (stickersToDelete.length > 0) {
        await db.stickers.bulkDelete(stickersToDelete);
      }
    });
    
    setAlbums(prev => prev.filter(a => a.id !== albumToDelete));
    setAlbumToDelete(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAlbumToDelete(id);
  };

  const handleOpenAlbum = async (id: string) => {
    await loadAlbumById(id);
    navigate('/editor');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importFromJson(file);
      navigate('/editor');
    }
  };

  return (
    <div className="landing">
      {/* Background Effects */}
      <div className="landing-bg">
        <div className="landing-gradient"></div>
        <div className="landing-pattern"></div>
        <div className="landing-particles" id="landing-particles" ref={particlesRef}></div>
        <div className="landing-stadium"></div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-ball">⚽</span>
          <span className="logo-text">Álbum Copa 2026</span>
        </div>
        <div className="landing-header-actions">
          <button className="btn btn-outline btn-sm" id="btn-load-json" onClick={() => fileInputRef.current?.click()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Carregar JSON
          </button>
        </div>
      </header>

      <div className="landing-content">
        {/* Hero Section */}
        <div className="hero-section animate-fade-in">
          <div className="hero-trophy">🏆</div>
          <div className="hero-badge">
            <span className="hero-badge-flag">🇧🇷</span>
            <span>FIFA WORLD CUP 2026™</span>
            <span className="hero-badge-flag">🌎</span>
          </div>
          <h1 className="hero-title" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <span className="hero-title-line">Crie sua História na</span>
            <span className="hero-title-gold">Copa de 2026</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
            A experiência definitiva em álbuns digitais. Personalize, colecione e eternize seus momentos em um formato premium de alta qualidade.
          </p>
          <button 
            className="btn btn-primary btn-xl animate-slide-up delay-2" 
            id="btn-new-album" 
            style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '50px' }}
            onClick={() => navigate('/configurator', { state: { isNew: true } })}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Começar Novo Projeto
          </button>
        </div>

        {/* Albums List */}
        {albums.length > 0 ? (
          <div className="albums-section animate-slide-up delay-3">
            <div className="albums-section-header">
              <h2 className="albums-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Seus Álbuns
              </h2>
              <span className="albums-count">{albums.length} {albums.length === 1 ? 'álbum' : 'álbuns'}</span>
            </div>
            <div className="albums-grid" id="albums-grid">
              {albums.map((album) => (
              <div 
                key={album.id}
                className="album-card" 
                onClick={() => handleOpenAlbum(album.id)}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * -12;
                  const rotateY = ((x - centerX) / centerX) * 12;
                  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                  const glare = card.querySelector('.card-glare') as HTMLDivElement;
                  if (glare) {
                    glare.style.transform = `translate(${x}px, ${y}px)`;
                    glare.style.opacity = '0.4';
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                  const glare = card.querySelector('.card-glare') as HTMLDivElement;
                  if (glare) {
                    glare.style.opacity = '0';
                    glare.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => { glare.style.transition = ''; }, 500);
                  }
                }}
              >
                <div className="card-glare" style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%)', borderRadius: '50%', top: '-150px', left: '-150px', pointerEvents: 'none', opacity: 0, zIndex: 10, transition: 'opacity 0.3s', mixBlendMode: 'overlay' }}></div>
                <div className="album-card-cover" style={{ background: 'linear-gradient(135deg, #008f4c, #006b39)' }}>
                  <div className="album-card-cover-icon">⚽</div>
                  <div className="album-card-cover-name">{album.albumName || 'Sem Nome'}</div>
                  <div className="album-card-glow" />
                  
                  <div className="album-card-actions-overlay">
                    <button className="btn btn-primary btn-sm album-open-btn" onClick={(e) => { e.stopPropagation(); handleOpenAlbum(album.id); }}>
                      Abrir Álbum
                    </button>
                    <button className="btn btn-secondary btn-sm album-edit-btn" onClick={(e) => { 
                      e.stopPropagation(); 
                      loadAlbumById(album.id).then(() => navigate('/configurator')); 
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm album-delete-btn" onClick={(e) => handleDeleteClick(e, album.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Excluir
                    </button>
                  </div>
                </div>
                <div className="album-card-info">
                  <div className="album-card-title">{album.albumName || 'Sem Nome'}</div>
                  <div className="album-card-meta">
                    <span>{album.pageCount} páginas</span>
                    <span>·</span>
                    <span>{album.filledSlots} figurinhas</span>
                    <span>·</span>
                    <span>{album.date}</span>
                  </div>
                  <div className="album-card-progress">
                    <div className="album-progress-bar">
                      <div className="album-progress-fill" style={{ width: `${album.progress}%` }}></div>
                    </div>
                    <span className="album-progress-text">{album.filledSlots}/{album.totalSlots} coladas ({album.progress}%)</span>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state animate-slide-up delay-3">
            <div className="empty-icon">📖</div>
            <p className="empty-text">Nenhum álbum criado ainda.<br/>Comece criando seu primeiro álbum da Copa!</p>
          </div>
        )}

        {/* Features */}
        <div className="landing-features animate-slide-up delay-4">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Personalizável</h3>
            <p>Configure páginas, layouts e estilos temáticos</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Efeitos de Raridade</h3>
            <p>Comum, Raro, Épico e Lendário</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Álbum Pronto</h3>
            <p>Vire as páginas como um álbum real</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Exportar PDF</h3>
            <p>Gere um PDF de alta qualidade para impressão</p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} id="json-file-input" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Modal de Confirmação de Exclusão */}
      {albumToDelete && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={() => setAlbumToDelete(null)}>
          <div className="modal-content glass-panel" style={{ padding: '32px', maxWidth: '400px', textAlign: 'center', borderRadius: '16px', background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗑️</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Excluir Álbum?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Tem certeza que deseja excluir este álbum? Todas as páginas e figurinhas coladas serão perdidas <b style={{color: 'var(--danger)'}}>permanentemente</b>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setAlbumToDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDeleteAlbum}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
