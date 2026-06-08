# Manual Detalhado do Aplicativo: Álbum de Figurinhas Oficial 2026

Este manual descreve exaustivamente a arquitetura, as funcionalidades, a estrutura de páginas e a experiência gamificada do **Álbum de Figurinhas 2026**. O documento serve como guia definitivo para Inteligências Artificiais e desenvolvedores compreenderem o fluxo da aplicação e a lógica visual que transforma o app em uma simulação fiel de um álbum físico real.

---

## 1. Intenção e Conceito do Aplicativo
O aplicativo visa criar uma experiência nostálgica e imersiva de colecionar figurinhas, mas em um ambiente digital 100% offline. Ele não é apenas um "visualizador de fotos"; ele replica a **física e a estrutura editorial de um álbum de bancada**.

**A temática central (Padrão):** É uma mistura entre a **Copa do Mundo FIFA 2026** e a vivência escolar/acadêmica (**SENAI**). A ideia é que o usuário (um aluno ou coordenador) crie um álbum para sua turma, mesclando a estética esportiva de alto padrão com as fotos de seus colegas, professores e laboratórios da instituição.

A aplicação roda inteiramente no navegador do usuário, salvando todos os dados e imagens localmente usando o **IndexedDB** para garantir performance e contornar os limites de memória.

---

## 2. A Estrutura Editorial do Álbum (Páginas Físicas)
Diferente de uma simples galeria, o álbum gerado pelo sistema simula um encadernado físico. Se todas as configurações padrão forem mantidas, o álbum será gerado com a seguinte **ordenação exata de páginas**, simulando as seções de um álbum real da Panini:

### 2.1. Capa (Página Externa Frontal)
A capa é a primeira impressão. Ela não possui slots de figurinhas.
- **Design Padrão:** Fundo com gradiente verde escuro (estilo México/Brasil), o logotipo de uma bola de futebol ("⚽"), o título personalizado (padrão: "Copa do Mundo 2026") e a marca registrada "FIFA WORLD CUP 2026™" em dourado.

### 2.2. Abertura e Identificação (Páginas Iniciais)
Logo ao abrir o álbum (Página 1 e 2), o usuário é recebido por páginas institucionais:
- **Abertura (Página Escura):** Uma página preta/noturna `#0a0e18` com a categoria "INTRODUÇÃO". O texto de boas-vindas informa: *"Este é o seu álbum oficial da Copa do Mundo + SENAI 2026. Guarde aqui as fotos dos laboratórios e os melhores momentos da sua turma para sempre."*
- **Identificação (Página da Cor do Álbum):** Uma página que exibe o ícone de graduação ("🎓") e o título do álbum em destaque, servindo como a "página de dono" do álbum.

### 2.3. Seção: A Turma (Páginas Especiais)
Uma dupla de páginas focada nas fotos gerais da sala de aula.
- **Página de Texto (Foto da Turma):** Fundo escuro texturizado informando "📸 FOTO OFICIAL".
- **Página de Slots (Fotos da Turma):** Uma página com slots retangulares e horizontais (formato 4:3) para colar fotos panorâmicas do grupo de alunos.

### 2.4. Seção: Os Alunos (Páginas Normais / "As Seleções")
Esta é a parte central do álbum, simulando as páginas das seleções de futebol.
- O usuário define quantas páginas existirão (ex: 4 a 10 páginas) e quantas figurinhas cabem por página (4, 6, 8, 9 ou 12).
- O fundo destas páginas segue a "Cor Principal" escolhida no configurador.
- Cada slot é numerado sequencialmente. O usuário pode nomear cada uma dessas páginas no configurador (Ex: "Turma de Robótica", "Turma de TI", "Professores").

### 2.5. Seção: Laboratórios & Estádios
Uma seção especial dedicada à infraestrutura.
- **Página de Texto:** "🏟️ ESPAÇOS - LABORATÓRIOS & ESTÁDIOS. Os espaços onde a aprendizagem e o futebol se encontram."
- **Página de Slots:** Slots dedicados a colar fotos dos laboratórios, quadras, salas de aula ou estádios reais.

### 2.6. Seção: Coordenação & Gestão
- **Página de Texto:** "🎖️ EQUIPE - COORDENAÇÃO & GESTÃO. Os profissionais que tornam tudo possível."
- **Página de Slots:** Slots para as figurinhas do corpo docente (diretor, coordenadores, etc.).

### 2.7. Encerramento (Últimas Páginas Internas)
- **Página "Parabéns":** Uma mensagem de congratulações indicando "🏅 FINAL - PARABÉNS! Parabéns por completar o álbum da turma!".
- **Página "Código de Barras":** A última página antes da contracapa, exibindo um troféu brilhante, o nome do álbum e uma simulação visual de um código de barras comercial indicando "SENAI-2026".

