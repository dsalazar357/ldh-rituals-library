import type React from "react"
import { AuthProvider } from "@/components/auth-provider"

export default function AdminDebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">{children}</div>
    </AuthProvider>
  )
}
