"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { uploadRitual } from "@/lib/rituals"

export function UploadRitualForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    degree: "1",
    ritualSystem: "Escocés",
    language: "Español",
    file: null as File | null,
  })

  const ritualSystems = ["Escocés", "Francés", "Emulación", "York"]
  const languages = ["Español", "Inglés", "Francés", "Portugués"]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo para subir.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Validar que el usuario tenga acceso al grado del ritual
      const ritualDegree = Number.parseInt(formData.degree)
      if (user && user.degree < ritualDegree) {
        toast({
          title: "Error",
          description: "No tienes permiso para subir rituales de este grado.",
          variant: "destructive",
        })
        return
      }

      await uploadRitual({
        name: formData.name,
        degree: ritualDegree,
        ritualSystem: formData.ritualSystem,
        language: formData.language,
        file: formData.file,
        author: user?.name || "Usuario Desconocido",
      })

      toast({
        title: "Éxito",
        description: "El ritual ha sido subido correctamente.",
      })

      router.push("/rituales")
    } catch (error) {
      console.error("Error al subir el ritual:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al subir el ritual. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Nuevo Ritual</CardTitle>
        <CardDescription>Completa el formulario para subir un nuevo ritual a la biblioteca.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Ritual</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="degree">Grado</Label>
              <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
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
            <Input id="file" type="file" accept=".pdf,.docx,.doc" onChange={handleFileChange} required />
            <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, DOCX. Tamaño máximo: 10MB.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Subir Ritual"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
