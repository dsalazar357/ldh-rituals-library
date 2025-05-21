import { DashboardStats } from "@/components/dashboard-stats"
import { RecentRituals } from "@/components/recent-rituals"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Panel de Control"
        description="Bienvenido a la Biblioteca de Rituales de Le Droit Humain"
      />
      <DashboardStats />
      <RecentRituals />
    </div>
  )
}
