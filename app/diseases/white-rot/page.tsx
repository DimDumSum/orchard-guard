import { FlaskConical } from "lucide-react"
import { getOrchard, getWeatherRange } from "@/lib/db"
import { evaluateWhiteRot } from "@/lib/models/white-rot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "White Rot Detail | OrchardGuard", description: "White rot risk from hot wet event tracking." }
export const dynamic = "force-dynamic"

export default function WhiteRotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, humidity_pct: h.humidity_pct ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const result = evaluateWhiteRot(hourlyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<FlaskConical className="h-8 w-8 text-gray-600" />} title="White Rot" riskLevel={result.riskLevel} subtitle={`Hot wet event monitoring — ${orchard.name}`} />

      <AboutCard title="White Rot">
        <p>White rot (<em>Botryosphaeria dothidea</em>) is a summer fruit rot closely related to black rot but with a preference for hotter conditions. Infected fruit develop light tan, watery lesions that eventually consume the entire fruit, which may remain attached to the tree as &ldquo;mummies.&rdquo;</p>
        <p><strong>Hot + wet connection:</strong> White rot is triggered by temperatures above 25&deg;C combined with extended wetness periods of 6+ hours. It is most common in the warmest parts of the growing season (July&ndash;August) and in warm microclimates within the orchard.</p>
        <p><strong>Soil-level cankers:</strong> The fungus often colonizes the tree from soil-level cankers at the base of the trunk. Keeping the trunk area clean, avoiding soil contact with wounds, and removing infected bark can reduce inoculum.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Hot Wet Events" icon={<FlaskConical className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Hot Wet Events" value={result.hotWetEvents} sub=">25°C with >6h wetness" />
          <StatBox label="Risk Level" value={result.riskLevel.toUpperCase()} />
        </div>
        {result.scoutingProtocol && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1">Scouting Protocol</p>
            <p className="text-sm text-bark-600">{result.scoutingProtocol}</p>
          </div>
        )}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="white-rot" />
      <ScoutingGuideSection slug="white-rot" />
      <ProductEfficacyTable slug="white-rot" />
      <CoincidenceAlerts slug="white-rot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="white-rot" />
    </div>
  )
}
