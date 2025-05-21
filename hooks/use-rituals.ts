"use client"

import { useState, useEffect, useCallback } from "react"
import type { Ritual } from "@/types/ritual"
import { getRituals } from "@/lib/rituals"

export function useRituals() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRituals = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getRituals()
      setRituals(data)
    } catch (error) {
      console.error("Error al obtener rituales:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRituals()
  }, [fetchRituals])

  return { rituals, isLoading, refetch: fetchRituals }
}
