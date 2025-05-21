"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileIcon, Trash } from "lucide-react"
import { useRitual } from "@/hooks/use-ritual"
import { useDeleteRitual } from "@/hooks/use-delete-ritual"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

interface RitualDetailsProps {
  id: string
}

export function RitualDetails({ id }: RitualDetailsProps) {
  const { ritual, isLoading } = useRitual(id)
  const { handleDelete, isDeleting } = useDeleteRitual()
  const { user } = useAuth()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isAdmin = user?.role === "admin"

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (!ritual) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Ritual no encontrado o no tienes acceso a este ritual.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ritual.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-muted rounded-lg p-3">
            <FileIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de archivo</p>
            <p className="font-medium">{ritual.fileUrl.split(".").pop()?.toUpperCase()}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Grado</p>
            <p className="font-medium">Grado {ritual.degree}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sistema Ritual</p>
            <p className="font-medium">{ritual.ritualSystem}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Idioma</p>
            <p className="font-medium">{ritual.language}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subido por</p>
            <p className="font-medium">{ritual.author}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de subida</p>
            <p className="font-medium">{formatDate(ritual.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={() => window.open(ritual.fileUrl, "_blank")}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Ritual
          </Button>

          {isAdmin && (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar Ritual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Ritual</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas eliminar este ritual? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(ritual.id)
                      setIsDeleteDialogOpen(false)
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
