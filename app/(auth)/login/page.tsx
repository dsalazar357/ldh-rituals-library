"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email, password)

      // Lista de usuarios válidos
      const validUsers = [
        {
          email: "admin@ldh.org",
          password: "admin123",
          name: "Administrador",
          degree: 33,
          role: "admin",
        },
        {
          email: "logia.lucerodelalba@gmail.com",
          password: "MorningStar357***",
          name: "Lucero del Alba",
          degree: 33,
          role: "admin",
        },
        {
          email: "user1@ldh.org",
          password: "user123",
          name: "Usuario Grado 1",
          degree: 1,
          role: "user",
        },
      ]

      // Buscar usuario que coincida
      const user = validUsers.find((u) => u.email === email && u.password === password)

      if (user) {
        console.log("Usuario encontrado:", user.name)

        // Guardar usuario en localStorage
        const { password, ...userInfo } = user
        localStorage.setItem("user", JSON.stringify(userInfo))

        // Redirigir al dashboard
        router.push("/")
      } else {
        console.log("Credenciales incorrectas")
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Ocurrió un error. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a la biblioteca de rituales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/registro" className="text-primary hover:underline">
            Solicitar acceso
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
