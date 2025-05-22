import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function GET() {
  try {
    // Inicializar el cliente de Supabase con las opciones de cookies correctas
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
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

    // Step 1: Create tables if they don't exist - usando RPC en lugar de SQL directo
    console.log("Verificando si las tablas existen...")

    // Verificar si la tabla users existe
    const { data: usersTableExists, error: usersTableError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (usersTableError && !usersTableError.message.includes("does not exist")) {
      console.error("Error verificando tabla users:", usersTableError)
      return NextResponse.json({ error: `Error verificando tabla users: ${usersTableError.message}` }, { status: 500 })
    }

    // Si la tabla no existe, no podemos crearla desde el cliente
    // Esto debería hacerse manualmente o a través de migraciones
    if (usersTableError && usersTableError.message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Las tablas necesarias no existen. Por favor, ejecuta las migraciones primero." },
        { status: 500 },
      )
    }

    // Step 2: Check if admin already exists in Auth
    console.log("Checking if admin already exists in Auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error listing users:", authError)
      return NextResponse.json({ error: `Error listing users: ${authError.message}` }, { status: 500 })
    }

    const adminAuthUser = authData.users.find((user) => user.email === "admin@ldh.org")

    // Step 3: Delete existing admin user if it exists (to ensure clean state)
    if (adminAuthUser) {
      console.log("Deleting existing admin user from Auth...")
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(adminAuthUser.id)

      if (deleteAuthError) {
        console.error("Error deleting admin user from Auth:", deleteAuthError)
        return NextResponse.json(
          { error: `Error deleting admin user from Auth: ${deleteAuthError.message}` },
          { status: 500 },
        )
      }

      // Also delete from users table
      console.log("Deleting existing admin user from database...")
      const { error: deleteDbError } = await supabase.from("users").delete().eq("email", "admin@ldh.org")

      if (deleteDbError) {
        console.error("Error deleting admin user from database:", deleteDbError)
        // Continue anyway, as the user might not exist in the database
      }
    }

    // Step 4: Create admin user in Auth
    console.log("Creating admin user in Auth...")
    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: "admin@ldh.org",
      password: "admin123",
      email_confirm: true,
    })

    if (createAuthError) {
      console.error("Error creating admin user in Auth:", createAuthError)
      return NextResponse.json(
        { error: `Error creating admin user in Auth: ${createAuthError.message}` },
        { status: 500 },
      )
    }

    if (!newAuthUser.user) {
      return NextResponse.json({ error: "Failed to create admin user in Auth" }, { status: 500 })
    }

    // Step 5: Create admin user profile in database
    console.log("Creating admin user profile in database...")
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: newAuthUser.user.id,
        name: "Administrador",
        email: "admin@ldh.org",
        degree: 33,
        lodge: "Admin",
        role: "admin",
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating admin user profile:", userError)
      return NextResponse.json({ error: `Error creating admin user profile: ${userError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: userData,
      authUser: newAuthUser.user,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
