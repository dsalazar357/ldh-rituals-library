import { supabaseDb } from "@/lib/supabase"
import type { User } from "@/types/user"

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    console.log("Fetching users...")

    const { data, error } = await supabaseDb.from("users").select("*")

    if (error) {
      console.error("Error fetching users:", error)
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
    return []
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseDb.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error)
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
    return null
  }
}

// Add a new user
export async function addUser(userData: Omit<User, "id"> & { password?: string }): Promise<User> {
  try {
    // Usar la API de administración para crear usuarios
    const response = await fetch("/api/users/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error creating user: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error in addUser:", error)
    throw error
  }
}

// Update a user
export async function updateUser(id: string, userData: Partial<User> & { password?: string }): Promise<User> {
  try {
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
    throw error
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  try {
    // En un entorno real, usaríamos la API para eliminar el usuario
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error deleting user: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error in deleteUser for ID ${id}:`, error)
    throw error
  }
}
