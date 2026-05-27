"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Building2, Store, ArrowRight, LogOut } from "lucide-react";
import { useCompanyStore, useAuth } from "@/hooks";

export default function SettingsPage() {
  const router = useRouter();
  const { currentCompany, currentStore } = useCompanyStore();
  const { signOut } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta e empresas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Empresa</CardTitle>
          <CardDescription>
            {currentCompany?.name ?? "Nenhuma empresa selecionada"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push("/select-company")}
          >
            <Building2 className="mr-2 size-4" />
            Trocar empresa
            <ArrowRight className="ml-auto size-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push("/create-company")}
          >
            <Building2 className="mr-2 size-4" />
            Nova empresa
            <ArrowRight className="ml-auto size-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Loja</CardTitle>
          <CardDescription>
            {currentStore?.name ?? "Nenhuma loja selecionada"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push("/select-store")}
          >
            <Store className="mr-2 size-4" />
            Trocar loja
            <ArrowRight className="ml-auto size-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push("/create-store")}
          >
            <Store className="mr-2 size-4" />
            Nova loja
            <ArrowRight className="ml-auto size-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sessão</CardTitle>
          <CardDescription>Gerencie seu acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive"
            onClick={() => {
              signOut();
              router.push("/login");
            }}
          >
            <LogOut className="mr-2 size-4" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
