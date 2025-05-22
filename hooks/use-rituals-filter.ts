"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface RitualsFilters {
  organizeBy: string
  degree?: number
  ritualSystem?: string
  language?: string
}

export function useRitualsFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initializedRef = useRef(false)

  // Inicializar con valores por defecto
  const [filters, setFiltersState] = useState<RitualsFilters>({
    organizeBy: "degree",
    degree: undefined,
    ritualSystem: undefined,
    language: undefined,
  })

  // Actualizar los filtros cuando cambian los searchParams (solo una vez al inicio)
  useEffect(() => {
    if (!initializedRef.current && searchParams) {
      initializedRef.current = true
      setFiltersState({
        organizeBy: searchParams.get("organizeBy") || "degree",
        degree: searchParams.get("degree") ? Number.parseInt(searchParams.get("degree") as string) : undefined,
        ritualSystem: searchParams.get("ritualSystem") || undefined,
        language: searchParams.get("language") || undefined,
      })
    }
  }, [searchParams])

  // Función para actualizar filtros y URL
  const setFilters = (newFilters: RitualsFilters) => {
    setFiltersState(newFilters)

    const params = new URLSearchParams()

    if (newFilters.organizeBy) {
      params.set("organizeBy", newFilters.organizeBy)
    }

    if (newFilters.degree) {
      params.set("degree", newFilters.degree.toString())
    }

    if (newFilters.ritualSystem) {
      params.set("ritualSystem", newFilters.ritualSystem)
    }

    if (newFilters.language) {
      params.set("language", newFilters.language)
    }

    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl)
  }

  const resetFilters = () => {
    const defaultFilters = {
      organizeBy: "degree",
      degree: undefined,
      ritualSystem: undefined,
      language: undefined,
    }
    setFilters(defaultFilters)
  }

  return { filters, setFilters, resetFilters }
}
