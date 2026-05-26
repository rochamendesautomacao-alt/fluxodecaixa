"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { CashTransaction } from "@/types/database";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

interface EditTransactionFormProps {
  transactionId: string;
}

export function EditTransactionForm({
  transactionId,
}: EditTransactionFormProps) {
  const supabase = createSupabaseBrowserClient();
  const [tx, setTx] = useState<CashTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("cash_transactions")
      .select("*")
      .eq("id", transactionId)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) {
          notFound();
          return;
        }
        setTx(data as CashTransaction);
      });
  }, [transactionId, supabase]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tx) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar lançamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Atualize as informações do lançamento
        </p>
      </div>
      <TransactionForm
        mode="edit"
        transactionId={transactionId}
        defaultValues={{
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          date: tx.date,
          category_id: tx.category_id,
          due_date: tx.due_date,
          notes: tx.notes,
        }}
      />
    </div>
  );
}
