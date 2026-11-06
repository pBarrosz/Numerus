# [00] CONTRIBUIR COM O NUMERUS

## [01] FLUXO

1. Abra ou pegue uma issue (`[BUG]` ou `[FEAT]`).
2. Crie a branch a partir de `main`: `feat/painel-meta-card`, `fix/transacoes-filtro`, `design/tokens-borda`, `docs/readme`.
3. Commits no padrão Conventional Commits: `tipo(escopo): descrição`.
4. Abra o PR com o template preenchido. Mudança de UI exige captura antes/depois.
5. CI verde (lint, typecheck, build) antes do merge. Merge por squash.

## [02] ESCOPOS DE COMMIT

`home` · `painel` · `transacoes` · `metas` · `assistente` · `tokens` · `brand` · `lib` · `ci`

## [03] CÓDIGO

- Cores, fontes, espaços e bordas só via tokens (`var(--nm-*)`). Nada de hex solto em componente.
- Comentários em minúsculas.
- Valores em reais formatados por `src/lib/currency.ts` (`R$ 1.284,50`).

## [04] DESIGN

Siga [`docs/DESIGN.md`](docs/DESIGN.md). Em caso de dúvida: mais preto, menos verde.
