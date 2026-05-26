"use client";

import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";

export default function SelectCompanyPage() {
  const { companies, setCurrentCompany, isLoading } =
    useCompanyStore();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Selecionar empresa
          </h1>
          <p className="text-muted-foreground text-sm">
            Escolha qual empresa deseja acessar
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setCurrentCompany(company)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="size-5 shrink-0" />
                  <div>
                    <CardTitle className="text-base">
                      {company.name}
                    </CardTitle>
                    {company.document && (
                      <CardDescription>
                        {company.document}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full" disabled>
          <Plus className="mr-2 size-4" />
          Nova empresa (em breve)
        </Button>
      </div>
    </div>
  );
}
