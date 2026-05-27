"use client";

import { useEffect } from "react";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Store as StoreIcon,
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SelectStorePage() {
  const { currentCompany, stores, setCurrentStore, isLoading } =
    useCompanyStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && stores.length === 0) {
      router.push("/create-store");
    }
  }, [isLoading, stores, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Selecionar loja
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentCompany?.name} — escolha a loja
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setCurrentStore(store)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <StoreIcon className="size-5 shrink-0" />
                  <div>
                    <CardTitle className="text-base">
                      {store.name}
                    </CardTitle>
                    {store.document && (
                      <CardDescription>
                        {store.document}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/select-company")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Trocar empresa
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/create-store")}
          >
            <Plus className="mr-2 size-4" />
            Nova loja
          </Button>
        </div>
      </div>
    </div>
  );
}
