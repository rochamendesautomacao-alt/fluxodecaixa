import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Target, TrendingUp } from "lucide-react";
import type { IndicatorsResult } from "@/types/indicators";

interface GoalsCardProps {
  data: IndicatorsResult;
  isLoading: boolean;
}

export function GoalsCard({ data, isLoading }: GoalsCardProps) {
  const progressWidth = `${Math.min(data.goalProgress, 100)}%`;
  const isBehind = data.goalProgress < 100 && data.monthlyGoal > 0;
  const isMet = data.goalProgress >= 100 && data.monthlyGoal > 0;
  const noGoal = data.monthlyGoal <= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Target className="size-4" />
          Meta mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ) : noGoal ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma meta definida
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight">
                {data.actualRevenue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span className="text-sm text-muted-foreground">
                de{" "}
                {data.monthlyGoal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>

            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isMet
                    ? "bg-emerald-500"
                    : isBehind
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
                style={{ width: progressWidth }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.goalProgress.toFixed(0)}% concluído</span>
              <span>
                {data.revenueGap > 0
                  ? `Faltam ${data.revenueGap.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}`
                  : "Meta atingida!"}
              </span>
            </div>

            {data.dailyGoalTarget > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <TrendingUp className="size-3.5" />
                Meta diária:{" "}
                {data.dailyGoalTarget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
