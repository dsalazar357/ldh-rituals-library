import { createClient as createClientBrowser } from "@/lib/supabase/client"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import type { cookies } from "next/headers"

// Default values for preview environment
const PREVIEW_SUPABASE_URL = "https://example.supabase.co"
const PREVIEW_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQwMjY5OTIsImV4cCI6MTk2OTYwMjk5Mn0.z2CN0mvO2No8wSi46Gw59VR2RHwVXRXrHQJ3Fbyl69M"
const PREVIEW_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1NDAyNjk5MiwiZXhwIjoxOTY5NjAyOTkyfQ.Pr-ryri3P5Ot3AQYtTwXKf65H83Jlvs0Apj_0SrRVsg"

// Check if we're in a preview environment
const isPreviewEnvironment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app")
    : !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === ""

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PREVIEW_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PREVIEW_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || PREVIEW_SERVICE_KEY

// Create Supabase client for browser-side operations
export const supabaseDb = createClientBrowser()

// Create Supabase client for auth operations
export const supabaseAuth = createClientBrowser()

// Create Supabase client for server-side operations with admin privileges
export const supabaseAdmin = isPreviewEnvironment
  ? createClientBrowser()
  : createServerClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

// Function to create a server client with cookies
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  if (isPreviewEnvironment) {
    console.log("Using mock Supabase client for preview environment")
    return createClientBrowser()
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
