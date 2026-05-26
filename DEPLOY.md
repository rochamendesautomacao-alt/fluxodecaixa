# Deploy — Fluxo de Caixa

## 1. Pré-requisitos

- Conta [Vercel](https://vercel.com) (plana free)
- Conta [Supabase](https://supabase.com) (plana free)
- Repositório Git hospedado (GitHub, GitLab, Bitbucket)

## 2. Variáveis de Ambiente

Adicione no **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variável | Onde obter | Público? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` | Não |
| `NEXT_PUBLIC_APP_URL` | URL do seu domínio Vercel — ex: `https://fluxodecaixa.vercel.app` | Sim |
| `DATABASE_URL` | Supabase Dashboard → Project Settings → Database → Connection string | Não |

**⚠ Importante:** `SUPABASE_SERVICE_ROLE_KEY` e `DATABASE_URL` têm permissões de admin — nunca exponha no frontend.

## 3. Configurar Supabase (Produção)

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute as migrations na ordem:
   ```sql
   -- Copie e cole cada arquivo de supabase/migrations/
   -- 1. 001_schema.sql
   -- 2. 002_security_enhancements.sql
   -- 3. 003_financial_foundation.sql
   ```
3. Em **Authentication → Settings**, confirme:
   - `Site URL` = URL da Vercel
   - `Redirect URLs` = `https://[seu-app].vercel.app/auth/callback`

## 4. Deploy na Vercel

### Via GitHub (recomendado)

1. Vá em https://vercel.com/new
2. Importe o repositório `fluxodecaixa`
3. Framework: **Next.js** (detectado automaticamente)
4. Adicione todas as variáveis de ambiente da seção 2
5. Clique em **Deploy**

### Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 5. Pós-Deploy

- [ ] Testar login/cadastro
- [ ] Testar criação de empresa e loja
- [ ] Testar CRUD de lançamentos
- [ ] Testar dashboard e indicadores
- [ ] Testar PWA (instalação)
- [ ] Verificar redirecionamentos
- [ ] Verificar se o service worker registrou

## 6. Checklist de Produção

### Segurança
- [ ] RLS ativo em todas as tabelas
- [ ] FORCE RLS habilitado nas migrations
- [ ] Chaves `service_role` e `anon` corretas no Vercel
- [ ] `X-Frame-Options: DENY` (configurado em next.config.ts)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Sem secrets no frontend

### Performance
- [ ] Build limpa sem warnings
- [ ] Imagens otimizadas (AVIF/WebP no next.config)
- [ ] Compressão gzip/br ativa (Vercel padrão)
- [ ] Service worker com cache básico

### SEO
- [ ] Meta tags no root layout
- [ ] Manifest PWA configurado
- [ ] Título por página com template `%s | Fluxo de Caixa`

### PWA
- [ ] Manifest.json servido com Cache-Control
- [ ] Service worker registrado
- [ ] Instalação testada no Chrome

## 7. Erros Comuns

| Erro | Causa | Solução |
|---|---|---|
| `403 (Forbidden)` ao listar dados | Service role key vazia ou RLS mal configurado | Verificar env vars e migrations |
| `Auth session missing` | Site URL errada no Supabase Auth | Configurar URL correta no dashboard |
| `Failed to load SW` | HTTPS necessário | Usar domínio Vercel padrão |
| `Build failed: Cannot find module` | Dependência não instalada | Rodar `npm install` local e comitar lockfile |
| `Route not found` no deploy | next.config com redirect mal formatado | Verificar sintaxe do arquivo |
| `404` em rotas dinâmicas | Build sem todas as páginas | Verificar `npm run build` local |

## 8. Monitoramento

### Vercel
- **Analytics**: Vercel Dashboard → Analytics (ativar gratuitamente)
- **Logs**: Vercel Dashboard → Logs (logs em tempo real)
- **Web Vitals**: Core Web Vitals no Analytics

### Supabase
- **Database**: Supabase Dashboard → Database → Reports
- **Auth**: Supabase Dashboard → Auth → Users (monitorar usuários ativos)
- **Edge Functions**: Logs em Edge Functions (se implementado)

### Custom (futuro)
- Sentry para erro tracking (quando escalar)
- Umami/Plausible para analytics leve

## 9. CI/CD

Por padrão, a Vercel faz deploy automático a cada push na branch `main`.

Para evitar deploy indesejado:
- Crie branches de feature: `git checkout -b feat/nome`
- Faça PR para `main`
- O deploy só ocorre no merge

Para preview deployments (recomendado):
- Vercel cria automaticamente uma URL de preview para cada PR
- Teste antes de fazer merge
