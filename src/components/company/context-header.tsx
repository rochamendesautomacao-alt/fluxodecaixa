"use client";

import { useCompanyStore } from "@/hooks";
import { Building2, Store as StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContextHeader() {
  const { currentCompany, currentStore } = useCompanyStore();
  const router = useRouter();

  return (
    <header className="flex h-14 items-center border-b pl-12 pr-4 lg:pl-4">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {currentCompany && (
          <button
            onClick={() => router.push("/select-company")}
            className="flex shrink-0 items-center gap-1.5 font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Trocar empresa"
          >
            <Building2 className="size-4" />
            <span className="truncate max-sm:hidden">
              {currentCompany.name}
            </span>
          </button>
        )}

        {currentCompany && currentStore && (
          <>
            <span className="text-muted-foreground max-sm:hidden">/</span>
            <button
              onClick={() => router.push("/select-store")}
              className="flex shrink-0 items-center gap-1.5 text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Trocar loja"
            >
              <StoreIcon className="size-4 max-sm:hidden" />
              <span className="truncate max-xs:hidden">
                {currentStore.name}
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
