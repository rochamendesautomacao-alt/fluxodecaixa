"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/hooks";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { upsertFinancialGoalSchema } from "@/lib/schemas/financial";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { FinancialGoal } from "@/types/database";

export function GoalsSettings() {
  const router = useRouter();
  const { currentStore } = useCompanyStore();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState<FinancialGoal | null>(null);

  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState("");
  const [profitMarginPercentage, setProfitMarginPercentage] = useState("30");
  const [operatingDaysPerMonth, setOperatingDaysPerMonth] = useState("22");
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState("");

  useEffect(() => {
    if (!currentStore) return;

    supabase
      .from("financial_goals")
      .select("*")
      .eq("store_id", currentStore.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const g = data as FinancialGoal;
          setGoal(g);
          setMonthlyRevenueGoal(String(g.monthly_revenue_goal));
          setProfitMarginPercentage(String(g.profit_margin_percentage));
          setOperatingDaysPerMonth(String(g.operating_days_per_month));
          setMonthlyFixedCosts(String(g.monthly_fixed_costs));
        }
        setLoading(false);
      });
  }, [currentStore, supabase]);

  async function handleSave() {
    if (!currentStore) return;

    try {
      const payload = upsertFinancialGoalSchema.parse({
        store_id: currentStore.id,
        monthly_revenue_goal: Number(monthlyRevenueGoal),
        profit_margin_percentage: Number(profitMarginPercentage),
        operating_days_per_month: Number(operatingDaysPerMonth),
        monthly_fixed_costs: Number(monthlyFixedCosts),
      });

      setSaving(true);
      const { error } = await supabase
        .from("financial_goals")
        .upsert(payload, { onConflict: "store_id" })
        .select()
        .single();

      setSaving(false);

      if (error) {
        toast.error("Erro ao salvar metas");
        return;
      }

      toast.success("Metas salvas");
      router.refresh();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message ?? "Dados inválidos");
      }
    }
  }

  if (!currentStore) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-muted-foreground">
          Selecione uma loja primeiro
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="size-4" />
          Metas financeiras
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="monthlyRevenueGoal">
                  Meta de faturamento mensal (R$)
                </Label>
                <Input
                  id="monthlyRevenueGoal"
                  type="number"
                  placeholder="50000"
                  value={monthlyRevenueGoal}
                  onChange={(e) =>
                    setMonthlyRevenueGoal(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="profitMarginPercentage">
                  Margem de contribuição (%)
                </Label>
                <Input
                  id="profitMarginPercentage"
                  type="number"
                  placeholder="30"
                  min="0"
                  max="100"
                  value={profitMarginPercentage}
                  onChange={(e) =>
                    setProfitMarginPercentage(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="operatingDaysPerMonth">
                  Dias úteis por mês
                </Label>
                <Input
                  id="operatingDaysPerMonth"
                  type="number"
                  placeholder="22"
                  min="1"
                  max="31"
                  value={operatingDaysPerMonth}
                  onChange={(e) =>
                    setOperatingDaysPerMonth(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="monthlyFixedCosts">
                  Custos fixos mensais (R$)
                </Label>
                <Input
                  id="monthlyFixedCosts"
                  type="number"
                  placeholder="15000"
                  value={monthlyFixedCosts}
                  onChange={(e) =>
                    setMonthlyFixedCosts(e.target.value)
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="self-start"
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar metas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
