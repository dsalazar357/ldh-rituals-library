import { UploadRitualForm } from "@/components/upload-ritual-form"
import { DashboardHeader } from "@/components/dashboard-header"

export default function UploadRitualPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Subir Nuevo Ritual" description="Añade un nuevo ritual a la biblioteca" />
      <UploadRitualForm />
    </div>
  )
}
