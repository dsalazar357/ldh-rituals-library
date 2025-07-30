"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Upload, Users, LogOut, Menu, X, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/hooks/use-sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { state, toggle, isOpen, setIsOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Marcar como montado para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Si no está montado, no renderizar nada
  if (!isMounted) {
    return null
  }

  const isAdmin = user?.role === "admin"

  console.log("Sidebar - Usuario:", user?.name, "Rol:", user?.role, "Es Admin:", isAdmin)

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      console.log("Iniciando cierre de sesión desde sidebar")

      // Llamar a la API de cierre de sesión
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error al cerrar sesión:", data.error)
        throw new Error(data.error || "Error al cerrar sesión")
      }

      console.log("Sesión cerrada correctamente, redirigiendo...")

      // Redireccionar al login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Redirección de respaldo en caso de error
      window.location.href = "/login"
    } finally {
      setIsLoggingOut(false)
    }
  }

  const routes = [
    {
      label: "Panel de Control",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Rituales",
      icon: BookOpen,
      href: "/rituales",
      active: pathname === "/rituales" || pathname.startsWith("/rituales/"),
    },
    {
      label: "Subir Ritual",
      icon: Upload,
      href: "/rituales/nuevo",
      active: pathname === "/rituales/nuevo",
    },
  ]

  // Añadir rutas de administración si el usuario es admin
  if (isAdmin) {
    routes.push(
      {
        label: "Panel Admin",
        icon: Settings,
        href: "/admin",
        active: pathname === "/admin" || pathname.startsWith("/admin/"),
        adminOnly: true,
      },
      {
        label: "Usuarios",
        icon: Users,
        href: "/admin/usuarios",
        active: pathname === "/admin/usuarios" || pathname.startsWith("/admin/usuarios"),
        adminOnly: true,
      },
    )
  }

  return (
    <>
      {/* Botón de menú móvil */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-background border-r transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[70px]" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("p-4 flex items-center justify-between", isCollapsed && "justify-center")}>
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-bold">LDH Rituales</h2>
                <p className="text-xs text-muted-foreground">Biblioteca Digital</p>
              </div>
            )}
            {isCollapsed && <BookOpen className="h-6 w-6" />}

            {/* Botón para colapsar/expandir (solo en desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggle}
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <TooltipProvider delayDuration={0}>
              {routes.map((route) => (
                <div key={route.href}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                            route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                            isCollapsed && "justify-center px-2",
                            route.adminOnly && "border-l-2 border-orange-500",
                          )}
                        >
                          <route.icon className="h-5 w-5 flex-shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {route.label}
                        {route.adminOnly && " (Admin)"}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                        route.adminOnly && "border-l-2 border-orange-500",
                      )}
                    >
                      <route.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{route.label}</span>
                      {route.adminOnly && <span className="text-xs text-orange-600">(Admin)</span>}
                    </Link>
                  )}
                </div>
              ))}
            </TooltipProvider>
          </nav>

          <div className="p-2 border-t">
            <TooltipProvider delayDuration={0}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center px-2"
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Cerrar Sesión</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="ml-2">{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
                </Button>
              )}
            </TooltipProvider>
          </div>

          {/* Información del usuario */}
          {user && !isCollapsed && (
            <div className="p-4 border-t">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Grado: {user.degree}</p>
                <p className="text-xs text-muted-foreground">Rol: {user.role}</p>
                {isAdmin && <p className="text-xs text-orange-600 font-medium">👑 Administrador</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
