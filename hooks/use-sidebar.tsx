"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type SidebarState = "expanded" | "collapsed"

interface SidebarContextType {
  state: SidebarState
  toggle: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SidebarState>("expanded")
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Marcar como montado para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Detectar si estamos en móvil al cargar
  useEffect(() => {
    if (!isMounted) return

    const checkIsMobile = () => {
      return window.innerWidth < 768
    }

    if (checkIsMobile()) {
      setState("collapsed")
    }

    const handleResize = () => {
      if (checkIsMobile()) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMounted])

  // Guardar preferencia en localStorage
  useEffect(() => {
    if (!isMounted) return

    try {
      localStorage.setItem("sidebar-state", state)
    } catch (error) {
      console.error("Error al guardar estado del sidebar:", error)
    }
  }, [state, isMounted])

  // Cargar preferencia de localStorage
  useEffect(() => {
    if (!isMounted) return

    try {
      const savedState = localStorage.getItem("sidebar-state") as SidebarState | null
      if (savedState && (savedState === "expanded" || savedState === "collapsed")) {
        setState(savedState)
      }
    } catch (error) {
      console.error("Error al cargar estado del sidebar:", error)
    }
  }, [isMounted])

  const toggle = () => {
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"))
  }

  return <SidebarContext.Provider value={{ state, toggle, isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
