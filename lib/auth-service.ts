import { supabaseAuth, supabaseDb } from "@/lib/supabase"
import type { User } from "@/types/user"

// Iniciar sesión con email y contraseña
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error al iniciar sesión:", error.message)
      return null
    }

    if (!data.user) {
      return null
    }

    // Obtener información adicional del usuario desde la base de datos
    const { data: userData, error: userError } = await supabaseDb.from("users").select("*").eq("email", email).single()

    if (userError) {
      console.error("Error al obtener información del usuario:", userError.message)
      return null
    }

    // Crear objeto de usuario con la información combinada
    const user: User = {
      id: data.user.id,
      name: userData.name,
      email: userData.email,
      degree: userData.degree,
      lodge: userData.lodge,
      role: userData.role,
    }

    return user
  } catch (error) {
    console.error("Error inesperado al iniciar sesión:", error)
    return null
  }
}

// Cerrar sesión
export async function signOut(): Promise<void> {
  await supabaseAuth.auth.signOut()
}

// Registrar un nuevo usuario
export async function registerUser(userData: {
  name: string
  email: string
  password: string
  degree: number
  lodge: string
}): Promise<User | null> {
  try {
    // Registrar el usuario en Supabase Auth
    const { data, error } = await supabaseAuth.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (error) {
      console.error("Error al registrar usuario:", error.message)
      return null
    }

    if (!data.user) {
      return null
    }

    // Crear el registro en la tabla users
    const { data: newUser, error: insertError } = await supabaseDb
      .from("users")
      .insert({
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        degree: userData.degree,
        lodge: userData.lodge,
        role: "user", // Por defecto, los usuarios registrados son usuarios normales
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error al crear registro de usuario:", insertError.message)
      return null
    }

    // Crear objeto de usuario
    const user: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      degree: newUser.degree,
      lodge: newUser.lodge,
      role: newUser.role,
    }

    return user
  } catch (error) {
    console.error("Error inesperado al registrar usuario:", error)
    return null
  }
}

// Obtener el usuario actual
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabaseAuth.auth.getUser()

    if (!data.user) {
      return null
    }

    // Obtener información adicional del usuario desde la base de datos
    const { data: userData, error } = await supabaseDb.from("users").select("*").eq("id", data.user.id).single()

    if (error) {
      console.error("Error al obtener información del usuario:", error.message)
      return null
    }

    // Crear objeto de usuario
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email || data.user.email || "",
      degree: userData.degree,
      lodge: userData.lodge,
      role: userData.role,
    }

    return user
  } catch (error) {
    console.error("Error inesperado al obtener usuario actual:", error)
    return null
  }
}
