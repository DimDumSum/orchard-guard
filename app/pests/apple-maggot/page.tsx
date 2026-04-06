import { Cherry } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateAppleMaggot } from "@/lib/models/apple-maggot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Maggot | OrchardGuard", description: "Apple maggot DD emergence, trap monitoring, and border row strategy." }
export const dynamic = "force-dynamic"

export default function AppleMaggotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateAppleMaggot(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Cherry className="h-8 w-8 text-red-600" />} title="Apple Maggot" riskLevel={result.riskLevel} subtitle={`DD emergence + trap monitoring — ${orchard.name}`} />
      <AboutCard title="Apple Maggot">
        <p>Apple maggot (<em>Rhagoletis pomonella</em>) is a native fruit fly whose larvae create brown, winding tunnels (&ldquo;railroad tracks&rdquo;) through apple flesh, making fruit unmarketable. Adults lay eggs just under the skin of developing fruit in mid-to-late summer.</p>
        <p><strong>Emergence:</strong> Pupae overwinter in the soil. Adults emerge at approximately 900 degree days (base 5&deg;C) from January 1. Peak activity occurs between 1200&ndash;1700 DD. Some pupae remain dormant for 2&ndash;3 years, creating a persistent soil bank.</p>
        <p><strong>Border row strategy:</strong> Apple maggot flies move into orchards from nearby wild or abandoned apple trees and hawthorns. Perimeter trapping with red sticky sphere traps identifies the direction and timing of immigration. Border-row insecticide applications triggered by trap catches can provide effective control while minimizing interior sprays.</p>
        <p className="font-medium text-bark-900">The action threshold is just 1 fly per red sphere trap &mdash; apple maggot has zero tolerance in fresh market fruit.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Cherry className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Jan 1" />
          <StatBox label="Emerged" value={result.emerged ? "YES" : "Not yet"} sub="Emerges at ≥900 DD" />
          <StatBox label="Peak Activity" value={result.peakActivity ? "YES" : "Not yet"} sub="1200–1700 DD" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.emerged} label={`Adult emergence (${Math.round(result.cumulativeDD)} / 900 DD)`} />
          <ConditionDot met={result.peakActivity} label="Peak egg-laying activity (1200–1700 DD)" />
        </div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4"><p className="text-sm font-medium text-red-800 dark:text-red-200">Economic Threshold</p><p className="mt-1 text-sm text-red-700 dark:text-red-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Trap Monitoring Guide</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="apple-maggot" />
      <ScoutingGuideSection slug="apple-maggot" />
      <ProductEfficacyTable slug="apple-maggot" />
      <CoincidenceAlerts slug="apple-maggot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-maggot" />
    </div>
  )
}
