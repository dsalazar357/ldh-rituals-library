import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  try {
    // Obtener todas las cookies
    const cookieStore = cookies()
    const allCookies: Record<string, string> = {}

    cookieStore.getAll().forEach((cookie) => {
      allCookies[cookie.name] = cookie.value
    })

    // Inicializar el cliente de Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Esta función no hace nada en este endpoint de solo lectura
          },
          remove(name: string, options: any) {
            // Esta función no hace nada en este endpoint de solo lectura
          },
        },
      },
    )

    // Verificar sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Verificar conexión a la base de datos
    const { data: dbData, error: dbError } = await supabase.from("users").select("count").limit(1)

    // Recopilar variables de entorno públicas
    const publicEnvVars: Record<string, string> = {}
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        publicEnvVars[key] = process.env[key] || "no disponible"
      }
    })

    return NextResponse.json({
      message: "Diagnóstico del servidor",
      cookies: {
        count: Object.keys(allCookies).length,
        names: Object.keys(allCookies),
        // No mostramos los valores por seguridad
      },
      session: {
        exists: !!sessionData.session,
        error: sessionError ? sessionError.message : null,
      },
      database: {
        connected: !dbError,
        error: dbError ? dbError.message : null,
        data: dbData,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        public_vars: publicEnvVars,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Error en el diagnóstico: ${error?.message || "Desconocido"}`,
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 },
    )
  }
}
