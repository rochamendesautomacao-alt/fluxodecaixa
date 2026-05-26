import { GoalsSettings } from "@/components/indicators/goals-settings";

export const dynamic = "force-dynamic";

export default function GoalsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Metas
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure as metas financeiras da loja
        </p>
      </div>
      <GoalsSettings />
    </div>
  );
}
