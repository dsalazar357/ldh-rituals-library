import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function POST(request: Request) {
  try {
    // Inicializar el cliente de Supabase
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

    // Verificar que el usuario actual es un administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el rol del usuario actual
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Solo los administradores pueden crear usuarios" }, { status: 403 })
    }

    // Procesar la solicitud para crear un nuevo usuario
    const userData = await request.json()

    if (!userData.email || !userData.name) {
      return NextResponse.json({ error: "Email y nombre son obligatorios" }, { status: 400 })
    }

    // Crear cliente con rol de servicio para operaciones administrativas
    const adminSupabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // Crear usuario en Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in Auth:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user in Auth" }, { status: 500 })
    }

    // Crear perfil de usuario en la base de datos
    const { data, error } = await adminSupabase
      .from("users")
      .insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        degree: userData.degree || 1,
        lodge: userData.lodge || null,
        role: userData.role || "user",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        degree: data.degree,
        lodge: data.lodge,
        role: data.role,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
