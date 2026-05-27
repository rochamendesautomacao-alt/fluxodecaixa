"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/schemas/transaction";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Category } from "@/types/database";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TransactionFormProps {
  defaultValues?: Partial<CreateTransactionInput>;
  transactionId?: string;
  mode: "create" | "edit";
}

interface Employee {
  id: string;
  name: string;
}

export function TransactionForm({
  defaultValues,
  transactionId,
  mode,
}: TransactionFormProps) {
  const router = useRouter();
  const { currentStore } = useCompanyStore();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "income" | "expense" | ""
  >(defaultValues?.type ?? "");

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      store_id: currentStore?.id ?? "",
      description: "",
      amount: undefined,
      type: undefined,
      date: new Date().toISOString().split("T")[0],
      category_id: null,
      employee_id: null,
      due_date: null,
      notes: `Lançamento de ${today}`,
      ...defaultValues,
    },
  });

  const watchType = watch("type");

  useEffect(() => {
    if (!currentStore) return;
    const type = watchType || selectedType;
    if (!type) {
      setCategories([]);
      return;
    }
    supabase
      .from("categories")
      .select("*")
      .eq("store_id", currentStore.id)
      .eq("type", type)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, [currentStore, watchType, selectedType, supabase]);

  useEffect(() => {
    if (!currentStore) return;
    supabase
      .from("employees")
      .select("id, name")
      .eq("store_id", currentStore.id)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setEmployees((data ?? []) as Employee[]));
  }, [currentStore, supabase]);

  async function onSubmit(data: CreateTransactionInput) {
    if (!currentStore) return;
    setIsSubmitting(true);

    const payload = {
      ...data,
      store_id: currentStore.id,
      category_id: data.category_id || null,
      employee_id: data.employee_id || null,
      due_date: data.due_date || null,
      notes: data.notes || null,
    };

    if (mode === "create") {
      const { error } = await supabase
        .from("cash_transactions")
        .insert(payload);

      if (error) {
        toast.error("Erro ao criar lançamento");
        setIsSubmitting(false);
        return;
      }

      toast.success("Lançamento criado");
      router.push("/financeiro");
    } else if (transactionId) {
      const { error } = await supabase
        .from("cash_transactions")
        .update(payload)
        .eq("id", transactionId);

      if (error) {
        toast.error("Erro ao atualizar lançamento");
        setIsSubmitting(false);
        return;
      }

      toast.success("Lançamento atualizado");
      router.push("/financeiro");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      {/* Tipo — Entrada / Saída */}
      <div className="flex flex-col gap-2">
        <Label>Tipo</Label>
        <input type="hidden" {...register("type")} />
        <div className="flex rounded-lg border p-0.5" role="radiogroup">
          <button
            type="button"
            role="radio"
            aria-checked={watchType === "income"}
            onClick={() => {
              setValue("type", "income");
              setSelectedType("income");
              setValue("category_id", null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              watchType === "income"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={watchType === "expense"}
            onClick={() => {
              setValue("type", "expense");
              setSelectedType("expense");
              setValue("category_id", null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              watchType === "expense"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saída
          </button>
        </div>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Categoria */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="category_id">Categoria</Label>
          <Select
            value={watch("category_id") ?? undefined}
            onValueChange={(v) => setValue("category_id", v)}
          >
            <SelectTrigger>
              {categories.find((c) => c.id === watch("category_id"))?.name ?? "Selecione"}
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="_none" disabled>
                  {selectedType
                    ? "Nenhuma categoria"
                    : "Selecione o tipo primeiro"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Funcionário (opcional) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="employee_id">Funcionário</Label>
          <Select
            value={watch("employee_id") ?? undefined}
            onValueChange={(v) => setValue("employee_id", v)}
          >
            <SelectTrigger>
              {employees.find((e) => e.id === watch("employee_id"))?.name ?? "Opcional"}
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
              {employees.length === 0 && (
                <SelectItem value="_none" disabled>
                  Nenhum funcionário
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Descrição */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Ex: Venda do dia"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Valor */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Observação */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="notes">Observação</Label>
          <Input
            id="notes"
            placeholder="Opcional"
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Data: <span className="font-medium">{today}</span>
        </p>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {mode === "create" ? "Lançar" : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
