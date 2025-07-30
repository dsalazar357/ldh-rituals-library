"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, FileIcon, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Ritual {
  id: string
  name: string
  degree: number
  ritualSystem: string
  language: string
  author: string
  description: string
  createdAt: string
  fileUrl: string
}

export default function RitualPage({ params }: { params: { id: string } }) {
  const [mounted, setMounted] = useState(false)
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadRitual()
    }
  }, [mounted, params.id])

  const loadRitual = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rituals/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setRitual(data.ritual)
      } else {
        setError("Ritual no encontrado")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !ritual) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/rituales">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Detalles del Ritual</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/rituales">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalles del Ritual</h1>
          <p className="text-muted-foreground">Información completa del ritual seleccionado</p>
        </div>
      </div>

      {/* Ritual Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{ritual.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Grado {ritual.degree}</Badge>
                <Badge variant="outline">{ritual.ritualSystem}</Badge>
                <Badge variant="outline">{ritual.language}</Badge>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <FileIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {ritual.description && (
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground">{ritual.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Información del Archivo</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Autor:</dt>
                  <dd>{ritual.author}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fecha de subida:</dt>
                  <dd>{formatDate(ritual.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Grado:</dt>
                  <dd>{ritual.degree}°</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sistema ritual:</dt>
                  <dd>{ritual.ritualSystem}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Idioma:</dt>
                  <dd>{ritual.language}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={() => window.open(ritual.fileUrl, "_blank")} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar Ritual
            </Button>
            <Link href="/rituales">
              <Button variant="outline">Volver a la Lista</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
