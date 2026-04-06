import { Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SEASONAL_TIMING, type PhenologyStage } from "@/data/multi-target-products"

const STAGES: { key: PhenologyStage; label: string; abbrev: string }[] = [
  { key: "dormant", label: "Dormant", abbrev: "DOR" },
  { key: "green-tip", label: "Green Tip", abbrev: "GT" },
  { key: "tight-cluster", label: "Tight Cluster", abbrev: "TC" },
  { key: "pink", label: "Pink", abbrev: "PK" },
  { key: "bloom", label: "Bloom", abbrev: "BL" },
  { key: "petal-fall", label: "Petal Fall", abbrev: "PF" },
  { key: "cover", label: "Cover Sprays", abbrev: "COV" },
  { key: "pre-harvest", label: "Pre-Harvest", abbrev: "PRE" },
]

export function SeasonalTimingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-section-title">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Seasonal Timing Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          When to use what &mdash; Ontario apple season. Shaded cells indicate labeled use windows.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold text-bark-900 min-w-[140px]">Product</th>
                {STAGES.map((s) => (
                  <th key={s.key} className="text-center py-2 px-1 font-semibold text-bark-900 min-w-[40px]" title={s.label}>
                    {s.abbrev}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEASONAL_TIMING.map((row) => (
                <tr key={row.product} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 font-medium text-bark-700">{row.product}</td>
                  {STAGES.map((s) => (
                    <td key={s.key} className="text-center py-1.5 px-1">
                      {row.timings[s.key] ? (
                        <div className="mx-auto h-5 w-8 rounded-sm bg-grove-500/80" title={`${row.product} — ${s.label}`} />
                      ) : (
                        <div className="mx-auto h-5 w-8" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-5 rounded-sm bg-grove-500/80" />
          <span>= Labeled use window for this timing</span>
        </div>
      </CardContent>
    </Card>
  )
}
