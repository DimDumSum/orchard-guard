import { Bug } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateAppleProliferation } from "@/lib/models/apple-proliferation"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Proliferation | OrchardGuard", description: "Apple proliferation phytoplasma advisory." }
export const dynamic = "force-dynamic"

export default function AppleProliferationPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateAppleProliferation()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-red-600" />} title="Apple Proliferation" riskLevel={result.riskLevel} subtitle={`Phytoplasma advisory — ${orchard.name}`} />

      <AboutCard title="Apple Proliferation">
        <p>Apple proliferation is caused by a phytoplasma (<em>Candidatus Phytoplasma mali</em>) transmitted by psyllid insect vectors, primarily <em>Cacopsylla picta</em> and <em>C. melanoneura</em>. It is a regulated disease in many jurisdictions and a potentially emerging threat in Ontario.</p>
        <p><strong>Symptoms:</strong> Characteristic &ldquo;witches&rsquo; broom&rdquo; growth with clusters of thin, upright shoots from nodes. Fruit is undersized, poorly colored, and may show early reddening. Enlarged, persistent stipules are a diagnostic feature. Symptoms often appear in late summer.</p>
        <p><strong>Regulatory significance:</strong> Apple proliferation is a quarantine pest in some regions. If you observe suspected symptoms, contact the Canadian Food Inspection Agency (CFIA) and your local crop advisor. Early detection and reporting are critical for managing this emerging threat.</p>
        <p className="font-medium text-bark-900">Apple proliferation has not been confirmed in Ontario as of this writing, but monitoring for symptoms is recommended as part of a proactive biosecurity program.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Symptom Guide">
        <div className="space-y-3 text-sm text-bark-600">
          <p><strong>Witches&rsquo; broom:</strong> Dense clusters of thin, upright shoots growing from a single point on a branch. Most visible in late summer.</p>
          <p><strong>Small fruit:</strong> Undersized, flattened fruit with poor color development. Fruit may ripen prematurely or show early red coloring.</p>
          <p><strong>Enlarged stipules:</strong> Leaf stipules that are abnormally large and persist on the shoot. This is considered a diagnostic feature.</p>
          <p><strong>Leaf rosettes:</strong> Shortened internodes causing leaves to cluster together, giving a rosette appearance at shoot tips.</p>
        </div>
      </SectionCard>

      <SectionCard title="What To Do If Suspected">
        <div className="space-y-2 text-sm text-bark-600">
          <p>&#x2610; Photograph symptoms from multiple angles</p>
          <p>&#x2610; Contact CFIA at 1-800-442-2342 or your local extension agent</p>
          <p>&#x2610; Do NOT prune or remove the tree until it has been assessed</p>
          <p>&#x2610; Note the tree location, cultivar, and rootstock for reporting</p>
          <p>&#x2610; Monitor neighboring trees for similar symptoms</p>
        </div>
      </SectionCard>

      <ImageGallery slug="apple-proliferation" />
      <ScoutingGuideSection slug="apple-proliferation" />
      <ProductEfficacyTable slug="apple-proliferation" />
      <CoincidenceAlerts slug="apple-proliferation" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-proliferation" />
    </div>
  )
}
