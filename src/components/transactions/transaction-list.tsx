"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "./transaction-row";
import type { CashTransaction } from "@/types/database";
import { Plus, Loader2 } from "lucide-react";

export function TransactionList({
  defaultTypeFilter,
}: {
  defaultTypeFilter?: string;
}) {
  const { currentStore } = useCompanyStore();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [transactions, setTransactions] = useState<
    CashTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!currentStore) return;
    setIsLoading(true);

    let query = supabase
      .from("cash_transactions")
      .select("*")
      .eq("store_id", currentStore.id)
      .order("date", { ascending: false })
      .limit(50);

    if (defaultTypeFilter && defaultTypeFilter !== "all") {
      query = query.eq("type", defaultTypeFilter);
    }

    const { data } = await query;
    setTransactions((data ?? []) as CashTransaction[]);
    setIsLoading(false);
  }, [currentStore, defaultTypeFilter, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            Nenhum lançamento encontrado
          </p>
        </div>
      ) : (
        <>
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onDeleted={fetchTransactions}
            />
          ))}
        </>
      )}
    </div>
  );
}
