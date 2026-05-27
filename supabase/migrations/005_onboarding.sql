-- ============================================================
-- FLUXO DE CAIXA — Onboarding RPCs
-- ============================================================
-- Functions security definer para criar empresa + loja + onboarding
-- sem colidir com as políticas RLS.
-- ============================================================

-- ============================================================
-- Cria empresa e adiciona usuário como owner (atomicamente)
-- ============================================================
create or replace function create_company_with_owner(
  p_name text,
  p_slug text
) returns uuid
language plpgsql security definer as $$
declare
  v_company_id uuid;
begin
  insert into companies (name, slug)
  values (p_name, p_slug)
  returning id into v_company_id;

  insert into company_users (company_id, user_id, role)
  values (v_company_id, auth.uid(), 'owner');

  return v_company_id;
end;
$$;

-- ============================================================
-- Cria loja com categorias padrão
-- ============================================================
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
    (v_store_id, 'Vendas', 'income', '#22c55e', 'ShoppingCart', 1),
    (v_store_id, 'Serviços', 'income', '#3b82f6', 'Wrench', 2),
    (v_store_id, 'Aluguel', 'expense', '#ef4444', 'Home', 1),
    (v_store_id, 'Fornecedores', 'expense', '#f59e0b', 'Truck', 2),
    (v_store_id, 'Salários', 'expense', '#8b5cf6', 'Users', 3);

  return v_store_id;
end;
$$;

-- ============================================================
-- Completa onboarding: cria despesas fixas + metas financeiras
-- Idempotente: substitui dados existentes se re-executado
-- ============================================================
create or replace function complete_onboarding(
  p_store_id uuid,
  p_fixed_expenses jsonb,
  p_monthly_revenue_goal numeric,
  p_profit_margin_percentage numeric,
  p_operating_days_per_month integer,
  p_monthly_fixed_costs numeric
) returns void
language plpgsql security definer as $$
declare
  v_expense jsonb;
  v_name text;
  v_amount numeric;
begin
  -- remove despesas fixas existentes para reinserir
  delete from fixed_expenses
  where store_id = p_store_id and is_active = true;

  -- insere despesas fixas
  for v_expense in select * from jsonb_array_elements(p_fixed_expenses)
  loop
    v_name := v_expense->>'name';
    v_amount := (v_expense->>'amount')::numeric;

    insert into fixed_expenses (store_id, name, amount, frequency)
    values (p_store_id, v_name, v_amount, 'monthly');
  end loop;

  -- upsert metas financeiras (uma por loja)
  insert into financial_goals (
    store_id,
    monthly_revenue_goal,
    profit_margin_percentage,
    operating_days_per_month,
    monthly_fixed_costs
  ) values (
    p_store_id,
    p_monthly_revenue_goal,
    p_profit_margin_percentage,
    p_operating_days_per_month,
    p_monthly_fixed_costs
  )
  on conflict (store_id) do update set
    monthly_revenue_goal = excluded.monthly_revenue_goal,
    profit_margin_percentage = excluded.profit_margin_percentage,
    operating_days_per_month = excluded.operating_days_per_month,
    monthly_fixed_costs = excluded.monthly_fixed_costs;
end;
$$;
