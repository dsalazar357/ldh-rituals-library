"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase-singleton"

export default function AuthDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(error.message)
      } else {
        setSessionInfo(data)
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const clearSession = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      setSessionInfo(null)
      // No redirigir, solo actualizar el estado
      checkSession()
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión")
    }
  }

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    alert("Cookies eliminadas. Recarga la página para ver los cambios.")
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkSession} disabled={loading}>
                {loading ? "Verificando..." : "Verificar Sesión"}
              </Button>
              <Button onClick={clearSession} variant="outline">
                Cerrar Sesión
              </Button>
              <Button onClick={clearAllCookies} variant="destructive">
                Eliminar Cookies
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
                <h3 className="font-medium mb-1">Error:</h3>
                <p>{error}</p>
              </div>
            )}

            {sessionInfo && (
              <div>
                <h3 className="font-medium mb-2">Información de sesión:</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs">{JSON.stringify(sessionInfo, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-medium mb-2">Enlaces rápidos:</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                  Ir al Dashboard
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/login")}>
                  Ir a Login
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/debug")}>
                  Ir a Debug
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
