"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tags, Plus, Loader2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
}

export default function CategoriesPage() {
  const { currentStore } = useCompanyStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("income");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!currentStore) return;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("store_id", currentStore.id)
      .eq("is_active", true)
      .order("type")
      .order("sort_order");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [currentStore]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStore || !newName.trim()) return;
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("categories").insert({
      store_id: currentStore.id,
      name: newName.trim(),
      type: newType,
      sort_order: categories.length + 1,
    });
    if (error) {
      setError(error.message);
    } else {
      setNewName("");
      await load();
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("categories").update({ is_active: false }).eq("id", id);
    await load();
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Categorias
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as categorias de entrada e saída
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Tags className="size-4" />
            Nova categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="catName">Nome</Label>
              <Input
                id="catName"
                placeholder="Ex: Vendas Online"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:w-36">
              <Label htmlFor="catType">Tipo</Label>
              <div className="flex rounded-lg border p-0.5" role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  aria-checked={newType === "income"}
                  onClick={() => setNewType("income")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    newType === "income"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={newType === "expense"}
                  onClick={() => setNewType("expense")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    newType === "expense"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Saída
                </button>
              </div>
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

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500" />
              Entradas ({income.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
            ) : income.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">Nenhuma</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {income.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{cat.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(cat.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-rose-600">
              <span className="size-2 rounded-full bg-rose-500" />
              Saídas ({expense.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
            ) : expense.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">Nenhuma</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {expense.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{cat.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(cat.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
