"use client"

import { useState, useEffect } from "react"
import type { Ritual } from "@/types/ritual"
import { getRitualById } from "@/lib/ritual-service"

export function useRitual(id: string) {
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRitual = async () => {
      try {
        setIsLoading(true)
        const data = await getRitualById(id)
        setRitual(data)
      } catch (error) {
        console.error(`Error fetching ritual with ID ${id}:`, error)
        setRitual(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRitual()
  }, [id])

  return { ritual, isLoading }
}
