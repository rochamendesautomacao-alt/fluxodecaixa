import { EditTransactionForm } from "./edit-form";

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  return <EditTransactionForm transactionId={id} />;
}
