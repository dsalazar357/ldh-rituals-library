"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/lib/auth"

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    degree: "1",
    lodge: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        degree: Number.parseInt(formData.degree),
        lodge: formData.lodge,
      })

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de registro ha sido enviada. Un administrador revisará tu solicitud.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Solicitar Acceso</CardTitle>
        <CardDescription>Completa el formulario para solicitar acceso a la biblioteca de rituales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="degree">Grado</Label>
              <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                <SelectTrigger id="degree">
                  <SelectValue placeholder="Selecciona tu grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grado 1</SelectItem>
                  <SelectItem value="2">Grado 2</SelectItem>
                  <SelectItem value="3">Grado 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lodge">Taller</Label>
              <Input
                id="lodge"
                value={formData.lodge}
                onChange={(e) => setFormData({ ...formData, lodge: e.target.value })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando solicitud..." : "Enviar Solicitud"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
