-- ============================================================
-- FLUXO DE CAIXA — Employees table
-- ============================================================
create table if not exists employees (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores(id) on delete cascade,
  name         text not null,
  role         text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_employees_store on employees (store_id);
create index if not exists idx_employees_active on employees (store_id) where is_active = true;

alter table employees enable row level security;
alter table employees force row level security;

create policy "Usuário vê funcionários da loja"
  on employees for select
  using (can_access_store(store_id));

create policy "Manager+ pode gerenciar funcionários"
  on employees for insert
  with check (can_access_store(store_id));

create policy "Manager+ pode atualizar funcionários"
  on employees for update
  using (can_access_store(store_id));

create policy "Manager+ pode remover funcionários"
  on employees for delete
  using (can_access_store(store_id));
