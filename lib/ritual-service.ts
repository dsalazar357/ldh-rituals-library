import { supabaseDb } from "@/lib/supabase"
import { put } from "@vercel/blob"
import { BLOB_READ_WRITE_TOKEN } from "@/lib/env"
import type { Ritual } from "@/types/ritual"

// Obtener todos los rituales
export async function getRituals(): Promise<Ritual[]> {
  try {
    const { data, error } = await supabaseDb.from("rituals").select("*")

    if (error) {
      console.error("Error al obtener rituales:", error.message)
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
    console.error("Error inesperado al obtener rituales:", error)
    return []
  }
}

// Obtener un ritual por ID
export async function getRitualById(id: string): Promise<Ritual | null> {
  try {
    const { data, error } = await supabaseDb.from("rituals").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error al obtener ritual con ID ${id}:`, error.message)
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
    console.error(`Error inesperado al obtener ritual con ID ${id}:`, error)
    return null
  }
}

// Subir un nuevo ritual
export async function uploadRitual(ritualData: {
  name: string
  degree: number
  ritualSystem: string
  language: string
  file: File
  author: string
}): Promise<Ritual> {
  try {
    // Subir el archivo a Vercel Blob
    const filename = `${Date.now()}-${ritualData.file.name.replace(/\s+/g, "-")}`
    const blob = await put(filename, ritualData.file, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Crear el registro en la tabla rituals
    const { data, error } = await supabaseDb
      .from("rituals")
      .insert({
        name: ritualData.name,
        degree: ritualData.degree,
        ritual_system: ritualData.ritualSystem,
        language: ritualData.language,
        author: ritualData.author,
        file_url: blob.url,
      })
      .select()
      .single()

    if (error) {
      console.error("Error al añadir ritual:", error.message)
      throw new Error(error.message)
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
    console.error("Error inesperado al subir ritual:", error)
    throw error
  }
}

// Eliminar un ritual
export async function deleteRitual(id: string): Promise<boolean> {
  try {
    // Obtener la URL del archivo
    const { data: ritual, error: getError } = await supabaseDb.from("rituals").select("file_url").eq("id", id).single()

    if (getError) {
      console.error(`Error al obtener ritual con ID ${id}:`, getError.message)
      return false
    }

    // Eliminar el registro de la tabla rituals
    const { error } = await supabaseDb.from("rituals").delete().eq("id", id)

    if (error) {
      console.error(`Error al eliminar ritual con ID ${id}:`, error.message)
      return false
    }

    // TODO: Eliminar el archivo de Vercel Blob
    // Nota: Actualmente, la API de Vercel Blob no soporta eliminar archivos desde el cliente
    // Se recomienda implementar un endpoint serverless para esto

    return true
  } catch (error) {
    console.error(`Error inesperado al eliminar ritual con ID ${id}:`, error)
    return false
  }
}
