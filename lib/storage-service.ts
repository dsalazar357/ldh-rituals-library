import { supabaseDb } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

/**
 * Sube un archivo a Supabase Storage
 * @param file Archivo a subir
 * @param degree Grado del ritual (para organizar en carpetas)
 * @returns URL del archivo subido
 */
export async function uploadFileToStorage(file: File, degree: number): Promise<string> {
  try {
    console.log("Iniciando subida de archivo a Supabase Storage...")

    // Generar un nombre de archivo seguro
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `rituales/${degree}/${fileName}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabaseDb.storage.from("rituals").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error al subir archivo a Supabase Storage:", error)
      throw new Error(`Error al subir archivo: ${error.message}`)
    }

    // Obtener la URL pública del archivo
    const { data: publicUrlData } = supabaseDb.storage.from("rituals").getPublicUrl(data.path)

    console.log("Archivo subido correctamente a Supabase Storage:", publicUrlData.publicUrl)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error("Error en uploadFileToStorage:", error)
    throw error
  }
}

/**
 * Elimina un archivo de Supabase Storage
 * @param fileUrl URL del archivo a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
  try {
    // Extraer la ruta del archivo de la URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split("/")
    const bucketName = pathParts[1] // Normalmente "rituals"
    const filePath = pathParts.slice(2).join("/") // El resto de la ruta

    console.log(`Eliminando archivo de Supabase Storage: bucket=${bucketName}, path=${filePath}`)

    // Eliminar el archivo de Supabase Storage
    const { error } = await supabaseDb.storage.from(bucketName).remove([filePath])

    if (error) {
      console.error("Error al eliminar archivo de Supabase Storage:", error)
      return false
    }

    console.log("Archivo eliminado correctamente de Supabase Storage")
    return true
  } catch (error) {
    console.error("Error en deleteFileFromStorage:", error)
    return false
  }
}
