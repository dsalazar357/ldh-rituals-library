"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase-singleton"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Verificar si ya hay una sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        console.log("Sesión existente encontrada, redirigiendo...")
        window.location.href = "/"
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email)
      const supabase = getSupabaseClient()

      // Iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error al iniciar sesión:", error.message)
        setError(`Error de autenticación: ${error.message}`)
        setIsLoading(false)
        return
      }

      if (data.session) {
        console.log("Sesión iniciada correctamente")
        setLoginSuccess(true)

        // Esperar un momento para que se establezcan las cookies
        setTimeout(() => {
          // Forzar recarga completa para asegurar que se apliquen las cookies
          window.location.href = "/"
        }, 1000)
      } else {
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error inesperado:", error)
      setError(`Error inesperado: ${error?.message || "Desconocido"}`)
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loginSuccess && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
            <AlertTitle>Inicio de sesión exitoso</AlertTitle>
            <AlertDescription>Redirigiendo al panel de control...</AlertDescription>
          </Alert>
        )}

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
              disabled={isLoading || loginSuccess}
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
              disabled={isLoading || loginSuccess}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || loginSuccess}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : loginSuccess ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/debug" className="text-sm text-blue-600 hover:underline">
            Herramientas de diagnóstico
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">Contacta con un administrador para solicitar acceso</p>
      </CardFooter>
    </Card>
  )
}
