import { TransactionForm } from "@/components/transactions/transaction-form";

export default function NewTransactionPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Novo lançamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Registre uma entrada ou saída no fluxo de caixa
        </p>
      </div>
      <TransactionForm mode="create" />
    </div>
  );
}
