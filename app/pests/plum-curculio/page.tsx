import { Worm } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluatePlumCurculio } from "@/lib/models/plum-curculio"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Plum Curculio | OrchardGuard", description: "Plum curculio emergence, night temps, and border row management." }
export const dynamic = "force-dynamic"

export default function PlumCurculioPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluatePlumCurculio(dailyMapped, orchard.petal_fall_date)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Worm className="h-8 w-8 text-amber-800" />} title="Plum Curculio" riskLevel={result.riskLevel} subtitle={`Post-petal-fall tracking — ${orchard.name}`} />
      <AboutCard title="Plum Curculio">
        <p>Plum curculio (<em>Conotrachelus nenuphar</em>) is the #1 beetle pest of apple in eastern North America. Adults are small, brownish-gray weevils with distinctive bumpy wing covers. They create crescent-shaped egg-laying scars on developing fruit that are diagnostic for this pest.</p>
        <p><strong>Migration from borders:</strong> PC adults overwinter in leaf litter along woodlot edges and hedgerows adjacent to orchards. They walk and fly into the orchard starting at petal fall, with immigration concentrated in the first 2&ndash;4 border rows. Warm nights (&gt;16&deg;C) trigger the most active movement.</p>
        <p><strong>Border row strategy:</strong> Because PC enters from the edges, perimeter sprays targeting the first 4&ndash;6 rows can be effective while reducing total spray volume. Monitor border rows most intensively and consider perimeter-only treatment if interior rows are clean.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Activity Status" icon={<Worm className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from petal fall" />
          <StatBox label="Emerged" value={result.emerged ? "YES" : "Not yet"} sub="Active at ≥120 DD" />
          <StatBox label="Night Temps" value={result.nightTempsWarm ? "Warm (>16°C)" : "Cool"} sub="Warm nights = active migration" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.emerged} label={`Adults emerged and active (${Math.round(result.cumulativeDD)} / 120 DD from petal fall)`} />
          <ConditionDot met={result.nightTempsWarm} label="Warm nights — peak migration conditions" />
        </div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="plum-curculio" />
      <ScoutingGuideSection slug="plum-curculio" />
      <ProductEfficacyTable slug="plum-curculio" />
      <CoincidenceAlerts slug="plum-curculio" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="plum-curculio" />
    </div>
  )
}
