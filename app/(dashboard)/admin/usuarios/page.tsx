"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash, AlertTriangle, Search, ArrowLeft, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface User {
  id: string
  name: string
  email: string
  role: string
  degree: number
  lodge: string | null
  created_at?: string
}

export default function UsersAdminPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Create user state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    degree: "1",
    lodge: "",
    role: "user",
  })

  // Delete user state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading) {
      loadData()
    }
  }, [mounted, authLoading, currentUser])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setAuthError(false)

      if (!currentUser) {
        setAuthError(true)
        return
      }

      if (currentUser.role !== "admin") {
        setAuthError(true)
        return
      }

      const usersResponse = await fetch("/api/users")

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text()
        setError(`Error al cargar los usuarios: ${usersResponse.status} - ${errorText}`)
        return
      }

      const usersData = await usersResponse.json()

      if (usersData.users && Array.isArray(usersData.users)) {
        setUsers(usersData.users)
      } else if (Array.isArray(usersData)) {
        setUsers(usersData)
      } else {
        setError("Formato de datos de usuarios inesperado")
      }
    } catch (err) {
      setError("Error de conexión al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setIsCreating(true)
      setError(null)

      console.log("Creating user with data:", createFormData)

      const response = await fetch("/api/users/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: createFormData.name,
          email: createFormData.email,
          password: createFormData.password || undefined,
          degree: Number.parseInt(createFormData.degree),
          lodge: createFormData.lodge || null,
          role: createFormData.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error creating user:", errorData)

        let errorMessage = `Error al crear el usuario: ${response.status}`
        try {
          const parsedError = JSON.parse(errorData)
          if (parsedError.error) {
            errorMessage = parsedError.error
          }
        } catch {
          errorMessage = errorData || errorMessage
        }

        setError(errorMessage)
        return
      }

      const result = await response.json()
      console.log("User created successfully:", result)

      // Add the new user to the list
      setUsers((prev) => [...prev, result.user])

      // Reset form and close dialog
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        degree: "1",
        lodge: "",
        role: "user",
      })
      setIsCreateDialogOpen(false)

      // Show success message if temporary password was generated
      if (result.temporaryPassword) {
        alert(
          `Usuario creado exitosamente.\nContraseña temporal: ${result.temporaryPassword}\n\nPor favor, guarda esta contraseña ya que no se mostrará nuevamente.`,
        )
      }
    } catch (err) {
      console.error("Error creating user:", err)
      setError("Error de conexión al crear el usuario")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      setIsUpdating(true)
      setError(null)

      console.log("Updating user:", editingUser.id, "with data:", {
        role: editingUser.role,
        degree: editingUser.degree,
      })

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editingUser.role,
          degree: editingUser.degree,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error updating user:", errorData)

        let errorMessage = `Error al actualizar el usuario: ${response.status}`
        try {
          const parsedError = JSON.parse(errorData)
          if (parsedError.error) {
            errorMessage = parsedError.error
          }
        } catch {
          errorMessage = errorData || errorMessage
        }

        setError(errorMessage)
        return
      }

      const updatedData = await response.json()
      console.log("User updated successfully:", updatedData)

      // Update the user in the local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...user, role: editingUser.role, degree: editingUser.degree } : user,
        ),
      )

      setIsEditDialogOpen(false)
      setEditingUser(null)
    } catch (err) {
      console.error("Error updating user:", err)
      setError("Error de conexión al actualizar el usuario")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error deleting user:", errorData)
        setError(`Error al eliminar el usuario: ${response.status}`)
        return
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId))
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Error de conexión al eliminar el usuario")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Loading state
  if (!mounted || authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Auth error state
  if (authError || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
            <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            No tienes permisos para acceder a esta área. Solo los administradores pueden gestionar usuarios.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Button asChild>
                <Link href="/admin">Volver al Panel de Administración</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios de la plataforma - Conectado como: {currentUser.name} ({currentUser.role})
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-2" onClick={loadData}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="user">Usuarios</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {users.length === 0
                  ? "No hay usuarios en la base de datos."
                  : "No se encontraron usuarios con los filtros seleccionados."}
              </p>
              {users.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm("")
                    setRoleFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Logia</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.degree}°</TableCell>
                    <TableCell>{user.lodge || "N/A"}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Editar usuario">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setUserToDelete(user.id)
                              setIsDeleteDialogOpen(true)
                            }}
                            title="Eliminar usuario"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Completa la información para crear un nuevo usuario en el sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre Completo *</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Contraseña</Label>
              <Input
                id="create-password"
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                placeholder="Dejar vacío para generar automáticamente"
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se generará una contraseña temporal automáticamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rol</Label>
              <Select
                value={createFormData.role}
                onValueChange={(value) => setCreateFormData({ ...createFormData, role: value })}
              >
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-degree">Grado</Label>
              <Select
                value={createFormData.degree}
                onValueChange={(value) => setCreateFormData({ ...createFormData, degree: value })}
              >
                <SelectTrigger id="create-degree">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grado 1</SelectItem>
                  <SelectItem value="2">Grado 2</SelectItem>
                  <SelectItem value="3">Grado 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-lodge">Logia</Label>
              <Input
                id="create-lodge"
                value={createFormData.lodge}
                onChange={(e) => setCreateFormData({ ...createFormData, lodge: e.target.value })}
                placeholder="Nombre de la logia (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setCreateFormData({
                  name: "",
                  email: "",
                  password: "",
                  degree: "1",
                  lodge: "",
                  role: "user",
                })
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating || !createFormData.name || !createFormData.email}>
              {isCreating ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica el rol y grado del usuario {editingUser?.name}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grado</Label>
                <Select
                  value={editingUser.degree.toString()}
                  onValueChange={(value) => setEditingUser({ ...editingUser, degree: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grado 1</SelectItem>
                    <SelectItem value="2">Grado 2</SelectItem>
                    <SelectItem value="3">Grado 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingUser(null)
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUserToDelete(null)
                setIsDeleteDialogOpen(false)
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
