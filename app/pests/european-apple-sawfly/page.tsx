import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateEuropeanAppleSawfly } from "@/lib/models/european-apple-sawfly"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "European Apple Sawfly | OrchardGuard", description: "European apple sawfly DD emergence and bloom-stage risk." }
export const dynamic = "force-dynamic"

export default function EuropeanAppleSawflyPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateEuropeanAppleSawfly(dailyMapped, orchard.bloom_stage ?? "dormant")

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-600" />} title="European Apple Sawfly" riskLevel={result.riskLevel} subtitle={`Bloom-stage risk — ${orchard.name}`} />
      <AboutCard title="European Apple Sawfly">
        <p>European apple sawfly (<em>Hoplocampa testudinea</em>) is a wasp-like insect whose larvae bore into developing fruitlets shortly after bloom. Adults lay eggs inside open flowers, and the larvae leave a distinctive ribbon-like scar on the fruit surface before tunneling to the core.</p>
        <p><strong>Bloom timing:</strong> Adults are only active during bloom. They are attracted to white flowers and can be monitored with white sticky traps placed at bloom height. Timing insecticide applications at petal fall is critical.</p>
        <p><strong>Natural thinning:</strong> At low populations, sawfly damage can actually provide beneficial fruit thinning. Only treat when trap counts exceed the economic threshold of 2&ndash;3 adults per white sticky trap.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Apr 1" />
          <StatBox label="Adults Active" value={result.adultsActive ? "YES" : "Not yet"} sub="Emerges at ≥100 DD" />
        </div>
        <div className="mt-4">
          <ConditionDot met={result.adultsActive} label={`Adult emergence (${Math.round(result.cumulativeDD)} / 100 DD)`} />
        </div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="european-apple-sawfly" />
      <ScoutingGuideSection slug="european-apple-sawfly" />
      <ProductEfficacyTable slug="european-apple-sawfly" />
      <CoincidenceAlerts slug="european-apple-sawfly" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="european-apple-sawfly" />
    </div>
  )
}
