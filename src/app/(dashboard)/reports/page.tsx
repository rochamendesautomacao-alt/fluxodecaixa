"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchIndicators } from "@/lib/services/indicators-service";
import { BarChart3, ArrowRight, Loader2, TrendingUp, DollarSign, Target, PiggyBank } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const { currentStore } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<any>(null);

  useEffect(() => {
    if (!currentStore) return;
    fetchIndicators(currentStore.id).then((data) => {
      setIndicators(data);
      setLoading(false);
    });
  }, [currentStore]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Relatórios
        </h1>
        <p className="text-sm text-muted-foreground">
          Indicadores de desempenho da loja
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !indicators || !indicators.monthlyGoal ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Configure as metas financeiras para ver relatórios
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/goals")}
            >
              Configurar metas
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <DollarSign className="size-3.5" />
                  Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  R$ {indicators.actualRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <PiggyBank className="size-3.5" />
                  Custos fixos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  R$ {indicators.fixedCosts.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="size-3.5" />
                  Meta mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  R$ {indicators.monthlyGoal.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  {indicators.goalProgress.toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Detalhamento mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="text-muted-foreground">Receita real</span>
                <span className="font-medium text-emerald-600">
                  R$ {indicators.actualRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="text-muted-foreground">Despesas realizadas</span>
                <span className="font-medium text-rose-600">
                  - R$ {(indicators.actualRevenue - indicators.estimatedProfit).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="text-muted-foreground">Custos fixos</span>
                <span className="font-medium text-rose-600">
                  - R$ {indicators.fixedCosts.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Lucro estimado</span>
                <span className={indicators.estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  R$ {indicators.estimatedProfit.toFixed(2)}
                </span>
              </div>

              <div className="mt-2 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Faturamento mínimo necessário
                </p>
                <p className="text-lg font-bold">
                  R$ {indicators.minimumRequiredRevenue.toFixed(2)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  para cobrir custos e atingir margem de {indicators.contributionMargin}%
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
