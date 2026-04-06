import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateTarnishedPlantBug } from "@/lib/models/tarnished-plant-bug"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Tarnished Plant Bug | OrchardGuard", description: "Tarnished plant bug emergence and tap sampling guide." }
export const dynamic = "force-dynamic"

export default function TarnishedPlantBugPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateTarnishedPlantBug(dailyMapped, orchard.bloom_stage, orchard.petal_fall_date)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-700" />} title="Tarnished Plant Bug" riskLevel={result.riskLevel} subtitle={`Emergence + tap sampling — ${orchard.name}`} />
      <AboutCard title="Tarnished Plant Bug">
        <p>The tarnished plant bug (<em>Lygus lineolaris</em>) is a major pest of developing fruitlets in the weeks following petal fall. Adults feed on developing fruit with piercing-sucking mouthparts, causing &ldquo;cat-facing&rdquo; &mdash; distorted, dimpled, knobby fruit that is unmarketable.</p>
        <p><strong>Mowing warning:</strong> TPB adults overwinter in ground cover and weeds. Mowing the orchard floor during bloom or early post-bloom drives adults from the ground cover up into the trees, where they begin feeding on fruitlets. Avoid mowing during bloom and the 2&ndash;3 weeks following petal fall.</p>
        <p><strong>Tap sampling:</strong> Place a white tray under a branch and tap sharply 3 times. Count the bugs that fall. Sample 25 clusters per block. The threshold is 4&ndash;5 bugs per 25 tapped clusters.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Activity Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Apr 1" />
          <StatBox label="Adults Active" value={result.active ? "YES" : "Not yet"} sub="Active at ≥150 DD" />
          <StatBox label="Critical Window" value={result.criticalWindow ? "OPEN" : "Closed"} sub="Petal fall + 3 weeks" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.active} label={`Adults active (${Math.round(result.cumulativeDD)} / 150 DD)`} />
          <ConditionDot met={result.criticalWindow} label="Critical fruit damage window open" />
        </div>
        {result.criticalWindow && <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4"><p className="text-sm font-medium text-red-800 dark:text-red-200">Do NOT mow orchard floor</p><p className="mt-1 text-sm text-red-700 dark:text-red-300">Mowing during the critical window drives plant bugs from cover crops into the tree canopy where they damage developing fruitlets.</p></div>}
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="tarnished-plant-bug" />
      <ScoutingGuideSection slug="tarnished-plant-bug" />
      <ProductEfficacyTable slug="tarnished-plant-bug" />
      <CoincidenceAlerts slug="tarnished-plant-bug" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="tarnished-plant-bug" />
    </div>
  )
}
