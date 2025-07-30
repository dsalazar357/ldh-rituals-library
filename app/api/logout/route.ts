import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function POST() {
  try {
    console.log("API de cierre de sesión llamada")

    // Inicializar el cliente de Supabase con las opciones de cookies correctas
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
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

    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error al cerrar sesión en Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Eliminar manualmente todas las cookies relacionadas con Supabase
    const supabaseCookies = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "__session",
      "sb-provider-token",
    ]

    for (const cookieName of supabaseCookies) {
      cookieStore.set({
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error inesperado al cerrar sesión:", error)
    return NextResponse.json(
      { error: `Error inesperado al cerrar sesión: ${error?.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}
