import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateClearwingMoth } from "@/lib/models/clearwing-moth"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Clearwing Moth | OrchardGuard", description: "Clearwing moth emergence timing and graft union scouting." }
export const dynamic = "force-dynamic"

export default function ClearwingMothPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateClearwingMoth(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-600" />} title="Apple Clearwing Moth" riskLevel={result.riskLevel} subtitle={`Emergence timing — ${orchard.name}`} />
      <AboutCard title="Apple Clearwing Moth">
        <p>The apple clearwing moth (<em>Synanthedon myopaeformis</em>) is a borer pest whose larvae tunnel into the cambium at graft unions and burr knots. Adults are wasp-mimics with clear wings and a distinctive red-orange band on the abdomen.</p>
        <p><strong>Graft union damage:</strong> Larvae bore into the graft union area, weakening the structural connection between rootstock and scion. In severe cases, trees can snap at the graft union during windstorms. Dwarfing rootstocks (M.9, M.26) with prominent burr knots are most vulnerable.</p>
        <p><strong>Timing:</strong> Adult emergence begins at approximately 400 degree days (base 10&deg;C). Pheromone traps can confirm adult activity. Inspect graft unions for frass, sawdust-like borings, and entry holes during the growing season.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Emergence Tracking" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 10°C from Jan 1" />
          <StatBox label="Adult Emergence" value={result.adultEmergence ? "YES" : "Not yet"} sub="Emerges at ≥400 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.adultEmergence} label={`Adults emerging (${Math.round(result.cumulativeDD)} / 400 DD)`} /></div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="clearwing-moth" />
      <ScoutingGuideSection slug="clearwing-moth" />
      <ProductEfficacyTable slug="clearwing-moth" />
      <CoincidenceAlerts slug="clearwing-moth" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="clearwing-moth" />
    </div>
  )
}
