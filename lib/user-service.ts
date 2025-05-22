import { supabaseDb } from "@/lib/supabase"
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

    // En un entorno real, usaríamos la API para crear el usuario
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Error creating user: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
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

    // En un entorno real, usaríamos la API para actualizar el usuario
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Error updating user: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
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

    // En un entorno real, usaríamos la API para eliminar el usuario
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error deleting user: ${response.statusText}`)
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
