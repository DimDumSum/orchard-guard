import { Egg } from "lucide-react"
import { getOrchard } from "@/lib/db"
import { evaluateAppleRustMite } from "@/lib/models/apple-rust-mite"
import { DetailHeader, RiskScoreCard, AboutCard, SectionCard, ProductList } from "@/components/models/model-detail-layout"
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = { title: "Apple Rust Mite | OrchardGuard", description: "Apple rust mite beneficial vs pest threshold assessment." }
export const dynamic = "force-dynamic"

export default function AppleRustMitePage() {
  const orchard = getOrchard()
  if (!orchard) return <div className="flex flex-1 items-center justify-center p-8"><p className="text-muted-foreground">No orchard configured.</p></div>

  const result = evaluateAppleRustMite()

  return (
    <div className="space-y-6">
      <DetailHeader icon={<Egg className="h-8 w-8 text-amber-500" />} title="Apple Rust Mite" riskLevel={result.riskLevel} subtitle={`Beneficial/pest assessment — ${orchard.name}`} />
      <AboutCard title="Apple Rust Mite">
        <p>Apple rust mite (<em>Aculus schlechtendali</em>) is unusual among orchard mites because at low-to-moderate populations it is <strong>beneficial</strong>. Rust mites serve as an alternative food source for predatory mites (<em>Typhlodromus pyri</em>, <em>Amblyseius fallacis</em>), sustaining predator populations when pest mites (European red mite, two-spotted spider mite) are scarce.</p>
        <p><strong>When it becomes a pest:</strong> Only at very high populations (&gt;200 per leaf) does apple rust mite cause visible damage &mdash; silvery russeting on leaves and fruit. This is rare in orchards with healthy predatory mite populations, which keep rust mite numbers in check.</p>
        <p><strong>Management philosophy:</strong> Do not spray specifically for apple rust mite unless populations are extremely high and causing visible russeting. Maintaining rust mite populations helps ensure predatory mites remain active in your orchard, providing free biological control of more damaging mite species.</p>
      </AboutCard>
      <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} recommendation={result.recommendation} />
      <SectionCard title="Scouting &amp; Thresholds">
        {result.scoutingProtocol && <div className="rounded-lg bg-muted/50 p-4 mb-4"><p className="text-sm font-medium mb-1">Scouting Protocol</p><p className="text-sm text-bark-600">{result.scoutingProtocol}</p></div>}
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Beneficial Role</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">Low-to-moderate rust mite populations feed predatory mites and help maintain biological control of European red mite and two-spotted spider mite. Preserve, don&rsquo;t eliminate.</p>
        </div>
        {result.productSuggestions.length > 0 && <ProductList products={result.productSuggestions} />}
      </SectionCard>

      <ImageGallery slug="apple-rust-mite" />
      <ScoutingGuideSection slug="apple-rust-mite" />
      <ProductEfficacyTable slug="apple-rust-mite" />
      <CoincidenceAlerts slug="apple-rust-mite" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-rust-mite" />
    </div>
  )
}
