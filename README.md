# Merchant Portal MFEs

Monorepo demonstrativo para apresentar o Portal Merchant separado por contextos de negócio, usando React 19, TypeScript, Tailwind, Next.js BFF e dados mockados. A base visual vem do Design System `tigelah/ds-merchant-portal` e das telas do Figma `Portal Merchant Screens Sandbox`.

## Como rodar

```powershell
cd "C:\Users\rodri\OneDrive\Documentos\merchant-portal-mfes"
npm install
npm run dev
```

Shell: `http://127.0.0.1:4173`

BFF Next.js:

```powershell
npm run dev -w @mp/bff
```

BFF: `http://127.0.0.1:4300`

## Arquitetura

- `apps/shell`: app host, navegação, sidebar, topbar, i18n, dark mode e acessibilidade.
- `apps/bff`: Next.js BFF com endpoints edge-ready para bootstrap, sessão, analytics e recebíveis aleatórios.
- `apps/auth`: login e verificação de segurança.
- `apps/dashboard`: visão geral executiva.
- `apps/operations`: transações e detalhe lateral.
- `apps/finance`: recebíveis e liquidações.
- `apps/integrations`: API keys, webhooks e observabilidade.
- `apps/admin`: usuários, papéis e permissionamento.
- `apps/reports`: central de relatórios.
- `apps/settings`: configurações da conta.
- `packages/design-system`: tokens e tema Tailwind derivados do DS.
- `packages/shared-ui`: componentes React compartilhados.
- `packages/mock-data`: dados tipados e gerador aleatório de recebíveis.
- `packages/runtime`: estado compartilhado, cache, analytics, ações, locale, theme e preferências acessíveis.

## Rotas

- `/login`
- `/verify`
- `/`
- `/transactions`
- `/receivables`
- `/integrations`
- `/admin/users`
- `/reports`
- `/settings/account`

## Produção

- Os MFEs estão separados por contexto e podem migrar para Module Federation ou import maps versionados.
- O BFF usa cache headers com `s-maxage` e `stale-while-revalidate`.
- O runtime simula estado distribuído e fallback quando o BFF não está online.
- As ações dos cards e botões emitem eventos de analytics mockados.
- O audit foi limpo com override de PostCSS sem `audit fix --force`.
