import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Crear una única instancia del cliente de Supabase
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // En el servidor, creamos una nueva instancia cada vez
    // para evitar problemas con el estado compartido entre solicitudes
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  // En el cliente, usamos un singleton
  if (!supabaseInstance) {
    console.log("Creando nueva instancia de Supabase cliente")
    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }
  return supabaseInstance
}
