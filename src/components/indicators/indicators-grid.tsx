import { GoalsCard } from "./goals-card";
import { BreakEvenCard } from "./break-even-card";
import { ProfitCard } from "./profit-card";
import type { IndicatorsResult } from "@/types/indicators";

interface IndicatorsGridProps {
  data: IndicatorsResult | null;
  isLoading: boolean;
}

export function IndicatorsGrid({ data, isLoading }: IndicatorsGridProps) {
  const defaultData: IndicatorsResult = {
    actualRevenue: 0,
    fixedCosts: 0,
    contributionMargin: 0,
    breakEvenRevenue: 0,
    dailyTarget: 0,
    dailyGoalTarget: 0,
    monthlyGoal: 0,
    goalProgress: 0,
    goalProgressValue: 0,
    revenueGap: 0,
    estimatedProfit: 0,
    actualProfitMargin: 0,
    operatingDays: 22,
    minimumRequiredRevenue: 0,
  };

  const d = data ?? defaultData;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <GoalsCard data={d} isLoading={isLoading} />
      <BreakEvenCard data={d} isLoading={isLoading} />
      <ProfitCard data={d} isLoading={isLoading} />
    </div>
  );
}
