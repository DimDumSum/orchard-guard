import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateRosyAppleAphid } from "@/lib/models/rosy-apple-aphid"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Rosy Apple Aphid | OrchardGuard", description: "Rosy apple aphid egg hatch prediction and pre-bloom management." }
export const dynamic = "force-dynamic"

export default function RosyAppleAphidPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateRosyAppleAphid(dailyMapped, orchard.bloom_stage)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-pink-600" />} title="Rosy Apple Aphid" riskLevel={result.riskLevel} subtitle={`Pre-bloom management — ${orchard.name}`} />
      <AboutCard title="Rosy Apple Aphid">
        <p>The rosy apple aphid (<em>Dysaphis plantaginea</em>) is the most damaging aphid pest of apples. Colonies curl leaves tightly around developing fruit clusters, causing severe fruit deformation &mdash; small, puckered, lopsided apples that are unmarketable. Unlike other aphid species, the damage from rosy apple aphid is irreversible once fruit distortion begins.</p>
        <p><strong>Critical pre-bloom window:</strong> Eggs hatch at approximately 80 degree days (base 5&deg;C) from March 1, typically around green tip. The critical control window is from green tip through pink bud stage. After bloom, colonies are protected inside curled leaves and sprays are far less effective. If you miss the pre-bloom window, you will live with the damage.</p>
        <p><strong>Scouting:</strong> At the pink stage, examine 100 flower clusters &mdash; if 1&ndash;2% have active aphid colonies, treatment is justified. Look for curling inner leaves on developing clusters and pinkish-purple aphids.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Mar 1" />
          <StatBox label="Egg Hatch" value={result.hatchExpected ? "Expected" : "Not yet"} sub="Hatches at ≥80 DD" />
          <StatBox label="Critical Window" value={result.criticalWindow ? "OPEN" : "Closed"} sub="Green tip through pink" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.hatchExpected} label={`Egg hatch expected (${Math.round(result.cumulativeDD)} / 80 DD)`} />
          <ConditionDot met={result.criticalWindow} label={`Critical control window open (stage: ${orchard.bloom_stage})`} />
        </div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="rosy-apple-aphid" />
      <ScoutingGuideSection slug="rosy-apple-aphid" />
      <ProductEfficacyTable slug="rosy-apple-aphid" />
      <CoincidenceAlerts slug="rosy-apple-aphid" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="rosy-apple-aphid" />
    </div>
  )
}
