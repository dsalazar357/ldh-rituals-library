import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting to log in with email: ${email}`)

    // For preview/development environment, use a direct check for admin credentials
    if (email === "admin@ldh.org" && password === "admin123") {
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
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error getting user profile:", profileError)
      return NextResponse.json({ error: "Error getting user profile" }, { status: 500 })
    }

    // Set auth cookies
    const cookieStore = cookies()
    cookieStore.set("sb-access-token", data.session.access_token, {
      path: "/",
      maxAge: data.session.expires_in,
    })
    cookieStore.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

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
