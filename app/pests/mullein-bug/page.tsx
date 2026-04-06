import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateMulleinBug } from "@/lib/models/mullein-bug"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Mullein Bug | OrchardGuard", description: "Mullein bug predator/pest assessment." }
export const dynamic = "force-dynamic"

export default function MulleinBugPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateMulleinBug(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-green-700" />} title="Mullein Bug" riskLevel={result.riskLevel} subtitle={`Predator/pest assessment — ${orchard.name}`} />
      <AboutCard title="Mullein Bug">
        <p>The mullein bug (<em>Campylomma verbasci</em>) occupies a unique position as both pest and beneficial predator. As a predator, it feeds on mites, aphids, and other small arthropods. As a pest, it can damage developing fruitlets during bloom, causing small dimples on mature fruit.</p>
        <p><strong>The trade-off:</strong> The decision to spray for mullein bug requires weighing pest damage against the loss of predatory services. In orchards with significant mite pressure, mullein bug predation may be more valuable than the minor fruit damage it causes. Only treat when populations exceed the threshold during bloom.</p>
        <p><strong>Timing:</strong> Egg hatch occurs at approximately 200 degree days (base 7&deg;C) from April 1. The damage window is narrow &mdash; primarily during bloom when nymphs probe developing fruitlets. After petal fall, mullein bugs shift to predatory feeding and become beneficial.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 7°C from Apr 1" />
          <StatBox label="Egg Hatch" value={result.eggHatch ? "YES" : "Not yet"} sub="Hatches at ≥200 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.eggHatch} label={`Egg hatch (${Math.round(result.cumulativeDD)} / 200 DD)`} /></div>
        <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4"><p className="text-sm font-medium text-blue-800 dark:text-blue-200">Predator vs Pest</p><p className="mt-1 text-sm text-blue-700 dark:text-blue-300">After petal fall, mullein bug shifts to predatory feeding on mites and aphids. Spraying post-bloom eliminates a beneficial predator. Only treat during bloom if threshold is exceeded.</p></div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="mullein-bug" />
      <ScoutingGuideSection slug="mullein-bug" />
      <ProductEfficacyTable slug="mullein-bug" />
      <CoincidenceAlerts slug="mullein-bug" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="mullein-bug" />
    </div>
  )
}
