"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

// Cliente de Supabase directo
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDebugInfo(null)
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email)

      // Iniciar sesión directamente con Supabase
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
        console.log("Sesión iniciada correctamente, redirigiendo...")
        setDebugInfo(
          JSON.stringify({
            user_id: data.user?.id,
            session_expires_at: data.session.expires_at,
            has_access_token: !!data.session.access_token,
          }),
        )

        // Pequeña pausa para mostrar el mensaje de éxito
        setTimeout(() => {
          // Redirección directa sin usar router
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

        {debugInfo && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
            <AlertTitle>Inicio de sesión exitoso</AlertTitle>
            <AlertDescription>Redirigiendo al panel de control...</AlertDescription>
            <pre className="mt-2 text-xs overflow-auto max-h-20 p-2 bg-black/10 rounded">{debugInfo}</pre>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
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
