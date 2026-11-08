---
name: Cartório Helper
description: Livro de ferramentas interno do cartório — papel, tinta de registro e instrumentos de precisão
colors:
  tinta-de-selo: "oklch(45% 0.180 350)"
  tinta-de-selo-prensa: "oklch(37% 0.160 350)"
  tinta-de-selo-foco: "oklch(46% 0.190 350)"
  tampa-do-selo: "oklch(97% 0.006 245)"
  papel-arquivo: "oklch(84% 0.012 245)"
  papel-arquivo-2: "oklch(81% 0.012 245)"
  papel-arquivo-3: "oklch(77% 0.012 245)"
  folha: "oklch(93.5% 0.008 245)"
  tinta: "oklch(16% 0.020 245)"
  tinta-suave: "oklch(24% 0.018 245)"
  tinta-morta: "oklch(38% 0.016 245)"
  pauta: "oklch(73% 0.013 240)"
  pauta-firme: "oklch(32% 0.018 240)"
  vermelho-anulacao: "oklch(52% 0.190 27)"
  verde-registro: "oklch(50% 0.120 150)"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.728rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  card: "0"
  pill: "2px"
spacing:
  "2xs": "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.tinta-de-selo}"
    textColor: "{colors.tampa-do-selo}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.tinta-de-selo-prensa}"
    textColor: "{colors.tampa-do-selo}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 16px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 16px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.vermelho-anulacao}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 16px"
  field:
    backgroundColor: "{colors.papel-arquivo}"
    textColor: "{colors.tinta}"
    typography: "{typography.data}"
    rounded: "{rounded.pill}"
    height: "36px"
    width: "100%"
  field-output:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.tinta}"
    typography: "{typography.data}"
    rounded: "{rounded.pill}"
    width: "100%"
  ledger-table:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.card}"
  status-pill:
    backgroundColor: "{colors.papel-arquivo-2}"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: Cartório Helper

## Overview

**Creative North Star: "A Caixa do Escrevente"**

O sistema visual do Cartório Helper é a caixa de ferramentas firmes do escrevente de cartório: cada tela é uma bandeja organizada, cada instrumento em seu nicho, tudo pronto para a mão no primeiro segundo do expediente. O mundo é de **papel e tinta** — fundo de Papel Arquivo (cinza frio, `oklch(84% 0.012 245)`) sobre o qual Folhas quase brancas carregam os dados — e a assinatura do sistema é **a tabela-livro**: uma folha retangular, fechada no topo por uma faixa de tinta de 2px, pautada por hairlines de 1px, com uma linha final que sempre registra a contagem ("5 ferramentas registradas"). Nada flutua: profundidade vem de faixa de tinta, linha pautada e camada tonal, nunca de sombra.

A personalidade é **precisa e discreta**. O acento Tinta de Selo aparece em ~10% de qualquer tela (botão primário, item ativo da navegação, caret do teclado) e sua raridade é o argumento — carimbo raro deixa marca. Dados que poderiam vir de um documento oficial (números, nomes extraídos de XML, contadores) vivem em IBM Plex Mono com numerais tabulares; a interface vive no Hanken Grotesk; a voz humana vive na serifa Newsreader. Cantos são quadrados (raio 0 em folhas, no máximo 2px em controles), bordas são sólidas — nunca tracejadas, nunca adesivas.

**Características-chave:**
- Papel Arquivo como pano de fundo; Folha (quase-branca) como superfície de dados.
- A faixa de tinta de 2px no topo da folha é o gesto de profundidade do sistema inteiro.
- Tabela pautada (`ledger`) como componente-síntese: cadastros, listas e dashboard são todos "registros".
- Tinta de Selo (magenta oklch 350) com dose restrita; estados usam vermelho e verde de registro.
- Tipografia tripla com papéis rígidos: sans de UI, serif de prosa, mono de documento.
- Raio máximo 2px; sombras e bordas tracejadas proibidas; foco sempre visível.

