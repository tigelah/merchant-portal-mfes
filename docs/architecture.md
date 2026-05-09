# Arquitetura Frontend

## Premissas

- Objetivo principal: apresentação navegável do Portal Merchant com comportamento realista.
- Fonte visual: Figma `Portal Merchant Screens Sandbox`.
- Fonte de tokens/componentes: `tigelah/ds-merchant-portal`, importado como base do pacote `packages/design-system`.
- Stack shell/MFE: React 19, TypeScript, Vite e Tailwind 4.
- BFF: Next.js 15 em `apps/bff`, com Route Handlers preparados para runtime edge.
- Dados: mockados, tipados e gerados por `packages/mock-data`.
- Autenticação: simulada com login, MFA e endpoint de sessão mockado.

## Decisão MFE

Recomendação principal: monorepo com shell e MFEs por contexto de negócio.

Justificativa:
- Os contextos têm jornadas, permissões e cadências evolutivas diferentes.
- A apresentação demonstra boundaries de domínio sem exigir deploy independente agora.
- O shell fica pequeno e os remotes podem evoluir para Module Federation, import maps ou deploy por domínio.

Alternativa viável: modular monolith com módulos por rota. Seria mais simples para um MVP com uma única squad, mas comunicaria pior a separação por contexto solicitada.

## Contextos

| Contexto | MFE | Rotas | Responsabilidade |
| --- | --- | --- | --- |
| Acesso | `auth` | `/login`, `/verify` | Login, MFA e entrada segura |
| Saúde do negócio | `dashboard` | `/` | KPIs, agenda, alertas e últimas transações |
| Operação | `operations` | `/transactions` | Consulta, filtros, exportação e detalhe de transações |
| Financeiro | `finance` | `/receivables` | Recebíveis, liquidações, antecipação e conciliação |
| Técnico | `integrations` | `/integrations` | API keys, webhooks, logs e alertas técnicos |
| Administração | `admin` | `/admin/users` | Usuários, papéis e permissionamento |
| Relatórios | `reports` | `/reports` | Modelos, geração e histórico |
| Configurações | `settings` | `/settings/account` | Perfil, preferências, segurança e conta |

## Produção

- Estado distribuído: `packages/runtime` concentra estado de sessão, preferências, dados de apresentação e ações; em produção ele pode ser substituído por store federada ou contracts versionados por MFE.
- Cache: `cachedFetch` usa TTL e fallback local; o BFF expõe `s-maxage` e `stale-while-revalidate` para edge/cache CDN.
- SSR/hydration: o BFF Next entrega endpoints e página de status edge; o shell Vite mantém hidratação client-side, com caminho natural para SSR por rota crítica se login/dashboard exigirem TTFB menor.
- Edge rendering: Route Handlers e status page em `apps/bff` usam `export const runtime = "edge"`.
- Autenticação: `/api/auth/session` simula sessão, MFA e logout; produção deve usar cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, rotação e CSRF quando houver mutações stateful.
- Analytics: `actions.track` envia eventos para `/api/events` e registra no console para apresentação; produção deve trocar por collector consent-aware.
- Performance: remotes são lazy-loaded, gráficos são SVG leves, dados são compactos e o audit está limpo com override de PostCSS seguro.

## Acessibilidade

- Teclado: botões, cards clicáveis e menus têm foco visível.
- Visão: alto contraste, texto maior e dark mode ficam no topbar.
- Neurodivergência: modo foco e redução de movimento ficam no menu de acessibilidade.
- Auditiva: alertas textuais e região `aria-live` comunicam ações sem depender de som.
- Localização: switch PT-BR, EN e ES altera labels principais, menus e títulos.

## Guardrails

- O shell não conhece detalhes internos das telas, apenas manifestos de rota e entrypoints.
- Dados sensíveis em mocks permanecem mascarados.
- Tokens do DS são consumidos como variáveis `--mp-*`.
- O runtime local usa imports por workspace. Produção deve ter versionamento, SRI, CSP e rollback por remote.
- CSP recomendada: `default-src 'self'; script-src 'self' https://trusted-cdn.example; style-src 'self' 'unsafe-inline'; img-src 'self' data:`.
- Clickjacking: `frame-ancestors 'none'` em produção.
