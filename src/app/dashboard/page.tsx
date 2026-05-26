"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore, useAuth } from "@/hooks";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import type { CashTransaction } from "@/types/database";

interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: CashTransaction[];
}

export default function DashboardPage() {
  const { currentCompany, currentStore, isLoading: contextLoading } =
    useCompanyStore();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

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

      const { data: allTx } = await supabase
        .from("cash_transactions")
        .select("*")
        .eq("store_id", storeId)
        .order("date", { ascending: false });

      const txList = (allTx ?? []) as CashTransaction[];

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
      });
      setDataLoading(false);
    }

    fetchData();
  }, [currentStore]);

  if (authLoading || contextLoading) {
    return <DashboardGrid isLoading balance={0} monthlyIncome={0} monthlyExpense={0} monthlyResult={0} recentTransactions={[]} />;
  }

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
      <DashboardGrid
        balance={data?.balance ?? 0}
        monthlyIncome={data?.monthlyIncome ?? 0}
        monthlyExpense={data?.monthlyExpense ?? 0}
        monthlyResult={
          (data?.monthlyIncome ?? 0) - (data?.monthlyExpense ?? 0)
        }
        recentTransactions={data?.recentTransactions ?? []}
        isLoading={dataLoading}
      />
    </div>
  );
}
