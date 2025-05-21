import { supabaseDb } from "@/lib/supabase"
import type { User } from "@/types/user"

// Obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabaseDb.from("users").select("*")

    if (error) {
      console.error("Error al obtener usuarios:", error.message)
      return []
    }

    return data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      degree: user.degree,
      lodge: user.lodge,
      role: user.role,
    }))
  } catch (error) {
    console.error("Error inesperado al obtener usuarios:", error)
    return []
  }
}

// Obtener un usuario por ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseDb.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error.message)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      degree: data.degree,
      lodge: data.lodge,
      role: data.role,
    }
  } catch (error) {
    console.error(`Error inesperado al obtener usuario con ID ${id}:`, error)
    return null
  }
}

// Añadir un nuevo usuario
export async function addUser(userData: Omit<User, "id">): Promise<User> {
  try {
    // Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseDb.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).slice(-8), // Generar contraseña aleatoria si no se proporciona
      email_confirm: true,
    })

    if (authError) {
      console.error("Error al crear usuario en Auth:", authError.message)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario en Auth")
    }

    // Crear el registro en la tabla users
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
      console.error("Error al añadir usuario:", error.message)
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      degree: data.degree,
      lodge: data.lodge,
      role: data.role,
    }
  } catch (error) {
    console.error("Error inesperado al añadir usuario:", error)
    throw error
  }
}

// Actualizar un usuario
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    // Si se está actualizando el email, actualizar en Auth
    if (userData.email) {
      const { error: authError } = await supabaseDb.auth.admin.updateUserById(id, {
        email: userData.email,
      })

      if (authError) {
        console.error("Error al actualizar email en Auth:", authError.message)
        throw new Error(authError.message)
      }
    }

    // Si se está actualizando la contraseña, actualizar en Auth
    if (userData.password) {
      const { error: passwordError } = await supabaseDb.auth.admin.updateUserById(id, {
        password: userData.password,
      })

      if (passwordError) {
        console.error("Error al actualizar contraseña en Auth:", passwordError.message)
        throw new Error(passwordError.message)
      }
    }

    // Actualizar en la tabla users
    const { data, error } = await supabaseDb
      .from("users")
      .update({
        name: userData.name,
        degree: userData.degree,
        lodge: userData.lodge,
        role: userData.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error.message)
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      degree: data.degree,
      lodge: data.lodge,
      role: data.role,
    }
  } catch (error) {
    console.error(`Error inesperado al actualizar usuario con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un usuario
export async function deleteUser(id: string): Promise<void> {
  try {
    // Eliminar el usuario de Auth
    const { error: authError } = await supabaseDb.auth.admin.deleteUser(id)

    if (authError) {
      console.error("Error al eliminar usuario de Auth:", authError.message)
      throw new Error(authError.message)
    }

    // Eliminar el registro de la tabla users
    const { error } = await supabaseDb.from("users").delete().eq("id", id)

    if (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error.message)
      throw new Error(error.message)
    }
  } catch (error) {
    console.error(`Error inesperado al eliminar usuario con ID ${id}:`, error)
    throw error
  }
}
