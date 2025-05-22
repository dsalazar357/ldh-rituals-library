"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string, degree: number, lodge: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Crear el cliente de Supabase
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        console.log("Obteniendo sesión...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        console.log("Sesión obtenida:", session ? "Sí" : "No")
        setSession(session)

        if (session) {
          // Get user profile
          console.log("Obteniendo perfil de usuario para:", session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            console.error("Error getting user profile:", profileError)
            setIsLoading(false)
            return
          }

          if (profile) {
            console.log("Perfil de usuario obtenido:", profile.name)
            setUser({
              id: profile.id,
              name: profile.name,
              email: session.user.email!,
              degree: profile.degree,
              lodge: profile.lodge || undefined,
              role: profile.role,
            })
          } else {
            console.error("No se encontró el perfil de usuario para:", session.user.id)
          }
        }
      } catch (error) {
        console.error("Error in getSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setSession(session)

      if (session) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Error getting user profile:", profileError)
          return
        }

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: session.user.email!,
            degree: profile.degree,
            lodge: profile.lodge || undefined,
            role: profile.role,
          })
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    const subscription = data.subscription

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Redirect based on auth state - but with less aggressive redirects
  useEffect(() => {
    if (isLoading) return

    const publicRoutes = ["/login", "/registro"]
    const isAuthRoute = publicRoutes.includes(pathname)

    // Only redirect away from auth routes if user is authenticated
    if (user && isAuthRoute) {
      router.push("/")
    }

    // Redirect to login if not authenticated and not on an auth route
    if (!user && !isAuthRoute && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      // Use our direct login API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Login error:", data.error)
        return false
      }

      // Refresh the page to update the auth state
      window.location.href = "/"
      return true
    } catch (error) {
      console.error("Error in signIn:", error)
      return false
    }
  }

  const signUp = async (email: string, password: string, name: string, degree: number, lodge: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            degree,
            lodge,
          },
        },
      })

      if (error) {
        console.error("Error signing up:", error.message)
        return false
      }

      // If signUp is successful but email confirmation is required
      if (data.user && !data.session) {
        return true
      }

      // If signUp is successful and session is created immediately
      return !!data.session
    } catch (error) {
      console.error("Error in signUp:", error)
      return false
    }
  }

  const signOut = async () => {
    try {
      console.log("Iniciando proceso de cierre de sesión")

      // Primero, limpia el estado local
      setUser(null)
      setSession(null)

      // Luego, cierra sesión en Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error al cerrar sesión en Supabase:", error)
        throw error
      }

      console.log("Sesión cerrada correctamente, redirigiendo...")

      // Usar window.location.href para forzar una recarga completa y asegurar
      // que todas las cookies y el estado de autenticación se limpien correctamente
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Forzar redirección en caso de error
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
