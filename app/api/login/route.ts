import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting to log in with email: ${email}`)

    // For preview/development environment, use a direct check for admin credentials
    if (false && email === "admin@ldh.org" && password === "admin123") {
      console.log("Using direct admin authentication for preview environment")

      // Create a mock session
      const session = {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        user: {
          id: "admin-user-id",
          email: "admin@ldh.org",
          role: "admin",
        },
      }

      // Set cookies
      const cookieStore = cookies()
      cookieStore.set("sb-access-token", session.access_token, {
        path: "/",
        maxAge: session.expires_in,
      })
      cookieStore.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      cookieStore.set("user-role", "admin", {
        path: "/",
        maxAge: session.expires_in,
      })
      cookieStore.set("user-email", email, {
        path: "/",
        maxAge: session.expires_in,
      })

      // Return success response
      return NextResponse.json({
        user: {
          id: "admin-user-id",
          name: "Administrador",
          email: "admin@ldh.org",
          degree: 33,
          lodge: "Admin",
          role: "admin",
        },
        session,
      })
    }

    // For other users, try Supabase Auth
    console.log("Attempting Supabase Auth login")

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase Auth login error:", error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user || !data.session) {
      console.error("Authentication failed: No user or session returned")
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error getting user profile:", profileError)
      return NextResponse.json({ error: "Error getting user profile" }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.name,
        email: data.user.email,
        degree: profile.degree,
        lodge: profile.lodge,
        role: profile.role,
      },
      session: data.session,
    })
  } catch (error: any) {
    console.error("Unexpected login error:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
