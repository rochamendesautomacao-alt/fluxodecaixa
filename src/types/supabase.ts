import type {
  Company,
  CompanyUser,
  Store,
  Category,
  CashTransaction,
  FixedExpense,
  FinancialGoal,
} from "./database";

export type Tables = {
  companies: Company;
  company_users: CompanyUser;
  stores: Store;
  categories: Category;
  cash_transactions: CashTransaction;
  fixed_expenses: FixedExpense;
  financial_goals: FinancialGoal;
};

export type TableName = keyof Tables;
