// Servicio para subir archivos a través de la API
export async function uploadFile(file: File, degree: string): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("degree", degree)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al subir el archivo")
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error en uploadFile:", error)
    throw error
  }
}
