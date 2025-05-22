import type React from "react"
import { AuthProvider } from "@/components/auth-provider"

export default function AuthDebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </AuthProvider>
  )
}
