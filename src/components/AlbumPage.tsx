import React from 'react';
import type { Page, Slot, AlbumConfig } from '../types';
import StickerSlot from './StickerSlot';
import { useAlbumStore } from '../store/useAlbumStore';

interface AlbumPageProps {
  page: Page;
  pageIndex: number;
  previewConfig?: AlbumConfig;
  previewSlots?: Slot[];
  isPresentation?: boolean;
  isEditor?: boolean;
}

export default function AlbumPage({ page, pageIndex, previewConfig, previewSlots, isPresentation, isEditor }: AlbumPageProps) {
  const storeConfig = useAlbumStore(state => state.albumConfig);
  const storeSlots = useAlbumStore(state => state.slots).filter(s => s.pageId === page.id);
  const updatePage = useAlbumStore(state => state.updatePage);

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

  const bgUrl = page.customBgImage || config.bgImage;
  const customBg = bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {};

  const isLeftPage = pageIndex % 2 !== 0; // Se a capa for 0, as da esquerda são ímpares (1, 3, 5...)
  const pageNum = String(page.order).padStart(2, '0');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage(page.id, { title: e.target.value });
  };

  const TitleElement = () => {
    if (isEditor) {
      return (
        <input 
          type="text" 
          value={page.title} 
          onChange={handleTitleChange}
          style={{ 
            background: 'rgba(255, 255, 255, 0.5)', 
            border: '1px dashed #1e3a8a', 
            color: 'inherit', 
            font: 'inherit', 
            padding: '2px 8px',
            borderRadius: '4px',
            outline: 'none',
            minWidth: '150px',
            textAlign: isLeftPage ? 'left' : 'right'
          }}
          title="Clique para editar o título da página"
        />
      );
    }
    return <span>{page.title}</span>;
  };

  return (
    <div className="album-page-content" style={{ background: config.bgStyle || '#eadecb', color: '#1e3a8a', ...customBg, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      
      {/* HEADER CLASSIC PANINI STYLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 8px 32px', fontWeight: '800', fontSize: '15px', letterSpacing: '2px', color: '#1e3a8a', textTransform: 'uppercase' }}>
        {isLeftPage ? (
          <>
            <span style={{ fontSize: '24px' }}>{pageNum}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <TitleElement />
            </span>
          </>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <TitleElement />
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
