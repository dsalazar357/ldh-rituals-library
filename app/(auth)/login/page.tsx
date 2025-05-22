"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("admin@ldh.org")
  const [password, setPassword] = useState("admin123")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Check if we're in a preview environment
  const isPreviewEnvironment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setDebugInfo(null)

    try {
      // In preview environment, use direct login
      if (isPreviewEnvironment && email === "admin@ldh.org" && password === "admin123") {
        console.log("Using direct login for preview environment")
        loginDirectly()
        return
      }

      // Use our direct login API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Login error:", data.error)
        setError(`Error de autenticación: ${data.error}`)
        setDebugInfo(data)
        setIsLoading(false)
        return
      }

      console.log("Login successful, redirecting...")
      setDebugInfo(data)

      // Refresh the page to update the auth state
      window.location.href = "/"
    } catch (error: any) {
      console.error("Error:", error)
      setError(`Ocurrió un error inesperado: ${error?.message || "Unknown error"}`)
      setDebugInfo({ unexpectedError: error })
    } finally {
      setIsLoading(false)
    }
  }

  const createAdminAccount = async () => {
    try {
      setIsLoading(true)
      setError("")
      setDebugInfo(null)

      // In preview environment, just use direct login
      if (isPreviewEnvironment) {
        console.log("Using direct login for preview environment")
        loginDirectly()
        return
      }

      const response = await fetch("/api/seed-admin")
      const data = await response.json()

      if (data.error) {
        setError(`Error al crear cuenta de administrador: ${data.error}`)
        setDebugInfo(data)
      } else {
        setDebugInfo(data)
        alert("Cuenta de administrador creada con éxito. Intenta iniciar sesión ahora.")
      }
    } catch (error: any) {
      console.error("Error creating admin account:", error)
      setError(`Error al crear cuenta de administrador: ${error?.message || "Unknown error"}`)
      setDebugInfo({ unexpectedError: error })
    } finally {
      setIsLoading(false)
    }
  }

  const loginDirectly = () => {
    // Set cookies directly
    document.cookie = "user-role=admin; path=/; max-age=3600"
    document.cookie = "user-email=admin@ldh.org; path=/; max-age=3600"
    document.cookie = "sb-access-token=mock-token; path=/; max-age=3600"

    // Redirect to dashboard
    window.location.href = "/"
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a la biblioteca de rituales</CardDescription>
      </CardHeader>
      <CardContent>
        {isPreviewEnvironment && (
          <Alert className="mb-4">
            <AlertTitle>Modo de vista previa</AlertTitle>
            <AlertDescription>
              Estás en un entorno de vista previa. Usa el botón "Acceso directo" para iniciar sesión como administrador.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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

        <div className="mt-4 pt-4 border-t space-y-4">
          {!isPreviewEnvironment && (
            <Button variant="outline" className="w-full" onClick={createAdminAccount} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear cuenta de administrador"
              )}
            </Button>
          )}

          <Button variant="secondary" className="w-full" onClick={loginDirectly} disabled={isLoading}>
            Acceso directo (modo desarrollo)
          </Button>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isPreviewEnvironment
              ? "Usa el botón de acceso directo para entrar como administrador"
              : "Si es la primera vez que accedes, crea la cuenta de administrador"}
          </p>
        </div>

        {debugInfo && (
          <div className="mt-4 p-2 bg-muted rounded-md">
            <p className="text-xs font-mono overflow-auto max-h-32">{JSON.stringify(debugInfo, null, 2)}</p>
          </div>
        )}
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
