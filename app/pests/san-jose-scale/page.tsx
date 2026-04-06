import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateSanJoseScale } from "@/lib/models/san-jose-scale"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "San Jose Scale | OrchardGuard", description: "San Jose scale crawler emergence and dormant oil timing." }
export const dynamic = "force-dynamic"

export default function SanJoseScalePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateSanJoseScale(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-red-700" />} title="San Jose Scale" riskLevel={result.riskLevel} subtitle={`Crawler emergence tracking — ${orchard.name}`} />
      <AboutCard title="San Jose Scale">
        <p>San Jose scale (<em>Quadraspidiotus perniciosus</em>) is the most damaging armored scale insect in apple orchards. Female scales are tiny (1&ndash;2mm), circular, and camouflaged against bark. Heavy infestations cause red halos on fruit, bark cracking, branch dieback, and tree death.</p>
        <p><strong>Crawler vulnerability:</strong> Adult scales are protected under their armored cover and are nearly impossible to kill with contact insecticides. The brief crawler stage &mdash; when newly born nymphs emerge and walk to new feeding sites &mdash; is the only window for effective chemical control. First-generation crawlers emerge at approximately 450 degree days (base 10&deg;C).</p>
        <p><strong>Dormant oil:</strong> Superior oil applied during the delayed dormant period (silver tip to green tip) smothers overwintering scales and is the foundation of SJS management. Crawler-targeted sprays provide the second line of defense.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development Status" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 10°C from Mar 1" />
          <StatBox label="1st Gen Crawlers" value={result.crawlerEmergence ? "ACTIVE" : "Not yet"} sub="Emerge at ≥450 DD" />
          <StatBox label="2nd Generation" value={result.secondGen ? "ACTIVE" : "Not yet"} sub="Emerge at ≥1100 DD" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.crawlerEmergence} label={`1st gen crawler emergence (${Math.round(result.cumulativeDD)} / 450 DD)`} />
          <ConditionDot met={result.secondGen} label={`2nd gen crawler emergence (${Math.round(result.cumulativeDD)} / 1100 DD)`} />
        </div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="san-jose-scale" />
      <ScoutingGuideSection slug="san-jose-scale" />
      <ProductEfficacyTable slug="san-jose-scale" />
      <CoincidenceAlerts slug="san-jose-scale" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="san-jose-scale" />
    </div>
  )
}
