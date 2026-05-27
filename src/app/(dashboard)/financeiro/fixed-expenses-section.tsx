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

export function FixedExpensesSection() {
  const { currentStore } = useCompanyStore();
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function load() {
    if (!currentStore) return;
    setLoading(true);
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
    setError(null);
    const { error } = await supabase.from("fixed_expenses").insert({
      store_id: currentStore.id,
      name: newName.trim(),
      amount: parseFloat(newAmount),
      frequency: "monthly",
    });
    if (error) {
      setError(error.message);
    } else {
      setNewName("");
      setNewAmount("");
      await load();
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    await supabase
      .from("fixed_expenses")
      .update({ is_active: false })
      .eq("id", id);
    await load();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">
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
            <div className="flex w-full flex-col gap-1.5 sm:w-36">
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
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Despesas cadastradas
            {!loading && (
              <span className="ml-2 text-muted-foreground">
                (R$ {total.toFixed(2)}/mês)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
          ) : expenses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Nenhuma despesa fixa cadastrada
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{exp.name}</span>
                    <span className="text-xs text-muted-foreground">
                      R$ {exp.amount.toFixed(2)}/{exp.frequency === "monthly" ? "mês" : exp.frequency}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(exp.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
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
