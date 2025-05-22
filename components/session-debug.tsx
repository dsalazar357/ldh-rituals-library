"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase-client"

export function SessionDebug() {
  const { user, session, isLoading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkSession = async () => {
    setIsChecking(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error al obtener sesión:", error)
      }
      setSessionData(data)
    } catch (error) {
      console.error("Error inesperado:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const refreshSession = async () => {
    setIsChecking(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error al refrescar sesión:", error)
      }
      setSessionData(data)
    } catch (error) {
      console.error("Error inesperado:", error)
    } finally {
      setIsChecking(false)
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
          </div>

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
