import { createClient } from "@supabase/supabase-js";
import type { Tables } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type TypedSupabaseClient = ReturnType<typeof createTypedClient>;

function createTypedClient() {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
  );
}

export const supabase = createTypedClient();

// Helper for server-side client with service_role
export function createServiceRoleClient(serviceRoleKey: string) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
