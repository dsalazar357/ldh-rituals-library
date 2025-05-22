import { DashboardStats } from "@/components/dashboard-stats"
import { RecentRituals } from "@/components/recent-rituals"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogoutButton } from "@/components/logout-button"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Panel de Control"
        description="Bienvenido a la Biblioteca de Rituales de Le Droit Humain"
      />
      <DashboardStats />
      <RecentRituals />

      {/* Botón de cierre de sesión alternativo para pruebas */}
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Opciones de depuración</h3>
        <LogoutButton />
      </div>
    </div>
  )
}
