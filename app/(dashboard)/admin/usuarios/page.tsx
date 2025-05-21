import { UsersTable } from "@/components/users-table"
import { DashboardHeader } from "@/components/dashboard-header"

export default function UsersAdminPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Administración de Usuarios" description="Gestiona los usuarios de la plataforma" />
      <UsersTable />
    </div>
  )
}
