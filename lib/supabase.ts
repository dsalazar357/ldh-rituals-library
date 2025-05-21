import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Cliente de Supabase para el navegador
export const supabase = createBrowserClient()