## Colors

A paleta é de papelaria de arquivo: cinzas frios levemente tingidos de azul (matiz 245) com um único acento magenta de carimbo. Todos os valores vivem em OKLCH em `cartorio_helper/src/tokens.css`; o frontmatter reflete os nomes canônicos, nunca hex aproximados.

### Primary
- **Tinta de Selo** (`oklch(45% 0.180 350)`, código `--color-accent`): o carimbo do sistema. Botão primário (fundo + borda + texto tampa-do-selo), item ativo da barra lateral (barra esquerda de 2px + ícone), caret do teclado. Nunca pintura de fundo em massa, nunca texto de corpo.
- **Tinta de Selo Prensa** (`oklch(37% 0.160 350)`, `--color-accent-2`): versão de hover do acento — o selo pressionado de novo.
- **Tinta de Selo Foco** (`oklch(46% 0.190 350)`, `--color-focus`): o contorno de foco de 2px em todo elemento focável.
- **Tampa do Selo** (`oklch(97% 0.006 245)`, `--color-accent-ink`): texto e ícones sobre o acento.

### Neutral
- **Papel Arquivo** (`oklch(84% 0.012 245)`, `--color-paper`): canvas da aplicação e fundo dos campos. Todo o app repousa nele.
- **Papel Arquivo 2** (`oklch(81% 0.012 245)`, `--color-paper-2`): a faixa lateral, hover quieto de controles, fundo de pills. Um passo mais escuro que o canvas — o "campo da mesa".
- **Papel Arquivo 3** (`oklch(77% 0.012 245)`, `--color-paper-3`): hover de controles sobre papel (botão intermediário, item de nav não ativa).
- **Folha** (`oklch(93.5% 0.008 245)`, `--color-sheet`): a superfície de dados — fundo de `.sheet`, do dropzone e do campo de saída. Mais branca que o canvas: é onde os dados se assentam.
- **Tinta** (`oklch(16% 0.020 245)`, `--color-ink`): texto de topo, faixas de 2px, bordas de botão secundário. Quase-preto azulado.
- **Tinta Suave** (`oklch(24% 0.018 245)`, `--color-ink-2`): texto corrente — células de tabela, dados, ícones inativos.
- **Tinta Morta** (`oklch(38% 0.016 245)`, `--color-muted`): texto auxiliar — legendas, headers de tabela, placeholders. Nunca para conteúdo primário.
- **Pauta** (`oklch(73% 0.013 240)`, `--color-rule`) e **Pauta Firme** (`oklch(32% 0.018 240)`, `--color-rule-2`): as duas linhas do livro — hairline de 1px para cadastro de linha e pauta firme de 2px para header de tabela e borda de cabeçalho da sidebar.
- **Vermelho Anulação** (`oklch(52% 0.190 27)`, `--color-error`) e **Verde Registro** (`oklch(50% 0.120 150)`, `--color-success`): dois únicos estados, sempre como linha de 2px, borda de pill ou texto no vazio — nunca como cartões tintados.

### Named Rules
**A Regra do Décimo.** Tinta de Selo ocupa no máximo um décimo de qualquer tela: um botão primário, a barra do item ativo, o caret. Sua escassez é o que faz cada aplicação parecer decisão de cartório.

**A Regra da Anulação Sem Cartão.** Erro e sucesso nunca criam fundos tintados, cartões coloridos ou ícones decorativos: assinam-se com linha (à esquerda de 2px em avisos), borda (pill, campo inválido) ou texto no vazio.

## Typography

