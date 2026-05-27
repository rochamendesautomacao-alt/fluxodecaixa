-- ============================================================
-- FLUXO DE CAIXA — Add missing RLS policies for fixed_expenses
-- ============================================================
create policy "Usuário vê despesas fixas da loja"
  on fixed_expenses for select
  using (can_access_store(store_id));

create policy "Manager+ pode gerenciar despesas fixas"
  on fixed_expenses for insert
  with check (can_access_store(store_id));

create policy "Manager+ pode atualizar despesas fixas"
  on fixed_expenses for update
  using (can_access_store(store_id));

create policy "Manager+ pode remover despesas fixas"
  on fixed_expenses for delete
  using (can_access_store(store_id));
