"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"

// Crear cliente de Supabase directamente aquí para evitar problemas de importación
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar el usuario
  const loadUser = async () => {
    try {
      setIsLoading(true)

      // Obtener sesión actual
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      // Si no hay sesión, limpiar estado y terminar
      if (!currentSession) {
        setUser(null)
        setSession(null)
        return
      }

      // Guardar la sesión
      setSession(currentSession)

      // Obtener datos del usuario
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentSession.user.id)
        .single()

      if (error || !userData) {
        console.error("Error al cargar datos del usuario:", error)
        setUser(null)
        return
      }

      // Establecer el usuario
      setUser({
        id: userData.id,
        name: userData.name,
        email: currentSession.user.email || "",
        degree: userData.degree,
        lodge: userData.lodge || undefined,
        role: userData.role,
      })
    } catch (error) {
      console.error("Error al cargar usuario:", error)
      setUser(null)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar usuario al inicio
  useEffect(() => {
    loadUser()

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      console.log("Evento de autenticación:", event)

      // Recargar usuario en cualquier cambio de autenticación
      await loadUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error al iniciar sesión:", error)
        return false
      }

      // Recargar usuario después de iniciar sesión
      await loadUser()
      return true
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error)
      return false
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    try {
      // Primero limpiar estado local
      setUser(null)
      setSession(null)

      // Luego cerrar sesión en Supabase
      await supabase.auth.signOut()

      // Forzar redirección
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // En caso de error, forzar redirección de todos modos
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
