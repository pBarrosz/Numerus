<p align="center">
  <img src="assets/brand/banner.svg" alt="NUMERUS — assistente financeiro" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-EM_DESENVOLVIMENTO-149E48?style=for-the-badge&labelColor=0A0A0A">
  <img src="https://img.shields.io/badge/PLATAFORMA-WEB_DESKTOP-F2F0E9?style=for-the-badge&labelColor=0A0A0A">
  <img src="https://img.shields.io/badge/LICENÇA-MIT-F2F0E9?style=for-the-badge&labelColor=0A0A0A">
</p>

<img src="assets/brand/section-01.svg" alt="[01] SOBRE" width="100%">

**NUMERUS** é um assistente financeiro pessoal para web. Ele organiza gastos, acompanha orçamento por categoria, mostra contas a vencer e responde perguntas sobre o seu dinheiro em linguagem direta.

| `[A]` REGISTRAR | `[B]` ACOMPANHAR | `[C]` PERGUNTAR |
| :-- | :-- | :-- |
| Lançar gastos e receitas em segundos | Teto por categoria, metas e contas da semana | Assistente que explica o mês e sugere ajustes |

<img src="assets/brand/section-02.svg" alt="[02] TELAS" width="100%">

| TELA | ROTA | O QUE MOSTRA |
| :-- | :-- | :-- |
| `HOME` | `/` | Landing page pública |
| `PAINEL` | `/app` | Disponível no mês, gasto, contas a vencer, meta de reserva, gastos por dia |
| `TRANSAÇÕES` | `/app/transacoes` | Lista filtrável de lançamentos + novo gasto |
| `METAS` | `/app/metas` | Metas de economia com progresso |
| `ASSISTENTE` | `/app/assistente` | Chat com o assistente financeiro |

> Capturas de tela ficam em [`docs/screens/`](docs/screens/). O protótipo completo está no canvas de design do projeto.

<img src="assets/brand/section-03.svg" alt="[03] STACK" width="100%">

<p>
  <img src="https://img.shields.io/badge/REACT-0A0A0A?style=for-the-badge&logo=react&logoColor=F2F0E9">
  <img src="https://img.shields.io/badge/TYPESCRIPT-0A0A0A?style=for-the-badge&logo=typescript&logoColor=F2F0E9">
  <img src="https://img.shields.io/badge/VITE-0A0A0A?style=for-the-badge&logo=vite&logoColor=F2F0E9">
  <img src="https://img.shields.io/badge/CSS_TOKENS-149E48?style=for-the-badge&logoColor=0A0A0A">
</p>

Sem biblioteca de UI: os componentes seguem os tokens em [`src/styles/tokens.css`](src/styles/tokens.css).

<img src="assets/brand/section-04.svg" alt="[04] ESTRUTURA" width="100%">

```text
numerus/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml              # [BUG] relato de erro
│   │   ├── feature.yml          # [FEAT] nova funcionalidade
│   │   └── config.yml
│   ├── workflows/
│   │   └── ci.yml               # lint + typecheck + build
│   ├── labels.yml               # labels nas cores da marca
│   └── pull_request_template.md
├── assets/
│   └── brand/                   # banner, logos, mark, favicon, paleta
├── docs/
│   ├── DESIGN.md                # sistema visual completo
│   └── screens/                 # capturas das telas
├── scripts/                     # gen_svgs.py + outline_text.py (gera os svgs da marca)
├── src/
│   ├── components/              # AppShell, Mark, ui (Card, Button, KpiTile, ProgressBar)
│   ├── lib/                     # formatação de moeda, datas, cálculos de orçamento
│   ├── pages/                   # Home, Painel, Transacoes, Metas, Assistente
│   ├── styles/
│   │   ├── tokens.css           # variáveis de cor, tipo, espaço e borda
│   │   ├── tokens.json          # os mesmos tokens para scripts e testes
│   │   └── base.css             # reset + estilos globais
│   ├── App.tsx
│   └── main.tsx
├── public/favicon.svg
├── index.html
├── package.json
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

<img src="assets/brand/section-05.svg" alt="[05] COMEÇAR" width="100%">

```bash
git clone https://github.com/<usuario>/numerus.git
cd numerus
npm install
npm run dev        # http://localhost:5173
```

| COMANDO | FAZ |
| :-- | :-- |
| `npm run dev` | servidor local |
| `npm run build` | build de produção em `dist/` |
| `npm run lint` | eslint |
| `npm run typecheck` | tsc sem emitir |

### Pluggy (sandbox)

Sem configuração o app usa dados de exemplo. Para analisar movimentações bancárias via [Pluggy](https://pluggy.ai):

1. Crie uma aplicação no [dashboard do Pluggy](https://dashboard.pluggy.ai) (aplicações novas já têm os conectores sandbox).
2. Copie `.env.example` para `.env` e preencha `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET`.
3. Rode `npm run dev`, vá ao **PAINEL → CONECTAR BANCO**, escolha **Pluggy Bank** e entre com `user-ok` / `password-ok` (MFA: `123456`).

As credenciais ficam só no servidor do Vite (`server/pluggy.ts`, rotas `/api/pluggy/*`); o navegador recebe apenas o connect token e os dados. Essas rotas existem no `npm run dev` e no `npm run preview` — em produção será preciso um backend próprio.

<img src="assets/brand/section-06.svg" alt="[06] DESIGN" width="100%">

<img src="assets/brand/palette.svg" alt="Paleta: #0A0A0A, #F2F0E9, #149E48" width="100%">

| TOKEN | VALOR | USO |
| :-- | :-- | :-- |
| `--nm-black` | `#0A0A0A` | texto, bordas, sidebar, barras |
| `--nm-off-white` | `#F2F0E9` | fundo |
| `--nm-green` | `#149E48` | **só preenchimento**: CTA, item ativo, destaque |
| `--nm-font` | JetBrains Mono 400 / 700 / 800 | tudo |
| `--nm-u` | `8px` | grade base |

**Regras**
1. Verde é preenchimento. Nunca texto verde sobre off-white.
2. Sem `border-radius`. Bordas pretas grossas: 8 (moldura) · 6 (card) · 4 (botão) · 3 (linha).
3. Rótulos em CAIXA ALTA, `letter-spacing: 0.08em`.
4. Seções numeradas: `[01] TÍTULO`.
5. Ação principal com sombra dura `5px 5px 0 #0A0A0A`.

Detalhes em [`docs/DESIGN.md`](docs/DESIGN.md).

<img src="assets/brand/section-07.svg" alt="[07] CONTRIBUIR" width="100%">

| ITEM | PADRÃO |
| :-- | :-- |
| Branches | `feat/…` · `fix/…` · `docs/…` · `design/…` |
| Commits | [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat(painel): adiciona card de meta` |
| PRs | usar o template; anexar captura quando mudar UI |

Guia completo em [`CONTRIBUTING.md`](CONTRIBUTING.md).

<br>
<p align="center">
  <img src="assets/brand/logo-horizontal-dark.svg" alt="NUMERUS" width="280">
</p>
