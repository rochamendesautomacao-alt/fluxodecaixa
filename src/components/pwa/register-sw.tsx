"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocalhost) return;

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (sw) {
              sw.addEventListener("statechange", () => {
                  if (sw.state === "installed") {
                    // SW ready
                  }
              });
            }
          });
        })
        .catch(() => {
          // Service worker not available
        });
    }
  }, []);

  return null;
}
