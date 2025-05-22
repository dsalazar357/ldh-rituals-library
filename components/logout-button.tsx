"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function LogoutButton() {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await signOut()
      // La redirección se maneja en signOut
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Forzar redirección en caso de error
      window.location.href = "/login"
    }
  }

  const forceLogout = () => {
    // Limpiar todas las cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Redireccionar
    window.location.href = "/login"
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleLogout} disabled={isLoggingOut} className="w-full">
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
      </Button>

      <Button onClick={forceLogout} variant="destructive" className="w-full">
        <LogOut className="mr-2 h-4 w-4" />
        Forzar Cierre (Emergencia)
      </Button>
    </div>
  )
}
