import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { IndicatorsInput, IndicatorsResult } from "@/types/indicators";

function buildIndicators(input: IndicatorsInput): IndicatorsResult {
  const {
    monthlyFixedCosts,
    profitMarginPercentage,
    operatingDaysPerMonth,
    monthlyRevenueGoal,
    actualMonthlyIncome,
    actualMonthlyExpense,
  } = input;

  const marginDecimal = profitMarginPercentage / 100;
  const variableCostRate = Math.max(1 - marginDecimal, 0.01);

  const breakEvenRevenue =
    monthlyFixedCosts > 0
      ? round(monthlyFixedCosts / variableCostRate)
      : 0;

  const dailyTarget =
    operatingDaysPerMonth > 0
      ? round(breakEvenRevenue / operatingDaysPerMonth)
      : 0;

  const dailyGoalTarget =
    operatingDaysPerMonth > 0
      ? round(monthlyRevenueGoal / operatingDaysPerMonth)
      : 0;

  const goalProgress =
    monthlyRevenueGoal > 0
      ? Math.min((actualMonthlyIncome / monthlyRevenueGoal) * 100, 100)
      : 0;

  const goalProgressValue = Math.min(actualMonthlyIncome, monthlyRevenueGoal);
  const revenueGap = Math.max(monthlyRevenueGoal - actualMonthlyIncome, 0);

  const estimatedProfit =
    actualMonthlyIncome - actualMonthlyExpense - monthlyFixedCosts;

  const actualProfitMargin =
    actualMonthlyIncome > 0
      ? round((estimatedProfit / actualMonthlyIncome) * 100)
      : 0;

  const minimumRequiredRevenue =
    monthlyFixedCosts > 0
      ? round((actualMonthlyExpense + monthlyFixedCosts) / (1 - marginDecimal))
      : round(actualMonthlyExpense / (1 - marginDecimal));

  return {
    actualRevenue: actualMonthlyIncome,
    fixedCosts: monthlyFixedCosts,
    contributionMargin: profitMarginPercentage,
    breakEvenRevenue,
    dailyTarget,
    dailyGoalTarget,
    monthlyGoal: monthlyRevenueGoal,
    goalProgress,
    goalProgressValue,
    revenueGap,
    estimatedProfit,
    actualProfitMargin,
    operatingDays: operatingDaysPerMonth,
    minimumRequiredRevenue,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { firstDay, lastDay };
}

async function getMonthlyTransactions(
  storeId: string,
  firstDay: string,
  lastDay: string,
) {
  const supabase = createSupabaseBrowserClient();

  const { data } = await supabase
    .from("cash_transactions")
    .select("amount, type")
    .eq("store_id", storeId)
    .gte("date", firstDay)
    .lte("date", lastDay);

  const items = data ?? [];

  const income = items
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = items
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expense };
}

async function getActiveFixedCosts(storeId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data } = await supabase
    .from("fixed_expenses")
    .select("amount")
    .eq("store_id", storeId)
    .eq("is_active", true);

  const items = data ?? [];
  return items.reduce((sum, f) => sum + Number(f.amount), 0);
}

async function getGoals(storeId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  return data
    ? {
        monthlyRevenueGoal: Number(data.monthly_revenue_goal),
        profitMarginPercentage: Number(data.profit_margin_percentage),
        operatingDaysPerMonth: Number(data.operating_days_per_month),
        monthlyFixedCosts: Number(data.monthly_fixed_costs),
      }
    : null;
}

export async function fetchIndicators(
  storeId: string,
): Promise<IndicatorsResult> {
  const { firstDay, lastDay } = getCurrentMonthRange();

  const [monthly, fixedCostsDirect, goals] = await Promise.all([
    getMonthlyTransactions(storeId, firstDay, lastDay),
    getActiveFixedCosts(storeId),
    getGoals(storeId),
  ]);

  const monthlyRevenueGoal = goals?.monthlyRevenueGoal ?? 0;
  const profitMarginPercentage = goals?.profitMarginPercentage ?? 30;
  const operatingDaysPerMonth = goals?.operatingDaysPerMonth ?? 22;
  const monthlyFixedCosts =
    goals?.monthlyFixedCosts ?? fixedCostsDirect;

  return buildIndicators({
    monthlyFixedCosts,
    profitMarginPercentage,
    operatingDaysPerMonth,
    monthlyRevenueGoal,
    actualMonthlyIncome: monthly.income,
    actualMonthlyExpense: monthly.expense,
  });
}
