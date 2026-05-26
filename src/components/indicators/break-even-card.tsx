import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartNoAxesGantt, Sun } from "lucide-react";
import type { IndicatorsResult } from "@/types/indicators";

interface BreakEvenCardProps {
  data: IndicatorsResult;
  isLoading: boolean;
}

export function BreakEvenCard({ data, isLoading }: BreakEvenCardProps) {
  const isAboveBreakEven = data.actualRevenue >= data.breakEvenRevenue;
  const isBelowBreakEven =
    data.breakEvenRevenue > 0 && data.actualRevenue < data.breakEvenRevenue;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ChartNoAxesGantt className="size-4" />
          Ponto de equilíbrio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        ) : data.breakEvenRevenue <= 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Configure as metas para ver o ponto de equilíbrio
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  isAboveBreakEven
                    ? "text-emerald-600"
                    : "text-red-600",
                )}
              >
                {data.breakEvenRevenue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  isAboveBreakEven
                    ? "text-emerald-600"
                    : isBelowBreakEven
                      ? "text-red-600"
                      : "text-muted-foreground",
                )}
              >
                {isAboveBreakEven
                  ? "Acima do equilíbrio"
                  : isBelowBreakEven
                    ? "Abaixo do equilíbrio"
                    : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Sun className="size-3.5" />
              Necessário por dia:{" "}
              {data.dailyTarget.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              {" • "}
              {data.operatingDays} dias úteis
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Margem: {data.contributionMargin}% | Custos fixos:{" "}
                {data.fixedCosts.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
