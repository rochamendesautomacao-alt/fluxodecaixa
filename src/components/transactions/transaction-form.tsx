"use client";

import { useEffect, useState } from "react";
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
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/database";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TransactionFormProps {
  defaultValues?: Partial<CreateTransactionInput>;
  transactionId?: string;
  mode: "create" | "edit";
}

export function TransactionForm({
  defaultValues,
  transactionId,
  mode,
}: TransactionFormProps) {
  const router = useRouter();
  const { currentStore } = useCompanyStore();
  const supabase = createSupabaseBrowserClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "income" | "expense" | ""
  >(defaultValues?.type ?? "");

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
      due_date: null,
      notes: null,
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

  async function onSubmit(data: CreateTransactionInput) {
    if (!currentStore) return;
    setIsSubmitting(true);

    const payload = {
      ...data,
      store_id: currentStore.id,
      category_id: data.category_id || null,
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
      router.push("/transactions");
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
      router.push("/transactions");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={watchType || selectedType || undefined}
            onValueChange={(v) => {
              if (!v) return;
              setValue("type", v as "income" | "expense");
              setSelectedType(v as "income" | "expense");
              setValue("category_id", null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Entrada</SelectItem>
              <SelectItem value="expense">Saída</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">
              {errors.type.message}
            </p>
          )}
        </div>

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

        <div className="flex flex-col gap-2">
          <Label htmlFor="category_id">Categoria</Label>
          <Select
            value={watch("category_id") ?? undefined}
            onValueChange={(v) => setValue("category_id", v)} // v pode ser null (limpa selecao)
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="_none" disabled>
                  Nenhuma categoria
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="due_date">Vencimento</Label>
          <Input
            id="due_date"
            type="date"
            {...register("due_date")}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="notes">Observação</Label>
          <Input
            id="notes"
            placeholder="Opicional"
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          {mode === "create" ? "Criar lançamento" : "Salvar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
