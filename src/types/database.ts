import type { UUID } from ".";

// ─── Enums ───────────────────────────────────────────
export type TransactionType = "income" | "expense";
export type UserRole = "owner" | "admin" | "manager" | "viewer";

// ─── Companies ───────────────────────────────────────
export interface Company {
  id: UUID;
  name: string;
  slug: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Company Users ───────────────────────────────────
export interface CompanyUser {
  id: UUID;
  company_id: UUID;
  user_id: UUID;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Stores ──────────────────────────────────────────
export interface Store {
  id: UUID;
  company_id: UUID;
  name: string;
  slug: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: Record<string, unknown> | null;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Categories ──────────────────────────────────────
export interface Category {
  id: UUID;
  store_id: UUID;
  name: string;
  type: TransactionType;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Cash Transactions ───────────────────────────────
export interface CashTransaction {
  id: UUID;
  store_id: UUID;
  category_id: UUID | null;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  due_date: string | null;
  payment_date: string | null;
  is_reconciled: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_by: UUID | null;
  created_at: string;
  updated_at: string;
}
