import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateAppleBrownBug } from "@/lib/models/apple-brown-bug"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Brown Bug | OrchardGuard", description: "Apple brown bug nymph hatch timing and tap sampling." }
export const dynamic = "force-dynamic"

export default function AppleBrownBugPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateAppleBrownBug(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-800" />} title="Apple Brown Bug" riskLevel={result.riskLevel} subtitle={`Nymph hatch tracking — ${orchard.name}`} />
      <AboutCard title="Apple Brown Bug">
        <p>The apple brown bug (<em>Atractotomus mali</em>) is an early-season pest whose nymphs feed on developing buds and fruitlets with piercing-sucking mouthparts, causing dimpling and scarring on fruit.</p>
        <p><strong>Timing:</strong> Eggs hatch at approximately 170 degree days (base 5&deg;C) from March 1, typically coinciding with tight cluster to pink stage. Nymphs are tiny and easily overlooked during scouting.</p>
        <p><strong>Tap sampling:</strong> Use the white tray tap method. The economic threshold is 2 nymphs per 25 tapped clusters. Control sprays applied at pink or petal fall for other pests often manage apple brown bug incidentally.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Mar 1" />
          <StatBox label="Egg Hatch" value={result.eggHatch ? "YES" : "Not yet"} sub="Hatches at ≥170 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.eggHatch} label={`Egg hatch (${Math.round(result.cumulativeDD)} / 170 DD)`} /></div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="apple-brown-bug" />
      <ScoutingGuideSection slug="apple-brown-bug" />
      <ProductEfficacyTable slug="apple-brown-bug" />
      <CoincidenceAlerts slug="apple-brown-bug" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-brown-bug" />
    </div>
  )
}
