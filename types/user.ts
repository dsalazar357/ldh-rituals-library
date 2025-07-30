export interface User {
  id: string
  name: string
  email: string
  degree: number
  lodge?: string
  role: "admin" | "user"
}
