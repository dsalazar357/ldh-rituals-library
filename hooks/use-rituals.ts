"use client"

import { useState, useEffect } from "react"
import type { Ritual } from "@/types/ritual"
import { getRituals } from "@/lib/rituals"

export function useRituals() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRituals = async () => {
      try {
        const data = await getRituals()
        setRituals(data)
      } catch (error) {
        console.error("Error al obtener rituales:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRituals()
  }, [])

  return { rituals, isLoading }
}
