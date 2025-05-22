import { supabaseDb } from "@/lib/supabase"
import { put } from "@vercel/blob"
import type { Ritual } from "@/types/ritual"

// Get all rituals
export async function getRituals(): Promise<Ritual[]> {
  try {
    console.log("Fetching rituals...")

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
    return []
  }
}

// Get ritual by ID
export async function getRitualById(id: string): Promise<Ritual | null> {
  try {
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
    // Verificar que tenemos un userId válido
    if (!ritualData.userId) {
      throw new Error("No se proporcionó un ID de usuario válido. Por favor, inicia sesión nuevamente.")
    }

    console.log("Iniciando subida de ritual para usuario:", ritualData.userId)

    // Generate a safe filename
    const safeFileName = `${Date.now()}-${ritualData.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `rituales/${ritualData.degree}/${safeFileName}`

    // Upload file to Vercel Blob
    console.log("Subiendo archivo a Vercel Blob...")
    const blob = await put(filePath, ritualData.file, {
      access: "public",
    })

    console.log("Archivo subido correctamente:", blob.url)

    // Insert ritual into Supabase
    console.log("Guardando información del ritual en Supabase...")
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
      throw new Error(`Error al guardar el ritual en la base de datos: ${error.message}`)
    }

    console.log("Ritual guardado correctamente:", data.id)

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
    console.error("Error in uploadRitual:", error)
    throw error
  }
}

// Delete a ritual
export async function deleteRitual(id: string): Promise<boolean> {
  try {
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
    return false
  }
}
