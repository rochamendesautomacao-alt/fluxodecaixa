"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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
import { Trash2, Loader2 } from "lucide-react";
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
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString("pt-BR")}
          </span>
          <span className="truncate text-sm font-medium">
            {transaction.description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            transaction.type === "income"
              ? "text-emerald-600"
              : "text-red-600",
          )}
        >
          —{transaction.amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            aria-label="Excluir lançamento"
            render={
              <Button variant="ghost" size="icon-sm" className="size-7">
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            }
          />
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
    </div>
  );
}
