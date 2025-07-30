"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { uploadRitual } from "@/lib/ritual-service"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UploadRitualForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    degree: "1",
    ritualSystem: "Escocés",
    language: "Español",
    file: null as File | null,
  })
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Verificar el estado de autenticación después de que el componente se monte
  useEffect(() => {
    // Esperar a que se complete la carga de autenticación
    if (!authLoading) {
      setIsCheckingAuth(false)
    }
  }, [authLoading])

  const ritualSystems = ["Escocés", "Francés", "Emulación", "York"]
  const languages = ["Español", "Inglés", "Francés", "Portugués"]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("El archivo es demasiado grande. El tamaño máximo permitido es 10MB.")
        return
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError("Formato de archivo no válido. Solo se permiten archivos PDF y DOCX.")
        return
      }

      setUploadError(null)
      setFormData({
        ...formData,
        file: selectedFile,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null)

    // Verificar nuevamente la autenticación antes de subir
    if (!user) {
      console.error("No hay usuario autenticado al intentar subir ritual")
      setUploadError(
        "Debes iniciar sesión para subir rituales. Por favor, recarga la página o inicia sesión nuevamente.",
      )
      return
    }

    if (!formData.file) {
      setUploadError("Por favor, selecciona un archivo para subir.")
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // Validate that the user has access to the ritual degree
      const ritualDegree = Number.parseInt(formData.degree)
      if (user.degree < ritualDegree) {
        setUploadError("No tienes permiso para subir rituales de este grado.")
        setIsUploading(false)
        return
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      console.log("Subiendo ritual con usuario:", user.id, user.name)

      await uploadRitual({
        name: formData.name,
        degree: ritualDegree,
        ritualSystem: formData.ritualSystem,
        language: formData.language,
        file: formData.file,
        author: user.name,
        userId: user.id,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({
        title: "Éxito",
        description: "El ritual ha sido subido correctamente.",
      })

      router.push("/rituales")
    } catch (error) {
      console.error("Error al subir el ritual:", error)

      setUploadError(
        error instanceof Error ? error.message : "Ocurrió un error al subir el ritual. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  // Mostrar un mensaje de carga mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Verificando autenticación...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar un error si no hay usuario autenticado
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de autenticación</AlertTitle>
            <AlertDescription>
              Debes iniciar sesión para subir rituales. Por favor, recarga la página o inicia sesión nuevamente.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push("/login")}>Ir a la página de inicio de sesión</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Nuevo Ritual</CardTitle>
        <CardDescription>Completa el formulario para subir un nuevo ritual a la biblioteca.</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Ritual</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isUploading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="degree">Grado</Label>
              <Select
                value={formData.degree}
                onValueChange={(value) => setFormData({ ...formData, degree: value })}
                disabled={isUploading}
              >
                <SelectTrigger id="degree">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grado 1</SelectItem>
                  <SelectItem value="2">Grado 2</SelectItem>
                  <SelectItem value="3">Grado 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ritualSystem">Sistema Ritual</Label>
              <Select
                value={formData.ritualSystem}
                onValueChange={(value) => setFormData({ ...formData, ritualSystem: value })}
                disabled={isUploading}
              >
                <SelectTrigger id="ritualSystem">
                  <SelectValue placeholder="Selecciona un rito" />
                </SelectTrigger>
                <SelectContent>
                  {ritualSystems.map((system) => (
                    <SelectItem key={system} value={system}>
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                disabled={isUploading}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo del Ritual (PDF o DOCX)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              required
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, DOCX. Tamaño máximo: 10MB.</p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subiendo archivo...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Subir Ritual"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
