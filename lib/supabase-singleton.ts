import { createBrowserClient, createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// Singleton para el navegador
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient solo debe usarse en el navegador. Usa createServerClient en SSR.")
  }

  if (!supabaseClient) {
    console.log("Creando instancia del cliente Supabase con cookies")

    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,          // No guardes en localStorage
          autoRefreshToken: false,        // Usa cookies automáticas
        },
      }
    )
  }

  return supabaseClient
}
