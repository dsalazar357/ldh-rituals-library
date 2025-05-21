import type { Ritual } from "@/types/ritual"

// Datos de ejemplo para rituales
const mockRituals: Ritual[] = [
  {
    id: "1",
    name: "Ritual de Apertura Grado 1",
    degree: 1,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual1.pdf",
    createdAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Ritual de Clausura Grado 1",
    degree: 1,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual2.pdf",
    createdAt: "2023-01-20T14:45:00Z",
  },
  {
    id: "3",
    name: "Ritual de Iniciación Grado 1",
    degree: 1,
    ritualSystem: "Francés",
    language: "Español",
    author: "Usuario Grado 3",
    fileUrl: "/files/ritual3.pdf",
    createdAt: "2023-02-05T09:15:00Z",
  },
  {
    id: "4",
    name: "Ritual de Apertura Grado 2",
    degree: 2,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual4.pdf",
    createdAt: "2023-02-10T11:20:00Z",
  },
  {
    id: "5",
    name: "Ritual de Clausura Grado 2",
    degree: 2,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Usuario Grado 3",
    fileUrl: "/files/ritual5.pdf",
    createdAt: "2023-02-15T16:30:00Z",
  },
  {
    id: "6",
    name: "Ritual de Apertura Grado 3",
    degree: 3,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual6.pdf",
    createdAt: "2023-03-01T13:45:00Z",
  },
  {
    id: "7",
    name: "Ritual de Clausura Grado 3",
    degree: 3,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual7.pdf",
    createdAt: "2023-03-05T10:00:00Z",
  },
  {
    id: "8",
    name: "Ritual de Iniciación Grado 1",
    degree: 1,
    ritualSystem: "Emulación",
    language: "Inglés",
    author: "Usuario Grado 3",
    fileUrl: "/files/ritual8.pdf",
    createdAt: "2023-03-10T15:20:00Z",
  },
  {
    id: "9",
    name: "Ritual de Apertura Grado 1",
    degree: 1,
    ritualSystem: "York",
    language: "Español",
    author: "Administrador",
    fileUrl: "/files/ritual9.pdf",
    createdAt: "2023-03-15T09:30:00Z",
  },
  {
    id: "10",
    name: "Ritual de Iniciación Grado 2",
    degree: 2,
    ritualSystem: "Francés",
    language: "Francés",
    author: "Usuario Grado 3",
    fileUrl: "/files/ritual10.pdf",
    createdAt: "2023-03-20T14:15:00Z",
  },
]

// Variable para almacenar los rituales (simulando una base de datos)
const rituals = [...mockRituals]

// Función para obtener todos los rituales
export async function getRituals(): Promise<Ritual[]> {
  // Simulación de obtención de rituales
  return [...rituals]
}

// Función para obtener un ritual por ID
export async function getRitualById(id: string): Promise<Ritual | null> {
  // Simulación de obtención de ritual por ID
  const ritual = rituals.find((r) => r.id === id)

  if (!ritual) {
    return null
  }

  return ritual
}

// Función para subir un nuevo ritual
export async function uploadRitual(ritualData: {
  name: string
  degree: number
  ritualSystem: string
  language: string
  file: File
  author: string
}): Promise<Ritual> {
  // Simulación de subida de ritual
  // En una implementación real, esto subiría el archivo a Vercel Blob
  // y guardaría los metadatos en la base de datos

  // Generar un ID único
  const id = Math.random().toString(36).substring(2, 11)

  // Crear el nuevo ritual
  const newRitual: Ritual = {
    id,
    name: ritualData.name,
    degree: ritualData.degree,
    ritualSystem: ritualData.ritualSystem,
    language: ritualData.language,
    author: ritualData.author,
    fileUrl: `/files/${ritualData.file.name}`,
    createdAt: new Date().toISOString(),
  }

  // Añadir el nuevo ritual a la lista
  rituals.push(newRitual)

  console.log("Ritual subido:", newRitual)

  return newRitual
}

// Función para eliminar un ritual
export async function deleteRitual(id: string): Promise<boolean> {
  // Verificar si el ritual existe
  const ritualIndex = rituals.findIndex((r) => r.id === id)

  if (ritualIndex === -1) {
    return false
  }

  // Eliminar el ritual de la lista
  rituals.splice(ritualIndex, 1)

  console.log(`Ritual con ID ${id} eliminado`)

  return true
}
