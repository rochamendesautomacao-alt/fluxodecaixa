"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Building2,
  Store as StoreIcon,
  LogOut,
  Menu,
  X,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCompanyStore, useAuth } from "@/hooks";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Lançamentos", icon: ArrowLeftRight },
  { href: "/goals", label: "Metas", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentCompany, currentStore } = useCompanyStore();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close],
  );

  const handleSignOut = useCallback(() => {
    signOut();
    router.push("/login");
  }, [signOut, router]);

  const linkList = (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      {links.map(({ href, label, icon: Icon }) => (
        <button
          key={href}
          onClick={() => navigate(href)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
            "hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname.startsWith(href)
              ? "bg-muted text-foreground"
              : "text-muted-foreground",
          )}
          aria-current={pathname.startsWith(href) ? "page" : undefined}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3.5 left-3 z-40 flex size-8 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={close}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-popover shadow-lg animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={close}
                className="flex size-7 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Fechar menu"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">{linkList}</div>

            <div className="border-t p-3">
              {currentCompany && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  <span className="truncate">{currentCompany.name}</span>
                  {currentStore && (
                    <>
                      <span>/</span>
                      <StoreIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{currentStore.name}</span>
                    </>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 size-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold">Fluxo de Caixa</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">{linkList}</div>

        <div className="border-t p-3">
          {currentCompany && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{currentCompany.name}</span>
              {currentStore && (
                <>
                  <span>/</span>
                  <StoreIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{currentStore.name}</span>
                </>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
