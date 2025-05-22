"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"

// Valores de configuración visibles para depuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "URL no disponible"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
  : "KEY no disponible"

// Cliente de Supabase para pruebas
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DebugPage() {
  const [email, setEmail] = useState("admin@ldh.org")
  const [password, setPassword] = useState("admin123")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  // Verificar variables de entorno al cargar
  useEffect(() => {
    const vars: Record<string, string> = {}

    // Listar todas las variables de entorno públicas
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        vars[key] = process.env[key] || "no disponible"
      }
    })

    setEnvVars(vars)
  }, [])

  // Probar conexión básica a Supabase
  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Intenta una operación simple
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        setError(`Error de conexión: ${error.message}`)
      } else {
        setResult({ message: "Conexión exitosa a Supabase", data })
      }
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || "Desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Probar inicio de sesión
  const testLogin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(`Error de autenticación: ${error.message}`)
      } else {
        setResult({
          message: "Autenticación exitosa",
          user: data.user,
          session: {
            ...data.session,
            access_token: data.session?.access_token ? `${data.session.access_token.substring(0, 10)}...` : null,
            refresh_token: data.session?.refresh_token ? `${data.session.refresh_token.substring(0, 10)}...` : null,
          },
        })
      }
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || "Desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Verificar sesión actual
  const checkSession = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(`Error al verificar sesión: ${error.message}`)
      } else {
        setResult({
          message: data.session ? "Sesión activa encontrada" : "No hay sesión activa",
          session: data.session
            ? {
                ...data.session,
                access_token: data.session?.access_token ? `${data.session.access_token.substring(0, 10)}...` : null,
                refresh_token: data.session?.refresh_token ? `${data.session.refresh_token.substring(0, 10)}...` : null,
              }
            : null,
        })
      }
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || "Desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Cerrar sesión
  const testLogout = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(`Error al cerrar sesión: ${error.message}`)
      } else {
        setResult({ message: "Sesión cerrada correctamente" })
      }
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || "Desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Limpiar cookies manualmente
  const clearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    setResult({ message: "Cookies eliminadas manualmente" })
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <h3 className="font-medium mb-2">Configuración de Supabase:</h3>
              <p>
                <strong>URL:</strong> {SUPABASE_URL}
              </p>
              <p>
                <strong>ANON KEY:</strong> {SUPABASE_ANON_KEY}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={testConnection} disabled={loading}>
                Probar Conexión
              </Button>
              <Button onClick={checkSession} disabled={loading}>
                Verificar Sesión
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Prueba de Inicio de Sesión:</h3>
              <div className="space-y-2 mb-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testLogin} disabled={loading}>
                  Probar Login
                </Button>
                <Button onClick={testLogout} disabled={loading} variant="outline">
                  Probar Logout
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Acciones de Emergencia:</h3>
              <Button onClick={clearCookies} variant="destructive">
                Limpiar Todas las Cookies
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
                <h3 className="font-medium mb-1">Error:</h3>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md">
                <h3 className="font-medium mb-1">Resultado:</h3>
                <p>{result.message}</p>
                {result.data && (
                  <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-black/10 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                {result.user && (
                  <div className="mt-2">
                    <h4 className="font-medium">Usuario:</h4>
                    <pre className="text-xs overflow-auto max-h-40 p-2 bg-black/10 rounded">
                      {JSON.stringify(result.user, null, 2)}
                    </pre>
                  </div>
                )}
                {result.session && (
                  <div className="mt-2">
                    <h4 className="font-medium">Sesión:</h4>
                    <pre className="text-xs overflow-auto max-h-40 p-2 bg-black/10 rounded">
                      {JSON.stringify(result.session, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-60 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
