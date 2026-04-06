import { Bug } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluatePearPsylla } from "@/lib/models/pear-psylla"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Pear Psylla | OrchardGuard", description: "Pear psylla advisory for adjacent pear blocks." }
export const dynamic = "force-dynamic"

export default function PearPsyllaPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluatePearPsylla()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-lime-600" />} title="Pear Psylla" riskLevel={result.riskLevel} subtitle={`Advisory — ${orchard.name}`} />
      <AboutCard title="Pear Psylla">
        <p>Pear psylla (<em>Cacopsylla pyricola</em>) is primarily a pear pest, but it can be relevant in apple orchards where pear blocks are adjacent. Adults are tiny, cicada-shaped insects that overwinter in bark crevices and become active in early spring.</p>
        <p><strong>Apple relevance:</strong> Pear psylla does not feed on apple trees. However, if you grow pears nearby, psylla populations can build up and drift into apple blocks. More importantly, pear psylla vectors <strong>phytoplasma</strong> (pear decline disease).</p>
        <p><strong>Honeydew and sooty mold:</strong> Heavy psylla infestations on nearby pears produce sticky honeydew that supports sooty mold growth. This can contaminate adjacent apple fruit if blocks are close together.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Advisory Notes">
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Low Risk to Apples</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">Pear psylla is not an apple pest. Monitor only if pear trees are grown nearby. No apple-specific treatment is needed.</p>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">When to Monitor</p>
          <ul className="text-sm text-bark-600 list-disc pl-5 space-y-1">
            <li>Only relevant if pear blocks are adjacent to apple blocks</li>
            <li>Watch for honeydew contamination on apple fruit near pear rows</li>
            <li>Pear psylla vectors phytoplasma — manage on pears to protect pear health</li>
          </ul>
        </div>
      </SectionCard>

      <ImageGallery slug="pear-psylla" />
      <ScoutingGuideSection slug="pear-psylla" />
      <ProductEfficacyTable slug="pear-psylla" />
      <CoincidenceAlerts slug="pear-psylla" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="pear-psylla" />
    </div>
  )
}
