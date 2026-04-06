import { CircleDot } from "lucide-react"
import { getOrchard, getWeatherRange } from "@/lib/db"
import { evaluateBlackRot } from "@/lib/models/black-rot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Black Rot Detail | OrchardGuard", description: "Black rot risk assessment based on wet period analysis." }
export const dynamic = "force-dynamic"

export default function BlackRotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, humidity_pct: h.humidity_pct ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const result = evaluateBlackRot(hourlyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<CircleDot className="h-8 w-8 text-gray-700" />} title="Black Rot" riskLevel={result.riskLevel} subtitle={`Wet period analysis — ${orchard.name}`} />

      <AboutCard title="Black Rot">
        <p>Black rot (<em>Botryosphaeria obtusa</em>) is a common fungal disease of apple that causes leaf spots (frogeye leaf spot), fruit rot, and limb cankers. The fungus overwinters in mummified fruit, dead bark, and cankers on the tree.</p>
        <p><strong>Infection conditions:</strong> Spores require extended wet periods of 9+ hours at temperatures between 15&ndash;30&deg;C to cause infection. Rain-splashed spores land on fruit and leaves, making prolonged rainy periods the primary driver of new infections.</p>
        <p><strong>Sanitation is key:</strong> Removing mummified fruit from the tree and orchard floor drastically reduces the inoculum available for infection. Pruning out cankers during the dormant season is equally important. Without these sanitation measures, fungicides alone may not provide adequate control.</p>
        <p className="font-medium text-bark-900">The most effective control program combines thorough dormant-season sanitation with fungicide sprays during wet periods from petal fall onward.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Infection Analysis" icon={<CircleDot className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Infection Periods (7d)" value={result.infectionPeriods} sub="Wet periods ≥9h at 15–30°C" />
          <StatBox label="Risk Level" value={result.riskLevel.toUpperCase()} sub={result.infectionPeriods === 0 ? "No qualifying wet periods" : `${result.infectionPeriods} event${result.infectionPeriods > 1 ? "s" : ""} detected`} />
        </div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <SectionCard title="Sanitation Checklist">
        <div className="space-y-2 text-sm text-bark-600">
          <p>&#x2610; Remove all mummified fruit from trees and ground</p>
          <p>&#x2610; Prune out dead wood and visible cankers during dormancy</p>
          <p>&#x2610; Destroy prunings &mdash; do not leave in orchard</p>
          <p>&#x2610; Monitor frogeye leaf spots as early warning of inoculum</p>
        </div>
      </SectionCard>

      <ImageGallery slug="black-rot" />
      <ScoutingGuideSection slug="black-rot" />
      <ProductEfficacyTable slug="black-rot" />
      <CoincidenceAlerts slug="black-rot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="black-rot" />
    </div>
  )
}
