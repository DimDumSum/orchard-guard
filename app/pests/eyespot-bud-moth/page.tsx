import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateEyespottedBudMoth } from "@/lib/models/eyespotted-bud-moth"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Eyespotted Bud Moth | OrchardGuard", description: "Eyespotted bud moth degree-day tracking and scouting guide." }
export const dynamic = "force-dynamic"

export default function EyespottedBudMothPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateEyespottedBudMoth(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-600" />} title="Eyespotted Bud Moth" riskLevel={result.riskLevel} subtitle={`DD phenology — ${orchard.name}`} />
      <AboutCard title="Eyespotted Bud Moth">
        <p>The eyespotted bud moth (<em>Spilonota ocellana</em>) is an early-season pest whose overwintering larvae feed on developing buds and young leaves in spring. Larvae tie leaves together with silk webbing, creating shelters that protect them from contact sprays.</p>
        <p><strong>Timing:</strong> Larvae become active at approximately 100 degree days (base 5&deg;C) from April 1. They feed through the tight-cluster and pink stages, then pupate. Adults emerge in summer and lay eggs that hatch into a second generation, but the spring larval generation causes the most damage.</p>
        <p><strong>Scouting:</strong> At tight cluster, examine buds for webbed leaves and frass. The economic threshold is &gt;5% of buds infested. Control is most effective when timed against actively feeding larvae before they web into protective shelters.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Degree Day Tracking" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Apr 1" />
          <StatBox label="Larvae Active" value={result.larvaeActive ? "YES" : "No"} sub="Active at ≥100 DD" />
          <StatBox label="Threshold" value={result.economicThreshold} sub="" />
        </div>
        <ConditionDot met={result.larvaeActive} label={`Larvae active (${Math.round(result.cumulativeDD)} DD accumulated, active at ≥100)`} />
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="eyespot-bud-moth" />
      <ScoutingGuideSection slug="eyespot-bud-moth" />
      <ProductEfficacyTable slug="eyespot-bud-moth" />
      <CoincidenceAlerts slug="eyespot-bud-moth" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="eyespot-bud-moth" />
    </div>
  )
}
