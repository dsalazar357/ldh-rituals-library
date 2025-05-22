import { DashboardStats } from "@/components/dashboard-stats"
import { RecentRituals } from "@/components/recent-rituals"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogoutButton } from "@/components/logout-button"
import { SessionDebug } from "@/components/session-debug"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Panel de Control"
        description="Bienvenido a la Biblioteca de Rituales de Le Droit Humain"
      />
      <DashboardStats />
      <RecentRituals />

      {/* Herramientas de depuración */}
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Herramientas de depuración</h3>
        <SessionDebug />
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
