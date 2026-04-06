import { Worm } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateJapaneseBeetle } from "@/lib/models/japanese-beetle"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Japanese Beetle | OrchardGuard", description: "Japanese beetle emergence and defoliation tolerance." }
export const dynamic = "force-dynamic"

export default function JapaneseBeetlePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateJapaneseBeetle(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Worm className="h-8 w-8 text-green-700" />} title="Japanese Beetle" riskLevel={result.riskLevel} subtitle={`Emergence tracking — ${orchard.name}`} />
      <AboutCard title="Japanese Beetle">
        <p>Japanese beetle (<em>Popillia japonica</em>) is an invasive pest from Asia that feeds on over 300 plant species. Adults are metallic green with copper-brown wing covers. They skeletonize apple leaves by feeding between the veins, leaving a lace-like pattern.</p>
        <p><strong>Defoliation tolerance:</strong> Mature apple trees can tolerate significant defoliation (up to 20&ndash;30%) without yield impact. Treatment is generally only needed when defoliation threatens to reduce photosynthesis enough to affect fruit sizing or return bloom. Young trees are more vulnerable.</p>
        <p><strong>Trap warning:</strong> Japanese beetle pheromone traps attract MORE beetles to the area than they catch. Do NOT place traps in or near the orchard &mdash; they will increase damage, not reduce it. Traps are only useful for area-wide monitoring programs far from cropping areas.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Emergence" icon={<Worm className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 10°C from Jan 1" />
          <StatBox label="Adults Active" value={result.adultsActive ? "YES" : "Not yet"} sub="Active at ≥700 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.adultsActive} label={`Adults active (${Math.round(result.cumulativeDD)} / 700 DD)`} /></div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="japanese-beetle" />
      <ScoutingGuideSection slug="japanese-beetle" />
      <ProductEfficacyTable slug="japanese-beetle" />
      <CoincidenceAlerts slug="japanese-beetle" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="japanese-beetle" />
    </div>
  )
}
