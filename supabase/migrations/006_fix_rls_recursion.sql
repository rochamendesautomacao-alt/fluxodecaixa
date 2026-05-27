-- ============================================================
-- FLUXO DE CAIXA — Fix infinite RLS recursion on company_users
-- ============================================================
-- Motivo: company_users tem FORCE ROW LEVEL SECURITY e a policy
-- SELECT chama is_company_member(), que consulta company_users
-- de novo. Funções SECURITY DEFINER também sofrem RLS com FORCE,
-- gerando recursão infinita.
--
-- Solução: remover FORCE de company_users. As funções SECURITY
-- DEFINER (can_access_store, is_company_member, has_company_role)
-- continuam sendo a única forma de acesso interno e já validam
-- permissão. O RLS normal continua ativo para queries diretas.
-- ============================================================

-- Recria a função auxiliar caso a migração 004 não tenha rodado
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

alter table company_users no force row level security;

drop policy if exists "Usuário vê membros da sua empresa" on company_users;
create policy "Usuário vê membros da sua empresa"
  on company_users for select
  using (user_id = auth.uid());
