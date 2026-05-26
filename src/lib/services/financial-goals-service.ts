import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FinancialGoal } from "@/types/database";
import {
  upsertFinancialGoalSchema,
  updateFinancialGoalSchema,
} from "@/lib/schemas/financial";
import type { z } from "zod";

export async function getFinancialGoalByStore(storeId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as FinancialGoal | null;
}

export async function upsertFinancialGoal(
  input: z.infer<typeof upsertFinancialGoalSchema>,
) {
  const supabase = await createSupabaseServerClient();
  const validated = upsertFinancialGoalSchema.parse(input);

  const { data, error } = await supabase
    .from("financial_goals")
    .upsert(validated, {
      onConflict: "store_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as FinancialGoal;
}

export async function updateFinancialGoal(
  storeId: string,
  input: z.infer<typeof updateFinancialGoalSchema>,
) {
  const supabase = await createSupabaseServerClient();
  const validated = updateFinancialGoalSchema.parse(input);

  const { data, error } = await supabase
    .from("financial_goals")
    .update(validated)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as FinancialGoal;
}

// ─── Financial calculations (future use) ─────────────

interface BreakEvenResult {
  breakEvenRevenue: number;
  dailyTarget: number;
  monthlyProfitProjection: number;
  profitMarginAmount: number;
}

export function calculateBreakEven(
  monthlyFixedCosts: number,
  profitMarginPercentage: number,
  operatingDays: number,
): BreakEvenResult {
  const marginDecimal = profitMarginPercentage / 100;
  const variableCostRate = 1 - marginDecimal;

  const breakEvenRevenue =
    variableCostRate > 0
      ? Math.round(monthlyFixedCosts / variableCostRate * 100) / 100
      : monthlyFixedCosts;

  const dailyTarget =
    operatingDays > 0
      ? Math.round(breakEvenRevenue / operatingDays * 100) / 100
      : 0;

  const monthlyProfitProjection =
    Math.round(breakEvenRevenue * marginDecimal * 100) / 100;

  const profitMarginAmount =
    Math.round(breakEvenRevenue * marginDecimal * 100) / 100;

  return {
    breakEvenRevenue,
    dailyTarget,
    monthlyProfitProjection,
    profitMarginAmount,
  };
}
