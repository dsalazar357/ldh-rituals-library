"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase-singleton"

export default function AdminDebugPage() {
  const { user, session } = useAuth()
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchUserFromDb() {
      if (!user?.id) return

      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error al obtener usuario de la base de datos:", error)
          return
        }

        setDbUser(data)
      } catch (error) {
        console.error("Error al consultar la base de datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserFromDb()
  }, [user?.id])

  const makeAdmin = async () => {
    if (!user?.id) return

    try {
      setUpdating(true)
      setMessage("")
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("users").update({ role: "admin" }).eq("id", user.id)

      if (error) {
        setMessage(`Error al actualizar: ${error.message}`)
        return
      }

      // Actualizar el usuario en la base de datos local
      setDbUser({ ...dbUser, role: "admin" })
      setMessage("¡Usuario actualizado a admin! Recarga la página para ver los cambios.")
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const testAdminAccess = () => {
    window.location.href = "/admin"
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Depuración de Acceso Admin</CardTitle>
          <CardDescription>Verifica el estado de tu usuario y los permisos de administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estado de Autenticación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Usuario desde AuthProvider</h4>
                {user ? (
                  <pre className="text-xs overflow-auto p-2 bg-background rounded">{JSON.stringify(user, null, 2)}</pre>
                ) : (
                  <p className="text-red-500">No hay usuario autenticado</p>
                )}
              </div>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Usuario desde Base de Datos</h4>
                {loading ? (
                  <p>Cargando...</p>
                ) : dbUser ? (
                  <pre className="text-xs overflow-auto p-2 bg-background rounded">
                    {JSON.stringify(dbUser, null, 2)}
                  </pre>
                ) : (
                  <p className="text-red-500">No se encontró el usuario en la base de datos</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Verificación de Rol</h3>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Estado del Rol</h4>
              {user ? (
                <div className="space-y-2">
                  <p>
                    Rol en AuthProvider: <span className="font-bold">{user.role || "No definido"}</span>
                  </p>
                  <p>
                    Rol en Base de Datos: <span className="font-bold">{dbUser?.role || "No definido"}</span>
                  </p>
                  <p>
                    ¿Es Admin? <span className="font-bold">{user.role === "admin" ? "SÍ" : "NO"}</span>
                  </p>
                </div>
              ) : (
                <p className="text-red-500">No hay usuario autenticado</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sesión Actual</h3>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Datos de Sesión</h4>
              {session ? (
                <div>
                  <p>ID de Usuario: {session.user.id}</p>
                  <p>Email: {session.user.email}</p>
                  <p>Expira: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-red-500">No hay sesión activa</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {message && (
            <div
              className={`p-3 rounded-md w-full ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
            >
              {message}
            </div>
          )}
          <div className="flex flex-wrap gap-4 w-full">
            <Button onClick={makeAdmin} disabled={updating || user?.role === "admin"}>
              {updating ? "Actualizando..." : "Hacer Admin"}
            </Button>
            <Button variant="outline" onClick={testAdminAccess}>
              Probar Acceso Admin
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recargar Página
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
