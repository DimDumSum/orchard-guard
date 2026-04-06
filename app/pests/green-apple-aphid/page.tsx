import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateGreenAppleAphid } from "@/lib/models/green-apple-aphid"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Green Apple Aphid | OrchardGuard", description: "Green apple aphid population tracking and natural enemy assessment." }
export const dynamic = "force-dynamic"

export default function GreenAppleAphidPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateGreenAppleAphid(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-green-600" />} title="Green Apple Aphid" riskLevel={result.riskLevel} subtitle={`Population management — ${orchard.name}`} />
      <AboutCard title="Green Apple Aphid">
        <p>The green apple aphid (<em>Aphis pomi</em>) is the most common aphid species found in apple orchards. Unlike rosy apple aphid, green apple aphid rarely causes fruit deformation and is generally considered a minor pest in well-managed orchards.</p>
        <p><strong>Natural enemies are key:</strong> Lady beetles, lacewings, syrphid fly larvae, and parasitoid wasps are highly effective at controlling green apple aphid populations. In orchards with a good natural enemy complex, aphid populations rarely reach economic levels. Broad-spectrum insecticide sprays that kill these beneficials often lead to aphid outbreaks.</p>
        <p><strong>When it matters:</strong> Green apple aphid is primarily a concern on young trees and nursery stock, where heavy infestations can coat shoot tips with honeydew, stunt growth, and attract sooty mold. On bearing trees, treatment is rarely needed unless &gt;50% of terminals are infested.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Thresholds &amp; Scouting">
        {result.economicThreshold && <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 mb-4"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Economic Threshold</p><p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{result.economicThreshold}</p></div>}
        {result.scoutingProtocol && <div className="rounded-lg bg-muted/50 p-4 mb-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>
      <SectionCard title="Natural Enemy Assessment">
        <div className="space-y-2 text-sm text-bark-600">
          <p><strong>Lady beetles:</strong> Both adults and larvae are voracious aphid predators. 1 lady beetle larva can consume 200&ndash;300 aphids before pupating.</p>
          <p><strong>Syrphid flies:</strong> Hover fly larvae are among the most important aphid predators. Look for legless, slug-like larvae among aphid colonies.</p>
          <p><strong>Lacewings:</strong> Both green and brown lacewing larvae are effective. Often called &ldquo;aphid lions.&rdquo;</p>
          <p><strong>Parasitoid wasps:</strong> Look for swollen, bronze-colored &ldquo;mummies&rdquo; among live aphids &mdash; these indicate parasitoid activity.</p>
          <p className="font-medium text-bark-900 mt-3">If you see active natural enemies among aphid colonies, delay spraying. Natural control often catches up within 7&ndash;10 days.</p>
        </div>
      </SectionCard>

      <ImageGallery slug="green-apple-aphid" />
      <ScoutingGuideSection slug="green-apple-aphid" />
      <ProductEfficacyTable slug="green-apple-aphid" />
      <CoincidenceAlerts slug="green-apple-aphid" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="green-apple-aphid" />
    </div>
  )
}
