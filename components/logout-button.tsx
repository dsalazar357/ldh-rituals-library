"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase-client"

export function LogoutButton() {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setError(null)

    try {
      console.log("Iniciando cierre de sesión")

      // Método 1: Usar el método signOut del contexto de autenticación
      await signOut()

      // Si el método anterior no redirige, forzar redirección
      setTimeout(() => {
        window.location.href = "/login"
      }, 500)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      // Método 2: Intentar cerrar sesión directamente con Supabase
      try {
        await supabase.auth.signOut()
        window.location.href = "/login"
      } catch (e) {
        console.error("Error en método alternativo:", e)

        // Método 3: Forzar redirección en caso de error
        window.location.href = "/login"
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Método alternativo para depuración
  const forceLogout = async () => {
    try {
      // Limpiar todas las cookies relacionadas con Supabase
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      // Forzar redirección
      window.location.href = "/login"
    } catch (error) {
      console.error("Error en forceLogout:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleLogout} disabled={isLoggingOut} className="w-full md:w-auto">
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
      </Button>

      <Button onClick={forceLogout} variant="destructive" className="w-full md:w-auto mt-2">
        <LogOut className="mr-2 h-4 w-4" />
        Forzar Cierre de Sesión
      </Button>

      {error && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">Error: {error}</div>}
    </div>
  )
}
