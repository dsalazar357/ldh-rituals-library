"use client"

import { useState, useEffect, useRef } from "react"
import type { Ritual } from "@/types/ritual"
import { getRituals } from "@/lib/ritual-service"

export function useRituals() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchedRef = useRef(false)

  const fetchRituals = async () => {
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
  }

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchRituals()
    }
  }, [])

  const refetch = () => {
    fetchRituals()
  }

  return { rituals, isLoading, error, refetch }
}
