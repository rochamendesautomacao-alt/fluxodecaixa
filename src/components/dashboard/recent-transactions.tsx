import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpFromLine, ArrowDownFromLine } from "lucide-react";
import type { CashTransaction } from "@/types/database";

interface RecentTransactionsProps {
  transactions: CashTransaction[];
  isLoading: boolean;
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum lançamento encontrado
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="hidden sm:table-cell">
            Categoria
          </TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="text-xs tabular-nums text-muted-foreground">
              {new Date(t.date).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="font-medium">
              {t.description}
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
              {t.category_id ? "—" : "—"}
            </TableCell>
            <TableCell
              className={cn(
                "text-right tabular-nums",
                t.type === "income"
                  ? "text-emerald-600"
                  : "text-red-600",
              )}
            >
              <span className="inline-flex items-center gap-1">
                {t.type === "income" ? (
                  <ArrowUpFromLine className="size-3" />
                ) : (
                  <ArrowDownFromLine className="size-3" />
                )}
                {t.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
