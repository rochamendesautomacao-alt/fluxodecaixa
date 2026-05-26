import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FixedExpense } from "@/types/database";
import {
  createFixedExpenseSchema,
  updateFixedExpenseSchema,
  fixedExpenseQuerySchema,
} from "@/lib/schemas/financial";
import type { z } from "zod";

type QueryParams = z.infer<typeof fixedExpenseQuerySchema>;

export async function listFixedExpenses(params: QueryParams) {
  const supabase = await createSupabaseServerClient();
  const validated = fixedExpenseQuerySchema.parse(params);

  let query = supabase
    .from("fixed_expenses")
    .select("*")
    .eq("store_id", validated.store_id)
    .order("name");

  if (validated.is_active !== "all") {
    query = query.eq(
      "is_active",
      validated.is_active === "true",
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as FixedExpense[];
}

export async function getFixedExpense(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as FixedExpense;
}

export async function createFixedExpense(
  input: z.infer<typeof createFixedExpenseSchema>,
) {
  const supabase = await createSupabaseServerClient();
  const validated = createFixedExpenseSchema.parse(input);

  const { data, error } = await supabase
    .from("fixed_expenses")
    .insert(validated)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as FixedExpense;
}

export async function updateFixedExpense(
  id: string,
  input: z.infer<typeof updateFixedExpenseSchema>,
) {
  const supabase = await createSupabaseServerClient();
  const validated = updateFixedExpenseSchema.parse(input);

  const { data, error } = await supabase
    .from("fixed_expenses")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as FixedExpense;
}

export async function deleteFixedExpense(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("fixed_expenses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function toggleFixedExpense(id: string, isActive: boolean) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fixed_expenses")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as FixedExpense;
}
