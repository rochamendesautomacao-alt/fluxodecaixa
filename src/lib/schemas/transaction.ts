import { z } from "zod";

export const createTransactionSchema = z.object({
  store_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  employee_id: z.string().uuid().nullable().optional(),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição muito longa"),
  amount: z
    .number()
    .positive("Valor deve ser positivo"),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "Data é obrigatória"),
  due_date: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .omit({ store_id: true });

export const transactionFilterSchema = z.object({
  type: z.enum(["all", "income", "expense"]).default("all"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;
export type UpdateTransactionInput = z.infer<
  typeof updateTransactionSchema
>;
export type TransactionFilterInput = z.infer<
  typeof transactionFilterSchema
>;
