"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCompanyStore } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Plus, Loader2, ArrowRight, Check } from "lucide-react";
import type { Store as StoreType } from "@/types/database";

export default function StoresPage() {
  const router = useRouter();
  const { currentCompany, currentStore, setCurrentStore } = useCompanyStore();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .rpc("get_company_stores", { p_company_id: currentCompany.id })
      .then(({ data }) => {
        setStores((data ?? []) as StoreType[]);
        setLoading(false);
      });
  }, [currentCompany]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Lojas
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentCompany?.name}
          </p>
        </div>
        <Button onClick={() => router.push("/create-store")}>
          <Plus className="mr-2 size-4" />
          Nova loja
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Lojas da empresa
          </CardTitle>
          <CardDescription>
            Selecione a loja para gerenciar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Store className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhuma loja cadastrada
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/create-store")}
              >
                <Plus className="mr-2 size-4" />
                Criar loja
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stores.map((store) => {
                const isActive = store.id === currentStore?.id;
                return (
                  <div
                    key={store.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isActive ? "border-primary/30 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full ${
                          isActive ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Store className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{store.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {store.slug}
                        </p>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Check className="size-3.5" />
                        Ativa
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStore(store)}
                      >
                        Acessar
                        <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
