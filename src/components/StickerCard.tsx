import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Sticker } from '../types';
import '../styles/rarity-effects.css'; // Importa os efeitos Míticos/Lendários antigos
import clsx from 'clsx';
import { useAlbumStore } from '../store/useAlbumStore';

interface StickerCardProps {
  sticker: Sticker;
  isDraggingOver?: boolean; // Se está sobre um slot válido
}

export function StickerCard({ sticker, isDraggingOver }: StickerCardProps) {
  const setStickerRarity = useAlbumStore(state => state.setStickerRarity);
  const deleteSticker = useAlbumStore(state => state.deleteSticker);

  const handleRarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setStickerRarity(sticker.id, e.target.value as any);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Excluir esta figurinha permanentemente?')) {
      deleteSticker(sticker.id);
    }
  };

  // Configuração do drag
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: sticker.id,
    data: {
      type: 'Sticker',
      sticker,
    },
  });

  const style: React.CSSProperties = {
    aspectRatio: sticker.isLandscape ? '65 / 49' : '49 / 65',
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'relative cursor-grab active:cursor-grabbing group',
        'w-full h-full', // Ocupa 100% do wrapper
        'rounded-md shadow-md overflow-hidden bg-white',
        'transition-transform duration-200',
        isDragging && 'scale-110 z-50 opacity-90 shadow-2xl rotate-3',
        isDraggingOver && 'scale-105 opacity-100',
        // Estilos de raridade baseados no CSS antigo:
        (!sticker.rarity || sticker.rarity === 'common') && 'border border-gray-300',
        sticker.rarity === 'rare' && 'rarity-rare',
        sticker.rarity === 'epic' && 'rarity-epic',
        sticker.rarity === 'legendary' && 'rarity-legendary',
        sticker.rarity === 'mythic' && 'rarity-legendary', // fallback mythic to legendary for now
      )}
    >
      <img
        src={sticker.imageBase64 || sticker.imageObjectUrl}
        alt={`Sticker ${sticker.id}`}
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      
      {/* Container Holográfico V1 */}
      {sticker.rarity !== 'common' && (
        <div className="hologram absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60"></div>
      )}

      {/* Botões de Ação (Aparecem no hover) */}
      <div className="absolute top-1 left-1 right-1 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none">
        
        {/* Dropdown de Raridade */}
        <select 
          value={sticker.rarity || 'common'}
          onChange={handleRarityChange}
          onPointerDown={(e) => e.stopPropagation()} // Impede drag
          className="pointer-events-auto bg-black/70 text-white text-[9px] font-bold rounded px-1 py-0.5 outline-none border border-white/20 shadow-[0_0_5px_rgba(0,0,0,0.8)] cursor-pointer max-w-[65px]"
        >
          <option value="common">COMUM</option>
          <option value="rare">INCOMUM</option>
          <option value="epic">RARA</option>
          <option value="legendary">ÉPICA</option>
          <option value="mythic">LENDÁRIA</option>
        </select>

        {/* Botão Excluir */}
        <button
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()} // Impede drag
          className="pointer-events-auto w-5 h-5 rounded-full bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center text-[10px] shadow-[0_0_5px_rgba(0,0,0,0.8)] border border-white/20 ml-1 flex-shrink-0"
          title="Excluir Figurinha"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
