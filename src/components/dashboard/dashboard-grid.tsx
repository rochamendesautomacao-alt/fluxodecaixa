import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceCard } from "./balance-card";
import { MonthlySummary } from "./monthly-summary";
import { RecentTransactions } from "./recent-transactions";
import { IndicatorsGrid } from "@/components/indicators/indicators-grid";
import { ListOrdered } from "lucide-react";
import type { CashTransaction } from "@/types/database";
import type { IndicatorsResult } from "@/types/indicators";

interface DashboardGridProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyResult: number;
  recentTransactions: CashTransaction[];
  indicators: IndicatorsResult | null;
  isLoading: boolean;
}

export function DashboardGrid({
  balance,
  monthlyIncome,
  monthlyExpense,
  monthlyResult,
  recentTransactions,
  indicators,
  isLoading,
}: DashboardGridProps) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <BalanceCard balance={balance} isLoading={isLoading} />

      <MonthlySummary
        income={monthlyIncome}
        expense={monthlyExpense}
        result={monthlyResult}
        isLoading={isLoading}
      />

      <IndicatorsGrid data={indicators} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ListOrdered className="size-4" />
            Últimos lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions
            transactions={recentTransactions}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
