import React, { useRef } from 'react';
import type { Page, AlbumConfig, Slot } from '../types';
import CoverPage from './CoverPage';
import AlbumPage from './AlbumPage';
import { useAlbumStore } from '../store/useAlbumStore';

interface AlbumSpreadRendererProps {
  leftPage?: Page | null;
  rightPage?: Page | null;
  leftPageIndex?: number;
  rightPageIndex?: number;
  config: AlbumConfig;
  previewSlots?: Slot[];
  hideSpine?: boolean;
  isEditor?: boolean;
}

function PageEditOverlay({ page }: { page: Page }) {
  const updatePage = useAlbumStore(state => state.updatePage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePage(page.id, { customBgImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)', pointerEvents: 'none',
    }}>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      <button onClick={() => fileInputRef.current?.click()} style={{
        background: 'var(--gold, #d4af37)', color: '#000', border: 'none', padding: '12px 24px',
        borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto'
      }}>
        📷 Alterar Fundo
      </button>
      {page.customBgImage && (
        <button onClick={() => updatePage(page.id, { customBgImage: undefined })} style={{
          background: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px',
          borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', pointerEvents: 'auto'
        }}>
          🗑️ Remover
        </button>
      )}
    </div>
  );
}

export function AlbumSpreadRenderer({ leftPage, rightPage, leftPageIndex, rightPageIndex, config, previewSlots, hideSpine, isEditor }: AlbumSpreadRendererProps) {
  const isSinglePage = !leftPage || !rightPage;

  return (
    <div className="album-spread-container" style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      aspectRatio: '420/297', 
      gap: '2px', 
      backgroundColor: isSinglePage ? 'transparent' : '#111', 
      padding: isSinglePage ? '0' : '4px', 
      borderRadius: '8px', 
      boxShadow: isSinglePage ? 'none' : '0 20px 50px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {/* Espinha do Álbum (Sombra no centro) */}
      {!isSinglePage && !hideSpine && (
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: '40px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
          zIndex: 10, pointerEvents: 'none'
        }} />
      )}

      {/* Página Esquerda */}
      <div style={{ 
        flex: 1, 
        backgroundColor: leftPage ? '#fff' : 'transparent', 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: isSinglePage ? '8px' : '4px 0 0 4px',
        ...(isSinglePage && leftPage ? {
          backgroundColor: '#111',
          padding: '4px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        } : {})
      }}>
        {leftPage ? (
          <div className="group" style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: isSinglePage ? '4px' : '4px 0 0 4px', overflow: 'hidden', position: 'relative' }}>
            {leftPage.isCover ? <CoverPage config={config} customBgImage={leftPage.customBgImage} /> : leftPage.isBackCover ? <CoverPage config={config} isBack customBgImage={leftPage.customBgImage} /> : <AlbumPage page={leftPage} pageIndex={leftPageIndex!} previewSlots={previewSlots} previewConfig={config} />}
            {isEditor && <PageEditOverlay page={leftPage} />}
          </div>
        ) : null}
      </div>
      
      {/* Página Direita */}
      <div style={{ 
        flex: 1, 
        backgroundColor: rightPage ? '#fff' : 'transparent', 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: isSinglePage ? '8px' : '0 4px 4px 0',
        ...(isSinglePage && rightPage ? {
          backgroundColor: '#111',
          padding: '4px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        } : {})
      }}>
        {rightPage ? (
          <div className="group" style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: isSinglePage ? '4px' : '0 4px 4px 0', overflow: 'hidden', position: 'relative' }}>
            {rightPage.isCover ? <CoverPage config={config} customBgImage={rightPage.customBgImage} /> : rightPage.isBackCover ? <CoverPage config={config} isBack customBgImage={rightPage.customBgImage} /> : <AlbumPage page={rightPage} pageIndex={rightPageIndex!} previewSlots={previewSlots} previewConfig={config} />}
            {isEditor && <PageEditOverlay page={rightPage} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
