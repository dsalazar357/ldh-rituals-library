import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Crear una única instancia del cliente de Supabase para el navegador
export const supabase = createClient<Database>(
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
