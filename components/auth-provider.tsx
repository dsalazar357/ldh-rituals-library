"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
})

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Marcar como montado para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Verificar si hay un usuario en localStorage
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isMounted])

  useEffect(() => {
    if (!isLoading && isMounted) {
      // Redirigir a login si no está autenticado
      const publicRoutes = ["/login", "/registro"]
      if (!user && !publicRoutes.includes(pathname)) {
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router, isMounted])

  const signOut = () => {
    if (!isMounted) return

    setUser(null)
    try {
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
    router.push("/login")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>
}
