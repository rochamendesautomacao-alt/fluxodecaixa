import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { IndicatorsResult } from "@/types/indicators";

interface ProfitCardProps {
  data: IndicatorsResult;
  isLoading: boolean;
}

export function ProfitCard({ data, isLoading }: ProfitCardProps) {
  const hasProfit = data.estimatedProfit >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <PiggyBank className="size-4" />
          Projeção de lucro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  hasProfit ? "text-emerald-600" : "text-red-600",
                )}
              >
                {data.estimatedProfit.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  hasProfit ? "text-emerald-600" : "text-red-600",
                )}
              >
                {hasProfit ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {data.actualProfitMargin}%
              </span>
            </div>

            {data.breakEvenRevenue > 0 && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Receita atual</span>
                  <span>
                    {data.actualRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Custos totais</span>
                  <span>
                    {(data.actualRevenue > 0
                      ? data.actualRevenue - data.estimatedProfit
                      : 0
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                  <span>Faturamento mínimo</span>
                  <span>
                    {data.minimumRequiredRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
