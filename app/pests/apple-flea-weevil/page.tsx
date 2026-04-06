import { Worm } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateAppleFleaWeevil } from "@/lib/models/apple-flea-weevil"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard, ProductList, ConditionDot } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Flea Weevil | OrchardGuard", description: "Apple flea weevil activity timing." }
export const dynamic = "force-dynamic"

export default function AppleFleaWeevilPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateAppleFleaWeevil(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Worm className="h-8 w-8 text-amber-600" />} title="Apple Flea Weevil" riskLevel={result.riskLevel} subtitle={`Activity timing — ${orchard.name}`} />
      <AboutCard title="Apple Flea Weevil">
        <p>The apple flea weevil (<em>Rhynchaenus pallicornis</em>) is a minor early-season pest. Adults create small, irregular feeding holes in expanding leaves during spring. Larvae mine leaves, creating blotch mines that can be confused with other leafminers.</p>
        <p><strong>Generally minor:</strong> Apple flea weevil rarely reaches economically damaging levels in well-managed orchards. It becomes active at approximately 100 degree days (base 5&deg;C) from April 1. Sprays applied for other spring pests typically provide incidental control.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Activity" icon={<Worm className="h-5 w-5 text-muted-foreground" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox label="Cumulative DD" value={Math.round(result.cumulativeDD)} sub="Base 5°C from Apr 1" />
          <StatBox label="Active" value={result.active ? "YES" : "Not yet"} sub="Active at ≥100 DD" />
        </div>
        <div className="mt-4"><ConditionDot met={result.active} label={`Adults active (${Math.round(result.cumulativeDD)} / 100 DD)`} /></div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="apple-flea-weevil" />
      <ScoutingGuideSection slug="apple-flea-weevil" />
      <ProductEfficacyTable slug="apple-flea-weevil" />
      <CoincidenceAlerts slug="apple-flea-weevil" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-flea-weevil" />
    </div>
  )
}
