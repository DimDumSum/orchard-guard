import { CircleDot } from "lucide-react"
import { getOrchard, getWeatherRange } from "@/lib/db"
import { evaluateBrooksSpot } from "@/lib/models/brooks-spot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Brooks Spot Detail | OrchardGuard", description: "Brooks spot risk from extended wet period tracking." }
export const dynamic = "force-dynamic"

export default function BrooksSpotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, humidity_pct: h.humidity_pct ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const result = evaluateBrooksSpot(hourlyMapped, orchard.petal_fall_date)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<CircleDot className="h-8 w-8 text-amber-600" />} title="Brooks Spot" riskLevel={result.riskLevel} subtitle={`Extended wet period tracking — ${orchard.name}`} />

      <AboutCard title="Brooks Spot">
        <p>Brooks spot (<em>Mycosphaerella pomi</em>) is a minor but cosmetically damaging fungal disease that causes irregular, dark green to brown spots on fruit. It primarily affects apples during a narrow window after petal fall.</p>
        <p><strong>Petal fall window:</strong> The critical infection period is from petal fall through approximately 45 days after. Extended wet periods (&gt;24 hours) at moderate temperatures (15&ndash;25&deg;C) during this window create the highest risk. Outside this window, Brooks spot is rarely a concern.</p>
        <p><strong>Management:</strong> Standard fungicide programs for apple scab during the petal fall period usually provide adequate Brooks spot control. It is rarely a standalone spray target but can cause cosmetic damage in unprotected blocks during wet springs.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Wet Period Analysis" icon={<CircleDot className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Extended Wet Periods" value={result.extendedWetPeriods} sub=">24h wet at 15–25°C near petal fall" />
          <StatBox label="Petal Fall Date" value={orchard.petal_fall_date ?? "Not set"} sub="Set in Settings" />
        </div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="brooks-spot" />
      <ScoutingGuideSection slug="brooks-spot" />
      <ProductEfficacyTable slug="brooks-spot" />
      <CoincidenceAlerts slug="brooks-spot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="brooks-spot" />
    </div>
  )
}
