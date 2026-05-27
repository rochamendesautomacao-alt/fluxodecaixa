"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore, useAuth } from "@/hooks";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { fetchIndicators } from "@/lib/services/indicators-service";
import { hasOnboarding } from "@/lib/services/onboarding-service";
import { Card, CardContent } from "@/components/ui/card";
import type { CashTransaction } from "@/types/database";
import type { IndicatorsResult } from "@/types/indicators";
import { Loader2, Target, TrendingUp, DollarSign, Plus, ArrowDown, ArrowUp } from "lucide-react";

interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: CashTransaction[];
  indicators: IndicatorsResult | null;
}

export default function DashboardPage() {
  const { currentCompany, currentStore, isLoading: contextLoading } =
    useCompanyStore();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (authLoading || contextLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }
    if (!currentCompany) {
      router.push("/select-company");
      return;
    }
    if (!currentStore) {
      router.push("/select-store");
      return;
    }
  }, [user, currentCompany, currentStore, authLoading, contextLoading, router]);

  useEffect(() => {
    const store = currentStore;
    if (!store) return;

    const sid: string = store.id;

    async function checkOnboarding() {
      const done = await hasOnboarding(sid);
      if (!done) {
        router.push(`/onboarding?store_id=${sid}`);
        return;
      }
      setOnboardingChecked(true);
    }

    checkOnboarding();
  }, [currentStore, router]);

  useEffect(() => {
    const store = currentStore;
    if (!store || !onboardingChecked) return;

    const supabase = createSupabaseBrowserClient();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const storeId = store!.id;
    async function fetchData() {
      setDataLoading(true);

      const [allTxResult, indicatorsResult] = await Promise.all([
        supabase
          .from("cash_transactions")
          .select("*")
          .eq("store_id", storeId)
          .order("date", { ascending: false }),
        fetchIndicators(storeId),
      ]);

      const txList = (allTxResult.data ?? []) as CashTransaction[];

      const balance = txList.reduce((acc, t) => {
        return t.type === "income" ? acc + t.amount : acc - t.amount;
      }, 0);

      const monthTx = txList.filter(
        (t) => t.date >= firstDay && t.date <= lastDay,
      );

      const monthlyIncome = monthTx
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

      const monthlyExpense = monthTx
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);

      setData({
        balance,
        monthlyIncome,
        monthlyExpense,
        recentTransactions: txList.slice(0, 10),
        indicators: indicatorsResult,
      });
      setDataLoading(false);
    }

    fetchData();
  }, [currentStore, onboardingChecked]);

  if (authLoading || contextLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const indicators = data?.indicators;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="px-4 pt-5 pb-1 sm:px-6 sm:pb-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {currentCompany?.name} &rsaquo; {currentStore?.name}
        </p>
      </div>

      <div className="mx-4 grid grid-cols-3 gap-2 sm:mx-6 sm:gap-3">
        <button
          onClick={() => router.push("/transactions/new?type=income")}
          className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 active:bg-emerald-100 dark:hover:bg-emerald-950/20"
        >
          <ArrowUp className="size-5" />
          <span className="text-xs sm:text-sm">Entrada</span>
        </button>
        <button
          onClick={() => router.push("/transactions/new?type=expense")}
          className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 active:bg-rose-100 dark:hover:bg-rose-950/20"
        >
          <ArrowDown className="size-5" />
          <span className="text-xs sm:text-sm">Saída</span>
        </button>
        <button
          onClick={() => router.push("/transactions/new")}
          className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
        >
          <Plus className="size-5" />
          <span className="text-xs sm:text-sm">Movimento</span>
        </button>
      </div>

      {indicators && indicators.monthlyGoal > 0 && (
        <div className="mx-4 sm:mx-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Target className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meta diária</p>
                  <p className="text-xl font-bold text-primary">
                    R$ {indicators.dailyGoalTarget.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento necessário</p>
                  <p className="text-xl font-bold">
                    R$ {indicators.minimumRequiredRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progresso da meta</p>
                  <p className="text-xl font-bold">
                    {indicators.goalProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DashboardGrid
        balance={data?.balance ?? 0}
        monthlyIncome={data?.monthlyIncome ?? 0}
        monthlyExpense={data?.monthlyExpense ?? 0}
        monthlyResult={
          (data?.monthlyIncome ?? 0) - (data?.monthlyExpense ?? 0)
        }
        recentTransactions={data?.recentTransactions ?? []}
        indicators={indicators ?? null}
        isLoading={dataLoading}
      />
    </div>
  );
}
