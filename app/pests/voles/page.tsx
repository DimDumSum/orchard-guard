import { Rat } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateVoles } from "@/lib/models/voles"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Voles | OrchardGuard", description: "Meadow and pine vole seasonal girdling risk." }
export const dynamic = "force-dynamic"

export default function VolesPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateVoles()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Rat className="h-8 w-8 text-stone-600" />} title="Voles" riskLevel={result.riskLevel} subtitle={`Seasonal girdling risk — ${orchard.name}`} />
      <AboutCard title="Voles (Meadow & Pine)">
        <p>Meadow voles (<em>Microtus pennsylvanicus</em>) and pine voles (<em>Microtus pinetorum</em>) are the most damaging vertebrate pests in Ontario apple orchards. They gnaw bark at and below the soil line, girdling trunks and killing trees &mdash; often undetected under mulch or snow until spring.</p>
        <p><strong>Meadow voles</strong> create surface runways through grass and feed on bark above ground level. They are most active when tall grass or mulch provides cover from predators.</p>
        <p><strong>Pine voles</strong> burrow underground and feed on roots and bark below the soil surface. They are harder to detect and control because they rarely come to the surface.</p>
        <p className="font-medium text-bark-900">Young trees on dwarfing rootstocks are most vulnerable &mdash; a single night of girdling can kill a tree that took years to establish.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Seasonal Status">
        <StatBox label="Current Season" value={result.season.charAt(0).toUpperCase() + result.season.slice(1)} sub="Risk varies by season" />
        {(result.season === "fall" || result.season === "winter") && (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Peak Risk Period</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{result.details}</p>
          </div>
        )}
        {(result.season === "spring" || result.season === "summer") && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1">Current Conditions</p>
            <p className="text-sm text-bark-600">{result.details}</p>
          </div>
        )}
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Prevention Checklist</p>
          <ul className="text-sm text-bark-600 list-disc pl-5 space-y-1">
            <li>Mow grass short (5 cm) around tree rows — reduces cover</li>
            <li>Pull mulch 15&ndash;20 cm away from trunks before fall</li>
            <li>Install hardware-cloth trunk guards on young trees</li>
            <li>Maintain bait stations with zinc phosphide along runways</li>
            <li>Inspect trunks at the soil line after snowmelt for girdling</li>
          </ul>
        </div>
      </SectionCard>

      <ImageGallery slug="voles" />
      <ScoutingGuideSection slug="voles" />
      <ProductEfficacyTable slug="voles" />
      <CoincidenceAlerts slug="voles" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="voles" />
    </div>
  )
}
