import { Bug } from "lucide-react"
import { getOrchard, getDailyWeather } from "@/lib/db"
import { evaluateWoollyAppleAphid } from "@/lib/models/woolly-apple-aphid"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Woolly Apple Aphid | OrchardGuard", description: "Woolly apple aphid colony tracking and parasitoid monitoring." }
export const dynamic = "force-dynamic"

export default function WoollyAppleAphidPage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const now = new Date()
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, now.toISOString().slice(0, 10))
  const dailyMapped = dailyData.map(d => ({ date: d.date, max_temp: d.max_temp ?? 0, min_temp: d.min_temp ?? 0 }))
  const result = evaluateWoollyAppleAphid(dailyMapped)

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Bug className="h-8 w-8 text-indigo-600" />} title="Woolly Apple Aphid" riskLevel={result.riskLevel} subtitle={`Colony monitoring — ${orchard.name}`} />
      <AboutCard title="Woolly Apple Aphid">
        <p>Woolly apple aphid (<em>Eriosoma lanigerum</em>) forms distinctive colonies covered in white, waxy, cotton-like filaments on wounds, pruning cuts, burr knots, and root systems. Both aerial (above-ground) and root colonies can cause significant damage.</p>
        <p><strong>Aerial colonies:</strong> Cluster on pruning wounds, graft unions, and water sprouts. They cause gall formation and swelling of woody tissue, weakening branches. Heavy infestations can reduce fruit quality through honeydew contamination.</p>
        <p><strong>Root colonies:</strong> Underground colonies feed on roots, causing nodular galls that reduce water and nutrient uptake. Resistant rootstocks (e.g., G.202, G.935 with Malling-Merton parentage) provide good root colony resistance.</p>
        <p><strong>Parasitoid wasp:</strong> <em>Aphelinus mali</em> is a tiny parasitoid wasp that is highly specific to woolly apple aphid. Parasitized aphids turn black and swollen. In orchards where <em>A. mali</em> is established, it often provides excellent biological control. Avoid broad-spectrum insecticides that disrupt this natural enemy.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Scouting &amp; Management">
        {result.scoutingProtocol && <div className="rounded-lg bg-muted/50 p-4 mb-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 mb-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Parasitoid Monitoring</p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">Look for black, swollen &ldquo;mummies&rdquo; in woolly aphid colonies &mdash; these indicate <em>Aphelinus mali</em> parasitoid activity. If &gt;30% of aphids are parasitized, natural control is likely sufficient.</p>
        </div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="woolly-apple-aphid" />
      <ScoutingGuideSection slug="woolly-apple-aphid" />
      <ProductEfficacyTable slug="woolly-apple-aphid" />
      <CoincidenceAlerts slug="woolly-apple-aphid" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="woolly-apple-aphid" />
    </div>
  )
}
