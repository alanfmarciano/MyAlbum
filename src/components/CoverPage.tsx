import type { AlbumConfig } from '../types';
import '../styles/cover.css';

interface CoverPageProps {
  config: AlbumConfig;
  isBack?: boolean;
}

export default function CoverPage({ config, isBack }: CoverPageProps) {
  if (isBack) {
    return (
      <div className="cover-page" style={{ borderRadius: '16px 5px 5px 16px', borderRight: 'none', borderLeft: '1px solid rgba(255, 255, 255, 0.12)' }}>
        {/* BLOB BACKGROUND */}
        <div className="cover-blobs" aria-hidden="true" style={{ transform: 'scaleX(-1)' }}>
          <div className="blob blob-1"></div><div className="blob blob-2"></div><div className="blob blob-3"></div>
          <div className="blob blob-4"></div><div className="blob blob-5"></div><div className="blob blob-6"></div>
          <div className="blob blob-7"></div><div className="blob blob-8"></div><div className="blob blob-9"></div>
          <div className="blob blob-10"></div><div className="blob blob-11"></div><div className="blob blob-12"></div>
        </div>

        <div className="cover-center-block" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <div className="cover-senai-badge" style={{ transform: 'scale(1.5)', marginBottom: '20px', backgroundColor: '#ffd700' }}>
            <div className="senai-badge-inner">
              <span className="senai-badge-icon">🎓</span>
              <span className="senai-badge-name">SENAI</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#fff', opacity: 0.8, fontSize: '0.8rem', letterSpacing: '2px', lineHeight: 1.6, textTransform: 'uppercase', padding: '0 20px' }}>
            <strong style={{ color: 'var(--gold)', fontSize: '1.2rem', display: 'block', marginBottom: '10px' }}>Lembrança Oficial</strong>
            Uma edição exclusiva da<br/>Turma de {config.albumName}
          </div>
        </div>

        <div className="cover-wc-block" style={{ background: 'transparent' }}>
          <div style={{ opacity: 0.5 }}>
            <div style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '1.5rem', color: '#fff' }}>
              ||| | || ||| | || |
            </div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '4px', color: '#fff', marginTop: '4px' }}>
              SENAI-2026-BR
            </div>
          </div>
        </div>

        <div className="cover-bottom-strip" style={{ justifyContent: 'center' }}>
          <div className="cover-capa-label" style={{ background: 'transparent', opacity: 0.5 }}>Produzido pela Turma</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cover-page">
      {/* BLOB BACKGROUND */}
      <div className="cover-blobs" aria-hidden="true">
        <div className="blob blob-1"></div><div className="blob blob-2"></div><div className="blob blob-3"></div>
        <div className="blob blob-4"></div><div className="blob blob-5"></div><div className="blob blob-6"></div>
        <div className="blob blob-7"></div><div className="blob blob-8"></div><div className="blob blob-9"></div>
        <div className="blob blob-10"></div><div className="blob blob-11"></div><div className="blob blob-12"></div>
      </div>

      {/* TOP STRIP */}
      <div className="cover-top-strip">
        <span className="cover-top-text">LIVRO ILUSTRADO OFICIAL</span>
      </div>

      {/* CENTRAL LOGO BLOCK */}
      <div className="cover-center-block">
        <div className="cover-26-wrap">
          <span className="cover-digit cover-digit-2">2</span>
          <div className="cover-trophy-center"></div>
          <span className="cover-digit cover-digit-6">6</span>
        </div>
        <div className="cover-fifa-box" style={{ backgroundColor: '#ffffff' }}>
          <span className="cover-fifa-text">SENAI</span>
        </div>
      </div>

      {/* WORLD CUP 2026 */}
      <div className="cover-wc-block">
        <p className="cover-wc-label">WORLD CUP</p>
        <p className="cover-wc-year">2026</p>
      </div>

      {/* BOTTOM STRIP */}
      <div className="cover-bottom-strip">
        <div className="cover-senai-badge" style={{ backgroundColor: '#ffd700' }}>
          <div className="senai-badge-inner">
            <span className="senai-badge-icon">🎓</span>
            <span className="senai-badge-name">SENAI</span>
          </div>
        </div>
        <div className="cover-capa-label">ÁLBUM SENAI</div>
        <div className="cover-player">⚽</div>
      </div>

    </div>
  );
}
