"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionRow } from "./transaction-row";
import type { CashTransaction } from "@/types/database";
import { Plus, Search, Loader2 } from "lucide-react";

export function TransactionList() {
  const router = useRouter();
  const { currentStore } = useCompanyStore();
  const supabase = createSupabaseBrowserClient();

  const [transactions, setTransactions] = useState<
    CashTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!currentStore) return;
    setIsLoading(true);

    let query = supabase
      .from("cash_transactions")
      .select("*")
      .eq("store_id", currentStore.id)
      .order("date", { ascending: false })
      .limit(50);

    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    if (searchText) {
      query = query.ilike("description", `%${searchText}%`);
    }

    const { data } = await query;
    setTransactions((data ?? []) as CashTransaction[]);
    setIsLoading(false);
  }, [currentStore, typeFilter, searchText, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => router.push("/transactions/new")}
        >
          <Plus className="mr-2 size-4" />
          Novo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            Nenhum lançamento encontrado
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/transactions/new")}
          >
            <Plus className="mr-2 size-4" />
            Criar primeiro lançamento
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="hidden sm:table-cell">
                Categoria
              </TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDeleted={fetchTransactions}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
