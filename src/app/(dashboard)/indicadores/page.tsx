"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Target, DollarSign, CalendarDays } from "lucide-react";

interface FinancialGoal {
  monthly_revenue_goal: number;
  profit_margin_percentage: number;
  operating_days_per_month: number;
  monthly_fixed_costs: number;
}

export default function IndicadoresPage() {
  const { currentStore } = useCompanyStore();
  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const storeId = currentStore?.id;
    if (!storeId) return;

    async function load() {
      setLoading(true);
      const [goalRes, revenueRes] = await Promise.all([
        supabase
          .from("financial_goals")
          .select("*")
          .eq("store_id", storeId)
          .single(),
        supabase
          .from("cash_transactions")
          .select("amount, type")
          .eq("store_id", storeId)
          .gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      if (goalRes.data) setGoal(goalRes.data as FinancialGoal);
      if (revenueRes.data) {
        const income = revenueRes.data
          .filter((t: { type: string; amount: number }) => t.type === "income")
          .reduce((s: number, t: { type: string; amount: number }) => s + (t.amount ?? 0), 0);
        const expense = revenueRes.data
          .filter((t: { type: string; amount: number }) => t.type === "expense")
          .reduce((s: number, t: { type: string; amount: number }) => s + (t.amount ?? 0), 0);
        setMonthRevenue(income - expense);
      }
      setLoading(false);
    }

    load();
  }, [currentStore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const dailyGoal = goal ? goal.monthly_revenue_goal / goal.operating_days_per_month : 0;
  const progress = goal ? Math.min((monthRevenue / goal.monthly_revenue_goal) * 100, 100) : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = Math.min(new Date().getDate(), daysInMonth);
  const expectedRevenue = goal ? (goal.monthly_revenue_goal / daysInMonth) * currentDay : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Indicadores</h1>
        <p className="text-sm text-muted-foreground">Acompanhe o desempenho da loja</p>
      </div>

      {!goal ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8">
            <Target className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma meta financeira definida. Complete o onboarding primeiro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <DollarSign className="size-3.5" />
                  Meta mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  R$ {goal.monthly_revenue_goal.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Meta diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  R$ {dailyGoal.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Margem de lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{goal.profit_margin_percentage}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Progresso mensal — R$ {monthRevenue.toFixed(2)} de R$ {goal.monthly_revenue_goal.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.toFixed(1)}% concluído</span>
                <span>
                  {monthRevenue >= expectedRevenue ? "✅" : "⚠️"} Esperado: R$ {expectedRevenue.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
