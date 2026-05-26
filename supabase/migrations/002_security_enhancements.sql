-- ============================================================
-- FLUXO DE CAIXA — RLS Security & Data Integrity
-- ============================================================
-- Reforça o isolamento entre empresas e lojas.
-- As policies CRUD base já estão em 001_schema.sql.
-- Aqui adicionamos:
--   - FORCE RLS (nem o postgres burla as policies)
--   - Funções reutilizáveis de autorização
--   - Auditoria (created_by automático)
--   - Proteção contra auto-elevação de role
--   - Regras de integridade (impedir deleção com filhos ativos)
-- ============================================================

-- ============================================================
-- 1. FORCE ROW LEVEL SECURITY
-- ============================================================
-- Garante que RLS é aplicado mesmo para o owner da tabela.
-- Sem FORCE, o superadmin/postgres consegue ler tudo.
alter table companies force row level security;
alter table company_users force row level security;
alter table stores force row level security;
alter table categories force row level security;
alter table cash_transactions force row level security;

-- ============================================================
-- 2. HELPER FUNCTIONS (reutilizáveis nas policies e API)
-- ============================================================

-- Verifica se o usuário tem cargo mínimo na empresa
create or replace function has_company_role(
  p_company_id uuid,
  p_min_role user_role
) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from company_users
    where company_id = p_company_id
      and user_id = auth.uid()
      and is_active = true
      and case p_min_role
        when 'owner'   then role = 'owner'
        when 'admin'   then role in ('owner', 'admin')
        when 'manager' then role in ('owner', 'admin', 'manager')
        else role in ('owner', 'admin', 'manager', 'viewer')
      end
  );
$$;

-- Verifica se o usuário pode aceder a uma loja específica
create or replace function can_access_store(
  p_store_id uuid
) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from stores s
    join company_users cu on cu.company_id = s.company_id
    where s.id = p_store_id
      and cu.user_id = auth.uid()
      and cu.is_active = true
  );
$$;

-- Retorna o role do usuário em determinada empresa
create or replace function get_user_role(
  p_company_id uuid
) returns user_role
language sql stable security definer as $$
  select role from company_users
  where company_id = p_company_id
    and user_id = auth.uid()
    and is_active = true;
$$;

-- ============================================================
-- 3. AUDIT TRIGGER
-- ============================================================
-- Preenche created_by com auth.uid() automaticamente

create or replace function set_created_by()
returns trigger as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$ language plpgsql;

create trigger trg_cash_transactions_created_by
  before insert on cash_transactions
  for each row
  when (new.created_by is null)
  execute function set_created_by();

-- ============================================================
-- 4. PROTEÇÃO CONTRA AUTO-ELEVAÇÃO DE ROLE
-- ============================================================
-- Impede que um usuário altere seu próprio role ou o user_id

create or replace function prevent_self_role_escalation()
returns trigger as $$
begin
  -- user_id é imutável após criado
  if old.user_id <> new.user_id then
    raise exception 'user_id cannot be changed';
  end if;
  -- usuário não pode alterar a própria role
  if old.user_id = auth.uid() and new.role <> old.role then
    raise exception 'you cannot change your own role';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_company_users_no_self_escalation
  before update on company_users
  for each row
  execute function prevent_self_role_escalation();

-- ============================================================
-- 5. POLICIES ADICIONAIS (não cobertas na 001)
-- ============================================================

-- Companies: owner pode excluir
create policy "Owner pode excluir empresa"
  on companies for delete
  using (has_company_role(id, 'owner'));

-- Company Users: ninguém se adiciona como owner
create policy "Impedir auto-cadastro como owner"
  on company_users for insert
  with check (
    case
      when user_id = auth.uid() then role <> 'owner'
      else true
    end
  );

-- ============================================================
-- 6. REGRAS DE INTEGRIDADE (triggers BEFORE DELETE)
-- ============================================================

-- Impede excluir empresa que ainda tem lojas ativas
create or replace function prevent_company_delete_with_active_stores()
returns trigger as $$
begin
  if exists (select 1 from stores where company_id = old.id and is_active = true) then
    raise exception 'cannot delete company with active stores';
  end if;
  return old;
end;
$$ language plpgsql;

create trigger trg_companies_prevent_delete
  before delete on companies
  for each row
  execute function prevent_company_delete_with_active_stores();

-- Impede excluir loja que ainda tem transações
create or replace function prevent_store_delete_with_transactions()
returns trigger as $$
begin
  if exists (select 1 from cash_transactions where store_id = old.id) then
    raise exception 'cannot delete store with existing transactions';
  end if;
  return old;
end;
$$ language plpgsql;

create trigger trg_stores_prevent_delete
  before delete on stores
  for each row
  execute function prevent_store_delete_with_transactions();
