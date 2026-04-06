import { Droplets } from "lucide-react"
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db"
import { evaluateBitterRot } from "@/lib/models/bitter-rot"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Bitter Rot Detail | OrchardGuard", description: "Bitter rot risk from heat and wet event tracking." }
export const dynamic = "force-dynamic"

export default function BitterRotPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hourlyEnd = now.toISOString().slice(0, 10)
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd)
  const hourlyMapped = hourlyData.map(h => ({ timestamp: h.timestamp, temp_c: h.temp_c ?? 0, humidity_pct: h.humidity_pct ?? 0, precip_mm: h.precip_mm ?? 0 }))

  const dailyStart = `${now.getFullYear()}-01-01`
  const dailyData = getDailyWeather("default", dailyStart, hourlyEnd)
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))

  const result = evaluateBitterRot(hourlyMapped, dailyMapped, orchard.petal_fall_date)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Droplets className="h-8 w-8 text-amber-700" />} title="Bitter Rot" riskLevel={result.riskLevel} subtitle={`Heat + wet event tracking — ${orchard.name}`} />

      <AboutCard title="Bitter Rot">
        <p>Bitter rot (<em>Colletotrichum</em> spp.) is the most important summer rot of apples in warm, humid growing regions. The disease causes sunken, tan-to-brown lesions on fruit that expand rapidly in hot weather, often with concentric rings and pink-orange spore masses.</p>
        <p><strong>Why it&rsquo;s a hot-weather disease:</strong> Unlike many apple pathogens, bitter rot thrives at temperatures above 21&deg;C and peaks at 25&ndash;30&deg;C. Hot, humid summers with frequent rain create ideal conditions for rapid disease buildup. Infections can remain latent for weeks before symptoms appear.</p>
        <p><strong>Latent infections:</strong> Fruit can be infected early in the season but show no symptoms until weeks later as fruit matures. This makes early-season fungicide coverage during warm, wet periods critical &mdash; by the time you see symptoms, the damage was done weeks ago.</p>
        <p className="font-medium text-bark-900">In Ontario, bitter rot risk increases sharply in July and August. Orchards with a history of bitter rot need protective fungicide sprays starting from June through harvest.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Disease Drivers" icon={<Droplets className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Degree Days (base 15°C)" value={Math.round(result.cumulativeDD15)} sub="From petal fall" />
          <StatBox label="Warm Wet Events" value={result.warmWetEvents} sub=">5h wet at >21°C" />
          <StatBox label="Latent Infections" value={result.latentInfections} sub="Warm wet events since Jun 1" />
        </div>
        {result.scoutingProtocol && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1">Scouting Protocol</p>
            <p className="text-sm text-bark-600">{result.scoutingProtocol}</p>
          </div>
        )}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="bitter-rot" />
      <ScoutingGuideSection slug="bitter-rot" />
      <ProductEfficacyTable slug="bitter-rot" />
      <CoincidenceAlerts slug="bitter-rot" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="bitter-rot" />
    </div>
  )
}
