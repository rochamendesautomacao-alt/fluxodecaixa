"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, PiggyBank, Trash2, Loader2 } from "lucide-react";

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  is_active: boolean;
}

export default function FixedExpensesPage() {
  const { currentStore } = useCompanyStore();
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!currentStore) return;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("fixed_expenses")
      .select("*")
      .eq("store_id", currentStore.id)
      .eq("is_active", true)
      .order("name");
    setExpenses((data ?? []) as FixedExpense[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [currentStore]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStore || !newName.trim() || !newAmount) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("fixed_expenses").insert({
      store_id: currentStore.id,
      name: newName.trim(),
      amount: parseFloat(newAmount),
      frequency: "monthly",
    });
    if (!error) {
      setNewName("");
      setNewAmount("");
      await load();
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("fixed_expenses")
      .update({ is_active: false })
      .eq("id", id);
    await load();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Despesas Fixas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as despesas fixas da loja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <PiggyBank className="size-4" />
            Adicionar despesa fixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Aluguel"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:w-36">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving} className="shrink-0">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span>
              Despesas cadastradas ({expenses.length})
            </span>
            <span className="text-muted-foreground">
              Total: R$ {total.toFixed(2)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma despesa fixa cadastrada
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">
                      R$ {expense.amount.toFixed(2)} / {expense.frequency === "monthly" ? "mês" : expense.frequency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(expense.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
