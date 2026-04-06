import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateWinterMoth } from "@/lib/models/winter-moth"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Winter Moth | OrchardGuard", description: "Winter moth degree-day tracking and banding guide." }
export const dynamic = "force-dynamic"

export default function WinterMothPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateWinterMoth(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-blue-600" />} title="Winter Moth" riskLevel={result.riskLevel} subtitle={`DD emergence tracking — ${orchard.name}`} />
      <AboutCard title="Winter Moth">
        <p>Winter moth (<em>Operophtera brumata</em>) is an invasive defoliator originally from Europe. Adult moths emerge in late November through December. Females are flightless and must climb tree trunks to lay eggs, making sticky banding an effective monitoring and control tool.</p>
        <p><strong>Lifecycle:</strong> Eggs hatch in early spring as buds begin to swell, at approximately 50&ndash;300 degree days (base 5&deg;C) from January 1. Tiny caterpillars enter buds and feed from inside, then move to expanding leaves. Severe infestations can completely defoliate trees.</p>
        <p><strong>Banding:</strong> Apply sticky bands around trunks in mid-November before adult emergence. Check bands weekly &mdash; a high catch of flightless females climbing trunks indicates the need for a spring caterpillar spray. Remove bands by late March to avoid trapping beneficial insects.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Degree Day Tracking" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Jan 1" />
          <StatBox label="Larvae Active" value={result.larvaeActive ? "YES" : "No"} sub="Active at 50–300 DD" />
        </div>
        <div className="mt-4 space-y-2">
          <ConditionDot met={result.cumulativeDD >= 50} label={`Egg hatch beginning (≥50 DD): ${Math.round(result.cumulativeDD)} DD`} />
          <ConditionDot met={result.larvaeActive} label="Larvae actively feeding in buds and on leaves" />
          <ConditionDot met={result.cumulativeDD >= 300} label="Larval feeding period ending (≥300 DD)" />
        </div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="winter-moth" />
      <ScoutingGuideSection slug="winter-moth" />
      <ProductEfficacyTable slug="winter-moth" />
      <CoincidenceAlerts slug="winter-moth" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="winter-moth" />
    </div>
  )
}
