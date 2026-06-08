import type { Page, AlbumConfig, Slot } from '../types';
import CoverPage from './CoverPage';
import AlbumPage from './AlbumPage';

interface AlbumSpreadRendererProps {
  leftPage?: Page | null;
  rightPage?: Page | null;
  leftPageIndex?: number;
  rightPageIndex?: number;
  config: AlbumConfig;
  previewSlots?: Slot[];
  hideSpine?: boolean;
}

export function AlbumSpreadRenderer({ leftPage, rightPage, leftPageIndex, rightPageIndex, config, previewSlots, hideSpine }: AlbumSpreadRendererProps) {
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
          <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: isSinglePage ? '4px' : '4px 0 0 4px', overflow: 'hidden' }}>
            {leftPage.isCover ? <CoverPage config={config} /> : leftPage.isBackCover ? <CoverPage config={config} isBack /> : <AlbumPage page={leftPage} pageIndex={leftPageIndex!} previewSlots={previewSlots} previewConfig={config} />}
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
          <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: isSinglePage ? '4px' : '0 4px 4px 0', overflow: 'hidden' }}>
            {rightPage.isCover ? <CoverPage config={config} /> : rightPage.isBackCover ? <CoverPage config={config} isBack /> : <AlbumPage page={rightPage} pageIndex={rightPageIndex!} previewSlots={previewSlots} previewConfig={config} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
