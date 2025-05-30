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
    console.log("User ID type:", typeof id)
    console.log("User ID length:", id.length)
    console.log("Update data:", userData)

    // Initialize Supabase client with proper cookie handling
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

    // First, check if the user exists and get current data
    const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").eq("id", id)

    console.log("Existing users query result:", { existingUsers, checkError })
    console.log("Number of existing users found:", existingUsers?.length || 0)

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ error: `Failed to check user: ${checkError.message}` }, { status: 500 })
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.error("User not found:", id)

      // Let's also try to find users with similar IDs for debugging
      const { data: allUsers } = await supabase.from("users").select("id, name, email").limit(10)
      console.log("All users in database (first 10):", allUsers)

      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingUser = existingUsers[0]
    console.log("Found existing user:", existingUser)

    // Update auth data if email or password is provided
    if (userData.email || userData.password) {
      const updateData: any = {}
      if (userData.email) updateData.email = userData.email
      if (userData.password) updateData.password = userData.password

      console.log("Updating auth data:", updateData)

      const { error: authError } = await supabase.auth.admin.updateUserById(id, updateData)

      if (authError) {
        console.error("Error updating user auth data:", authError)
        return NextResponse.json({ error: `Auth update failed: ${authError.message}` }, { status: 500 })
      }
    }

    // Prepare update data - only include fields that are actually changing
    const updateData: any = {}

    if (userData.name !== undefined && userData.name !== existingUser.name) {
      updateData.name = userData.name
    }
    if (userData.email !== undefined && userData.email !== existingUser.email) {
      updateData.email = userData.email
    }
    if (userData.degree !== undefined && userData.degree !== existingUser.degree) {
      updateData.degree = userData.degree
    }
    if (userData.lodge !== undefined && userData.lodge !== existingUser.lodge) {
      updateData.lodge = userData.lodge
    }
    if (userData.role !== undefined && userData.role !== existingUser.role) {
      updateData.role = userData.role
    }

    console.log("Final update data (only changed fields):", updateData)

    // If no fields are changing, return the existing user
    if (Object.keys(updateData).length === 0) {
      console.log("No fields to update, returning existing user")
      return NextResponse.json({
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          degree: existingUser.degree,
          lodge: existingUser.lodge,
          role: existingUser.role,
        },
      })
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    console.log("Executing update query...")

    // Perform the update
    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("*")

    console.log("Update query result:", { updatedData, updateError })

    if (updateError) {
      console.error(`Error updating user with ID ${id}:`, updateError)
      return NextResponse.json({ error: `Database update failed: ${updateError.message}` }, { status: 500 })
    }

    if (!updatedData || updatedData.length === 0) {
      console.error("No rows updated for user:", id)

      // Try to fetch the user again to see if it still exists
      const { data: recheckUser } = await supabase.from("users").select("*").eq("id", id)
      console.log("User recheck after failed update:", recheckUser)

      return NextResponse.json({ error: "No user was updated - user may have been deleted" }, { status: 404 })
    }

    if (updatedData.length > 1) {
      console.error("Multiple rows updated for user:", id, updatedData.length)
      return NextResponse.json({ error: "Multiple users updated - data integrity issue" }, { status: 500 })
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
    console.error("Unexpected error in PUT /api/users/[id]:", error)
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

    // Initialize Supabase client with proper cookie handling
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

    // First, check if the user exists
    const { data: existingUser, error: checkError } = await supabase.from("users").select("*").eq("id", id)

    console.log("User exists check:", { existingUser, checkError })

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ error: `Failed to check user: ${checkError.message}` }, { status: 500 })
    }

    if (!existingUser || existingUser.length === 0) {
      console.error("User not found for deletion:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user profile from database first
    const { error: dbError } = await supabase.from("users").delete().eq("id", id)

    if (dbError) {
      console.error(`Error deleting user with ID ${id} from database:`, dbError)
      return NextResponse.json({ error: `Database deletion failed: ${dbError.message}` }, { status: 500 })
    }

    // Delete user from Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error(`Error deleting user with ID ${id} from Auth:`, authError)
      // Don't return error here as the user is already deleted from database
      console.log("User deleted from database but auth deletion failed - this is usually okay")
    }

    console.log("User deleted successfully:", id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/users/[id]:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    console.log("=== GET /api/users/[id] ===")
    console.log("Getting user:", id)

    // Initialize Supabase client with proper cookie handling
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

    console.log("Get user result:", { data, error })

    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error("User not found:", id)
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
    console.error("Unexpected error in GET /api/users/[id]:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
