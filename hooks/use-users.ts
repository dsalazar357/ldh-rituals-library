"use client"

import { useState, useEffect, useRef } from "react"
import type { User } from "@/types/user"
import {
  getUsers,
  addUser as addUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
} from "@/lib/user-service"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetchedRef = useRef(false)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchUsers()
    }
  }, [])

  const addUser = async (userData: Omit<User, "id"> & { password?: string }) => {
    try {
      const newUser = await addUserApi(userData)
      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (error) {
      console.error("Error adding user:", error)
      throw error
    }
  }

  const updateUser = async (id: string, userData: Partial<User> & { password?: string }) => {
    try {
      const updatedUser = await updateUserApi(id, userData)
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)))
      return updatedUser
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await deleteUserApi(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error)
      throw error
    }
  }

  return { users, isLoading, addUser, updateUser, deleteUser, refetch: fetchUsers }
}
