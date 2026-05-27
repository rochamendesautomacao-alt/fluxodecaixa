"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Trash2, Loader2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string | null;
  is_active: boolean;
}

export default function FuncionariosPage() {
  const { currentStore } = useCompanyStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function load() {
    if (!currentStore) return;
    setLoading(true);
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("store_id", currentStore.id)
      .eq("is_active", true)
      .order("name");
    setEmployees((data ?? []) as Employee[]);
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
    const { error } = await supabase.from("employees").insert({
      store_id: currentStore.id,
      name: newName.trim(),
      role: newRole.trim() || null,
    });
    if (error) {
      setError(error.message);
    } else {
      setNewName("");
      setNewRole("");
      await load();
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    await supabase.from("employees").update({ is_active: false }).eq("id", id);
    await load();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Funcionários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os funcionários vinculados às transações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" />
            Adicionar funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1.5 sm:w-44">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                placeholder="Ex: Vendedor"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
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
            Funcionários ({loading ? "..." : employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
          ) : employees.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum funcionário cadastrado
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{emp.name}</span>
                    {emp.role && (
                      <span className="text-xs text-muted-foreground">{emp.role}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(emp.id)}>
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
