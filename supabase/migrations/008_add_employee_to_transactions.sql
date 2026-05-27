-- ============================================================
-- FLUXO DE CAIXA — Add employee_id to cash_transactions
-- ============================================================
alter table cash_transactions
  add column if not exists employee_id uuid references employees(id) on delete set null;

create index if not exists idx_cash_transactions_employee
  on cash_transactions (store_id, employee_id);
