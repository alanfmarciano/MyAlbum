# Análise do Projeto: Álbum Digital da Copa do Mundo SENAI

## 1. Resumo do Objetivo do Sistema
O "Álbum Digital da Copa do Mundo SENAI" é uma plataforma web interativa focada em proporcionar uma experiência gamificada de colecionismo educacional. O objetivo não é apenas fornecer um álbum virtual, mas criar engajamento por meio de mecânicas de jogos e coleção (como a abertura de "pacotinhos", sistema de raridade, gerenciamento e colagem das figurinhas). A plataforma permite que administradores (ou usuários com papel equivalente) configurem a estrutura do álbum, personalizem fundos e títulos, além de adicionar imagens (fotos dos alunos) que são tratadas como figurinhas colecionáveis (Stickers) com níveis variados de raridade. A aplicação opera primariamente no navegador de forma offline-first (utilizando o banco de dados IndexedDB).

## 2. Tecnologias Utilizadas
A aplicação é um Single Page Application (SPA) moderno de frontend construído com o ecossistema React.
- **Linguagem Principal:** TypeScript, HTML, e Vanilla CSS / CSS Modules
- **Framework Core:** React 19 em conjunto com Vite (Server/Build Tool)
- **Roteamento:** `react-router-dom` para navegação entre visões (Landing, Configurator, Editor, Presentation)
- **Gerenciamento de Estado Global:** `zustand` configurado com `useAlbumStore`
- **Armazenamento e Persistência Local:** `dexie` (Wrapper sobre o IndexedDB, garantindo que o álbum não dependa de backend ativo)
- **Estilização e UI:** 
  - `tailwindcss` para estilização utilitária
  - `clsx` e `tailwind-merge` para classes dinâmicas
  - CSS nativo para efeitos avançados de brilhos e raridade (`rarity-effects.css`), animações (`gacha.css`) e landing.
- **Ícones e Assets SVG:** `lucide-react`
- **Animações e Efeitos Visuais:** 
  - `framer-motion` (Microinterações)
  - `react-pageflip` (Efeito 3D ao virar páginas do álbum de figurinhas)
- **Interatividade (Drag and Drop):** Ecossistema `@dnd-kit` (`core`, `sortable`, `utilities`) para arrastar e soltar as figurinhas nos slots (espaços vazios das páginas)
- **Geração de Exportáveis:** `html2pdf.js`, `jspdf`, `html2canvas` para conversão do álbum HTML em arquivo PDF.

## 3. Estrutura de Pastas Explicada
O repositório apresenta as pastas de build e código fonte clássicas de um app Vite/React.
```
NovoAlbum2.0/
├── public/                 # Assets estáticos servidos diretamente pelo servidor web (não passam pelo Vite bundle config)
├── src/                    # Todo o código fonte principal da aplicação
│   ├── assets/             # Mídias diversas (possivelmente as imagens padronizadas ou pacotinhos)
│   ├── components/         # Componentes React reutilizáveis (e.g. StickerSlot, StickerCard, SidebarGallery, AlbumPage)
│   ├── pages/              # Visualizações maiores (views) mapeadas pelo Router (Landing, Configurator, Editor, Presentation)
│   ├── store/              # Gerenciamento de estado e BD (useAlbumStore.ts, db.ts)
│   ├── styles/             # Estilos CSS específicos separados por escopo (gacha, editor, rarity-effects, configurator)
│   ├── types/              # Tipagens do TypeScript (index.ts -> Page, Slot, Sticker, AlbumConfig)
│   └── utils/              # Funções de suporte, como a construção lógica da disposição das páginas e slots (albumBuilder.ts)
├── .gitignore              # Lista de pastas que não sobem no git
├── package.json            # Scripts NPM, dependências e configurações estruturais
├── tsconfig.*.json         # Configurações do compilador TypeScript
├── vite.config.ts          # Configuração do Vite (plugins, porta hardcoded, tailwind)
└── MANUAIS/DOCUMENTAÇÕES   # (PRODUCT_VISION.md, manualDoApp.md, PROJECT_RULES.md, etc)
```

## 4. Principais Funcionalidades Implementadas
- **Modelagem do Banco Offline (Dexie/Zustand):** O `useAlbumStore.ts` se integra ao DB Dexie para realizar transações seguras no IndexedDB nas tabelas (config, pages, slots, stickers).
- **Construtor Dinâmico de Páginas (AlbumBuilder):** Um motor que cria páginas predefinidas baseando-se no `AlbumConfig` (ex: capa especial, página da turma, laboratórios, dezenas de slots dependendo de configs como `stickersPerPage`).
- **Gerenciador de Figurinhas (Editor):** Upload de múltiplas imagens sendo comprimidas em base64/Blob localmente (`compressImage`).
- **Sistema de Drag & Drop para Colar:** Arrastar a figurinha de uma "galeria" para "slots" localizados no componente `AlbumPage`.
- **Motor de Raridades e Efeitos:** Funcionalidade que aleatoriza a raridade das figurinhas "no estoque" (Comum, Raro, Épico, Lendário, Mítico). O frontend renderiza shaders CSS complexos dependendo do "Grau".
- **Modo Gacha / Apresentação:** Há indícios em `store` de uma "Apresentação" ou exibição (gacha.css e tempos de `presentationInterval`, `presentationStickerTime`).
- **Exportação/Importação do Projeto:** Salvar o estado do IndexedDB para um arquivo JSON (backup) e recuperá-lo para que todo o progresso do álbum não seja perdido ao limpar os cookies do navegador.

