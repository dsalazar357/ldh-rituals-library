"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-singleton"
import { useSetAtom } from "jotai"
import { userAtom, sessionAtom, isLoadingAtom } from "@/stores/authAtoms"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setUserAtom = useSetAtom(userAtom)
  const setSessionAtom = useSetAtom(sessionAtom)
  const setIsLoadingAtom = useSetAtom(isLoadingAtom)

  useEffect(() => {
    setUserAtom(user)
  }, [user, setUserAtom])

  useEffect(() => {
    setSessionAtom(session)
  }, [session, setSessionAtom])

  useEffect(() => {
    setIsLoadingAtom(isLoading)
  }, [isLoading, setIsLoadingAtom])

  const loadUserData = useCallback(async (userId: string, userEmail: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

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

  const refreshUserData = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const currentSession = sessionData.session

    if (!currentSession) return

    setSession(currentSession)
    const userData = await loadUserData(currentSession.user.id, currentSession.user.email || "")
    if (userData) setUser(userData)
  }, [loadUserData])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.session || !data.user) {
        console.error("Error al iniciar sesión:", error)
        return false
      }

      // Establecer cookies manualmente
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      setSession(data.session)

      const userData = await loadUserData(data.user.id, data.user.email || "")
      if (userData) setUser(userData)

      return true
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error)
      return false
    }
  }, [loadUserData])

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

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)
        await refreshUserData()
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [refreshUserData])

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    refreshUserData,
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
