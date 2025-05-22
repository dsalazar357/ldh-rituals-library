import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import type { cookies } from "next/headers"
import { getSupabaseClient } from "@/lib/supabase-singleton"

// Export supabaseDb from singleton
export const supabaseDb = getSupabaseClient()

// Export supabaseAuth from singleton
export const supabaseAuth = getSupabaseClient()

// Function to create a server client with cookies
export const createClient = (cookieStore?: ReturnType<typeof cookies>) => {
  if (!cookieStore) {
    return getSupabaseClient()
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: { path: string; domain?: string }) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    },
  )
}

// Función para crear el cliente de Supabase Admin
export const createAdminClient = (cookieStore?: ReturnType<typeof cookies>) => {
  if (!cookieStore) {
    return getSupabaseClient()
  }

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: { path: string; domain?: string }) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create Supabase client for server-side operations with admin privileges
export const supabaseAdmin = createAdminClient()
