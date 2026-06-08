import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/index.css'
import './styles/rarity-effects.css'
import './styles/editor.css'
import './styles/landing.css'
import './styles/configurator.css'
import './styles/gacha.css'

import Landing from './pages/Landing'
import Configurator from './pages/Configurator'
import Editor from './pages/Editor'
import Presentation from './pages/Presentation'
import { useEffect } from 'react'
import { useAlbumStore } from './store/useAlbumStore'

// eslint-disable-next-line react-refresh/only-export-components
function StoreLoader({ children }: { children: React.ReactNode }) {
  const isLoaded = useAlbumStore(state => state.isLoaded);
  const loadAlbum = useAlbumStore(state => state.loadAlbum);

  useEffect(() => {
    if (!isLoaded) loadAlbum();
  }, [isLoaded, loadAlbum]);

  if (!isLoaded) {
    return <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff' }}>Carregando motor do álbum...</div>;
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreLoader>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/presentation" element={<Presentation />} />
        </Routes>
      </StoreLoader>
    </BrowserRouter>
  </StrictMode>,
)
