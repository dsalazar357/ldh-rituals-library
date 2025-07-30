"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react"

export function UsersTable() {
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    degree: "1",
    lodge: "",
    role: "user",
    isAdmin: false,
  })

  const handleAddUser = () => {
    try {
      addUser({
        ...formData,
        degree: Number.parseInt(formData.degree),
        role: formData.role || "user",
      })

      toast({
        title: "Éxito",
        description: "Usuario añadido correctamente.",
      })

      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        degree: "1",
        lodge: "",
        role: "user",
        isAdmin: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al añadir el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = () => {
    if (!selectedUser) return

    try {
      updateUser(selectedUser.id, {
        ...formData,
        degree: Number.parseInt(formData.degree),
        role: formData.role || "user",
      })

      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente.",
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return

    try {
      deleteUser(selectedUser.id)

      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente.",
      })

      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el usuario.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      degree: user.degree.toString(),
      lodge: user.lodge,
      role: user.role,
      isAdmin: user.role === "admin",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Usuario (Admin o Regular)</DialogTitle>
              <DialogDescription>Completa el formulario para añadir un nuevo usuario.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Grado</Label>
                <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                  <SelectTrigger id="degree">
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grado 1</SelectItem>
                    <SelectItem value="2">Grado 2</SelectItem>
                    <SelectItem value="3">Grado 3</SelectItem>
                    <SelectItem value="4">Grado 4</SelectItem>
                    <SelectItem value="18">Grado 18</SelectItem>
                    <SelectItem value="30">Grado 30</SelectItem>
                    <SelectItem value="33">Grado 33</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lodge">Taller</Label>
                <Input
                  id="lodge"
                  value={formData.lodge}
                  onChange={(e) => setFormData({ ...formData, lodge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol del Usuario</Label>
                <Select
                  value={formData.role || "user"}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario Regular</SelectItem>
                    <SelectItem value="admin">Administrador (acceso total)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Los administradores tienen acceso completo a todas las funciones del sistema.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUser}>Añadir Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Taller</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.degree}</TableCell>
                  <TableCell>{user.lodge}</TableCell>
                  <TableCell>{user.role === "admin" ? "Administrador" : "Usuario"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}>
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Actualiza la información del usuario.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Contraseña (dejar en blanco para mantener)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-degree">Grado</Label>
              <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                <SelectTrigger id="edit-degree">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grado 1</SelectItem>
                  <SelectItem value="2">Grado 2</SelectItem>
                  <SelectItem value="3">Grado 3</SelectItem>
                  <SelectItem value="4">Grado 4</SelectItem>
                  <SelectItem value="18">Grado 18</SelectItem>
                  <SelectItem value="30">Grado 30</SelectItem>
                  <SelectItem value="33">Grado 33</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lodge">Taller</Label>
              <Input
                id="edit-lodge"
                value={formData.lodge}
                onChange={(e) => setFormData({ ...formData, lodge: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol del Usuario</Label>
              <Select
                value={formData.role || "user"}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario Regular</SelectItem>
                  <SelectItem value="admin">Administrador (acceso total)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Los administradores tienen acceso completo a todas las funciones del sistema.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
