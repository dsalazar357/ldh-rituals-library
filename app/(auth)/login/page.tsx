"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email)

      const success = await signIn(email, password)

      if (success) {
        console.log("Sesión iniciada correctamente")
        setLoginSuccess(true)
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error inesperado:", error)
      setError(`Error inesperado: ${error?.message || "Desconocido"}`)
      setIsLoading(false)
    }
  }

  useEffect( () => {
    if(loginSuccess) router.push("/")
  }, [loginSuccess]);

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
          <Link href="/auth-debug" className="text-sm text-blue-600 hover:underline">
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
