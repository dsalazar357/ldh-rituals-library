"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase-singleton"
import { useAuth } from "@/hooks/use-auth"

export default function AuthDebugPage() {
  const { user, session, isLoading: authLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cookieInfo, setCookieInfo] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Asegurarnos de que el componente solo se ejecute en el cliente
  useEffect(() => {
    setIsMounted(true)
    checkSession()
    // Obtener información de cookies
    if (typeof document !== "undefined") {
      setCookieInfo(document.cookie.split(";").map((c) => c.trim()))
    }
  }, [])

  // Si no está montado, no renderizar nada que dependa de hooks del cliente
  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Cargando diagnóstico...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Inicializando herramientas de diagnóstico...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión")
    }
  }

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    alert("Cookies eliminadas. Recarga la página para ver los cambios.")
    window.location.reload()
  }

  const forceRedirect = (path: string) => {
    window.location.href = path
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        setError(`Error al refrescar sesión: ${error.message}`)
      } else {
        setSessionInfo(data)
        alert("Sesión refrescada correctamente")
      }
    } catch (err: any) {
      setError(err.message || "Error al refrescar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={checkSession} disabled={loading}>
                {loading ? "Verificando..." : "Verificar Sesión"}
              </Button>
              <Button onClick={refreshSession} variant="outline" disabled={loading}>
                Refrescar Sesión
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

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="font-medium mb-2">Estado de AuthProvider:</h3>
              <p>
                <strong>Cargando:</strong> {authLoading ? "Sí" : "No"}
              </p>
              <p>
                <strong>Usuario:</strong> {user ? user.name : "No autenticado"}
              </p>
              <p>
                <strong>Email:</strong> {user ? user.email : "N/A"}
              </p>
              <p>
                <strong>Rol:</strong> {user ? user.role : "N/A"}
              </p>
              <p>
                <strong>Sesión activa:</strong> {session ? "Sí" : "No"}
              </p>
              {session && (
                <p>
                  <strong>Expira:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}
                </p>
              )}
            </div>

            {sessionInfo && (
              <div>
                <h3 className="font-medium mb-2">Información de sesión (getSession):</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs">{JSON.stringify(sessionInfo, null, 2)}</pre>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Cookies ({cookieInfo.length}):</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-40">
                {cookieInfo.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {cookieInfo.map((cookie, index) => (
                      <li key={index}>{cookie}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs">No hay cookies</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Redirección manual:</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => forceRedirect("/")}>Ir al Dashboard (forzado)</Button>
                <Button onClick={() => forceRedirect("/login")} variant="outline">
                  Ir a Login (forzado)
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <h3 className="font-medium mb-2">Estado de navegación:</h3>
              <p>
                <strong>URL actual:</strong> {typeof window !== "undefined" ? window.location.href : "No disponible"}
              </p>
              <p>
                <strong>Ruta:</strong> {typeof window !== "undefined" ? window.location.pathname : "No disponible"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
