import { RitualDetails } from "@/components/ritual-details"
import { DashboardHeader } from "@/components/dashboard-header"

export default function RitualPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Detalles del Ritual" description="Información completa del ritual seleccionado" />
      <RitualDetails id={params.id} />
    </div>
  )
}
