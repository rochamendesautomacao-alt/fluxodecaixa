"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, ArrowRight, Loader2, Check } from "lucide-react";
import { createStore } from "@/lib/services/onboarding-service";

export default function CreateStorePage() {
  const router = useRouter();
  const { currentCompany } = useCompanyStore();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCompany) return;
    setError(null);
    setIsPending(true);

    try {
      const storeId = await createStore(
        currentCompany.id,
        name,
        slug || name.toLowerCase().replace(/\s+/g, "-"),
      );
      router.push(`/onboarding?store_id=${storeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar loja");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sua loja
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentCompany?.name} &rsaquo; criar loja
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da loja</CardTitle>
            <CardDescription>
              Crie sua primeira loja para começar a operar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome da loja</Label>
                <Input
                  id="name"
                  placeholder="Ex: Loja Centro"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">URL amigável</Label>
                <Input
                  id="slug"
                  placeholder="loja-centro"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar loja
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Check className="size-3" />
          Segundo passo — criar loja
        </div>
      </div>
    </div>
  );
}
