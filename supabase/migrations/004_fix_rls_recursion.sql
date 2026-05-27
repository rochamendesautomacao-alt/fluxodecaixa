-- ============================================================
-- FLUXO DE CAIXA — Fix RLS infinite recursion
-- ============================================================
-- As políticas originais em 001 usavam subqueries diretas em
-- company_users, que acionavam a RLS da própria company_users,
-- gerando recursão infinita.
--
-- A solução é usar funções security definer (já existentes em
-- 002 ou criadas aqui) que bypassam RLS.
-- ============================================================

-- ============================================================
-- 1. FUNÇÃO AUXILIAR security definer
-- ============================================================
-- Verifica se o usuário autenticado é membro ativo de uma empresa
create or replace function is_company_member(p_company_id uuid)
returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from company_users
    where company_id = p_company_id
      and user_id = auth.uid()
      and is_active = true
  );
$$;

-- ============================================================
-- 2. CORRIGIR POLICIES DA TABELA companies
-- ============================================================
drop policy if exists "Usuário vê suas empresas" on companies;
create policy "Usuário vê suas empresas"
  on companies for select
  using (is_company_member(id));

drop policy if exists "Admin pode gerenciar empresas" on companies;
create policy "Admin pode gerenciar empresas"
  on companies for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Owner pode atualizar empresa" on companies;
create policy "Owner pode atualizar empresa"
  on companies for update
  using (has_company_role(id, 'owner'));

-- ============================================================
-- 3. CORRIGIR POLICIES DA TABELA company_users
-- ============================================================
-- Em vez de subquery recursiva, usa auth.uid() diretamente
drop policy if exists "Usuário vê membros da sua empresa" on company_users;
create policy "Usuário vê membros da sua empresa"
  on company_users for select
  using (user_id = auth.uid() or is_company_member(company_id));

-- As policies de insert/update/delete já usam subqueries que
-- não causam recursão porque são com WITH CHECK ou têm role check,
-- mas vamos reforçá-las com security definer também.
drop policy if exists "Admin pode gerenciar membros" on company_users;
create policy "Admin pode gerenciar membros"
  on company_users for insert
  with check (has_company_role(company_id, 'admin'));

drop policy if exists "Admin pode atualizar membros" on company_users;
create policy "Admin pode atualizar membros"
  on company_users for update
  using (has_company_role(company_id, 'admin'));

drop policy if exists "Admin pode remover membros" on company_users;
create policy "Admin pode remover membros"
  on company_users for delete
  using (has_company_role(company_id, 'admin'));

-- ============================================================
-- 4. CORRIGIR POLICIES DA TABELA stores
-- ============================================================
drop policy if exists "Usuário vê lojas da sua empresa" on stores;
create policy "Usuário vê lojas da sua empresa"
  on stores for select
  using (is_company_member(company_id));

drop policy if exists "Manager+ pode criar lojas" on stores;
create policy "Manager+ pode criar lojas"
  on stores for insert
  with check (has_company_role(company_id, 'manager'));

drop policy if exists "Manager+ pode atualizar lojas" on stores;
create policy "Manager+ pode atualizar lojas"
  on stores for update
  using (has_company_role(company_id, 'manager'));

drop policy if exists "Admin+ pode remover lojas" on stores;
create policy "Admin+ pode remover lojas"
  on stores for delete
  using (has_company_role(company_id, 'admin'));

-- ============================================================
-- 5. CORRIGIR POLICIES DA TABELA categories
-- ============================================================
drop policy if exists "Usuário vê categorias da loja" on categories;
create policy "Usuário vê categorias da loja"
  on categories for select
  using (can_access_store(store_id));

drop policy if exists "Manager+ pode gerenciar categorias" on categories;
create policy "Manager+ pode gerenciar categorias"
  on categories for insert
  with check (can_access_store(store_id));

drop policy if exists "Manager+ pode atualizar categorias" on categories;
create policy "Manager+ pode atualizar categorias"
  on categories for update
  using (can_access_store(store_id));

drop policy if exists "Manager+ pode remover categorias" on categories;
create policy "Manager+ pode remover categorias"
  on categories for delete
  using (can_access_store(store_id));

-- ============================================================
-- 6. CORRIGIR POLICIES DA TABELA cash_transactions
-- ============================================================
drop policy if exists "Usuário vê transações da loja" on cash_transactions;
create policy "Usuário vê transações da loja"
  on cash_transactions for select
  using (can_access_store(store_id));

drop policy if exists "Manager+ pode criar transações" on cash_transactions;
create policy "Manager+ pode criar transações"
  on cash_transactions for insert
  with check (can_access_store(store_id));

drop policy if exists "Manager+ pode atualizar transações" on cash_transactions;
create policy "Manager+ pode atualizar transações"
  on cash_transactions for update
  using (can_access_store(store_id));

drop policy if exists "Admin+ pode remover transações" on cash_transactions;
create policy "Admin+ pode remover transações"
  on cash_transactions for delete
  using (can_access_store(store_id));
