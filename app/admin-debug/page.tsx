"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function AdminDebugPage() {
  const { user, session } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [message, setMessage] = useState("")

  // Asegurarnos de que el componente está montado antes de renderizar
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Si no está montado, mostrar un mensaje de carga
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

  const makeAdmin = async () => {
    if (!user?.id) return

    try {
      setMessage("Actualizando rol a admin...")

      // Llamar a la API para actualizar el rol
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el rol")
      }

      setMessage("¡Usuario actualizado a admin! Recarga la página para ver los cambios.")
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="font-medium mb-2">Estado de Usuario:</h3>
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
                <strong>¿Es Admin?</strong> {user?.role === "admin" ? "Sí" : "No"}
              </p>
            </div>

            {message && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p>{message}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={makeAdmin} disabled={user?.role === "admin"}>
                Hacer Admin
              </Button>
              <Button onClick={() => (window.location.href = "/admin")} variant="outline">
                Ir a Panel Admin
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Recargar Página
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
