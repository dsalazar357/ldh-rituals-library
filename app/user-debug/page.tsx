"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function UserDebugPage() {
  const { user, session } = useAuth()
  const [userFromDb, setUserFromDb] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchUserFromDb = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}`)
      const data = await response.json()
      setUserFromDb(data.user)
    } catch (error) {
      console.error("Error fetching user from DB:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "admin",
        }),
      })
      const data = await response.json()
      console.log("Usuario actualizado:", data)
      alert("Rol actualizado a admin. Recarga la página.")
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Depuración de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="font-medium mb-2">Usuario desde AuthProvider:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
              <h3 className="font-medium mb-2">Sesión:</h3>
              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(session, null, 2)}</pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={fetchUserFromDb} disabled={loading}>
                Obtener Usuario de DB
              </Button>
              <Button onClick={updateUserRole} disabled={loading} variant="outline">
                Hacer Admin
              </Button>
            </div>

            {userFromDb && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <h3 className="font-medium mb-2">Usuario desde Base de Datos:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(userFromDb, null, 2)}</pre>
              </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-md">
              <h3 className="font-medium mb-2">Verificaciones:</h3>
              <ul className="text-sm space-y-1">
                <li>✓ Usuario cargado: {user ? "Sí" : "No"}</li>
                <li>✓ Rol actual: {user?.role || "No definido"}</li>
                <li>✓ Es admin: {user?.role === "admin" ? "Sí" : "No"}</li>
                <li>✓ ID de usuario: {user?.id || "No disponible"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