## 5. Funcionalidades Incompletas ou em Desenvolvimento
- O código base sugere a exportação em PDF (dependências de `html2canvas` e `jspdf`), mas não está claro o nível de estabilidade de imprimir layouts baseados em 3D/PageFlip. O componente `ExportPdfModal.tsx` precisa de validação de layout.
- Responsividade: Algumas configurações dinâmicas de largura/altura podem quebrar a diagramação das figurinhas em monitores variados se a apresentação não escalar perfeitamente (haja vista variáveis como `presentationStickerScale`).
- **Integração com Backend / Multiplayer:** O manifesto (`PRODUCT_VISION.md`) fala sobre sistema de "Trocas", "Ranking" e "Social", porém toda a arquitetura atual é 100% Client-Side. O projeto foi projetado inicialmente (ou neste momento do MVP) para apenas um "player" curador.

## 6. Possíveis Problemas Encontrados
- **Escalabilidade do IndexedDB:** Ao invés de armazenar links (URLs), o projeto converte imagens para blobs e as grava no banco `Dexie` e no objeto Zustand. Como os álbuns crescem com o tempo e com os usuários realizando uplod de dezenas de fotos (Stickers), isso pode acarretar memory-leaks do lado do navegador, crashes na aba e travamentos (especialmente ao renderizar dezenas de blobs/base64 ao mesmo tempo no `StickerShowcaseOverlay`).
- A lógica do ID `album-default` e como a inicialização do app resgata o último projeto (`loadAlbum`) parece frágil caso o usuário importe múltiplos JSONs diferentes.

## 7. Débitos Técnicos Identificados
- **Refatoramento de Imagens Blob vs ObjectURL:** Foi criado um hacky helper `migrateAndFilterStickers` dentro do store que converte Base64 do Dexie para `imageBlob` e insere `isLandscape`. É uma lógica custosa rodando no state inicial.
- **Store Gigante (God Class):** O arquivo `useAlbumStore.ts` é extenso (536 linhas) com responsabilidades de interface, lógica de negócio, interações de drag-and-drop e queries complexas no banco de dados misturadas juntas. Seria ideal dividi-lo em slices (ex: `createStickerSlice`, `createConfigSlice`, `createSlotSlice`).

## 8. Mapa do Projeto

### Onde está cada funcionalidade
- **Configuração Inicial do Projeto:** Rota `/configurator` -> `src/pages/Configurator.tsx`
- **Área de Manuseio de Figurinhas e Colagem:** Rota `/editor` -> `src/pages/Editor.tsx` e seus componentes associados (`SidebarGallery`, `StickerSlot`, `AlbumPage`).
- **Exibição do Motor 3D do Álbum:** Componentes visuais ficam centralizados na pasta `src/components`. A leitura como livro deve rodar em `AlbumSpreadRenderer.tsx` + bibliotecas de pageflip.
- **Apresentação / Eventos:** Rota `/presentation` -> `src/pages/Presentation.tsx` associada aos estados temporais em `useAlbumStore.ts`.

### Arquivos Mais Importantes
1. `src/store/useAlbumStore.ts`: O "coração" lógico da aplicação.
2. `src/store/db.ts`: A interface com o banco de dados cliente.
3. `src/utils/albumBuilder.ts`: Define de forma imperativa como as páginas e espaços de figurinhas são preenchidos ao criar um novo álbum.
4. `src/types/index.ts`: Modelagem de dados (`Sticker`, `Slot`, `Page`, `AlbumConfig`).
5. `src/pages/Editor.tsx`: O cérebro da interação de colar/retirar e modificar figurinhas.

### Dependências entre Módulos
O sistema é altamente centrado em volta do `Zustand`. Componentes não passam dados por `props` muito profundos (prop drilling); eles conectam diretamente ao `useAlbumStore`. O `albumBuilder` e dependem das interfaces no `types`.

### Fluxo de Navegação do Usuário
1. O usuário abre o sistema e cai no **Landing**.
2. Ele é direcionado a escolher a configuração inicial do álbum ou carregar o estado (**Configurator**).
3. Após criar, ele é redirecionado ao **Editor**, onde a maior parte da mágica acontece: à esquerda um painel com as figurinhas no "estoque", ao centro o Álbum 3D. O usuário arrasta a figurinha do painel para o Slot.
4. O usuário pode então iniciar uma experiência de **Presentation** para visualizar os stickers obtidos ou realizar aberturas simuladas de pacote.

## 9. Estado Atual do Projeto
### O Que Já Está Funcionando
- Roteamento e arquitetura base do SPA.
- Modelagem complexa do banco de dados relacional simulado no frontend via Dexie (páginas tem slots, figurinhas podem pertencer a slots).
- Criação base do livro de figurinhas e as disposições pré-montadas de slots dependendo do tipo da página (turma especial, labs, capa).
- Sistema de raridades (matemática para sorteio implementada).

### O Que Precisa Ser Finalizado
- Dependendo do estágio planejado do MVP, funcionalidades sociais descritas no "Product Vision" (Sistema de Trocas e Sistema de Duplicatas) não estão enxergáveis no código atual, limitando-se ao app como uma experiência geradora manual (um super administrador que alimenta e apresenta).

### Próximos Passos Recomendados
1. Realizar otimizações profundas no rendering (memoization com `React.memo` nos `StickerCard` e `StickerSlot`) para não estrangular a RAM do navegador em álbuns grandes.
2. Segmentar a lógica do Zustand em vários arquivos e retirar responsabilidades do DB dentro do hook.
3. Definir o grau de complexidade esperado para a parte "server-side" futura do projeto. (Caso a visão "Social e Trocas entre os alunos do SENAI" venha a ser feita agora, será obrigatório migrar do formato offline-first puro local para um backend Node.js que trate as instâncias dos usuários e da economia).
