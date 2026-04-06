import { Dna } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateAppleMosaic } from "@/lib/models/apple-mosaic"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Mosaic Virus | OrchardGuard", description: "Apple mosaic virus advisory and scouting guide." }
export const dynamic = "force-dynamic"

export default function AppleMosaicPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateAppleMosaic()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Dna className="h-8 w-8 text-purple-600" />} title="Apple Mosaic Virus" riskLevel={result.riskLevel} subtitle={`Scouting advisory — ${orchard.name}`} />

      <AboutCard title="Apple Mosaic Virus">
        <p>Apple mosaic virus (ApMV) is a latent virus that infects apple trees through grafting with infected budwood or rootstock. Unlike fungal or bacterial diseases, there is no cure, no chemical treatment, and no insect vector &mdash; the virus spreads only through propagation material.</p>
        <p><strong>Symptoms:</strong> Infected trees may show pale yellow to cream-colored mosaic patterns on leaves, particularly noticeable in spring. Symptoms vary by cultivar &mdash; some show dramatic leaf markings while others remain symptomless carriers. Infected trees may have reduced vigor and 20&ndash;30% lower yields over time.</p>
        <p><strong>Why it matters:</strong> Once a tree is infected, it carries the virus for life. The only management strategy is prevention: plant certified virus-free nursery stock, and remove confirmed symptomatic trees to prevent their use as budwood sources.</p>
        <p className="font-medium text-bark-900">ApMV cannot spread tree-to-tree in the orchard through natural means. Your risk comes entirely from planting infected nursery stock.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      <SectionCard title="Scouting Guide">
        <div className="space-y-3 text-sm text-bark-600">
          <p><strong>When to scout:</strong> Late May through June when symptoms are most visible on expanding leaves.</p>
          <p><strong>What to look for:</strong> Irregular cream to bright yellow patches, bands, or mosaic patterns on leaves. Compare with healthy leaves on the same tree. Symptoms are most obvious on shade leaves.</p>
          <p><strong>Recording:</strong> Mark symptomatic trees with flagging tape. Record GPS location, cultivar, rootstock, and nursery source. This information helps trace potentially infected planting material.</p>
        </div>
      </SectionCard>

      <SectionCard title="Symptomatic Tree Management">
        <div className="space-y-2 text-sm text-bark-600">
          <p>&#x2610; Flag any trees showing mosaic leaf patterns</p>
          <p>&#x2610; Do NOT use flagged trees as budwood or scion source</p>
          <p>&#x2610; Consider removal if yield loss exceeds 20%</p>
          <p>&#x2610; Source all new trees from certified virus-free nurseries</p>
          <p>&#x2610; Request virus testing certificates from your nursery supplier</p>
        </div>
      </SectionCard>

      <ImageGallery slug="apple-mosaic" />
      <ScoutingGuideSection slug="apple-mosaic" />
      <ProductEfficacyTable slug="apple-mosaic" />
      <CoincidenceAlerts slug="apple-mosaic" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-mosaic" />
    </div>
  )
}
