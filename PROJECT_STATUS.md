# STATUS DO PROJETO

## Concluído
- [x] FASE_BASE_PROJETO — Next.js 16, shadcn/ui, Tailwind v4, ESLint, Prettier
- [x] FASE_SUPABASE — Schema PostgreSQL (companies, stores, categories, cash_transactions)
- [x] FASE_RLS — Row Level Security, FORCE RLS, helpers, triggers
- [x] FASE_AUTH — Supabase Auth, login/register, middleware proxy
- [x] FASE_FINANCEIRO_BASE — fixed_expenses, financial_goals, Zod, services
- [x] FASE_EMPRESA_LOJA — Company/Store provider, selector pages
- [x] FASE_DASHBOARD — BalanceCard, MonthlySummary, RecentTransactions
- [x] FASE_CASHFLOW — CRUD transações (list, form, row, pages)
- [x] FASE_MOBILE — Sidebar, responsive layout, touch targets
- [x] FASE_INDICADORES — Metas, break-even, progresso, lucro, calculos
- [x] FASE_DEPLOY — Config Vercel, env vars, seguranca, guia
- [x] FASE_HARDENING — Revisão completa produção (ver abaixo)

## Hardening — O que foi feito

### Segurança
- [x] Removido `databasesupabase.txt` com secrets expostos (adicionado ao .gitignore)
- [x] Headers de segurança: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] Sem SQL injection (todas queries via Supabase SDK)
- [x] Sem XSS (nenhum `dangerouslySetInnerHTML`)
- [x] poweredByHeader desligado

### Performance
- [x] `useMemo(() => createSupabaseBrowserClient(), [])` em todos os componentes client
- [x] `indicators-service.ts`: cliente único reutilizado nas 3 queries paralelas
- [x] productionBrowserSourceMaps: false
- [x] Imagens otimizadas (AVIF/WebP)

### Acessibilidade
- [x] `aria-label` nos botões de editar e excluir transações
- [x] `<label htmlFor>` no campo de busca
- [x] DialogTrigger usa `render` prop em vez de aninhar `<button>`
- [x] `sr-only` em português ("Fechar")
- [x] Error boundary global (fallback UI + botão recarregar)

### Código
- [x] Break-even duplicado removido do `financial-goals-service.ts`
- [x] `indicators-service.ts` adicionado ao barrel export
- [x] `CardContent` import não utilizado removido de select-company e select-store
- [x] `console.log` removido do service worker
- [x] Mobile drawer com `max-w-[85vw]` para telas muito estreitas

## Pendente
- [ ] FASE_PWA — Rever/refinar manifest, SW, instalável
- [ ] Git push — Autenticação GitHub pendente

## Observações
- Git push bloqueado: `rochamendesautomacao-alt` sem permissão no repo `RmGuit/fluxodecaixa`
- Solução: `git remote set-url origin https://<TOKEN>@github.com/RmGuit/fluxodecaixa.git` (usar Personal Access Token)
