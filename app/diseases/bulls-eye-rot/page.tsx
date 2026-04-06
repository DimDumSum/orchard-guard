import { ShieldAlert } from "lucide-react"
import { getOrchard, getWeatherRange } from "@/lib/db"
import { evaluateBullsEyeRot } from "@/lib/models/bulls-eye-rot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Bull's Eye Rot Detail | OrchardGuard", description: "Bull's eye rot risk from late season rain tracking." }
export const dynamic = "force-dynamic"

export default function BullsEyeRotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, humidity_pct: h.humidity_pct ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const result = evaluateBullsEyeRot(hourlyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<ShieldAlert className="h-8 w-8 text-amber-700" />} title="Bull's Eye Rot" riskLevel={result.riskLevel} subtitle={`Late season rain tracking — ${orchard.name}`} />

      <AboutCard title="Bull's Eye Rot">
        <p>Bull&rsquo;s eye rot (<em>Neofabraea</em> spp., also called <em>Phlyctema vagabunda</em>) is a post-harvest storage disease that infects fruit in the orchard but doesn&rsquo;t show symptoms until weeks or months in cold storage. The characteristic bullseye lesion &mdash; a light brown center with darker concentric rings &mdash; appears on stored fruit.</p>
        <p><strong>Late-season infection:</strong> Spores from cankers on branches are rain-splashed onto fruit during August through October. Frequent fall rains increase the number of infections that will emerge later in storage. The fungus enters through lenticels and remains dormant until storage conditions allow it to develop.</p>
        <p><strong>Canker management:</strong> The primary inoculum source is perennial cankers on scaffold branches and small twigs. Pruning out cankered wood during the dormant season reduces spore loads significantly. Pre-harvest fungicide applications during rainy periods in late summer and fall can also reduce storage losses.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Late Season Rain Events" icon={<ShieldAlert className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Rain Events (Aug–Oct)" value={result.lateSeasonRainEvents} sub="Days >2mm rain" />
          <StatBox label="Storage Risk" value={result.riskLevel.toUpperCase()} sub="Based on pre-harvest rain exposure" />
        </div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="bulls-eye-rot" />
      <ScoutingGuideSection slug="bulls-eye-rot" />
      <ProductEfficacyTable slug="bulls-eye-rot" />
      <CoincidenceAlerts slug="bulls-eye-rot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="bulls-eye-rot" />
    </div>
  )
}
