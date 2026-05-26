import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
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
