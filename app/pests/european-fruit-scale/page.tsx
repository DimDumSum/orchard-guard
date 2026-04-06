import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateEuropeanFruitScale } from "@/lib/models/european-fruit-scale"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "European Fruit Scale | OrchardGuard", description: "European fruit scale crawler timing and oil application." }
export const dynamic = "force-dynamic"

export default function EuropeanFruitScalePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateEuropeanFruitScale(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-600" />} title="European Fruit Scale" riskLevel={result.riskLevel} subtitle={`Crawler timing — ${orchard.name}`} />
      <AboutCard title="European Fruit Scale">
        <p>European fruit scale (<em>Parthenolecanium corni</em>) is a soft scale insect that feeds on sap from branches and twigs. Unlike San Jose scale, it has only one generation per year and is generally less damaging, but heavy infestations can weaken trees and contaminate fruit with honeydew and sooty mold.</p>
        <p><strong>Control:</strong> Dormant oil is the primary control method. Crawler emergence occurs at approximately 550 degree days (base 10&deg;C) from March 1, providing a second spray window for infested blocks. One well-timed oil application during delayed dormant typically provides season-long control.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Development" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 10°C from Mar 1" />
          <StatBox label="Crawler Emergence" value={result.crawlerEmergence ? "ACTIVE" : "Not yet"} sub="Emerge at ≥550 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.crawlerEmergence} label={`Crawlers active (${Math.round(result.cumulativeDD)} / 550 DD)`} /></div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="european-fruit-scale" />
      <ScoutingGuideSection slug="european-fruit-scale" />
      <ProductEfficacyTable slug="european-fruit-scale" />
      <CoincidenceAlerts slug="european-fruit-scale" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="european-fruit-scale" />
    </div>
  )
}
