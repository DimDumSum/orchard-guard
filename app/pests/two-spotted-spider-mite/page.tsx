import { Egg } from "lucide-react"
import { getOrchard, getWeatherRange } from "@/lib/db"
import { evaluateTwoSpottedSpiderMite } from "@/lib/models/two-spotted-spider-mite"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Two-Spotted Spider Mite | OrchardGuard", description: "Two-spotted spider mite hot-dry weather tracking." }
export const dynamic = "force-dynamic"

export default function TwoSpottedSpiderMitePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const result = evaluateTwoSpottedSpiderMite(hourlyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Egg className="h-8 w-8 text-orange-600" />} title="Two-Spotted Spider Mite" riskLevel={result.riskLevel} subtitle={`Hot-dry weather tracking — ${orchard.name}`} />
      <AboutCard title="Two-Spotted Spider Mite">
        <p>The two-spotted spider mite (<em>Tetranychus urticae</em>) is a hot-weather mite that thrives during prolonged hot, dry periods. Unlike European red mite, TSSM does not overwinter on apple trees &mdash; it migrates in from ground cover and weeds during summer heat waves.</p>
        <p><strong>Hot-dry trigger:</strong> Extended periods above 30&deg;C with no rain create ideal conditions for TSSM population explosions. Drought-stressed trees are especially vulnerable because reduced leaf turgor makes feeding easier for mites.</p>
        <p><strong>Lower canopy focus:</strong> TSSM tends to build up in the lower, interior canopy first. Scout by examining the undersides of leaves in the lower third of trees for stippling damage and the tiny, yellowish-green mites with two dark spots.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Weather Trigger" icon={<Egg className="h-5 w-5 text-muted-foreground" />}>
        <StatBox label="Hot Dry Streak" value={`${result.hotDryStreak} days`} sub="Consecutive days >30°C, no rain" />
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="two-spotted-spider-mite" />
      <ScoutingGuideSection slug="two-spotted-spider-mite" />
      <ProductEfficacyTable slug="two-spotted-spider-mite" />
      <CoincidenceAlerts slug="two-spotted-spider-mite" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="two-spotted-spider-mite" />
    </div>
  )
}
