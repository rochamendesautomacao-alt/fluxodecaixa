"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CashTransaction } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface TransactionRowProps {
  transaction: CashTransaction;
  onDeleted: () => void;
}

export function TransactionRow({
  transaction,
  onDeleted,
}: TransactionRowProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const { error } = await supabase
      .from("cash_transactions")
      .delete()
      .eq("id", transaction.id);

    setIsDeleting(false);

    if (error) {
      toast.error("Erro ao excluir");
      return;
    }

    toast.success("Lançamento excluído");
    setDeleteOpen(false);
    onDeleted();
  }

  return (
    <TableRow>
      <TableCell className="py-3 pr-1 text-xs tabular-nums text-muted-foreground sm:py-2.5">
        {new Date(transaction.date).toLocaleDateString("pt-BR")}
      </TableCell>
      <TableCell className="py-3 font-medium sm:py-2.5">
        {transaction.description}
      </TableCell>
      <TableCell className="hidden py-3 text-sm text-muted-foreground sm:table-cell sm:py-2.5">
        —
      </TableCell>
      <TableCell
        className={cn(
          "py-3 text-right tabular-nums sm:py-2.5",
          transaction.type === "income"
            ? "text-emerald-600"
            : "text-red-600",
        )}
      >
        <span className="inline-flex items-center gap-0.5 sm:gap-1">
          {transaction.type === "income" ? (
            <ArrowUpFromLine className="size-3.5 sm:size-3" />
          ) : (
            <ArrowDownFromLine className="size-3.5 sm:size-3" />
          )}
          {transaction.amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </TableCell>
      <TableCell className="py-3 sm:py-2.5">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar lançamento"
            onClick={() =>
              router.push(
                `/transactions/${transaction.id}/edit`,
              )
            }
          >
            <Pencil className="size-4" />
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              aria-label="Excluir lançamento"
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <Trash2 className="size-4 text-destructive" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir lançamento</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir &ldquo;
                  {transaction.description}&rdquo;?
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
