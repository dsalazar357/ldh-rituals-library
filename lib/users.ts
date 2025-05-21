import type { User } from "@/types/user"
import { ADMIN_EMAIL, ADMIN_NAME, TEST_USER_EMAIL, TEST_USER_NAME } from "@/lib/env"

// Datos de ejemplo para usuarios
const mockUsers: User[] = [
  {
    id: "1",
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    degree: 33,
    lodge: "Admin",
    role: "admin",
  },
  {
    id: "2",
    name: TEST_USER_NAME,
    email: TEST_USER_EMAIL,
    degree: 1,
    lodge: "Taller 1",
    role: "user",
  },
  {
    id: "3",
    name: "Usuario Grado 2",
    email: "user2@ldh.org",
    degree: 2,
    lodge: "Taller 2",
    role: "user",
  },
  {
    id: "4",
    name: "Usuario Grado 3",
    email: "user3@ldh.org",
    degree: 3,
    lodge: "Taller 3",
    role: "user",
  },
  {
    id: "5",
    name: "Lucero del Alba",
    email: "logia.lucerodelalba@gmail.com",
    degree: 33,
    lodge: "Lucero del Alba",
    role: "admin",
  },
]

// Variable para almacenar los usuarios (simulando una base de datos)
const users = [...mockUsers]

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  // Simulación de obtención de usuarios
  return [...users]
}

// Función para añadir un nuevo usuario
export async function addUser(userData: Omit<User, "id">): Promise<User> {
  // Simulación de añadir usuario
  // En una implementación real, esto sería una llamada a la API

  // Verificar si el email ya existe
  const existingUser = users.find((u) => u.email === userData.email)
  if (existingUser) {
    throw new Error(`El email ${userData.email} ya está en uso`)
  }

  // Generar un ID único
  const id = Math.random().toString(36).substring(2, 11)

  // Crear el nuevo usuario
  const newUser: User = {
    id,
    ...userData,
  }

  // Añadir el usuario a la lista
  users.push(newUser)

  console.log("Usuario añadido:", newUser)

  return newUser
}

// Función para actualizar un usuario
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  // Simulación de actualizar usuario
  // En una implementación real, esto sería una llamada a la API

  // Buscar el usuario existente
  const userIndex = users.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    throw new Error(`Usuario con ID ${id} no encontrado`)
  }

  // Verificar si el email ya existe (si se está cambiando)
  if (userData.email && userData.email !== users[userIndex].email) {
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      throw new Error(`El email ${userData.email} ya está en uso`)
    }
  }

  // Actualizar el usuario
  const updatedUser: User = {
    ...users[userIndex],
    ...userData,
  }

  users[userIndex] = updatedUser

  console.log("Usuario actualizado:", updatedUser)

  return updatedUser
}

// Función para eliminar un usuario
export async function deleteUser(id: string): Promise<void> {
  // Simulación de eliminar usuario
  // En una implementación real, esto sería una llamada a la API

  // Verificar que el usuario existe
  const userIndex = users.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    throw new Error(`Usuario con ID ${id} no encontrado`)
  }

  // Eliminar el usuario
  users.splice(userIndex, 1)

  console.log(`Usuario con ID ${id} eliminado`)
}
