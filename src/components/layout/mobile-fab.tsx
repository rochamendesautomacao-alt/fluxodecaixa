"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function MobileFab() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/transactions/new")}
      className="fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      aria-label="Nova movimentação"
    >
      <Plus className="size-6" />
    </button>
  );
}
