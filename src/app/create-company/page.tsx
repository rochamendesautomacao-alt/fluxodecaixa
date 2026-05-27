"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, ArrowRight, Loader2, Check } from "lucide-react";
import { createCompany } from "@/lib/services/onboarding-service";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    if (!user) return;
    setError(null);
    setIsPending(true);

    try {
      await createCompany(name, slug || name.toLowerCase().replace(/\s+/g, "-"));
      router.push("/select-company");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar empresa");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sua empresa
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vamos criar sua primeira empresa no Fluxo de Caixa
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
            <CardDescription>
              Informe o nome da sua empresa para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome da empresa</Label>
                <Input
                  id="name"
                  placeholder="Ex: Minha Loja"
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
                  placeholder="minha-loja"
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
                    Criar empresa
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Check className="size-3" />
          Primeiro passo — criar empresa
        </div>
      </div>
    </div>
  );
}
