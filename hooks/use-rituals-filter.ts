"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { use } from "react"

interface RitualsFilters {
  organizeBy: string
  degree?: number
  ritualSystem?: string
  language?: string
}

export function useRitualsFilter() {
  const searchParamsPromise = useSearchParams()
  const searchParams = use(searchParamsPromise)
  const router = useRouter()
  const pathname = usePathname()

  const [filters, setFiltersState] = useState<RitualsFilters>({
    organizeBy: searchParams.get("organizeBy") || "degree",
    degree: searchParams.get("degree") ? Number.parseInt(searchParams.get("degree") as string) : undefined,
    ritualSystem: searchParams.get("ritualSystem") || undefined,
    language: searchParams.get("language") || undefined,
  })

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
