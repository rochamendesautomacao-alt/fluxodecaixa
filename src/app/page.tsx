import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Fluxo de Caixa
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Sistema de gestão financeira multiempresa
        </p>
        <Button>Começar</Button>
      </div>
    </div>
  );
}
