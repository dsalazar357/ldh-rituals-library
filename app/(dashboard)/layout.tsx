import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AuthProvider } from "@/components/auth-provider"
import { SidebarProvider } from "@/hooks/use-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 transition-all duration-300 md:ml-[70px] lg:ml-[70px] xl:ml-[70px] pt-16">
              <div className="container mx-auto p-4 md:p-6">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}
