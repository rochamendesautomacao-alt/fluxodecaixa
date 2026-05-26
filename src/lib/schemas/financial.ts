import { z } from "zod";

// ─── Expense Frequency ───────────────────────────────
const expenseFrequencySchema = z.enum([
  "monthly",
  "yearly",
  "weekly",
  "daily",
]);

// ─── Fixed Expense ───────────────────────────────────
export const createFixedExpenseSchema = z.object({
  store_id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo"),
  description: z.string().max(500).nullable().optional(),
  amount: z
    .number()
    .positive("Valor deve ser positivo")
    .max(999999999999.99, "Valor muito alto"),
  frequency: expenseFrequencySchema.default("monthly"),
  due_day: z
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional(),
});

export const updateFixedExpenseSchema = createFixedExpenseSchema
  .partial()
  .omit({ store_id: true });

export const fixedExpenseQuerySchema = z.object({
  store_id: z.string().uuid(),
  is_active: z
    .enum(["true", "false", "all"])
    .default("true"),
});

// ─── Financial Goal ──────────────────────────────────
export const upsertFinancialGoalSchema = z.object({
  store_id: z.string().uuid(),
  monthly_revenue_goal: z
    .number()
    .positive("Meta de faturamento deve ser positiva"),
  profit_margin_percentage: z
    .number()
    .min(0, "Margem não pode ser negativa")
    .max(100, "Margem não pode exceder 100%"),
  operating_days_per_month: z
    .number()
    .int()
    .min(1, "Mínimo 1 dia")
    .max(31, "Máximo 31 dias"),
  monthly_fixed_costs: z
    .number()
    .min(0, "Custos fixos não podem ser negativos"),
});

export const updateFinancialGoalSchema = upsertFinancialGoalSchema
  .partial()
  .omit({ store_id: true });

// ─── Types derived from schemas ──────────────────────
export type CreateFixedExpenseInput = z.infer<
  typeof createFixedExpenseSchema
>;
export type UpdateFixedExpenseInput = z.infer<
  typeof updateFixedExpenseSchema
>;
export type UpsertFinancialGoalInput = z.infer<
  typeof upsertFinancialGoalSchema
>;
export type UpdateFinancialGoalInput = z.infer<
  typeof updateFinancialGoalSchema
>;
