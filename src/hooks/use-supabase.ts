import { useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function getClient() {
  if (typeof window === "undefined") return null;
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}

export function useSupabase() {
  const ref = useRef<SupabaseClient | null>(null);

  if (typeof window !== "undefined" && !ref.current) {
    ref.current = getClient();
  }

  return ref.current;
}
