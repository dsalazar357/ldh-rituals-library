import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const userData = await request.json()

    console.log("=== PUT /api/users/[id] ===")
    console.log("User ID:", id)
    console.log("Update data:", userData)

    // Initialize Supabase client with service role key
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

    // First, verify the user exists
    const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").eq("id", id)

    console.log("User existence check:", { existingUsers, checkError })

    if (checkError) {
      console.error("Error checking user existence:", checkError)
      return NextResponse.json({ error: `Failed to verify user: ${checkError.message}` }, { status: 500 })
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.error("User not found:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingUser = existingUsers[0]
    console.log("Found existing user:", existingUser)

    // Update auth data if email or password is provided
    if (userData.email || userData.password) {
      const authUpdateData: any = {}
      if (userData.email && userData.email !== existingUser.email) {
        authUpdateData.email = userData.email
      }
      if (userData.password) {
        authUpdateData.password = userData.password
      }

      if (Object.keys(authUpdateData).length > 0) {
        console.log("Updating auth data:", authUpdateData)

        const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdateData)

        if (authError) {
          console.error("Error updating auth data:", authError)
          return NextResponse.json({ error: `Auth update failed: ${authError.message}` }, { status: 500 })
        }
      }
    }

    // Prepare database update
    const dbUpdateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are provided and different
    if (userData.name !== undefined && userData.name !== existingUser.name) {
      dbUpdateData.name = userData.name
    }
    if (userData.email !== undefined && userData.email !== existingUser.email) {
      dbUpdateData.email = userData.email
    }
    if (userData.degree !== undefined && userData.degree !== existingUser.degree) {
      dbUpdateData.degree = userData.degree
    }
    if (userData.lodge !== undefined && userData.lodge !== existingUser.lodge) {
      dbUpdateData.lodge = userData.lodge
    }
    if (userData.role !== undefined && userData.role !== existingUser.role) {
      dbUpdateData.role = userData.role
    }

    console.log("Database update data:", dbUpdateData)

    // Always update the updated_at timestamp, even if no other fields changed
    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update(dbUpdateData)
      .eq("id", id)
      .select("*")

    console.log("Update result:", { updatedData, updateError })

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: `Database update failed: ${updateError.message}` }, { status: 500 })
    }

    if (!updatedData || updatedData.length === 0) {
      console.error("No rows updated - this should not happen")
      return NextResponse.json({ error: "Update failed - no rows affected" }, { status: 500 })
    }

    const updatedUser = updatedData[0]
    console.log("User updated successfully:", updatedUser)

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        degree: updatedUser.degree,
        lodge: updatedUser.lodge,
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in PUT:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    console.log("=== DELETE /api/users/[id] ===")
    console.log("Deleting user:", id)

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

    // Delete from database first
    const { error: dbError } = await supabase.from("users").delete().eq("id", id)

    if (dbError) {
      console.error("Database deletion error:", dbError)
      return NextResponse.json({ error: `Database deletion failed: ${dbError.message}` }, { status: 500 })
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error("Auth deletion error:", authError)
      // Don't fail the request if auth deletion fails
    }

    console.log("User deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in DELETE:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { data, error } = await supabase.from("users").select("*").eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = data[0]

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        lodge: user.lodge,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in GET:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
