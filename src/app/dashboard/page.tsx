"use client";

import { useCompanyStore, useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { currentCompany, currentStore, isLoading } =
    useCompanyStore();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!currentCompany) {
      router.push("/select-company");
      return;
    }

    if (!currentStore) {
      router.push("/select-store");
      return;
    }
  }, [
    user,
    currentCompany,
    currentStore,
    authLoading,
    isLoading,
    router,
  ]);

  if (authLoading || isLoading || !currentStore) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="text-muted-foreground">
        {currentCompany?.name} &rsaquo; {currentStore?.name}
      </p>
    </div>
  );
}
