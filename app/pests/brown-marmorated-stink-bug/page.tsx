import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateBMSB } from "@/lib/models/brown-marmorated-stink-bug"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Brown Marmorated Stink Bug | OrchardGuard", description: "BMSB DD emergence, late-season risk, and border row monitoring." }
export const dynamic = "force-dynamic"

export default function BMSBPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateBMSB(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-800" />} title="Brown Marmorated Stink Bug" riskLevel={result.riskLevel} subtitle={`Border row monitoring — ${orchard.name}`} />
      <AboutCard title="Brown Marmorated Stink Bug (BMSB)">
        <p>Brown marmorated stink bug (<em>Halyomorpha halys</em>) is an invasive pest that feeds on developing apple fruit by piercing the skin with needle-like mouthparts. Feeding damage causes corky, sunken spots under the skin that make fruit unmarketable.</p>
        <p><strong>Border effect:</strong> BMSB overwinters in sheltered structures (buildings, woodpiles) and moves into orchards from surrounding habitat in mid-to-late summer. Damage is consistently heaviest on perimeter rows nearest woods, hedgerows, or buildings.</p>
        <p><strong>Late-season risk:</strong> The most damaging period is August through harvest, when adults aggregate on fruit to feed. Beat-tray sampling on border rows is the most effective detection method.</p>
        <p className="font-medium text-bark-900">Border-row management &mdash; targeted sprays on perimeter rows &mdash; can reduce whole-orchard insecticide use while protecting the most vulnerable fruit.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 14°C from Jan 1" />
          <StatBox label="Adults Active" value={result.adultsActive ? "YES" : "Not yet"} sub="Emerges at ≥500 DD" />
          <StatBox label="Late Season Risk" value={result.lateSeasonRisk ? "YES" : "No"} sub="Aug–Oct damage window" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.adultsActive} label={`Adult emergence (${Math.round(result.cumulativeDD)} / 500 DD)`} />
          <ConditionDot met={result.lateSeasonRisk} label="Late-season damage window (Aug–Oct)" />
        </div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="brown-marmorated-stink-bug" />
      <ScoutingGuideSection slug="brown-marmorated-stink-bug" />
      <ProductEfficacyTable slug="brown-marmorated-stink-bug" />
      <CoincidenceAlerts slug="brown-marmorated-stink-bug" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="brown-marmorated-stink-bug" />
    </div>
  )
}
