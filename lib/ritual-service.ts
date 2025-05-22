import { supabaseDb } from "@/lib/supabase"
import { put } from "@vercel/blob"
import type { Ritual } from "@/types/ritual"

// Verificar si estamos en un entorno de vista previa
const isPreviewEnvironment =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

// Datos simulados para entornos de vista previa
const MOCK_RITUALS = [
  {
    id: "ritual-1",
    name: "Ritual de Primer Grado",
    degree: 1,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "https://example.com/ritual1.pdf",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ritual-2",
    name: "Ritual de Segundo Grado",
    degree: 2,
    ritualSystem: "Francés",
    language: "Español",
    author: "Administrador",
    fileUrl: "https://example.com/ritual2.pdf",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ritual-3",
    name: "Ritual de Tercer Grado",
    degree: 3,
    ritualSystem: "Escocés",
    language: "Español",
    author: "Administrador",
    fileUrl: "https://example.com/ritual3.pdf",
    createdAt: new Date().toISOString(),
  },
]

// Get all rituals
export async function getRituals(): Promise<Ritual[]> {
  try {
    console.log("Fetching rituals...")

    // Si estamos en un entorno de vista previa, devolver datos simulados
    if (isPreviewEnvironment) {
      console.log("Using mock data for preview environment")
      return MOCK_RITUALS
    }

    const { data, error } = await supabaseDb.from("rituals").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rituals:", error)
      return []
    }

    return data.map((ritual) => ({
      id: ritual.id,
      name: ritual.name,
      degree: ritual.degree,
      ritualSystem: ritual.ritual_system,
      language: ritual.language,
      author: ritual.author,
      fileUrl: ritual.file_url,
      createdAt: ritual.created_at,
    }))
  } catch (error) {
    console.error("Error in getRituals:", error)

    // Si estamos en un entorno de vista previa, devolver datos simulados
    if (isPreviewEnvironment) {
      return MOCK_RITUALS
    }

    return []
  }
}

// Get ritual by ID
export async function getRitualById(id: string): Promise<Ritual | null> {
  try {
    // Si estamos en un entorno de vista previa, buscar en los datos simulados
    if (isPreviewEnvironment) {
      const ritual = MOCK_RITUALS.find((r) => r.id === id)
      return ritual || null
    }

    const { data, error } = await supabaseDb.from("rituals").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching ritual with ID ${id}:`, error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      degree: data.degree,
      ritualSystem: data.ritual_system,
      language: data.language,
      author: data.author,
      fileUrl: data.file_url,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error(`Error in getRitualById for ID ${id}:`, error)

    // Si estamos en un entorno de vista previa, buscar en los datos simulados
    if (isPreviewEnvironment) {
      const ritual = MOCK_RITUALS.find((r) => r.id === id)
      return ritual || null
    }

    return null
  }
}

// Upload a new ritual
export async function uploadRitual(ritualData: {
  name: string
  degree: number
  ritualSystem: string
  language: string
  file: File
  author: string
  userId: string
}): Promise<Ritual> {
  try {
    // Si estamos en un entorno de vista previa, simular la subida de un ritual
    if (isPreviewEnvironment) {
      console.log("Simulating ritual upload in preview environment")
      const newRitual = {
        id: `ritual-${Date.now()}`,
        name: ritualData.name,
        degree: ritualData.degree,
        ritualSystem: ritualData.ritualSystem,
        language: ritualData.language,
        author: ritualData.author,
        fileUrl: URL.createObjectURL(ritualData.file),
        createdAt: new Date().toISOString(),
      }

      // Añadir a los datos simulados
      MOCK_RITUALS.push(newRitual)

      return newRitual
    }

    // Generate a safe filename
    const safeFileName = `${Date.now()}-${ritualData.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `rituales/${ritualData.degree}/${safeFileName}`

    // Upload file to Vercel Blob
    const blob = await put(filePath, ritualData.file, {
      access: "public",
    })

    // Insert ritual into Supabase
    const { data, error } = await supabaseDb
      .from("rituals")
      .insert({
        name: ritualData.name,
        degree: ritualData.degree,
        ritual_system: ritualData.ritualSystem,
        language: ritualData.language,
        author: ritualData.author,
        file_url: blob.url,
        user_id: ritualData.userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting ritual:", error)
      throw new Error("Error saving ritual to database")
    }

    return {
      id: data.id,
      name: data.name,
      degree: data.degree,
      ritualSystem: ritualData.ritualSystem,
      language: ritualData.language,
      author: ritualData.author,
      fileUrl: data.file_url,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error("Error in uploadRitual:", error)

    // Si estamos en un entorno de vista previa, simular la subida de un ritual
    if (isPreviewEnvironment) {
      const newRitual = {
        id: `ritual-${Date.now()}`,
        name: ritualData.name,
        degree: ritualData.degree,
        ritualSystem: ritualData.ritualSystem,
        language: ritualData.language,
        author: ritualData.author,
        fileUrl: "https://example.com/ritual-simulado.pdf",
        createdAt: new Date().toISOString(),
      }

      // Añadir a los datos simulados
      MOCK_RITUALS.push(newRitual)

      return newRitual
    }

    throw error
  }
}

// Delete a ritual
export async function deleteRitual(id: string): Promise<boolean> {
  try {
    // Si estamos en un entorno de vista previa, simular la eliminación de un ritual
    if (isPreviewEnvironment) {
      console.log(`Simulating deletion of ritual with ID ${id} in preview environment`)
      const index = MOCK_RITUALS.findIndex((r) => r.id === id)
      if (index !== -1) {
        MOCK_RITUALS.splice(index, 1)
      }
      return true
    }

    // Delete the ritual from Supabase
    const { error } = await supabaseDb.from("rituals").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting ritual with ID ${id}:`, error)
      return false
    }

    // Note: We can't delete the file from Vercel Blob from the client side
    // This would require a server-side function

    return true
  } catch (error) {
    console.error(`Error in deleteRitual for ID ${id}:`, error)

    // Si estamos en un entorno de vista previa, simular la eliminación de un ritual
    if (isPreviewEnvironment) {
      const index = MOCK_RITUALS.findIndex((r) => r.id === id)
      if (index !== -1) {
        MOCK_RITUALS.splice(index, 1)
      }
      return true
    }

    return false
  }
}
