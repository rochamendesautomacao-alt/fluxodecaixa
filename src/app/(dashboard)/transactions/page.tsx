import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Lançamentos
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie entradas e saídas do fluxo de caixa
        </p>
      </div>
      <TransactionList />
    </div>
  );
}
