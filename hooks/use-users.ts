"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import { getUsers, addUser as addUserApi, updateUser as updateUserApi, deleteUser as deleteUserApi } from "@/lib/users"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error) {
        console.error("Error al obtener usuarios:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = await addUserApi(userData)
      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (error) {
      console.error("Error al añadir usuario:", error)
      throw error
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await updateUserApi(id, userData)
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)))
      return updatedUser
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await deleteUserApi(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error)
      throw error
    }
  }

  return { users, isLoading, addUser, updateUser, deleteUser }
}
