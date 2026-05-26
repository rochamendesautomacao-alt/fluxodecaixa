"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) setShow(false);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
    setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg sm:bottom-4 sm:inset-x-auto sm:right-4 sm:w-80 sm:rounded-xl sm:border">
      <p className="mb-3 text-sm font-medium">
        Instale o Fluxo de Caixa
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Adicione à tela inicial para acesso rápido como um app.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall} className="flex-1">
          <Download className="mr-2 size-4" />
          Instalar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShow(false)}
        >
          Agora não
        </Button>
      </div>
    </div>
  );
}
