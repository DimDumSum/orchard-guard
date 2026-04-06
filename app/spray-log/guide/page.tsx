import { MultiTargetTable } from "@/components/models/multi-target-table"
import { SeasonalTimingChart } from "@/components/models/seasonal-timing-chart"

export const metadata = {
  title: "Spray Guide | OrchardGuard",
  description: "Multi-target product reference and seasonal timing chart.",
}

export default function SprayGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: "-0.02em" }}>
          Spray Guide
        </h1>
        <p className="mt-1 text-[14px] text-bark-400">
          Multi-target product reference and seasonal timing chart for Ontario apple orchards.
        </p>
      </div>

      <SeasonalTimingChart />
      <MultiTargetTable />
    </div>
  )
}
