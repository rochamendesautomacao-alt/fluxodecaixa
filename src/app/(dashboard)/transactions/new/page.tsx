import { TransactionForm } from "@/components/transactions/transaction-form";

export default function NewTransactionPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
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
