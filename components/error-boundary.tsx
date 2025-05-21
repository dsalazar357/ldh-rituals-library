"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Error capturado por ErrorBoundary:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded mb-6 text-left overflow-auto max-h-40">
              <p className="text-sm text-red-800 dark:text-red-300 font-mono">{error.toString()}</p>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()}>Recargar página</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/login")}>
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
