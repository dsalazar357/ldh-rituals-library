// Este archivo ahora es un proxy para mantener compatibilidad con código existente
import { getSupabaseClient } from "@/lib/supabase-singleton"
// Importa la función
import { isProductionMode } from "@/lib/env"

// Default values for preview environment
const PREVIEW_SUPABASE_URL = "https://example.supabase.co"
const PREVIEW_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQwMjY5OTIsImV4cCI6MTk2OTYwMjk5Mn0.z2CN0mvO2No8wSi46Gw59VR2RHwVXRXrHQJ3Fbyl69M"

// Cambia esta línea:
// const isPreviewEnvironment =
//   typeof window !== "undefined" &&
//   (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

// Por esta línea:
const isPreviewEnvironment =
  !isProductionMode() &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

// Mock data for preview environment
const MOCK_USERS = [
  {
    id: "admin-user-id",
    name: "Administrador",
    email: "admin@ldh.org",
    degree: 33,
    lodge: "Admin",
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-1",
    name: "Usuario de Prueba",
    email: "usuario@ldh.org",
    degree: 3,
    lodge: "Taller de Prueba",
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_RITUALS = [
  {
    id: "ritual-1",
    name: "Ritual de Primer Grado",
    degree: 1,
    ritual_system: "Escocés",
    language: "Español",
    author: "Administrador",
    file_url: "https://example.com/ritual1.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "admin-user-id",
  },
  {
    id: "ritual-2",
    name: "Ritual de Segundo Grado",
    degree: 2,
    ritual_system: "Francés",
    language: "Español",
    author: "Administrador",
    file_url: "https://example.com/ritual2.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "admin-user-id",
  },
  {
    id: "ritual-3",
    name: "Ritual de Tercer Grado",
    degree: 3,
    ritual_system: "Escocés",
    language: "Español",
    author: "Administrador",
    file_url: "https://example.com/ritual3.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "admin-user-id",
  },
]

// Create a mock client for preview environment
const createMockClient = () => {
  console.log("Creating mock Supabase client for preview environment")

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === "admin@ldh.org" && password === "admin123") {
          return {
            data: {
              user: { id: "admin-user-id", email: "admin@ldh.org" },
              session: { access_token: "mock-token", refresh_token: "mock-refresh-token", expires_in: 3600 },
            },
            error: null,
          }
        }
        return { data: { user: null, session: null }, error: { message: "Invalid credentials" } }
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
        createUser: async () => ({
          data: { user: { id: "mock-id", email: "admin@ldh.org" } },
          error: null,
        }),
        deleteUser: async () => ({ error: null }),
      },
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            if (table === "users") {
              const user = MOCK_USERS.find((u) => u[column as keyof typeof u] === value)
              return user ? { data: user, error: null } : { data: null, error: { message: "User not found" } }
            } else if (table === "rituals") {
              const ritual = MOCK_RITUALS.find((r) => r[column as keyof typeof r] === value)
              return ritual ? { data: ritual, error: null } : { data: null, error: { message: "Ritual not found" } }
            }
            return { data: null, error: { message: `Table ${table} not found` } }
          },
          limit: () => ({ data: [], error: null }),
        }),
        limit: () => ({ data: [], error: null }),
        order: () => {
          if (table === "users") {
            return { data: MOCK_USERS, error: null }
          } else if (table === "rituals") {
            return { data: MOCK_RITUALS, error: null }
          }
          return { data: [], error: null }
        },
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            if (table === "users") {
              const newUser = {
                ...data,
                id: `user-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              MOCK_USERS.push(newUser)
              return { data: newUser, error: null }
            } else if (table === "rituals") {
              const newRitual = {
                ...data,
                id: `ritual-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              MOCK_RITUALS.push(newRitual)
              return { data: newRitual, error: null }
            }
            return { data: null, error: { message: `Table ${table} not found` } }
          },
        }),
      }),
      delete: () => ({ error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              if (table === "users") {
                const index = MOCK_USERS.findIndex((u) => u[column as keyof typeof u] === value)
                if (index !== -1) {
                  MOCK_USERS[index] = { ...MOCK_USERS[index], ...data, updated_at: new Date().toISOString() }
                  return { data: MOCK_USERS[index], error: null }
                }
              } else if (table === "rituals") {
                const index = MOCK_RITUALS.findIndex((r) => r[column as keyof typeof r] === value)
                if (index !== -1) {
                  MOCK_RITUALS[index] = { ...MOCK_RITUALS[index], ...data, updated_at: new Date().toISOString() }
                  return { data: MOCK_RITUALS[index], error: null }
                }
              }
              return { data: null, error: { message: "Record not found" } }
            },
          }),
        }),
      }),
    }),
    sql: async () => ({ error: null }),
  } as any
}

// Crear y exportar una instancia del cliente para uso en el navegador
// Exportar el cliente singleton
export const createClient = () => {
  return getSupabaseClient()
}

// Exportar una instancia del cliente
export const supabaseDb = getSupabaseClient()
