"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRitualsFilter } from "@/hooks/use-rituals-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

// Componente de carga para los filtros
function RitualsFiltersLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

// Componente principal de filtros
function RitualsFiltersContent() {
  const { filters, setFilters, resetFilters } = useRitualsFilter()

  const ritualSystems = ["Escocés", "Francés", "Emulación", "York"]
  const languages = ["Español", "Inglés", "Francés", "Portugués"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="degree">Grado</Label>
          <Select
            value={filters.degree?.toString() || ""}
            onValueChange={(value) => setFilters({ ...filters, degree: value ? Number.parseInt(value) : undefined })}
          >
            <SelectTrigger id="degree">
              <SelectValue placeholder="Todos los grados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos los grados</SelectItem>
              <SelectItem value="1">Grado 1</SelectItem>
              <SelectItem value="2">Grado 2</SelectItem>
              <SelectItem value="3">Grado 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ritualSystem">Sistema Ritual</Label>
          <Select
            value={filters.ritualSystem || ""}
            onValueChange={(value) => setFilters({ ...filters, ritualSystem: value || undefined })}
          >
            <SelectTrigger id="ritualSystem">
              <SelectValue placeholder="Todos los ritos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos los ritos</SelectItem>
              {ritualSystems.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select
            value={filters.language || ""}
            onValueChange={(value) => setFilters({ ...filters, language: value || undefined })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Todos los idiomas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos los idiomas</SelectItem>
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
  )
}

// Componente exportado que envuelve el contenido en Suspense
export function RitualsFilters() {
  return (
    <Suspense fallback={<RitualsFiltersLoading />}>
      <RitualsFiltersContent />
    </Suspense>
  )
}
