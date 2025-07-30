import { createClient } from "@/lib/supabase/client"
import { put } from "@vercel/blob"
import type { Ritual } from "@/types/ritual"

// Function to get all rituals
export async function getRituals(): Promise<Ritual[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("rituals").select("*").order("created_at", { ascending: false })

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

// Function to get a ritual by ID
export async function getRitualById(id: string): Promise<Ritual | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("rituals").select("*").eq("id", id).single()

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

// Function to upload a new ritual
export async function uploadRitual(ritualData: {
  name: string
  degree: number
  ritualSystem: string
  language: string
  file: File
  author: string
  userId: string
}): Promise<Ritual> {
  const supabase = createClient()

  try {
    // Generate a safe filename
    const safeFileName = `${Date.now()}-${ritualData.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `rituales/${ritualData.degree}/${safeFileName}`

    // Upload file to Vercel Blob
    const blob = await put(filePath, ritualData.file, {
      access: "public",
    })

    // Insert ritual into Supabase
    const { data, error } = await supabase
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
      throw new Error("Error al guardar el ritual en la base de datos")
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
    console.error("Error in uploadRitual:", error)
    throw error
  }
}

// Function to delete a ritual
export async function deleteRitual(id: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get the ritual to get the file URL
    const { data: ritual, error: fetchError } = await supabase.from("rituals").select("file_url").eq("id", id).single()

    if (fetchError) {
      console.error(`Error fetching ritual with ID ${id}:`, fetchError)
      return false
    }

    // Delete the ritual from Supabase
    const { error: deleteError } = await supabase.from("rituals").delete().eq("id", id)

    if (deleteError) {
      console.error(`Error deleting ritual with ID ${id}:`, deleteError)
      return false
    }

    // TODO: Delete the file from Vercel Blob
    // This would require a server-side function as Vercel Blob doesn't support
    // client-side deletion for security reasons

    return true
  } catch (error) {
    console.error(`Error in deleteRitual for ID ${id}:`, error)
    return false
  }
}
