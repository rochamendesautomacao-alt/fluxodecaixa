"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { completeOnboarding } from "@/lib/services/onboarding-service";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ArrowRight,
  Check,
  Loader2,
  PiggyBank,
  Target,
  Trash2,
  Plus,
  TrendingUp,
  CalendarDays,
  DollarSign,
} from "lucide-react";

interface FixedExpenseItem {
  id: string;
  name: string;
  amount: string;
}

const STEPS = [
  { id: "expenses", label: "Despesas fixas", icon: PiggyBank },
  { id: "goals", label: "Metas financeiras", icon: Target },
  { id: "summary", label: "Resumo", icon: TrendingUp },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isActive
                    ? "bg-primary/10 text-primary ring-1 ring-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden h-px w-8 sm:block ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store_id");
  const { currentStore, setCurrentStore, refreshStores } = useCompanyStore();

  const [step, setStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStoreId = storeId ?? currentStore?.id;

  const [expenses, setExpenses] = useState<FixedExpenseItem[]>([
    { id: crypto.randomUUID(), name: "", amount: "" },
  ]);

  const [goals, setGoals] = useState({
    monthlyRevenueGoal: "",
    profitMarginPercentage: "30",
    operatingDaysPerMonth: "22",
  });

  function addExpense() {
    setExpenses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", amount: "" },
    ]);
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function updateExpense(id: string, field: "name" | "amount", value: string) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }

  const totalFixedCosts = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0,
  );

  const revenueGoal = parseFloat(goals.monthlyRevenueGoal) || 0;
  const marginPct = parseFloat(goals.profitMarginPercentage) || 0;
  const opDays = parseInt(goals.operatingDaysPerMonth) || 22;

  const dailyGoalTarget = opDays > 0 ? revenueGoal / opDays : 0;

  function validateStep(current: number): boolean {
    if (current === 0) {
      const valid = expenses.every(
        (e) => e.name.trim().length > 0 && parseFloat(e.amount) > 0,
      );
      if (!valid) {
        setError("Preencha nome e valor de todas as despesas");
        return false;
      }
      return true;
    }
    if (current === 1) {
      if (!revenueGoal || revenueGoal <= 0) {
        setError("Informe a meta de faturamento mensal");
        return false;
      }
      if (marginPct < 0 || marginPct > 100) {
        setError("Margem deve estar entre 0% e 100%");
        return false;
      }
      if (opDays < 1 || opDays > 31) {
        setError("Dias operacionais devem estar entre 1 e 31");
        return false;
      }
      return true;
    }
    return true;
  }

  async function handleFinish() {
    if (!effectiveStoreId) return;
    setError(null);
    setIsPending(true);

    try {
      await completeOnboarding({
        storeId: effectiveStoreId,
        fixedExpenses: expenses.map((e) => ({
          name: e.name.trim(),
          amount: parseFloat(e.amount),
        })),
        monthlyRevenueGoal: revenueGoal,
        profitMarginPercentage: marginPct,
        operatingDaysPerMonth: opDays,
      });

      await refreshStores();

      const supabase = createSupabaseBrowserClient();
      const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("id", effectiveStoreId)
        .single();

      if (store) {
        setCurrentStore(store);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar configuração");
    } finally {
      setIsPending(false);
    }
  }

  if (!effectiveStoreId) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Nenhuma loja selecionada.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/select-store")}>
          Selecionar loja
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <StepIndicator current={step} />

        <div className="mt-8">
          {step === 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PiggyBank className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Despesas fixas</CardTitle>
                    <CardDescription>
                      Quais despesas fixas sua loja tem por mês?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-start gap-2">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:gap-2">
                      <Input
                        placeholder="Nome (ex: Aluguel)"
                        value={expense.name}
                        onChange={(e) =>
                          updateExpense(expense.id, "name", e.target.value)
                        }
                        className="sm:flex-[2]"
                      />
                      <div className="relative sm:flex-1">
                        <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Valor"
                          value={expense.amount}
                          onChange={(e) =>
                            updateExpense(expense.id, "amount", e.target.value)
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>
                    {expenses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-0 shrink-0"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpense}
                  className="mt-1"
                >
                  <Plus className="mr-1 size-4" />
                  Adicionar despesa
                </Button>

                {totalFixedCosts > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total:{" "}
                    <span className="font-medium text-foreground">
                      R$ {totalFixedCosts.toFixed(2)}
                    </span>{" "}
                    / mês
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Metas financeiras</CardTitle>
                    <CardDescription>
                      Defina seus objetivos mensais
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="revenue">Faturamento mensal desejado (R$)</Label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="revenue"
                      type="number"
                      step="100"
                      min="0"
                      placeholder="Ex: 50000"
                      value={goals.monthlyRevenueGoal}
                      onChange={(e) =>
                        setGoals((prev) => ({
                          ...prev,
                          monthlyRevenueGoal: e.target.value,
                        }))
                      }
                      className="pl-8"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="margin">Margem de lucro média (%)</Label>
                  <div className="relative">
                    <TrendingUp className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="margin"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="Ex: 30"
                      value={goals.profitMarginPercentage}
                      onChange={(e) =>
                        setGoals((prev) => ({
                          ...prev,
                          profitMarginPercentage: e.target.value,
                        }))
                      }
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="days">Dias operacionais por mês</Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="days"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Ex: 22"
                      value={goals.operatingDaysPerMonth}
                      onChange={(e) =>
                        setGoals((prev) => ({
                          ...prev,
                          operatingDaysPerMonth: e.target.value,
                        }))
                      }
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Tudo pronto!</CardTitle>
                    <CardDescription>
                      Aqui está um resumo da sua configuração
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Despesas fixas</p>
                      <p className="text-lg font-bold">
                        R$ {totalFixedCosts.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Meta mensal</p>
                      <p className="text-lg font-bold">
                        R$ {revenueGoal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margem de lucro</p>
                      <p className="text-lg font-bold">{marginPct}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dias operacionais</p>
                      <p className="text-lg font-bold">{opDays} dias</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Meta diária de faturamento
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {dailyGoalTarget.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fature isso por dia para atingir sua meta mensal de{" "}
                    R$ {revenueGoal.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>{expenses.length} despesa(s) fixa(s) cadastrada(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Meta de faturamento definida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Margem e dias operacionais configurados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}

        <div className="mt-6 flex justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null);
                setStep((prev) => prev - 1);
              }}
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                setError(null);
                if (validateStep(step)) {
                  setStep((prev) => prev + 1);
                }
              }}
            >
              {step === 0 ? "Definir metas" : "Continuar"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isPending}
              onClick={handleFinish}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
