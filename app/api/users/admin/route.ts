import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    console.log("=== POST /api/users/admin ===")
    console.log("Creating user with data:", userData)

    if (!userData.email || !userData.name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Initialize Supabase client with service role key for admin operations
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          },
        },
      },
    )

    // Generate a random password if not provided
    const password = userData.password || Math.random().toString(36).slice(-8) + "A1!"

    console.log("Creating user in Auth with email:", userData.email)

    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
      },
    })

    if (authError) {
      console.error("Error creating user in Auth:", authError)
      return NextResponse.json({ error: `Auth creation failed: ${authError.message}` }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user in Auth" }, { status: 500 })
    }

    console.log("User created in Auth:", authData.user.id)

    // Create user profile in database
    const userProfile = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      degree: userData.degree || 1,
      lodge: userData.lodge || null,
      role: userData.role || "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Creating user profile in database:", userProfile)

    const { data, error } = await supabase.from("users").insert(userProfile).select().single()

    if (error) {
      console.error("Error creating user profile:", error)

      // If database insert fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({ error: `Database creation failed: ${error.message}` }, { status: 500 })
    }

    console.log("User created successfully:", data)

    return NextResponse.json({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        degree: data.degree,
        lodge: data.lodge,
        role: data.role,
      },
      temporaryPassword: userData.password ? undefined : password, // Only return if auto-generated
    })
  } catch (error: any) {
    console.error("Unexpected error in POST /api/users/admin:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
