"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Plus, Loader2 } from "lucide-react";

export default function SelectCompanyPage() {
  const router = useRouter();
  const { companies, setCurrentCompany, isLoading } =
    useCompanyStore();

  useEffect(() => {
    if (!isLoading && companies.length === 0) {
      router.push("/create-company");
    }
  }, [isLoading, companies, router]);

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
                    {company.slug && (
                      <CardDescription>
                        {company.slug}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/create-company")}
        >
          <Plus className="mr-2 size-4" />
          Nova empresa
        </Button>
      </div>
    </div>
  );
}
