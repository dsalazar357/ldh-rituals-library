"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SessionDebug() {
  const { user, session, isLoading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const checkSession = async () => {
    setIsChecking(true)
    setStatusMessage("Verificando sesión...")
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error al obtener sesión:", error)
        setStatusMessage(`Error: ${error.message}`)
      } else {
        setSessionData(data)
        setStatusMessage(data.session ? "Sesión activa encontrada" : "No hay sesión activa")
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setStatusMessage(`Error inesperado: ${error instanceof Error ? error.message : "Desconocido"}`)
    } finally {
      setIsChecking(false)
    }
  }

  const refreshSession = async () => {
    setIsChecking(true)
    setStatusMessage("Refrescando sesión...")
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error al refrescar sesión:", error)
        setStatusMessage(`Error: ${error.message}`)
      } else {
        setSessionData(data)
        setStatusMessage(data.session ? "Sesión refrescada correctamente" : "No se pudo refrescar la sesión")
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setStatusMessage(`Error inesperado: ${error instanceof Error ? error.message : "Desconocido"}`)
    } finally {
      setIsChecking(false)
    }
  }

  const clearCookies = () => {
    try {
      // Limpiar todas las cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      setStatusMessage("Cookies limpiadas. Recarga la página para ver los cambios.")
    } catch (error) {
      console.error("Error al limpiar cookies:", error)
      setStatusMessage(`Error al limpiar cookies: ${error instanceof Error ? error.message : "Desconocido"}`)
    }
  }

  const listCookies = () => {
    try {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
      console.log("Cookies actuales:", cookies)
      setStatusMessage(`${cookies.length} cookies encontradas. Ver consola para detalles.`)
    } catch (error) {
      console.error("Error al listar cookies:", error)
      setStatusMessage(`Error al listar cookies: ${error instanceof Error ? error.message : "Desconocido"}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depuración de Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={checkSession} disabled={isChecking}>
              Verificar Sesión
            </Button>
            <Button onClick={refreshSession} disabled={isChecking}>
              Refrescar Sesión
            </Button>
            <Button onClick={listCookies} variant="outline">
              Listar Cookies
            </Button>
            <Button onClick={clearCookies} variant="destructive">
              Limpiar Cookies
            </Button>
          </div>

          {statusMessage && (
            <Alert>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Estado de Autenticación:</h3>
            <div className="rounded bg-muted p-2 text-xs">
              <p>Cargando: {isLoading ? "Sí" : "No"}</p>
              <p>Usuario autenticado: {user ? "Sí" : "No"}</p>
              <p>Sesión activa: {session ? "Sí" : "No"}</p>
              {user && (
                <>
                  <p>ID: {user.id}</p>
                  <p>Nombre: {user.name}</p>
                  <p>Email: {user.email}</p>
                  <p>Rol: {user.role}</p>
                </>
              )}
              {session && (
                <>
                  <p className="mt-2 font-medium">Información de sesión:</p>
                  <p>ID de sesión: {session.access_token.substring(0, 10)}...</p>
                  <p>Expira: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>

          {sessionData && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Datos de Sesión:</h3>
              <pre className="rounded bg-muted p-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
