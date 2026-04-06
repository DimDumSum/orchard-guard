import { TreeDeciduous } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateDeer } from "@/lib/models/deer"
import { DetailHeader, RiskScoreCard, AboutCard, StatBox, SectionCard } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Deer Damage | OrchardGuard", description: "Deer browse and antler rub seasonal risk." }
export const dynamic = "force-dynamic"

export default function DeerPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateDeer()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<TreeDeciduous className="h-8 w-8 text-amber-700" />} title="Deer Damage" riskLevel={result.riskLevel} subtitle={`Seasonal browse risk — ${orchard.name}`} />
      <AboutCard title="Deer Damage">
        <p>White-tailed deer cause two types of damage in apple orchards: <strong>browse damage</strong> (eating buds, shoots, and terminal leaders) and <strong>antler rub</strong> (bucks rubbing bark off trunks in fall). Both are most severe on young, non-bearing trees.</p>
        <p><strong>Browse damage:</strong> Deer preferentially eat apple terminal leaders and flower buds, especially in winter and early spring when other food is scarce. Losing a terminal leader sets a young tree back 1&ndash;2 years of growth.</p>
        <p><strong>Antler rub:</strong> In September&ndash;November, bucks rub velvet off their antlers on smooth-barked young trees. This strips bark and can completely girdle and kill trees.</p>
        <p className="font-medium text-bark-900">8-foot exclusion fencing is the only reliable long-term solution for orchards with high deer pressure.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Seasonal Status">
        <StatBox label="Current Season" value={result.season.charAt(0).toUpperCase() + result.season.slice(1)} sub="Risk varies by season" />
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Current Conditions</p>
          <p className="text-sm text-bark-600">{result.details}</p>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Protection Strategies</p>
          <ul className="text-sm text-bark-600 list-disc pl-5 space-y-1">
            <li>8 ft woven wire or electric fencing around young blocks</li>
            <li>Wire cages or tree shelters on individual young trees</li>
            <li>Trunk guards to prevent antler rub damage</li>
            <li>Remove attractants (windfall fruit) near fence lines</li>
            <li>Inspect fencing after storms and after snowmelt</li>
          </ul>
        </div>
      </SectionCard>

      <ImageGallery slug="deer" />
      <ScoutingGuideSection slug="deer" />
      <ProductEfficacyTable slug="deer" />
      <CoincidenceAlerts slug="deer" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="deer" />
    </div>
  )
}
