"use client"

import { useState, useEffect, useCallback } from "react"
import type { Ritual } from "@/types/ritual"
import { getRituals } from "@/lib/ritual-service"

export function useRituals() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRituals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getRituals()
      setRituals(data)
    } catch (err) {
      console.error("Error fetching rituals:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar rituales"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRituals()
  }, [fetchRituals])

  return { rituals, isLoading, error, refetch: fetchRituals }
}
