import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateDogwoodBorer } from "@/lib/models/dogwood-borer"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Dogwood Borer | OrchardGuard", description: "Dogwood borer degree-day tracking and burr knot inspection guide." }
export const dynamic = "force-dynamic"

export default function DogwoodBorerPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateDogwoodBorer(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-amber-700" />} title="Dogwood Borer" riskLevel={result.riskLevel} subtitle={`DD tracking — ${orchard.name}`} />
      <AboutCard title="Dogwood Borer">
        <p>The dogwood borer (<em>Synanthedon scitula</em>) is a clearwing moth whose larvae bore into burr knots and graft unions on apple trees. It is the most common borer pest in high-density apple orchards on dwarfing rootstocks.</p>
        <p><strong>Burr knot vulnerability:</strong> Dwarfing rootstocks like M.9 and M.26 produce burr knots &mdash; clusters of root initials on the trunk above ground. These soft, spongy growths are highly attractive to dogwood borer females for egg-laying. Burying burr knots below the soil line or applying latex paint can reduce infestation.</p>
        <p><strong>Peak activity:</strong> Adult moths peak at approximately 800 degree days (base 10&deg;C). Pheromone traps help confirm timing. Trunk sprays targeted at the graft union area during peak emergence can reduce larval establishment.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Degree Day Tracking" icon={<Bug className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 10°C from Jan 1" />
          <StatBox label="Adult Peak" value={result.adultPeak ? "YES" : "Not yet"} sub="Peak at ≥800 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.adultPeak} label={`Peak adult activity (${Math.round(result.cumulativeDD)} / 800 DD)`} /></div>
        {result.scoutingProtocol && <div className="mt-4 rounded-lg bg-muted/50 p-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="dogwood-borer" />
      <ScoutingGuideSection slug="dogwood-borer" />
      <ProductEfficacyTable slug="dogwood-borer" />
      <CoincidenceAlerts slug="dogwood-borer" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="dogwood-borer" />
    </div>
  )
}
