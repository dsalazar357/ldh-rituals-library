import type { User } from "@/types/user"

// Datos de ejemplo para usuarios
const mockUsers: User[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@ldh.org",
    degree: 33,
    lodge: "Admin",
    role: "admin",
  },
  {
    id: "2",
    name: "Usuario Grado 1",
    email: "user1@ldh.org",
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

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  // Simulación de obtención de usuarios
  // En una implementación real, esto sería una llamada a la API
  return mockUsers
}

// Función para añadir un nuevo usuario
export async function addUser(userData: Omit<User, "id">): Promise<User> {
  // Simulación de añadir usuario
  // En una implementación real, esto sería una llamada a la API

  // Generar un ID único
  const id = Math.random().toString(36).substring(2, 11)

  // Crear el nuevo usuario
  const newUser: User = {
    id,
    ...userData,
  }

  // En una implementación real, aquí se enviaría el usuario a la base de datos
  console.log("Usuario añadido:", newUser)

  return newUser
}

// Función para actualizar un usuario
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  // Simulación de actualizar usuario
  // En una implementación real, esto sería una llamada a la API

  // Buscar el usuario existente
  const existingUser = mockUsers.find((u) => u.id === id)

  if (!existingUser) {
    throw new Error(`Usuario con ID ${id} no encontrado`)
  }

  // Actualizar el usuario
  const updatedUser: User = {
    ...existingUser,
    ...userData,
  }

  // En una implementación real, aquí se actualizaría el usuario en la base de datos
  console.log("Usuario actualizado:", updatedUser)

  return updatedUser
}

// Función para eliminar un usuario
export async function deleteUser(id: string): Promise<void> {
  // Simulación de eliminar usuario
  // En una implementación real, esto sería una llamada a la API

  // Verificar que el usuario existe
  const existingUser = mockUsers.find((u) => u.id === id)

  if (!existingUser) {
    throw new Error(`Usuario con ID ${id} no encontrado`)
  }

  // En una implementación real, aquí se eliminaría el usuario de la base de datos
  console.log("Usuario eliminado:", existingUser)
}
