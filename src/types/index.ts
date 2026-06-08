export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Sticker {
  id: string; // Ex: sticker-123
  albumId?: string; // Vincula a figurinha ao álbum específico
  imageBase64: string; // A imagem processada
  imageBlob?: Blob; // Imagem otimizada (novo padrão)
  imageObjectUrl?: string; // URL efêmera na memória (runtime)
  rarity: Rarity;
  playerName?: string;
  isLandscape?: boolean;
  createdAt: number;
}

export interface Slot {
  id: string; // Ex: page0-slot1
  pageId: string; // Referência à página
  stickerId: string | null; // Null se estiver vazio
  playerName: string;
  playerNumber: string;
  team: string;
  rarity: Rarity; // A raridade "exigida" pelo slot
  position: number; // Ordem visual na página
  rotation?: number; // Grau de rotação (0, 90, 180, 270)
}

export interface Page {
  id: string; // Ex: page-0
  albumId: string;
  title: string;
  bgColor: string;
  order: number; // Qual a posição dela no álbum
  
  // Flags de Tipo de Página (Migradas da V1)
  isCover?: boolean;
  isBackCover?: boolean;
  isIntroPage?: boolean;
  isIdentPage?: boolean;
  isAlunosPage?: boolean;
  
  // Tema/Layout Específico do Legado
  pageTheme?: 'abertura-left' | 'abertura-right' | 'turma-left' | 'turma-right' | 'alunos-left' | 'alunos-right' | 'labs-left' | 'labs-right' | 'coord-left' | 'coord-right' | 'final-left' | 'final-right';
  
  // Textos e Metadados Extras
  infoCategory?: string;
  infoSubtitle?: string;
  infoDescription?: string;
  infoWatermark?: string;
  
  // Parâmetros para alunos
  startNum?: number;
  endNum?: number;
}

export interface AlbumConfig {
  id: string;
  albumName: string;
  totalPages: number;
  stickersPerPage: number;
  bgStyle: string;
  bgImage: string | null;
  borderStyle: string;
  stickerSize: string;
  includeCover: boolean;
  includeBackCover: boolean;
  includeIntro: boolean;
  includeClassPage: boolean;
  includeLabsPage: boolean;
  includeCoordPage: boolean;
  includeEndPage: boolean;
  pageNames: string[];
  
  // Configurações de Apresentação
  presentationInterval?: number;
  presentationStickerTime?: number;
  presentationAnimationSpeed?: number;
  manualZoomTime?: number;
  presentationStickerScale?: number;
  presentationStickerInterval?: number;
  presentationPackTime?: number;
}
