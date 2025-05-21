import type { User } from "@/types/user"
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_NAME } from "@/lib/env"

// Lista de usuarios válidos (en una implementación real, esto estaría en una base de datos)
const validUsers = [
  {
    id: "1",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
    degree: 33,
    lodge: "Admin",
    role: "admin" as const,
  },
  {
    id: "2",
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    name: TEST_USER_NAME,
    degree: 1,
    lodge: "Taller 1",
    role: "user" as const,
  },
  {
    id: "3",
    email: "logia.lucerodelalba@gmail.com",
    password: "MorningStar357***",
    name: "Lucero del Alba",
    degree: 33,
    lodge: "Lucero del Alba",
    role: "admin" as const,
  },
]

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

// Función para iniciar sesión
export async function signIn(email: string, password: string): Promise<boolean> {
  // Buscar usuario que coincida
  const user = validUsers.find((u) => u.email === email && u.password === password)

  if (user) {
    console.log("Usuario encontrado:", user.name)

    // Guardar usuario en localStorage
    const { password, ...userInfo } = user
    try {
      localStorage.setItem("user", JSON.stringify(userInfo))
      return true
    } catch (error) {
      console.error("Error al guardar usuario:", error)
      return false
    }
  }

  return false
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

// Función para cerrar sesión
export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
  }
}
