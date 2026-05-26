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

// ─── Calculations moved to indicators-service.ts ─────
