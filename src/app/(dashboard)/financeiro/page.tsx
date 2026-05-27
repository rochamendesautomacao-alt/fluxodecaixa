"use client";

import { useState } from "react";
import { TransactionList } from "@/components/transactions/transaction-list";
import { FixedExpensesSection } from "./fixed-expenses-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "all", label: "Todas" },
  { value: "income", label: "Entradas" },
  { value: "expense", label: "Saídas" },
  { value: "variable", label: "Variáveis" },
  { value: "fixed", label: "Fixas" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

export default function FinanceiroPage() {
  const [tab, setTab] = useState<TabValue>("all");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie entradas, saídas e despesas fixas
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList variant="line">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <TransactionList key="all" defaultTypeFilter="all" />
        </TabsContent>

        <TabsContent value="income">
          <TransactionList key="income" defaultTypeFilter="income" />
        </TabsContent>

        <TabsContent value="expense">
          <TransactionList key="expense" defaultTypeFilter="expense" />
        </TabsContent>

        <TabsContent value="variable">
          <TransactionList key="variable" defaultTypeFilter="expense" />
        </TabsContent>

        <TabsContent value="fixed">
          <FixedExpensesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