### 2.8. Contracapa (Página Externa Traseira)
A última página simulada pelo sistema, com a mesma cor da capa, sinalizando que o usuário fechou o álbum físico.

---

## 3. Funcionalidades de Interface (Views)

### 3.1. Landing Page (`landing.js`)
A recepção do aplicativo. Possui um fundo escuro elegante com partículas flutuantes em formato de troféus, bolas e estrelas.
- **Ações Principais:** O botão central "Começar Novo Projeto" redireciona o usuário para o configurador. O botão "Carregar JSON" no canto superior permite "descompactar" um álbum físico inteiro de um backup anterior.
- **Lista de Álbuns (Sua Coleção):** Cada álbum criado ganha um "Card" que reage fisicamente (efeito Tilt 3D) quando o mouse passa por cima. O card mostra o progresso (ex: "12/40 coladas (30%)") e permite **Abrir**, **Editar Configurações** ou **Excluir** o projeto.

### 3.2. Configurador (`configurator.js`)
A gráfica do álbum. Esta tela simula o processo de "encomenda" de um álbum personalizado.
- **Formulário de Regras:** 
  - Nome do álbum, quantidade de páginas normais (de alunos), densidade (figurinhas por página) e estilo de borda (clássica, moderna, sem borda).
  - Toggles visuais permitem "ligar ou desligar" as páginas institucionais descritas na Seção 2 (ex: não quero a página de Laboratórios).
- **Preview Interativo (O Mockup):** Ao lado direito, existe um "mini-álbum". Sempre que o usuário altera uma cor de fundo, ativa um botão ou digita o nome de uma página, o mini-álbum se atualiza em tempo real, permitindo que o usuário clique nas setas para folhear e ver como o projeto final está ficando.

### 3.3. O Editor / Workspace (`editor.js`)
O núcleo da experiência de colecionador. Uma tela tripla onde a mágica de "colar figurinhas" acontece.
- **Menu Superior:** Comandos globais como "Modo Apresentação" (inicia a física realística de flipbook), "Salvar Backup JSON" e "Exportar PDF" (usa a biblioteca `html2pdf.js` para renderizar o álbum num A4 ou retrato pronto para gráfica).
- **O Álbum (Centro):** Renderiza o HTML final das páginas. Exibe os **slots vazios** (marcados por números ou ícones de câmera).
  - **Editar Propriedades (O Meta-Dado):** Clicar em um slot vazio abre o modal de propriedades. O usuário define os "Status" do jogador: **Nome**, **Número da Camisa/Turma**, **Time/Sala**, e a **Raridade**.
- **A Galeria (Sidebar Direita):** É o seu "pacote de figurinhas aberto". Você pode "Importar Figurinhas" do seu PC. O JavaScript nativamente reduz a qualidade excessiva da imagem no canvas para não sobrecarregar a memória RAM, e as guarda ali.
  - **Física de Arrastar (Drag and Drop):** A melhor forma de colar. Você clica na figurinha na galeria, segura e a arrasta soltando perfeitamente em cima de um slot vazio no centro.
  - **O "Raio" (Preenchimento Automático):** Um botão na galeria que pega todas as fotos importadas e "cospe" colando-as instantaneamente em todos os slots vazios da página que você está olhando. Útil para preencher turmas grandes de uma vez.

---

## 4. O Sistema de Figurinha e Gamificação (Raridades)
Uma das características mais fortes do aplicativo é a recriação da alegria de "tirar uma figurinha brilhante".
O `rarity-system.js` classifica cada slot do álbum em 4 níveis. Quando uma foto é colada nesse slot, a mágica do CSS é ativada.

1. **Comum (70% de chance):** Borda padrão cinza e minimalista.
2. **Rara (20% de chance):** A foto ganha uma moldura em gradiente azul vibrante (`#3b82f6`) com uma insígnia "◆ Raro" grudada no rodapé da figurinha.
3. **Épica (7% de chance):** A foto assume uma aura mística em roxo (`#8b5cf6`), brilhando com um glow sutil de fundo "★ Épico".
4. **Lendária (3% de chance):** O prêmio máximo. A foto ganha uma borda dourada espessa e metálica (`#d4a745`), uma marca "♛ Lendário", e o JavaScript injeta dezenas de **partículas animadas** girando e flutuando no entorno da figurinha para sempre.

No modo "Randomizar Raridade" de uma página inteira, o algoritmo utiliza esses pesos (70-20-7-3) para distribuir as brilhantes como se você estivesse abrindo pacotinhos reais na banca de jornal.

---

