"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Upload, Users, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const isAdmin = user?.role === "admin"

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
      active: pathname === "/rituales",
    },
    {
      label: "Subir Ritual",
      icon: Upload,
      href: "/rituales/nuevo",
      active: pathname === "/rituales/nuevo",
    },
    ...(isAdmin
      ? [
          {
            label: "Usuarios",
            icon: Users,
            href: "/admin/usuarios",
            active: pathname === "/admin/usuarios",
          },
        ]
      : []),
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold">LDH Rituales</h2>
            <p className="text-sm text-muted-foreground">Biblioteca Digital</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
