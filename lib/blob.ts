import { put } from "@vercel/blob"

// Función para subir un archivo a Vercel Blob
export async function uploadFile(file: File, filename?: string): Promise<string> {
  try {
    const blobName = filename || `${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    const blob = await put(blobName, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error al subir archivo a Vercel Blob:", error)
    throw new Error("Error al subir archivo")
  }
}
