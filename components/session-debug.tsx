"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase para verificaciones
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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

  const forceReload = () => {
    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depuración de Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={checkSession} disabled={isChecking}>
              Verificar Sesión
            </Button>
            <Button onClick={refreshSession} disabled={isChecking}>
              Refrescar Sesión
            </Button>
            <Button onClick={forceReload} variant="outline">
              Recargar Página
            </Button>
          </div>

          {statusMessage && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {statusMessage}
            </div>
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