**Display Font:** Hanken Grotesk (fallback `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Newsreader (fallback `ui-serif, Georgia, serif`)
**Label/Data Font:** IBM Plex Mono (fallback `ui-monospace, monospace`)

Fontes auto-hospedadas (`src/assets/fonts/`, latin subset, woff2 — declaradas em `src/fonts.css`, importadas no topo de `index.css`): a versão CDN do Google Fonts foi removida do `index.html`; os arquivos são byte-idênticos ao que o CDN servia.

**Caractere:** a tríade do livro de registro impresso — título gravado (sans de peso 600, agressivamente apertada), texto escrito à mão (serifa de textos), números datilografados (mono tabular). Nenhuma fonte é intercambiável: trocar de papel é quebrar o pacto (UI ≠ prosa ≠ documento).

### Hierarchy
- **Display** (Hanken Grotesk 600, `1.728rem`, lh 1.05, `-0.02em`, máx. `20ch`): título da página (h1). Nunca maior — o app não tem hero.
- **Section** (600, `1.2rem`, lh 1.2): títulos de folha/sessão (h2). Sempre acompanhada do cabeçalho da folha, com o dado de contexto à direita.
- **Title** (600, `1rem`, lh 1.2, máx. `40ch`): títulos de bloco (h3).
- **Body** (Newsreader 400, `1rem`, lh 1.55, máx. `65ch`): prosa e descrições.
- **Label** (Newsreader 500, `.875rem`, lh 1.3, sentence case, sem tracking): rótulos de campo (`.field-label`) e headers de tabela do livro. Cor tinta-morta.
- **Data** (IBM Plex Mono 400, `.875rem`, lh 1.4, numerais tabulares): todo valor que existir num documento oficial — números de processo, CPFs, contadores, versões, datas do sistema. Toda célula `td.num`, o contador do rodapé da folha, e a versão do rodapé da sidebar.

### Named Rules
**A Regra do Mono Como Documento.** IBM Plex Mono é o rosto do arquivo: se o valor está num XML, numa averbação ou num contador, ele é mono tabular; UI e prosa nunca o pedem emprestado. Textareas recebem corpo serif; placeholders recebem sans.

## Layout

Barra lateral fixa à esquerda (240px, `--sidebar-width`; fundo Papel Arquivo 2, borda direita de 1px pauta; nome do app no topo, separado por pauta firme de 2px; versão no rodapé em mono). O conteúdo é uma coluna rolável com padding 24px horizontal / 32px vertical (`px-6 py-8`), aberta por um bloco de título (h1 Display + legenda `mt-1`) seguido das folhas empilhadas com respiro de 24px (`mb-6`).

Densidade: interna alta, externa contida. Dentro da folha, o respiro é raso — `4px` de padding vertical por célula, `12px`/`24px` nas margens do cabeçalho — o que deixa a tabela parecer pautada de verdade. Escala de espaçamento completa (2px→96px) existe nos tokens, com os degraus `xl`+ reservados a contextos editoriais (o dropzone usa `40px`); o shell do app vive nos degraus de 8–32px.

Responsivo: abaixo de 48rem a barra lateral se dobra em coluna de ícones de 56px (títulos e legendas somem); cabeçalho de folha permitindo quebra (`flex-wrap`); tabelas rolam horizontalmente em `.table-scroll`. Abaixo de 40rem os gutters editoriais caem para 16px e o gap de colunas para 16px.

## Elevation & Depth

**Sistema sem sombras — profundidade por tinta, linha e camada tonal.** `--shadow-card: none` é a regra, não uma omissão. A hierarquia é lógica: tudo repousa no Papel Arquivo; a Folha (mais clara) assenta sobre ele; e cada folha se prende no papel com uma **faixa de tinta de 2px no topo** (`border-top: 2px solid tinta`) — o traço do termo de abertura de um livro. Dentro e entre blocos, hairlines de 1px em Pauta e pautas firmes de 2px em Pauta Firme fazem o resto do traçado. Camadas de zoom (modal, toast, etc.) têm z-index por tokens, mas também nunca recebem sombra.

### Named Rules
**A Regra da Faixa de Abertura.** Todo bloco de superfície (`.sheet`, `.dropzone`) se abre com `border-top: 2px solid tinta`; a folha nunca é apenas um retângulo de cor mais clara — é uma página de livro aberta no termo.

## Shapes

Vocabulário de formas de carimbo: **cantos quadrados**. Folhas e blocos têm raio 0 (`--radius-card: 0`); controles interativos têm no máximo 2px (`--radius-pill: 2px`) — botões, campos e pills "arredondam" só o que os dedos tocam. Larguras de linha têm apenas dois graus: hairline 1px (`--rule-hair`) e barra 2px (`--rule-bar`). Toda borda é **sólida**: tracejados são proibidos explícitamente, até em dropzones — a área de arrasto (280px, banda de tinta no topo, hairlines nos lados) comunica pelo gesto do cursor e do hover, não por decoração tracejada ("a fact-to-fill, not a dashed celebration").

Ícones: Lucide via stroke 1.5, 14–16px, pintados com `currentColor`. Seleção de texto é tintada com 22% de acento sobre translúcido. Animação existe apenas em cor/fundo (`120ms micro` com `cubic-bezier(0.16,1,0.3,1)`) e no micro-pressionamento (`translateY(1px)` dos botões) — respeitando `prefers-reduced-motion`.

## Components

### Buttons (`.btn`)
- **Shape:** cápsula quase quadrada (raio `2px`), altura mínima `36px`, padding `0 16px`, label em Hanken Grotesk 500 `.875rem`, gap de `8px` se tiver ícone.
- **Secundário (default):** borda 1px tinta, fundo transparente, texto tinta. Hover: fundo papel-arquivo-3. Ativo: `translateY(1px)`.
- **Primário (`.btn--primary`):** fundo e borda tinta-de-selo, texto tampa-do-selo. Hover: tinta-de-selo-prensa — o selo pressionado de novo.
- **Danger (`.btn--danger`):** borda e texto vermelho-anulação em fundo transparente; hover tinta 8% de vermelho-anulação.
- **Quiet (`.btn--quiet`):** sem borda visível, texto tinta-suave; hover fundo papel-arquivo-2. Usado para ações subordinadas — delete nunca é a ação principal da página.
- **Estados:** `focus-visible` outline 2px tinta-de-selo-foco offset 2px; `disabled`/`aria-disabled` opacidade 0.55, cursor not-allowed, transform travado; carregamento via `aria-busy` (cursor progress), nunca spinner de dots.

### Fields (`.field`)
- **Style:** 1px sólido tinta-morta, fundo papel-arquivo, raio 2px, altura mínima 36px, texto IBM Plex Mono `.875rem` — o campo já nasce "de documento".
- **Placeholder** em Hanken Grotesk — o placeholder fala a língua da UI; o valor digitado fala a do documento (mono).
- **Focus:** outline 2px tinta-de-selo-foco, inset no campo (`outline-offset: -3px`) — a tinta entra no papel, não sai.
- **Error (`aria-invalid`):** borda vermelho-anulação. **Disabled:** opacidade 0.55. **Hover:** borda sobe para tinta-suave.
- **Saída (`.field--out`):** fundo folha, mono — o texto gerado "se digita" na folha. Textareas herdam corpo serif.

### Ledger (`.sheet` + `table.ledger`) — o componente-síntese
- **Corner Style:** raio 0; faixa de tinta de 2px no topo; hairlines internas.
- **Background:** folha.
- **Cabeçalho:** `.sheet-head` com baseline — título Section à esquerda, dado-contexto à direita (mono, tinta-morta), padding `16px 24px`, quebra permitida.
- **Tabela:** header de tabela em Newsreader 500 `.75rem` tinta-morta, pauta firme de 2px embaixo; células `.875rem` tinta-suave, hairline 1px entre linhas, padding vertical 4px; colunas numéricas à direita em mono tabular `.75rem`. Hover de linha: papel-arquivo-2 a 55% transparente (`color-mix`).
- **Rodapé:** `.sheet-foot` hairline no topo, contador em mono ("5 ferramentas registradas"). O contador no fim é parte do pacto: ferramentas, arquivos e registros sempre somam.

### Status pills (`.pill`)
- **Style:** borda 1px pauta-firme, fundo papel-arquivo-2, texto tinta-suave, raio 2px, padding `4px 8px`, Newsreader 500 `.75rem`, quebra proibida.
- **Estados:** `pill--error` (borda/texto vermelho-anulação, fundo transparente) e `pill--success` (verde-registro) — sem tons intermediários.

### Notices (`.notice`)
- Aviso não é cartão: padding `8px 0 8px 16px`, regra esquerda de 2px (vermelho-anulação em erro), corpo `0.875rem` Newsreader tinta-suave. Sem fundo, sem ícone grande, sem vibração.

### Dropzones (`.dropzone`)
- **Signature data-entry:** área de arrasto de no mínimo 280px, banda de tinta 2px no topo, hairlines nas bordas restantes, conteúdo centrado verticalmente, texto tinta-suave.
- **Hover:** fundo papel-arquivo; **drag sobre (`--drag`):** todas as bordas sobem para tinta-de-selo — o único momento em que o acento desenha um contorno de área; **inválido:** borda vermelho-anulação. Foco e estados inline (outline 2px tinta-de-selo-foco).

### Navigation (barra lateral)
- 240px de coluna de papel-arquivo-2; itens como linhas full-width (padding `8px 20px`), ícone Lucide 16px stroke 1.5, label `.875rem` Hanken Grotesk 500.
- **Ativo:** barra esquerda de 2px tinta-de-selo, fundo folha, texto tinta peso 600, ícone tinta-de-selo. **Repose:** borda esquerda transparente, texto tinta-suave, ícone tinta-morta; hover: fundo papel-arquivo-3, texto tinta.

## Do's and Don'ts

### Do:
- **Do** consumir tudo via tokens (`var(--color-*)`, `var(--space-*)`, `var(--dur-*)`, `var(--ease-*)`) — nada de hex cru, `rem` folgado ou duração avulsa no código de tela.
- **Do** fechar toda folha com contador no rodapé em mono (`5 ferramentas registradas`) — a contagem é parte do componente.
- **Do** usar mono tabular (`.num`) para todo número que provém de documento: processo, selo, folha, CPF.
- **Do** manter estados de erro em linha/borda (notice, `aria-invalid`, pill) — nunca em fundo tintado.
- **Do** garantir foco visível: outline `2px` tinta-de-selo-foco (offset `+2` fora; `-3px` interior nos campos) — o outline transparente de 2px pré-definido evita saltos.
- **Do** manter Hanken Grotesk, Newsreader e IBM Plex Mono auto-hospedados em `src/assets/fonts/` + `src/fonts.css` — **resolvido** (a versão CDN do Google Fonts foi removida do `index.html`).

### Don't:
- **Don't** adicionar sombras, glows, gradientes de profundidade ou backdrop-filter: `--shadow-card: none` é invariante; profundidade é faixa de tinta + hairline + camada tonal.
- **Don't** arredondar além de 2px, nem inventar raio em folhas (`--radius-card: 0`).
- **Don't** usar bordas tracejadas em qualquer lugar — dropzone incluído.
- **Don't** pintar o acento em massa: sem cartões magenta, sem banners, sem fundo pintado de seção; a Regra do Décimo vale para telas inteiras.
- **Don't** misturar MUI/PrimeReact na linguagem visual — os primitivos instalados podem ser usados internamente, mas o rosto é sempre `.btn`, `.field`, `.sheet`, `.ledger`.
- **Don't** usar dots pulsantes, spinners animados ou skeletons para carregamento: a espera é uma linha de texto silenciosa ao lado do rótulo (`aria-busy`, cursor progress).
- **Don't** ampliar o título além de `1.728rem` nem usar peso de display além de 600: o app não tem hero, tem termo de abertura.
