import { Warehouse } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluatePostHarvest } from "@/lib/models/post-harvest"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Post-Harvest Diseases | OrchardGuard", description: "Post-harvest disease risk assessment and storage management." }
export const dynamic = "force-dynamic"

export default function PostHarvestPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluatePostHarvest(0, false)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Warehouse className="h-8 w-8 text-gray-600" />} title="Post-Harvest Diseases" riskLevel={result.riskLevel} subtitle={`Storage risk advisory — ${orchard.name}`} />

      <AboutCard title="Post-Harvest Diseases">
        <p>Post-harvest diseases are a complex of fungal pathogens that cause fruit decay during cold storage. The most common are blue mold (<em>Penicillium expansum</em>), gray mold (<em>Botrytis cinerea</em>), and Mucor rot. These fungi typically enter through wounds &mdash; stem punctures, bruises, insect stings, and hail damage.</p>
        <p><strong>Wound entry:</strong> Nearly all post-harvest rots require a wound to initiate infection. Gentle handling during harvest, careful bin filling, and minimizing drops and impacts during packing are the most effective preventive measures. Even small bruises or stem punctures provide entry points.</p>
        <p><strong>Pre-harvest factors:</strong> Hail events, insect damage (especially codling moth and stink bug), and bird pecks during the growing season create wounds that serve as infection courts. The number of wound events during the season directly predicts storage loss potential.</p>
        <p className="font-medium text-bark-900">Post-harvest fungicide drenches (e.g., fludioxonil) and proper storage temperature management (0&ndash;1&deg;C) are critical for reducing losses in long-term storage.</p>
      </AboutCard>

      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />

      {result.woundRiskFactors.length > 0 && (
        <SectionCard title="Wound Risk Factors">
          <ul className="space-y-2 text-sm text-bark-600">
            {result.woundRiskFactors.map((f, i) => <li key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">&#x26A0;</span>{f}</li>)}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Storage Best Practices">
        <div className="space-y-2 text-sm text-bark-600">
          <p>&#x2610; Harvest at proper maturity &mdash; overripe fruit decays faster</p>
          <p>&#x2610; Minimize handling damage &mdash; pad bins, avoid drops</p>
          <p>&#x2610; Cool fruit to 0&ndash;1&deg;C within 24 hours of harvest</p>
          <p>&#x2610; Maintain &gt;90% relative humidity in storage</p>
          <p>&#x2610; Consider post-harvest fungicide drench for long-term lots</p>
          <p>&#x2610; Segregate damaged lots &mdash; hail-damaged fruit first to market</p>
        </div>
      </SectionCard>

      <ImageGallery slug="post-harvest" />
      <ScoutingGuideSection slug="post-harvest" />
      <ProductEfficacyTable slug="post-harvest" />
      <CoincidenceAlerts slug="post-harvest" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="post-harvest" />
    </div>
  )
}
