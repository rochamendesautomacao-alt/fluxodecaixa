-- ============================================================
-- FLUXO DE CAIXA — Multi-tenant Schema
-- ============================================================
-- Estratégia: isolamento por company_id + store_id
-- Um usuário acede várias empresas via company_users
-- Cada loja pertence a uma empresa
-- Transações e categorias são scoped por loja
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. COMPANIES
-- ============================================================
create table companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  document    text unique,       -- CNPJ/CPF
  phone       text,
  email       text,
  logo_url    text,
  is_active   boolean not null default true,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_companies_slug on companies (slug);
create index idx_companies_active on companies (is_active) where is_active = true;

-- ============================================================
-- 2. COMPANY_USERS (many-to-many)
-- ============================================================
create type user_role as enum ('owner', 'admin', 'manager', 'viewer');

create table company_users (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  user_id     uuid not null,  -- references auth.users(id) — Supabase Auth
  role        user_role not null default 'viewer',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- um usuário só pode ter um papel por empresa
  unique (company_id, user_id)
);

create index idx_company_users_user on company_users (user_id);
create index idx_company_users_company on company_users (company_id);
create index idx_company_users_active on company_users (company_id, user_id) where is_active = true;

-- ============================================================
-- 3. STORES
-- ============================================================
create table stores (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  name        text not null,
  slug        text not null,
  document    text,              -- CNPJ/CPF da loja
  phone       text,
  email       text,
  address     jsonb,             -- {street, number, neighborhood, city, state, zip}
  is_active   boolean not null default true,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- slug único dentro de cada empresa
  unique (company_id, slug)
);

create index idx_stores_company on stores (company_id);
create index idx_stores_active on stores (company_id) where is_active = true;

-- ============================================================
-- 4. CATEGORIES
-- ============================================================
create type transaction_type as enum ('income', 'expense');

create table categories (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores(id) on delete cascade,
  name         text not null,
  type         transaction_type not null,
  color        text,              -- hex color para UI
  icon         text,              -- nome do ícone Lucide
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- nome único dentro de cada loja para cada tipo
  unique (store_id, type, name)
);

create index idx_categories_store on categories (store_id);
create index idx_categories_type on categories (store_id, type);
create index idx_categories_active on categories (store_id, type) where is_active = true;

-- ============================================================
-- 5. CASH TRANSACTIONS
-- ============================================================
create table cash_transactions (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  description   text not null,
  amount        numeric(15,2) not null check (amount > 0),
  type          transaction_type not null,
  date          date not null,
  due_date      date,
  payment_date  date,
  is_reconciled boolean not null default false,
  notes         text,
  metadata      jsonb not null default '{}'::jsonb,
  created_by    uuid,             -- auth.users(id)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índices para performance em consultas de fluxo de caixa
create index idx_cash_transactions_store on cash_transactions (store_id);
create index idx_cash_transactions_date on cash_transactions (store_id, date);
create index idx_cash_transactions_type on cash_transactions (store_id, type, date);
create index idx_cash_transactions_category on cash_transactions (store_id, category_id);
create index idx_cash_transactions_pending on cash_transactions (store_id, payment_date) where payment_date is null;
create index idx_cash_transactions_period on cash_transactions (store_id, date desc);

-- ============================================================
-- 6. AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_updated_at
  before update on companies for each row execute function update_updated_at();
create trigger trg_company_users_updated_at
  before update on company_users for each row execute function update_updated_at();
create trigger trg_stores_updated_at
  before update on stores for each row execute function update_updated_at();
create trigger trg_categories_updated_at
  before update on categories for each row execute function update_updated_at();
create trigger trg_cash_transactions_updated_at
  before update on cash_transactions for each row execute function update_updated_at();

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

-- Habilitar RLS em todas as tabelas
alter table companies enable row level security;
alter table company_users enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table cash_transactions enable row level security;

-- Política base: usuário vê apenas empresas às quais está vinculado
create policy "Usuário vê suas empresas"
  on companies for select
  using (
    id in (
      select company_id from company_users where user_id = auth.uid()
    )
  );

create policy "Admin pode gerenciar empresas"
  on companies for insert
  with check (
    -- apenas usuários autenticados podem criar empresas
    auth.role() = 'authenticated'
  );

create policy "Owner pode atualizar empresa"
  on companies for update
  using (
    id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Company Users
create policy "Usuário vê membros da sua empresa"
  on company_users for select
  using (
    company_id in (
      select company_id from company_users where user_id = auth.uid()
    )
  );

create policy "Admin pode gerenciar membros"
  on company_users for insert
  with check (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admin pode atualizar membros"
  on company_users for update
  using (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admin pode remover membros"
  on company_users for delete
  using (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Stores
create policy "Usuário vê lojas da sua empresa"
  on stores for select
  using (
    company_id in (
      select company_id from company_users where user_id = auth.uid()
    )
  );

create policy "Manager+ pode criar lojas"
  on stores for insert
  with check (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ pode atualizar lojas"
  on stores for update
  using (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admin+ pode remover lojas"
  on stores for delete
  using (
    company_id in (
      select company_id from company_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Categories
create policy "Usuário vê categorias da loja"
  on categories for select
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid()
    )
  );

create policy "Manager+ pode gerenciar categorias"
  on categories for insert
  with check (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ pode atualizar categorias"
  on categories for update
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ pode remover categorias"
  on categories for delete
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin', 'manager')
    )
  );

-- Cash Transactions
create policy "Usuário vê transações da loja"
  on cash_transactions for select
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid()
    )
  );

create policy "Manager+ pode criar transações"
  on cash_transactions for insert
  with check (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ pode atualizar transações"
  on cash_transactions for update
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admin+ pode remover transações"
  on cash_transactions for delete
  using (
    store_id in (
      select s.id from stores s
      join company_users cu on cu.company_id = s.company_id
      where cu.user_id = auth.uid() and cu.role in ('owner', 'admin')
    )
  );

-- ============================================================
-- 8. HELPER FUNCTIONS
-- ============================================================

-- Retorna as empresas do usuário autenticado
create or replace function get_user_companies()
returns table (
  id uuid,
  name text,
  slug text,
  role user_role
) language sql security definer as $$
  select c.id, c.name, c.slug, cu.role
  from companies c
  join company_users cu on cu.company_id = c.id
  where cu.user_id = auth.uid() and cu.is_active = true and c.is_active = true
  order by c.name;
$$;

-- Retorna as lojas de uma empresa que o usuário pode aceder
create or replace function get_company_stores(p_company_id uuid)
returns setof stores language sql security definer as $$
  select s.*
  from stores s
  join company_users cu on cu.company_id = s.company_id
  where cu.user_id = auth.uid()
    and s.company_id = p_company_id
    and cu.is_active = true
    and s.is_active = true
  order by s.name;
$$;
