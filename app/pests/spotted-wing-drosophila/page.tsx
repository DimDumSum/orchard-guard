import { Bug } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateSWD } from "@/lib/models/spotted-wing-drosophila"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Spotted Wing Drosophila | OrchardGuard", description: "SWD advisory for apple orchards." }
export const dynamic = "force-dynamic"

export default function SpottedWingDrosophilaPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateSWD()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-orange-500" />} title="Spotted Wing Drosophila" riskLevel={result.riskLevel} subtitle={`Advisory — ${orchard.name}`} />
      <AboutCard title="Spotted Wing Drosophila (SWD)">
        <p>Spotted wing drosophila (<em>Drosophila suzukii</em>) is an invasive vinegar fly that lays eggs in ripening soft fruit. Unlike common fruit flies, the female has a serrated ovipositor that can cut into intact fruit skin &mdash; primarily cherries, berries, and stone fruit.</p>
        <p><strong>Apple relevance:</strong> Intact apple fruit is generally <strong>not at risk</strong> from SWD. The thick skin of apples prevents egg-laying. However, damaged, cracked, or overripe fruit can attract SWD, especially late in the season when other host fruit is depleted.</p>
        <p><strong>When to watch:</strong> If you grow mixed fruit (especially cherries or berries near your apple blocks), SWD populations may be higher in the area. Keep apple drops picked up and remove damaged fruit promptly.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Advisory Notes">
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Low Risk to Apples</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">Intact apple fruit is not a preferred host. SWD primarily targets soft-skinned fruit like cherries, blueberries, and raspberries. Maintain good sanitation by removing drops and damaged fruit to minimize any secondary attraction.</p>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Monitoring</p>
          <p className="text-sm text-bark-600">Apple cider vinegar traps can monitor SWD presence if soft fruit is grown nearby. Place traps at the orchard edge nearest other host crops.</p>
        </div>
      </SectionCard>

      <ImageGallery slug="spotted-wing-drosophila" />
      <ScoutingGuideSection slug="spotted-wing-drosophila" />
      <ProductEfficacyTable slug="spotted-wing-drosophila" />
      <CoincidenceAlerts slug="spotted-wing-drosophila" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="spotted-wing-drosophila" />
    </div>
  )
}
