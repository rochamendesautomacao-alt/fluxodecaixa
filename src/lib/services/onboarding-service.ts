import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface FixedExpenseInput {
  name: string;
  amount: number;
}

interface OnboardingInput {
  storeId: string;
  fixedExpenses: FixedExpenseInput[];
  monthlyRevenueGoal: number;
  profitMarginPercentage: number;
  operatingDaysPerMonth: number;
}

export async function createCompany(name: string, slug: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_company_with_owner", {
    p_name: name,
    p_slug: slug,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function createStore(companyId: string, name: string, slug: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_store_with_defaults", {
    p_company_id: companyId,
    p_name: name,
    p_slug: slug,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = createSupabaseBrowserClient();
  const monthlyFixedCosts = input.fixedExpenses.reduce(
    (sum, f) => sum + f.amount,
    0,
  );
  const { error } = await supabase.rpc("complete_onboarding", {
    p_store_id: input.storeId,
    p_fixed_expenses: input.fixedExpenses,
    p_monthly_revenue_goal: input.monthlyRevenueGoal,
    p_profit_margin_percentage: input.profitMarginPercentage,
    p_operating_days_per_month: input.operatingDaysPerMonth,
    p_monthly_fixed_costs: monthlyFixedCosts,
  });
  if (error) throw new Error(error.message);
}

export async function hasOnboarding(storeId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from("financial_goals")
    .select("id")
    .eq("store_id", storeId)
    .maybeSingle();
  return data !== null;
}
