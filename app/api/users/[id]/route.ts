import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const userData = await request.json()

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

    // Update auth data if email or password is provided
    if (userData.email || userData.password) {
      const updateData: any = {}
      if (userData.email) updateData.email = userData.email
      if (userData.password) updateData.password = userData.password

      const { error: authError } = await supabase.auth.admin.updateUserById(id, updateData)

      if (authError) {
        console.error("Error updating user auth data:", authError)
        return NextResponse.json({ error: authError.message }, { status: 500 })
      }
    }

    // Update user profile in database
    const updateData: any = {}
    if (userData.name) updateData.name = userData.name
    if (userData.email) updateData.email = userData.email
    if (userData.degree) updateData.degree = userData.degree
    if (userData.lodge !== undefined) updateData.lodge = userData.lodge
    if (userData.role) updateData.role = userData.role

    const { data, error } = await supabase.from("users").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating user with ID ${id}:`, error)
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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

    // Delete user from Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error(`Error deleting user with ID ${id} from Auth:`, authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Delete user profile from database
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting user with ID ${id} from database:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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

    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 404 })
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
