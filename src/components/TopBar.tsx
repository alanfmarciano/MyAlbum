import { Download, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopBarProps {
  currentPageIndex: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onExportPDF: () => void;
}

export function TopBar({ currentPageIndex, totalPages, onNextPage, onPrevPage, onExportPDF }: TopBarProps) {
  return (
    <header className="h-16 bg-[#0a0e18] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[var(--copa-gold-500)] flex items-center justify-center">
          <span className="text-black font-bold">A</span>
        </div>
        <h1 className="text-white font-bold tracking-widest uppercase text-sm hidden sm:block">
          Álbum 2026
        </h1>
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onPrevPage} 
          disabled={currentPageIndex === 0}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <span className="text-white/80 font-mono text-sm w-24 text-center">
          Pág {currentPageIndex + 1} de {totalPages}
        </span>

        <button 
          onClick={onNextPage} 
          disabled={currentPageIndex === totalPages - 1}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--copa-gold-500)] text-black font-semibold rounded hover:bg-[var(--copa-gold-400)] transition-colors text-sm uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar PDF</span>
        </button>
        <button className="p-2 text-white/70 hover:text-white transition-colors" title="Configurações">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
