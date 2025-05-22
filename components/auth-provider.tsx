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

  // Check if we're in a preview environment
  const isPreviewEnvironment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))

  // Only create the Supabase client if we're not in a preview environment
  const supabase = !isPreviewEnvironment ? createClient() : null

  // Function to get cookies
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        // Check for our custom auth cookies first
        const userRole = getCookie("user-role")
        const userEmail = getCookie("user-email")

        if (userRole === "admin" && userEmail === "admin@ldh.org") {
          console.log("Using custom auth for admin user")
          setUser({
            id: "admin-user-id",
            name: "Administrador",
            email: "admin@ldh.org",
            degree: 33,
            lodge: "Admin",
            role: "admin",
          })
          setSession({} as Session) // Mock session
          setIsLoading(false)
          return
        }

        // Fall back to Supabase Auth if not in preview environment
        if (!isPreviewEnvironment && supabase) {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error("Error getting session:", error)
            setIsLoading(false)
            return
          }

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
              setIsLoading(false)
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
          }
        }
      } catch (error) {
        console.error("Error in getSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener if not in preview environment
    let subscription: { unsubscribe: () => void } | null = null

    if (!isPreviewEnvironment && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email)

        // Check for our custom auth cookies first
        const userRole = getCookie("user-role")
        const userEmail = getCookie("user-email")

        if (userRole === "admin" && userEmail === "admin@ldh.org") {
          console.log("Using custom auth for admin user (from auth change)")
          setUser({
            id: "admin-user-id",
            name: "Administrador",
            email: "admin@ldh.org",
            degree: 33,
            lodge: "Admin",
            role: "admin",
          })
          setSession({} as Session) // Mock session
          setIsLoading(false)
          return
        }

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

      subscription = data.subscription
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase, isPreviewEnvironment])

  // Redirect based on auth state - but with less aggressive redirects
  useEffect(() => {
    if (isLoading) return

    const publicRoutes = ["/login", "/registro"]
    const isAuthRoute = publicRoutes.includes(pathname)

    // Only redirect away from auth routes if user is authenticated
    if (user && isAuthRoute) {
      router.push("/")
    }

    // Don't automatically redirect to login - let the middleware handle that
  }, [user, isLoading, pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      // In preview environment, use direct login
      if (isPreviewEnvironment && email === "admin@ldh.org" && password === "admin123") {
        // Set cookies directly
        document.cookie = "user-role=admin; path=/; max-age=3600"
        document.cookie = "user-email=admin@ldh.org; path=/; max-age=3600"
        document.cookie = "sb-access-token=mock-token; path=/; max-age=3600"

        // Redirect to dashboard
        window.location.href = "/"
        return true
      }

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
      // In preview environment, just return success
      if (isPreviewEnvironment) {
        return true
      }

      if (!supabase) {
        console.error("Supabase client not available")
        return false
      }

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
      // Clear our custom cookies
      document.cookie = "user-role=; path=/; max-age=0"
      document.cookie = "user-email=; path=/; max-age=0"
      document.cookie = "sb-access-token=; path=/; max-age=0"
      document.cookie = "sb-refresh-token=; path=/; max-age=0"

      // Also try Supabase signout if not in preview environment
      if (!isPreviewEnvironment && supabase) {
        await supabase.auth.signOut()
      }

      // Redirect to login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error signing out:", error)
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
