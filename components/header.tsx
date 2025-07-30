"use client"

import { MoonIcon, SunIcon, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function Header() {
  const { setTheme } = useTheme()
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { state, setIsOpen } = useSidebar()
  const [isOpen, setIsOpenLocal] = useState(false) // Local state for the menu button
  const isCollapsed = state === "collapsed"

  // Asegurarnos de que el componente está montado antes de renderizar
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Si no está montado, mostrar una versión simplificada
  if (!isMounted) {
    return (
      <header className="fixed top-0 right-0 z-30 border-b bg-background h-16 flex items-center left-0 md:left-64">
        <div className="flex-1" />
        <div className="flex items-center gap-4 px-4">
          <Button variant="outline" size="icon">
            <SunIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 border-b bg-background h-16 flex items-center transition-all duration-300",
        isCollapsed ? "left-[70px]" : "left-0 md:left-64",
      )}
    >
      <div className="flex items-center px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log("Botón de menú móvil clickeado")
            setIsOpen(!isOpen)
            setIsOpen(true)
          }}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4 px-4">
        {user && (
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {user.name} | Grado: {user.degree}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
