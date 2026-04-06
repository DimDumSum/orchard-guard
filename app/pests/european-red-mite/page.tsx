import { Egg } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateEuropeanRedMite } from "@/lib/models/european-red-mite"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "European Red Mite | OrchardGuard", description: "European red mite DD tracking, mite-day accumulation, and predator ratio." }
export const dynamic = "force-dynamic"

export default function EuropeanRedMitePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateEuropeanRedMite(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Egg className="h-8 w-8 text-red-600" />} title="European Red Mite" riskLevel={result.riskLevel} subtitle={`Mite management — ${orchard.name}`} />
      <AboutCard title="European Red Mite">
        <p>European red mite (<em>Panonychus ulmi</em>) is the most common mite pest in apple orchards. Overwintering eggs are tiny, red, and round, found in bark crevices and around bud bases. They hatch in spring and populations can build rapidly through summer, with multiple overlapping generations.</p>
        <p><strong>Mite-day accumulation:</strong> Mite damage is cumulative &mdash; it depends on both population density and duration. The concept of &ldquo;mite-days&rdquo; (average mites per leaf &times; days) captures this relationship. Economic injury occurs at approximately 500 mite-days per leaf, or an instantaneous count of &gt;5 mites per leaf.</p>
        <p><strong>Predatory mites:</strong> <em>Typhlodromus pyri</em> and <em>Amblyseius fallacis</em> are key biological control agents. A predator-to-prey ratio of 1:10 or better usually provides effective natural control. Broad-spectrum insecticides (pyrethroids, organophosphates) disrupt this balance and often cause mite outbreaks.</p>
        <p className="font-medium text-bark-900">The best mite management strategy is preserving predatory mites by choosing selective insecticides for other pest targets.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development" icon={<Egg className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Mar 1" />
          <StatBox label="Egg Hatch" value={result.eggHatch ? "YES" : "Not yet"} sub="Hatches at ≥185 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.eggHatch} label={`Overwintering egg hatch (${Math.round(result.cumulativeDD)} / 185 DD)`} /></div>
        {result.economicThreshold && <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="european-red-mite" />
      <ScoutingGuideSection slug="european-red-mite" />
      <ProductEfficacyTable slug="european-red-mite" />
      <CoincidenceAlerts slug="european-red-mite" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="european-red-mite" />
    </div>
  )
}
