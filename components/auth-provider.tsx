"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-singleton"

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
  const initializedRef = useRef(false)
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // Memoizar la función signOut para evitar re-renders
  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      window.location.href = "/login"
    }
  }, [])

  // Función para cargar datos del usuario
  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: userData, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error || !userData) {
        console.error("Error al cargar datos del usuario:", error)
        return null
      }

      return {
        id: userData.id,
        name: userData.name,
        email: userEmail,
        degree: userData.degree,
        lodge: userData.lodge || undefined,
        role: userData.role,
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      return null
    }
  }, [])

  // Efecto para inicializar la autenticación (solo se ejecuta una vez)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        // Obtener sesión actual
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData.session) {
          setSession(sessionData.session)
          const userData = await loadUserData(sessionData.session.user.id, sessionData.session.user.email || "")
          setUser(userData)
        }

        // Suscribirse a cambios de autenticación
        const { data } = supabase.auth.onAuthStateChange(async (event, _session) => {
          console.log("Evento de autenticación:", event)

          if (event === "SIGNED_IN" && _session) {
            setSession(_session)
            const userData = await loadUserData(_session.user.id, _session.user.email || "")
            setUser(userData)
          } else if (event === "SIGNED_OUT") {
            setUser(null)
            setSession(null)
          }
        })

        // Guardar la suscripción para limpiarla después
        authSubscriptionRef.current = data.subscription
      } catch (error) {
        console.error("Error al inicializar autenticación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Limpiar suscripción al desmontar
    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe()
      }
    }
  }, [loadUserData])

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
