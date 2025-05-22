import { supabaseDb, supabaseAdmin } from "@/lib/supabase"
import type { User } from "@/types/user"

// Verificar si estamos en un entorno de vista previa
const isPreviewEnvironment =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    console.log("Fetching users...")

    const { data, error } = await supabaseDb.from("users").select("*")

    if (error) {
      console.error("Error fetching users:", error)

      // Si estamos en un entorno de vista previa, devolver datos simulados
      if (isPreviewEnvironment) {
        console.log("Using mock data for preview environment")
        return [
          {
            id: "admin-user-id",
            name: "Administrador",
            email: "admin@ldh.org",
            degree: 33,
            lodge: "Admin",
            role: "admin",
          },
          {
            id: "user-1",
            name: "Usuario de Prueba",
            email: "usuario@ldh.org",
            degree: 3,
            lodge: "Taller de Prueba",
            role: "user",
          },
        ]
      }

      return []
    }

    return data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email || "",
      degree: user.degree,
      lodge: user.lodge || undefined,
      role: user.role,
    }))
  } catch (error) {
    console.error("Error in getUsers:", error)

    // Si estamos en un entorno de vista previa, devolver datos simulados
    if (isPreviewEnvironment) {
      console.log("Using mock data for preview environment")
      return [
        {
          id: "admin-user-id",
          name: "Administrador",
          email: "admin@ldh.org",
          degree: 33,
          lodge: "Admin",
          role: "admin",
        },
        {
          id: "user-1",
          name: "Usuario de Prueba",
          email: "usuario@ldh.org",
          degree: 3,
          lodge: "Taller de Prueba",
          role: "user",
        },
      ]
    }

    return []
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseDb.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error)

      // Si estamos en un entorno de vista previa y el ID es el del administrador, devolver datos simulados
      if (isPreviewEnvironment && id === "admin-user-id") {
        return {
          id: "admin-user-id",
          name: "Administrador",
          email: "admin@ldh.org",
          degree: 33,
          lodge: "Admin",
          role: "admin",
        }
      }

      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      degree: data.degree,
      lodge: data.lodge || undefined,
      role: data.role,
    }
  } catch (error) {
    console.error(`Error in getUserById for ID ${id}:`, error)

    // Si estamos en un entorno de vista previa y el ID es el del administrador, devolver datos simulados
    if (isPreviewEnvironment && id === "admin-user-id") {
      return {
        id: "admin-user-id",
        name: "Administrador",
        email: "admin@ldh.org",
        degree: 33,
        lodge: "Admin",
        role: "admin",
      }
    }

    return null
  }
}

// Add a new user
export async function addUser(userData: Omit<User, "id"> & { password?: string }): Promise<User> {
  try {
    // Si estamos en un entorno de vista previa, simular la creación de un usuario
    if (isPreviewEnvironment) {
      console.log("Simulating user creation in preview environment")
      return {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        degree: userData.degree,
        lodge: userData.lodge,
        role: userData.role,
      }
    }

    // Create user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in Auth:", authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("Failed to create user in Auth")
    }

    // Create user profile in database
    const { data, error } = await supabaseDb
      .from("users")
      .insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        degree: userData.degree,
        lodge: userData.lodge,
        role: userData.role,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      degree: data.degree,
      lodge: userData.lodge || undefined,
      role: data.role,
    }
  } catch (error) {
    console.error("Error in addUser:", error)

    // Si estamos en un entorno de vista previa, simular la creación de un usuario
    if (isPreviewEnvironment) {
      return {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        degree: userData.degree,
        lodge: userData.lodge,
        role: userData.role,
      }
    }

    throw error
  }
}

// Update a user
export async function updateUser(id: string, userData: Partial<User> & { password?: string }): Promise<User> {
  try {
    // Si estamos en un entorno de vista previa, simular la actualización de un usuario
    if (isPreviewEnvironment) {
      console.log("Simulating user update in preview environment")
      return {
        id,
        name: userData.name || "Usuario Actualizado",
        email: userData.email || "usuario@actualizado.com",
        degree: userData.degree || 1,
        lodge: userData.lodge,
        role: userData.role || "user",
      }
    }

    // Update auth data if email or password is provided
    if (userData.email || userData.password) {
      const updateData: any = {}
      if (userData.email) updateData.email = userData.email
      if (userData.password) updateData.password = userData.password

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)

      if (authError) {
        console.error("Error updating user auth data:", authError)
        throw new Error(authError.message)
      }
    }

    // Update user profile in database
    const updateData: any = {}
    if (userData.name) updateData.name = userData.name
    if (userData.email) updateData.email = userData.email
    if (userData.degree) updateData.degree = userData.degree
    if (userData.lodge !== undefined) updateData.lodge = userData.lodge
    if (userData.role) updateData.role = userData.role

    const { data, error } = await supabaseDb.from("users").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating user with ID ${id}:`, error)
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      degree: data.degree,
      lodge: userData.lodge || undefined,
      role: data.role,
    }
  } catch (error) {
    console.error(`Error in updateUser for ID ${id}:`, error)

    // Si estamos en un entorno de vista previa, simular la actualización de un usuario
    if (isPreviewEnvironment) {
      return {
        id,
        name: userData.name || "Usuario Actualizado",
        email: userData.email || "usuario@actualizado.com",
        degree: userData.degree || 1,
        lodge: userData.lodge,
        role: userData.role || "user",
      }
    }

    throw error
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  try {
    // Si estamos en un entorno de vista previa, simular la eliminación de un usuario
    if (isPreviewEnvironment) {
      console.log(`Simulating deletion of user with ID ${id} in preview environment`)
      return
    }

    // Delete user from Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error(`Error deleting user with ID ${id} from Auth:`, authError)
      throw new Error(authError.message)
    }

    // Delete user profile from database
    const { error } = await supabaseDb.from("users").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting user with ID ${id} from database:`, error)
      throw new Error(error.message)
    }
  } catch (error) {
    console.error(`Error in deleteUser for ID ${id}:`, error)

    // Si estamos en un entorno de vista previa, no hacer nada
    if (isPreviewEnvironment) {
      return
    }

    throw error
  }
}