## 5. Notas Técnicas para Manutenção e IA
- **Gerenciamento de Estado:** O estado não usa Redux/Zustand. Toda a árvore do álbum (configurações, array de páginas e array de figurinhas) vive no `this._state` da classe no arquivo `storage.js` e é automaticamente empurrada para o IndexedDB usando *debouncing*.
- **Geração Procedural do HTML:** O arquivo `editor.js` confia na concatenação pesada de strings literais (`innerHTML`) para desenhar as páginas, baseando-se no objeto descritivo que veio do `storage.js`. Ao alterar estilos ou adicionar novas páginas especiais (como uma página de mascote), é necessário editar a função `_buildPages()` no `storage.js` para prever esse tipo de página, e em seguida adicionar os condicionais de renderização no `updatePreview()` do `configurator.js` e no bloco central do `editor.js`.
- **Efeitos Premium e CSS:** A elegância do app reside em classes de utilidade no CSS. Evite injetar inline styles para cores de botões e prefira usar as variáveis de ambiente pré-existentes, como `var(--copa-gold-400)` ou as animações globais (`.animate-slide-up`).

---

## 6. Documentação da Estrutura de Dados (Data Schema)
Para garantir a integridade do IndexedDB e dos backups, o estado do aplicativo (`this._state`) segue uma interface JSON estrita. 

O estado mestre (`State`) é composto por:
```json
{
  "albums": [ Álbum_1, Álbum_2, ... ],
  "currentAlbumId": "album-123456789"
}
```

Cada **Álbum** contém:
- `id`: (String) Identificador único gerado por timestamp.
- `createdAt`: (Number) Timestamp de criação.
- `config`: (Object) Metadados estéticos (`albumName`, `totalPages`, `bgStyle`, `borderStyle`, `includeCover`, etc).
- `stickers`: (Array) Galeria de figurinhas (banco de imagens soltas aguardando colagem). Contém `id` e `dataUrl` (Base64 da imagem comprimida).
- `pages`: (Array de Objetos) As páginas reais do álbum. Cada página contém propriedades indicando seu tipo (ex: `isCover: true`, `isClassTextPage: true`) e um array de `slots`.

Anatomia de um **Slot** (dentro de uma página):
```json
{
  "id": "page0-slot0",
  "stickerId": "id-da-foto-colada-ou-null",
  "playerName": "João Silva",
  "playerNumber": "10",
  "team": "3º Ano B",
  "rarity": "epic",
  "isEmpty": false
}
```
*Atenção IA/Dev:* Ao criar novos recursos visuais no `editor.js`, busque ler as informações primariamente deste objeto de slot, nunca leia valores diretamente do DOM, o DOM é apenas um espelho deste estado.

---

## 7. Arquitetura de Estilos (CSS)
O CSS é escrito de forma "Vanilla" para evitar dependências de build pesadas.
A organização geralmente se divide em escopos visuais:
- **`index.css` (Global):** Define os *Custom Properties* (variáveis) em `:root`. Contém as cores da paleta principal (como os tons de dourado `var(--copa-gold-500)`, cinzas de fundo e tipografias como `Outfit`, `Oswald` e `Bungee`). Também abriga as classes globais (`.glass-panel`, `.btn-primary`).
- **Arquivos Específicos:** Como o `editor.css` gerenciam o esqueleto da interface tripla (Sidebars, Área central).
*Dica:* Para criar um "Tema Novo" (ex: "Álbum de Super-Heróis" em vez da Copa do Mundo), a maneira mais rápida é sobrescrever as variáveis `:root` no `index.css` e trocar as cores padrão no `getDefaultConfig()` em `storage.js`.

---

## 8. Guia de Desenvolvimento e Comandos Básicos
Para um desenvolvedor fazer alterações ou iniciar o projeto, basta rodar os comandos padrão do `Vite` no terminal:

- **Instalar Dependências:**
  ```bash
  npm install
  ```
  *(Nota Crítica para Usuários Windows:* Se o projeto estiver dentro de uma pasta sincronizada com o **Google Drive** ou **OneDrive**, a sincronização deve ser **pausada** antes de rodar o `npm install`, caso contrário, arquivos em uso gerarão o erro `EBUSY` ou `TAR_ENTRY_ERROR` durante a extração dos pacotes.)
- **Iniciar o Servidor de Desenvolvimento (Live-Reload):**
  ```bash
  npm run dev
  ```
- **Gerar Versão de Produção (Build):**
  ```bash
  npm run build
  ```

---

## 9. Mecanismos de Exportação e Backup
- **Exportar PDF (`html2pdf.js`):** A função de gerar PDF clona o grid central e desabilita temporariamente elementos flutuantes. O `html2pdf.js` renderiza isso num `<canvas>` gigante e transforma em um PDF imprimível A4. Imagens com Base64 muito grandes podem causar lentidão nesta etapa em PCs modestos.
- **Salvar Backup JSON:** Todo o objeto daquele álbum (incluindo as Strings de imagem Base64) são empacotadas em um `.json` nativo com `URL.createObjectURL()`. É a forma mais segura de transferir seu álbum completo para outro computador sem perder a resolução das fotos.
