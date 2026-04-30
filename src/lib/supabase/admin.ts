import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  if (!hasServiceRole) {
    return null;
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
