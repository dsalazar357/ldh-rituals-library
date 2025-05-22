"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"

// Cliente de Supabase directo
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario al inicio
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)

        // Obtener sesión actual
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          console.log("No hay sesión activa")
          setUser(null)
          setSession(null)
          setIsLoading(false)
          return
        }

        setSession(sessionData.session)

        // Obtener datos del usuario
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single()

        if (error || !userData) {
          console.error("Error al cargar datos del usuario:", error)
          setUser(null)
          setIsLoading(false)
          return
        }

        // Establecer el usuario
        setUser({
          id: userData.id,
          name: userData.name,
          email: sessionData.session.user.email || "",
          degree: userData.degree,
          lodge: userData.lodge || undefined,
          role: userData.role,
        })
      } catch (error) {
        console.error("Error al verificar sesión:", error)
        setUser(null)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      console.log("Evento de autenticación:", event)

      if (event === "SIGNED_IN" && _session) {
        // Actualizar sesión
        setSession(_session)

        // Obtener datos del usuario
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", _session.user.id).single()

        if (!error && userData) {
          setUser({
            id: userData.id,
            name: userData.name,
            email: _session.user.email || "",
            degree: userData.degree,
            lodge: userData.lodge || undefined,
            role: userData.role,
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Cerrar sesión
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    session,
    isLoading,
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
