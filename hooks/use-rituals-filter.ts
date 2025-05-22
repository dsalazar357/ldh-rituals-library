"use client"

import { useState, useEffect } from "react"
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

  // Inicializar con valores por defecto para evitar undefined
  const [filters, setFiltersState] = useState<RitualsFilters>({
    organizeBy: "degree",
    degree: undefined,
    ritualSystem: undefined,
    language: undefined,
  })

  // Actualizar los filtros cuando cambian los searchParams
  useEffect(() => {
    if (searchParams) {
      setFiltersState({
        organizeBy: searchParams.get("organizeBy") || "degree",
        degree: searchParams.get("degree") ? Number.parseInt(searchParams.get("degree") as string) : undefined,
        ritualSystem: searchParams.get("ritualSystem") || undefined,
        language: searchParams.get("language") || undefined,
      })
    }
  }, [searchParams])

  // Actualizar la URL cuando cambien los filtros
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

    router.push(`${pathname}?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      organizeBy: "degree",
      degree: undefined,
      ritualSystem: undefined,
      language: undefined,
    })
  }

  return { filters, setFilters, resetFilters }
}
