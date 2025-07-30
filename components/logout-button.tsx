"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase directo
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      // Cerrar sesión directamente con Supabase
      await supabase.auth.signOut()

      // Redirección directa
      window.location.href = "/login"
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
