"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteRitual } from "@/lib/ritual-service"
import { useToast } from "@/hooks/use-toast"

export function useDeleteRitual() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      const success = await deleteRitual(id)

      if (success) {
        toast({
          title: "Ritual eliminado",
          description: "El ritual ha sido eliminado correctamente.",
        })
        router.push("/rituales")
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el ritual. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting ritual:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el ritual. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return { handleDelete, isDeleting }
}
