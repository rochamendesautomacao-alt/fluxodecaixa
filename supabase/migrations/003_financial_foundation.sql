-- ============================================================
-- FLUXO DE CAIXA — Fundação Financeira Estratégica
-- ============================================================
-- Habilita cada loja a configurar:
--   - Despesas fixas recorrentes
--   - Metas financeiras (faturamento, margem, dias operacionais)
-- Futuramente alimentará cálculos de:
--   - Ponto de equilíbrio
--   - Faturamento mínimo
--   - Meta diária
--   - Projeção de lucro
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
create type expense_frequency as enum (
  'monthly',
  'yearly',
  'weekly',
  'daily'
);

-- ============================================================
-- 2. FIXED EXPENSES
-- ============================================================
create table fixed_expenses (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  name          text not null,
  description   text,
  amount        numeric(15,2) not null check (amount > 0),
  frequency     expense_frequency not null default 'monthly',
  due_day       integer check (due_day between 1 and 31),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Nome único por loja
  unique (store_id, name)
);

create index idx_fixed_expenses_store on fixed_expenses (store_id);
create index idx_fixed_expenses_active on fixed_expenses (store_id) where is_active = true;

-- ============================================================
-- 3. FINANCIAL GOALS (uma por loja)
-- ============================================================
create table financial_goals (
  id                          uuid primary key default gen_random_uuid(),
  store_id                    uuid not null references stores(id) on delete cascade unique,
  monthly_revenue_goal        numeric(15,2) not null check (monthly_revenue_goal > 0),
  profit_margin_percentage    numeric(5,2) not null check (profit_margin_percentage >= 0 and profit_margin_percentage <= 100),
  operating_days_per_month    integer not null check (operating_days_per_month between 1 and 31),
  monthly_fixed_costs         numeric(15,2) not null check (monthly_fixed_costs >= 0),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index idx_financial_goals_store on financial_goals (store_id);

-- ============================================================
-- 4. AUTO-UPDATE TRIGGERS
-- ============================================================
create trigger trg_fixed_expenses_updated_at
  before update on fixed_expenses for each row execute function update_updated_at();
create trigger trg_financial_goals_updated_at
  before update on financial_goals for each row execute function update_updated_at();

-- ============================================================
-- 5. RLS
-- ============================================================
alter table fixed_expenses enable row level security;
alter table financial_goals enable row level security;
alter table fixed_expenses force row level security;
alter table financial_goals force row level security;

-- Fixed Expenses: SELECT (usuário vê da loja)
create policy "Usuário vê despesas fixas da loja"
  on fixed_expenses for select
  using (can_access_store(store_id));

create policy "Manager+ gerencia despesas fixas"
  on fixed_expenses for insert
  with check (
    can_access_store(store_id)
    and exists (
      select 1 from stores s
      join company_users cu on cu.company_id = s.company_id
      where s.id = store_id
        and cu.user_id = auth.uid()
        and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ atualiza despesas fixas"
  on fixed_expenses for update
  using (can_access_store(store_id))
  with check (can_access_store(store_id));

create policy "Manager+ remove despesas fixas"
  on fixed_expenses for delete
  using (can_access_store(store_id));

-- Financial Goals: SELECT (usuário vê da loja)
create policy "Usuário vê metas da loja"
  on financial_goals for select
  using (can_access_store(store_id));

create policy "Manager+ gerencia metas"
  on financial_goals for insert
  with check (
    can_access_store(store_id)
    and exists (
      select 1 from stores s
      join company_users cu on cu.company_id = s.company_id
      where s.id = store_id
        and cu.user_id = auth.uid()
        and cu.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Manager+ atualiza metas"
  on financial_goals for update
  using (can_access_store(store_id))
  with check (can_access_store(store_id));

create policy "Manager+ remove metas"
  on financial_goals for delete
  using (can_access_store(store_id));
