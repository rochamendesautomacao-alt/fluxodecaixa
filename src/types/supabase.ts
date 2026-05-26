import type {
  Company,
  CompanyUser,
  Store,
  Category,
  CashTransaction,
} from "./database";

export type Tables = {
  companies: Company;
  company_users: CompanyUser;
  stores: Store;
  categories: Category;
  cash_transactions: CashTransaction;
};

export type TableName = keyof Tables;
