import { Suspense } from "react"
import { RitualsHeader } from "@/components/rituals-header"
import { RitualsList } from "@/components/rituals-list"
import { RitualsFilters } from "@/components/rituals-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function RitualsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <RitualsHeader />
      </Suspense>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <RitualsFilters />
        </div>
        <div className="md:w-3/4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RitualsList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
