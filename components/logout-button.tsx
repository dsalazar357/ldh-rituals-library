"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setError(null)

    try {
      console.log("Iniciando cierre de sesión desde botón alternativo")

      // Llamar a la API de cierre de sesión
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error al cerrar sesión:", data.error)
        setError(data.error || "Error al cerrar sesión")
        throw new Error(data.error || "Error al cerrar sesión")
      }

      console.log("Sesión cerrada correctamente, redirigiendo...")

      // Redireccionar al login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      // Esperar un momento antes de intentar la redirección de respaldo
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleLogout} disabled={isLoggingOut} className="w-full md:w-auto">
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión (Alternativo)"}
      </Button>

      {error && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">Error: {error}</div>}

      <div className="text-xs text-muted-foreground">
        Este botón utiliza un método alternativo para cerrar sesión. Úsalo si el botón principal no funciona.
      </div>
    </div>
  )
}
