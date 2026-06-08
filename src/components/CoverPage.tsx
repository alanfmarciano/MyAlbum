import type { AlbumConfig } from '../types';
import '../styles/cover.css';

interface CoverPageProps {
  config: AlbumConfig;
  isBack?: boolean;
  customBgImage?: string;
}

export default function CoverPage({ config, isBack, customBgImage }: CoverPageProps) {
  const themeName = config.themeName || 'copa2026';
  const defaultBgImage = isBack ? `/themes/${themeName}/contracapa.png` : `/themes/${themeName}/capa.png`;
  
  // customBgImage takes precedence if the user uploaded something via the WYSIWYG editor
  const finalBgImage = customBgImage || defaultBgImage;

  const customStyle = { 
    backgroundImage: `url(${finalBgImage})`, 
    backgroundSize: '100% 100%', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat' 
  };

  if (isBack) {
    return (
      <div 
        className="cover-page" 
        style={{ 
          borderRadius: '16px 5px 5px 16px', 
          borderRight: 'none', 
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)', 
          ...customStyle 
        }} 
      />
    );
  }

  return (
    <div 
      className="cover-page" 
      style={customStyle} 
    />
  );
}
