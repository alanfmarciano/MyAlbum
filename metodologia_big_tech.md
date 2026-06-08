# Metodologia de Desenvolvimento "Big Tech"
*Guia prático de como grandes empresas de tecnologia iniciam e executam projetos de software escaláveis.*

Em empresas de alto nível (Google, Meta, Nubank), um projeto de software nunca começa com a abertura de uma IDE ou a escrita da primeira linha de código. A mitigação de riscos, alinhamento de negócios e validação de design precedem a engenharia.

Abaixo está o ciclo de vida padrão para a concepção e início de um projeto (exemplo focado no **Álbum de Figurinhas 2.0**).

---

## 1. O PRD (Product Requirements Document)
**Responsável:** Gerente de Produto (PM) | **Foco:** Negócios / O Quê e o Por Quê

Antes de qualquer mobilização técnica, a diretoria ou os *stakeholders* precisam ser convencidos de que o produto tem valor. O PRD é um documento não-técnico que responde às perguntas críticas do produto.

- **Problema:** Qual dor do usuário estamos resolvendo? *(Ex: Falta de engajamento e nostalgia no ambiente escolar digital).*
- **Público-Alvo:** Para quem é isso? *(Ex: Alunos, Escolas, Eventos Corporativos).*
- **Requisitos Funcionais Core:** O que o app *deve* fazer na versão 1.0? *(Ex: Upload de fotos, colar em páginas específicas, exportar PDF).*
- **Métricas de Sucesso (KPIs):** Como sabemos que deu certo? *(Ex: 80% dos usuários que iniciam um álbum chegam até a contracapa; Média de 3 PDFs exportados por usuário).*

> [!IMPORTANT]
> Sem a aprovação formal do PRD, o projeto não segue adiante. O escopo definido aqui protege o time de "escopo creep" (pedidos intermináveis de novas funções no meio do caminho).

---

## 2. O Design Doc / RFC (Request for Comments)
**Responsável:** Engenheiro de Software Sênior / Staff | **Foco:** Arquitetura / Como vamos construir

Com o escopo de negócio definido, a engenharia entra em cena. O Engenheiro Líder escreve um documento técnico (semelhante ao nosso `proposta_nova_arquitetura.md`) desenhando a solução sistêmica.

- **Stack Tecnológico:** Linguagens, frameworks, bibliotecas e infraestrutura. *(Ex: React, Vite, Tailwind).*
- **Gerenciamento de Estado e Dados:** Modelagem do banco de dados, fluxos de API, armazenamento offline. *(Ex: IndexedDB via Dexie.js com estrutura relacional).*
- **Trade-offs (Prós e Contras):** *"Por que não usamos Redux?"*, *"Quais os riscos de usar Canvas no Client-side?"*
- **Revisão por Pares:** O documento é enviado para outros engenheiros experientes "atacarem". Eles procuram gargalos de performance ou falhas de segurança. O código só inicia quando o consenso técnico é atingido.

---

## 3. Prototipação e UI/UX
**Responsável:** Product Designer (UX/UI) | **Foco:** Usabilidade / A Cara do Produto

Com a viabilidade técnica validada, o design visual é criado. 

- **Figma:** Cria-se protótipos de alta fidelidade das telas. Cores, botões, estados vazios (*empty states*) e interações são desenhados sem escrever CSS.
- **Teste de Usabilidade (User Testing):** O protótipo "falso" (clicável no próprio Figma) é colocado nas mãos de 5 a 10 pessoas do público-alvo.
- **Validação:** Se os usuários demoram muito para descobrir como colar uma figurinha, a interface é redesenhada. É infinitamente mais barato apagar um botão no Figma do que reescrever a lógica de um botão no React.

> [!TIP]
> **Micro-interações:** É nesta fase que são planejadas as animações, como o som de "rasgar pacotinho" e o tremor na tela (haptic feedback).

---

## 4. O "Spike" (Prova de Conceito / PoC)
**Responsável:** Engenheiros de Software | **Foco:** Mitigação de Riscos Críticos

Antes de construir o app inteiro, a equipe mapeia os **maiores riscos técnicos** do projeto. O "Spike" é uma tarefa de tempo delimitado (ex: 2 dias) para escrever um código feio e rápido, apenas para provar que a funcionalidade crítica é possível.

- **Exemplo de Risco:** *"O navegador vai suportar renderizar um PDF A4 pesado usando `html2pdf.js` sem dar crash no celular do usuário?"*
- O time foca exclusivamente em responder a essa pergunta com um mini-script de teste. Se falhar, voltamos à fase de arquitetura para encontrar outra ferramenta. Se funcionar, temos sinal verde.

---

## 5. Configuração Básica (Scaffolding) e Sprints Ágeis
**Responsável:** Todo o Time (Engenharia + QA + PM) | **Foco:** Execução

Agora sim, o projeto técnico se inicia de fato.

- **Scaffolding:** Configuração da fundação. Repositório no GitHub, *pipelines* de CI/CD (integração contínua), linters (ESLint, Prettier) para manter o código limpo, e arquitetura de pastas inicial.
- **Sprints Ágeis:** O trabalho não é feito tudo de uma vez. Ele é dividido em "Sprints" (geralmente ciclos de 2 semanas).
  - *Semana 1-2 (MVP Core):* Fazer a figurinha arrastar e cair num slot branco. (Sem design, apenas funcional).
  - *Semana 3-4 (Integração):* Plugar o design bonito do Figma no código funcional.
  - *Semana 5-6 (Polimento):* Adicionar os efeitos de raridade dourada e persistência offline.

> [!NOTE]
> Esta estrutura passo a passo garante previsibilidade, reduz o desperdício de horas de programação e garante que o produto final seja algo que os usuários realmente consigam usar e que a infraestrutura aguente rodar.
