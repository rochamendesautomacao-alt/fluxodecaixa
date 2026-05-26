"use client";

import { useCompanyStore, useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Building2,
  Store as StoreIcon,
  LogOut,
} from "lucide-react";

export function ContextHeader() {
  const { currentCompany, currentStore, companies } =
    useCompanyStore();
  const { signOut } = useAuth();
  const router = useRouter();

  const switchCompany = () => router.push("/select-company");
  const switchStore = () => router.push("/select-store");

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        {currentCompany && (
          <button
            onClick={switchCompany}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            <Building2 className="size-4" />
            <span>{currentCompany.name}</span>
          </button>
        )}

        {currentCompany && currentStore && (
          <>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={switchStore}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <StoreIcon className="size-4" />
              <span>{currentStore.name}</span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {currentCompany && (
          <Button
            variant="ghost"
            size="sm"
            onClick={switchCompany}
          >
            <Building2 className="mr-2 size-4" />
            {companies.length > 1
              ? "Trocar empresa"
              : "Empresa"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            signOut();
            router.push("/login");
          }}
        >
          <LogOut className="mr-2 size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
