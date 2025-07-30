"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Download, FileIcon, Trash, AlertTriangle, Plus, Search } from "lucide-react"
import Link from "next/link"

interface Ritual {
  id: string
  name: string
  degree: number
  ritualSystem: string
  language: string
  author: string
  createdAt: string
  fileUrl: string
}

interface User {
  id: string
  email: string
  role: string
  degree: number
}

interface Filters {
  organizeBy: string
  degree?: number
  ritualSystem?: string
  language?: string
  search?: string
}

export default function RitualsPage() {
  const [mounted, setMounted] = useState(false)
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ritualToDelete, setRitualToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    organizeBy: "degree",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Cargando datos...")

      // Cargar usuario
      const userResponse = await fetch("/api/debug")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log("Usuario cargado:", userData.user)
        setUser(userData.user)
      } else {
        console.error("Error al cargar usuario:", userResponse.status)
      }

      // Cargar rituales usando el mismo endpoint que el dashboard
      const ritualsResponse = await fetch("/api/debug")
      if (ritualsResponse.ok) {
        const debugData = await ritualsResponse.json()
        console.log("Datos de debug completos:", debugData)

        if (debugData.stats && debugData.stats.rituals) {
          // Si tenemos stats, usar esos datos
          const ritualsData = debugData.stats.rituals
          console.log("Rituales desde stats:", ritualsData)
          setRituals(ritualsData)
        } else {
          // Intentar cargar desde el endpoint específico de rituales
          const altResponse = await fetch("/api/rituals")
          if (altResponse.ok) {
            const altData = await altResponse.json()
            console.log("Rituales desde /api/rituals:", altData)
            setRituals(altData.rituals || [])
          } else {
            console.error("Error en ambos endpoints de rituales")
            setError("Error al cargar los rituales")
          }
        }
      } else {
        console.error("Error al cargar datos:", ritualsResponse.status)
        setError("Error al cargar los datos")
      }
    } catch (err) {
      console.error("Error de conexión:", err)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const organizedRituals = useMemo(() => {
    console.log("=== ORGANIZANDO RITUALES ===")
    console.log("Rituales totales:", rituals)
    console.log("Usuario:", user)

    if (!rituals || !Array.isArray(rituals)) {
      console.log("No hay rituales válidos para organizar")
      return {}
    }

    // TEMPORAL: Mostrar todos los rituales sin filtro de grado para debug
    let filteredRituals = [...rituals]

    // Solo aplicar filtro de grado si el usuario NO es admin
    if (user && user.role !== "admin") {
      const userDegree = user.degree || 0
      console.log("Aplicando filtro de grado. Usuario grado:", userDegree)

      filteredRituals = rituals.filter((ritual) => {
        const ritualDegree = ritual.degree || 0
        const canAccess = ritualDegree <= userDegree
        console.log(`Ritual "${ritual.name}" (grado ${ritualDegree}) - Usuario puede acceder: ${canAccess}`)
        return canAccess
      })
    } else {
      console.log("Usuario es admin o no hay usuario, mostrando todos los rituales")
    }

    console.log("Rituales después de filtrar por grado:", filteredRituals.length)

    // Aplicar filtros adicionales
    if (filters.degree) {
      filteredRituals = filteredRituals.filter((ritual) => ritual.degree === filters.degree)
      console.log("Rituales después de filtrar por grado específico:", filteredRituals.length)
    }

    if (filters.ritualSystem) {
      filteredRituals = filteredRituals.filter((ritual) => ritual.ritualSystem === filters.ritualSystem)
      console.log("Rituales después de filtrar por rito:", filteredRituals.length)
    }

    if (filters.language) {
      filteredRituals = filteredRituals.filter((ritual) => ritual.language === filters.language)
      console.log("Rituales después de filtrar por idioma:", filteredRituals.length)
    }

    if (filters.search) {
      filteredRituals = filteredRituals.filter(
        (ritual) =>
          ritual.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          ritual.author.toLowerCase().includes(filters.search!.toLowerCase()),
      )
      console.log("Rituales después de filtrar por búsqueda:", filteredRituals.length)
    }

    // Organizar por el criterio seleccionado
    const organized: Record<string, typeof filteredRituals> = {}

    filteredRituals.forEach((ritual) => {
      let key = ""

      switch (filters.organizeBy) {
        case "degree":
          key = `Grado ${ritual.degree}`
          break
        case "ritualSystem":
          key = ritual.ritualSystem || "Sin rito"
          break
        case "language":
          key = ritual.language || "Sin idioma"
          break
        default:
          key = `Grado ${ritual.degree}`
      }

      if (!organized[key]) {
        organized[key] = []
      }

      organized[key].push(ritual)
    })

    console.log("Rituales organizados finales:", organized)
    return organized
  }, [rituals, filters, user])

  const handleDelete = async (ritualId: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/rituals/${ritualId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRituals((prev) => prev.filter((r) => r.id !== ritualId))
      } else {
        setError("Error al eliminar el ritual")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = async () => {
    if (ritualToDelete) {
      await handleDelete(ritualToDelete)
      setRitualToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const resetFilters = () => {
    setFilters({ organizeBy: "degree" })
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="md:w-3/4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"
  const ritualSystems = ["Escocés", "Francés", "Emulación", "York"]
  const languages = ["Español", "Inglés", "Francés", "Portugués"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Rituales</h1>
          <p className="text-muted-foreground">Explora y gestiona la colección de rituales masónicos</p>
        </div>
        <Link href="/rituales/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Ritual
          </Button>
        </Link>
      </div>

      {/* Debug info mejorado */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Debug Info</AlertTitle>
        <AlertDescription>
          <div className="space-y-1 text-sm">
            <div>
              Usuario: {user?.email} (Rol: {user?.role}, Grado: {user?.degree})
            </div>
            <div>Rituales cargados: {rituals.length}</div>
            <div>Rituales organizados: {Object.keys(organizedRituals).length} categorías</div>
            <div>Total rituales visibles: {Object.values(organizedRituals).flat().length}</div>
            <div>Filtros activos: {JSON.stringify(filters)}</div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtros */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar rituales..."
                    className="pl-8"
                    value={filters.search || ""}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Organizar por */}
              <div className="space-y-2">
                <Label>Organizar por</Label>
                <RadioGroup
                  value={filters.organizeBy}
                  onValueChange={(value) => setFilters({ ...filters, organizeBy: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="degree" id="degree" />
                    <Label htmlFor="degree">Grado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ritualSystem" id="ritualSystem" />
                    <Label htmlFor="ritualSystem">Rito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="language" id="language" />
                    <Label htmlFor="language">Idioma</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Filtro por grado */}
              <div className="space-y-2">
                <Label htmlFor="degreeFilter">Grado</Label>
                <Select
                  value={filters.degree?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      degree: value === "all" ? undefined : Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="degreeFilter">
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grados</SelectItem>
                    <SelectItem value="1">Grado 1</SelectItem>
                    <SelectItem value="2">Grado 2</SelectItem>
                    <SelectItem value="3">Grado 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por rito */}
              <div className="space-y-2">
                <Label htmlFor="ritualSystemFilter">Sistema Ritual</Label>
                <Select
                  value={filters.ritualSystem || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      ritualSystem: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger id="ritualSystemFilter">
                    <SelectValue placeholder="Todos los ritos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los ritos</SelectItem>
                    {ritualSystems.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por idioma */}
              <div className="space-y-2">
                <Label htmlFor="languageFilter">Idioma</Label>
                <Select
                  value={filters.language || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      language: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger id="languageFilter">
                    <SelectValue placeholder="Todos los idiomas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los idiomas</SelectItem>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de rituales */}
        <div className="md:w-3/4">
          {loading ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {Object.keys(organizedRituals).length > 0 ? (
                Object.entries(organizedRituals).map(([category, categoryRituals]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {categoryRituals.map((ritual) => (
                        <Card key={ritual.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-muted rounded-lg p-2">
                              <FileIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-medium">{ritual.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {ritual.ritualSystem} • {ritual.language}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Subido por {ritual.author} • {formatDate(ritual.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Link href={`/rituales/${ritual.id}`}>
                                <Button variant="ghost" size="icon" title="Ver detalles">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Ver detalles</span>
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Descargar"
                                onClick={() => window.open(ritual.fileUrl, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Descargar</span>
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Eliminar"
                                  onClick={() => {
                                    setRitualToDelete(ritual.id)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron rituales con los filtros seleccionados.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total de rituales en la base de datos: {rituals.length}
                  </p>
                  {rituals.length > 0 && (
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Rituales disponibles:</p>
                      {rituals.map((ritual, index) => (
                        <p key={ritual.id}>
                          {index + 1}. {ritual.name} (Grado {ritual.degree})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Ritual</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este ritual? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRitualToDelete(null)
                setIsDeleteDialogOpen(false)
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
