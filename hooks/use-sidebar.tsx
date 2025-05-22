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

// Valores por defecto para el contexto
const defaultContextValue: SidebarContextType = {
  state: "expanded",
  toggle: () => {},
  isOpen: false,
  setIsOpen: () => {},
}

const SidebarContext = createContext<SidebarContextType>(defaultContextValue)

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

  // Usar valores por defecto durante el prerendering
  const contextValue = isMounted ? { state, toggle, isOpen, setIsOpen } : defaultContextValue

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  return useContext(SidebarContext)
}
