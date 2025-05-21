import { RitualsHeader } from "@/components/rituals-header"
import { RitualsList } from "@/components/rituals-list"
import { RitualsFilters } from "@/components/rituals-filters"

export default function RitualsPage() {
  return (
    <div className="space-y-6">
      <RitualsHeader />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <RitualsFilters />
        </div>
        <div className="md:w-3/4">
          <RitualsList />
        </div>
      </div>
    </div>
  )
}
