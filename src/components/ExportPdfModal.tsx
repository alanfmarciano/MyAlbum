import { X, BookOpen, FileText } from 'lucide-react';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'a4' | 'booklet') => void;
}

export function ExportPdfModal({ isOpen, onClose, onExport }: ExportPdfModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white font-outfit">Exportar Álbum em PDF</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-white/70 mb-6">
            Escolha o formato de impressão. O PDF gerado conterá todas as páginas do álbum com as figurinhas coladas.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => onExport('a4')}
              className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="text-[var(--gold)]" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">A4 Padrão (Digital / Espiral)</h3>
                <p className="text-white/60 text-sm">
                  As páginas são organizadas em ordem sequencial. Ideal para ler no computador, enviar por arquivo ou imprimir para encadernação simples.
                </p>
              </div>
            </button>

            <button
              onClick={() => onExport('booklet')}
              className="flex items-start gap-4 p-4 rounded-xl border border-[var(--gold)] bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="text-[var(--gold)]" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Livreto (Formato Revista)</h3>
                <p className="text-white/60 text-sm">
                  Pronto para impressão gráfica. Faz a imposição frente e verso para ser dobrado e grampeado no centro, criando uma revista profissional.
                  <br/><span className="text-[var(--gold)]/80 text-xs mt-1 block">* Pode adicionar páginas em branco caso o total não seja múltiplo de 4.</span>
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
