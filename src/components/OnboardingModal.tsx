import { useState, useEffect } from 'react';
import { useAlbumStore } from '../store/useAlbumStore';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const albumConfig = useAlbumStore(state => state.albumConfig);

  useEffect(() => {
    // Verifica se já viu o onboarding PARA ESTE ÁLBUM
    const hasSeen = localStorage.getItem(`onboarding_${albumConfig.id}`);
    if (!hasSeen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [albumConfig.id]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem(`onboarding_${albumConfig.id}`, 'true');
    setIsOpen(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#1a1f2e', borderRadius: '20px', width: '90%', maxWidth: '500px',
        padding: '30px', position: 'relative',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,215,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        
        {/* Mascote */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '-80px', marginBottom: '20px'
        }}>
          <img 
            src="/mascote.png" 
            alt="Mascote" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}
          />
        </div>

        <h2 style={{ fontFamily: 'Oswald, sans-serif', color: 'var(--copa-gold-300)', fontSize: '2rem', margin: '0 0 10px 0' }}>
          {step === 1 && "Bem-vindo ao Editor!"}
          {step === 2 && "A Galeria de Figurinhas"}
          {step === 3 && "Colando no Álbum!"}
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: '1.5', minHeight: '60px' }}>
          {step === 1 && "Aqui é onde a mágica da coleção acontece. Prepare-se para montar o álbum da sua turma!"}
          {step === 2 && "Use a barra lateral direita para importar fotos do seu computador. Elas serão transformadas automaticamente em figurinhas."}
          {step === 3 && "Basta arrastar suas figurinhas da galeria e soltá-las nos slots tracejados para colar. Vamos lá!"}
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px', margin: '20px 0' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? '20px' : '8px', height: '8px', borderRadius: '4px',
              background: s === step ? 'var(--copa-gold-400)' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}
        >
          {step === 3 ? "Começar a Colecionar!" : "Próximo"}
        </button>

      </div>
    </div>
  );
}
