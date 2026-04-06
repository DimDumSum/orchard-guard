import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateAppleLeafMidge } from "@/lib/models/apple-leaf-midge"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Leaf Curling Midge | OrchardGuard", description: "Apple leaf curling midge generation timing." }
export const dynamic = "force-dynamic"

export default function AppleLeafMidgePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateAppleLeafMidge(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-green-600" />} title="Apple Leaf Curling Midge" riskLevel={result.riskLevel} subtitle={`Generation timing — ${orchard.name}`} />
      <AboutCard title="Apple Leaf Curling Midge">
        <p>The apple leaf curling midge (<em>Dasineura mali</em>) is a tiny fly whose larvae cause characteristic tight leaf curling on shoot tips. Infested leaves roll tightly inward from the margins, turning red and eventually necrotic.</p>
        <p><strong>Young tree focus:</strong> Apple leaf curling midge is primarily a concern in young, non-bearing orchards and nurseries where vigorous shoot growth provides abundant oviposition sites. On mature bearing trees, the pest is rarely economically significant.</p>
        <p><strong>Multiple generations:</strong> The midge can produce 3&ndash;4 generations per season. First generation adults emerge in spring and are attracted to actively growing shoot tips. Avoiding excessive nitrogen that promotes lush vegetative growth can reduce attractiveness to egg-laying females.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Accumulated this season" />
          <StatBox label="1st Generation" value={result.firstGeneration ? "ACTIVE" : "Not yet"} sub="" />
        </div>
        <div className="mt-4"><ConditionDot met={result.firstGeneration} label="First generation adults active" /></div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="apple-leaf-midge" />
      <ScoutingGuideSection slug="apple-leaf-midge" />
      <ProductEfficacyTable slug="apple-leaf-midge" />
      <CoincidenceAlerts slug="apple-leaf-midge" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-leaf-midge" />
    </div>
  )
}
