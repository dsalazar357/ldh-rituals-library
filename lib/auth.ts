import type { User } from "@/types/user"

// Función para obtener el usuario actual
export async function getUser(): Promise<User | null> {
  // Simulación de obtención de usuario desde localStorage
  if (typeof window !== "undefined") {
    try {
      const userJson = localStorage.getItem("user")
      if (userJson) {
        return JSON.parse(userJson)
      }
    } catch (error) {
      console.error("Error al obtener usuario desde localStorage:", error)
    }
  }

  return null
}

// Función para registrar un nuevo usuario
export async function registerUser(userData: Omit<User, "id" | "role">): Promise<User> {
  // Simulación de registro de usuario
  // En una implementación real, esto sería una llamada a la API

  // Generar un ID único
  const id = Math.random().toString(36).substring(2, 11)

  // Crear el nuevo usuario
  const newUser: User = {
    id,
    ...userData,
    role: "user",
  }

  // En una implementación real, aquí se enviaría el usuario a la base de datos
  console.log("Usuario registrado:", newUser)

  return newUser
}
