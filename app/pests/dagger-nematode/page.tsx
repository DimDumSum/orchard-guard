import { Microscope } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateDaggerNematode } from "@/lib/models/dagger-nematode"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Dagger Nematode | OrchardGuard", description: "Dagger nematode soil-test advisory and replant risk." }
export const dynamic = "force-dynamic"

export default function DaggerNematodePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateDaggerNematode(false)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Microscope className="h-8 w-8 text-stone-500" />} title="Dagger Nematode" riskLevel={result.riskLevel} subtitle={`Replant advisory — ${orchard.name}`} />
      <AboutCard title="Dagger Nematode">
        <p>Dagger nematodes (<em>Xiphinema</em> spp.) are microscopic, soil-dwelling roundworms that feed on apple roots. On their own, they cause minor root damage, but their real threat is as a <strong>virus vector</strong> &mdash; they transmit Tomato Ringspot Virus (ToRSV), which causes apple union necrosis and decline.</p>
        <p><strong>Replant risk:</strong> Dagger nematodes are primarily a concern when replanting on old orchard sites. They persist in soil around old root fragments and can transmit virus to newly planted trees. Pre-plant soil testing is essential.</p>
        <p><strong>Soil testing:</strong> Request <em>Xiphinema</em> spp. counts from your soil lab. Counts above 50 per 100 cm&sup3; of soil indicate elevated risk and may require pre-plant fumigation.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Advisory">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Current Assessment</p>
          <p className="text-sm text-bark-600">{result.details}</p>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Soil Testing Guide</p>
          <ul className="text-sm text-bark-600 list-disc pl-5 space-y-1">
            <li>Test soil before planting new blocks, especially replant sites</li>
            <li>Collect samples from the root zone (top 30 cm) in fall or spring</li>
            <li>Request <em>Xiphinema</em> spp. counts specifically</li>
            <li>Threshold: &gt;50 nematodes per 100 cm&sup3; soil warrants action</li>
            <li>If high counts: fumigate with Vapam or Telone before planting</li>
            <li>Remove old root fragments thoroughly before replanting</li>
          </ul>
        </div>
      </SectionCard>

      <ImageGallery slug="dagger-nematode" />
      <ScoutingGuideSection slug="dagger-nematode" />
      <ProductEfficacyTable slug="dagger-nematode" />
      <CoincidenceAlerts slug="dagger-nematode" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="dagger-nematode" />
    </div>
  )
}
