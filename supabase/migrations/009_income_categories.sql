-- ============================================================
-- FLUXO DE CAIXA — Income categories as payment methods
-- ============================================================

-- 1. Atualiza a função de criação de loja com novas categorias
create or replace function create_store_with_defaults(
  p_company_id uuid,
  p_name text,
  p_slug text
) returns uuid
language plpgsql security definer as $$
declare
  v_store_id uuid;
begin
  insert into stores (company_id, name, slug)
  values (p_company_id, p_name, p_slug)
  returning id into v_store_id;

  insert into categories (store_id, name, type, color, icon, sort_order) values
    (v_store_id, 'Dinheiro', 'income', '#22c55e', 'Banknote', 1),
    (v_store_id, 'Débito', 'income', '#3b82f6', 'CreditCard', 2),
    (v_store_id, 'Crédito', 'income', '#8b5cf6', 'CreditCard', 3),
    (v_store_id, 'PIX', 'income', '#10b981', 'Zap', 4),
    (v_store_id, 'Aluguel', 'expense', '#ef4444', 'Home', 1),
    (v_store_id, 'Fornecedores', 'expense', '#f59e0b', 'Truck', 2),
    (v_store_id, 'Salários', 'expense', '#8b5cf6', 'Users', 3);

  return v_store_id;
end;
$$;

-- 2. Adiciona as novas categorias de entrada para lojas existentes
do $$
declare
  rec record;
begin
  for rec in
    select s.id as store_id
    from stores s
  loop
    insert into categories (store_id, name, type, color, icon, sort_order) values
      (rec.store_id, 'Dinheiro', 'income', '#22c55e', 'Banknote', 1),
      (rec.store_id, 'Débito', 'income', '#3b82f6', 'CreditCard', 2),
      (rec.store_id, 'Crédito', 'income', '#8b5cf6', 'CreditCard', 3),
      (rec.store_id, 'PIX', 'income', '#10b981', 'Zap', 4)
    on conflict (store_id, type, name) do nothing;
  end loop;
end;
$$;
