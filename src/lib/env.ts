export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  demoRole: (process.env.NEXT_PUBLIC_DEMO_ROLE ?? "ADMIN") as
    | "ADMIN"
    | "RESPONSABLE"
    | "MEMBRE"
    | "VISITEUR",
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasServiceRole = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
