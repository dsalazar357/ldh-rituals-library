"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Función para obtener el usuario actual
    const getUser = async () => {
      try {
        setIsLoading(true)

        // Obtener la sesión actual
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)

        if (currentSession) {
          console.log("Sesión encontrada:", currentSession.user.email)

          // Obtener el perfil del usuario
          const { data: profile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentSession.user.id)
            .single()

          if (error) {
            console.error("Error al obtener perfil:", error)
            setUser(null)
            return
          }

          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: currentSession.user.email || "",
              degree: profile.degree,
              lodge: profile.lodge || undefined,
              role: profile.role,
            })
            console.log("Usuario cargado:", profile.name)
          } else {
            setUser(null)
          }
        } else {
          console.log("No hay sesión activa")
          setUser(null)
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Obtener usuario inicial
    getUser()

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Cambio de estado de autenticación:", event)

      setSession(newSession)

      if (newSession) {
        // Obtener el perfil del usuario
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", newSession.user.id).single()

        if (error) {
          console.error("Error al obtener perfil:", error)
          setUser(null)
          return
        }

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: newSession.user.email || "",
            degree: profile.degree,
            lodge: profile.lodge || undefined,
            role: profile.role,
          })
        } else {
          setUser(null)
        }
      } else {
        // IMPORTANTE: Limpiar el estado del usuario cuando no hay sesión
        setUser(null)
      }
    })

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error al iniciar sesión:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error)
      return false
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      console.log("Cerrando sesión...")

      // Limpiar el estado del usuario antes de cerrar sesión
      setUser(null)
      setSession(null)

      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error al cerrar sesión en Supabase:", error)
      } else {
        console.log("Sesión cerrada correctamente en Supabase")
      }

      // Forzar redirección al login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // En caso de error, intentar redirección forzada
      window.location.href = "/login"
    }
  }

  return <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
