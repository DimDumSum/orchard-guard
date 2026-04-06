import { TreePine, CloudRain, Target } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateCedarRust } from "@/lib/models/cedar-rust";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Cedar Apple Rust Detail | OrchardGuard",
  description:
    "Detailed cedar apple rust risk assessment tracking spore release conditions and infection windows.",
};

export const dynamic = "force-dynamic";

export default function CedarRustPage() {
  const orchard = getOrchard();

  if (!orchard) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">
          No orchard configured. Add an orchard to get started.
        </p>
      </div>
    );
  }

  const now = new Date();
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = now.toISOString().slice(0, 10);
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);
  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    humidity_pct: h.humidity_pct ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  const result = evaluateCedarRust(
    hourlyMapped,
    orchard.bloom_stage,
    orchard.petal_fall_date,
  );

  const windowStatusLabel = {
    open: "Open",
    closed: "Closed",
    approaching: "Approaching",
  }[result.infectionWindowStatus];

  const windowStatusColor = {
    open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    closed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    approaching:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  }[result.infectionWindowStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<TreePine className="h-8 w-8 text-amber-600" />}
        title="Cedar Apple Rust"
        riskLevel={result.riskLevel}
        subtitle={`Spore release and infection assessment \u2014 ${orchard.name}, bloom stage: ${orchard.bloom_stage}`}
      />

      {/* About */}
      <AboutCard title="Cedar Apple Rust">
        <p>
          Cedar apple rust (<em>Gymnosporangium juniperi-virginianae</em>) is a
          fungal disease that requires two hosts to complete its lifecycle:
          apple trees and eastern red cedar or other juniper species. The fungus
          cannot spread directly from apple to apple &mdash; it must alternate
          between the two hosts. This makes it unique among apple diseases and
          means proximity to juniper trees is a critical risk factor.
        </p>
        <p>
          On juniper, the fungus forms brown, golf-ball-sized galls that
          produce bright orange, gelatinous <strong>telial horns</strong> during
          warm spring rains. These horns release basidiospores that are carried
          by wind up to several kilometres to infect developing apple leaves and
          fruit. Spore release requires warm rain (&gt;10&deg;C with &gt;2.5mm
          precipitation) and the spores are most effectively dispersed during
          the 4&ndash;6 hours following the onset of rain.
        </p>
        <p>
          On apple, infections appear as bright orange-yellow spots on leaves
          and fruit, typically 10&ndash;14 days after infection. Severe leaf
          infections can reduce photosynthesis and weaken the tree. Fruit
          infections cause deformed, unmarketable fruit. The susceptible window
          on apple runs from bloom through approximately four weeks after petal
          fall.
        </p>
        <p>
          This model tracks warm rain events and telial horn wetting
          conditions during the susceptible window. If juniper trees are present
          within a few kilometres of your orchard, the risk is significantly
          higher. Removing nearby junipers or applying protectant fungicides
          before rain events are the primary management strategies for Ontario
          apple growers.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={result.riskLevel === "high" ? "red" : result.riskLevel === "moderate" ? "amber" : "green"}
      />

      {/* Infection Window Status */}
      <SectionCard
        title="Infection Window"
        icon={<Target className="h-5 w-5 text-muted-foreground" />}
        badge={<Badge className={windowStatusColor}>{windowStatusLabel}</Badge>}
      >
        <div className="space-y-4">
          <div className="text-sm text-bark-600">
            {result.infectionWindowStatus === "open" && (
              <p>
                The susceptible window is currently <strong>open</strong>.
                Apple tissue from bloom through 4 weeks after petal fall is
                vulnerable to cedar apple rust infection during warm rain
                events.
              </p>
            )}
            {result.infectionWindowStatus === "approaching" && (
              <p>
                Bloom is approaching &mdash; the susceptible window will open
                soon. Have protectant fungicide ready for the first warm rain
                event at bloom.
              </p>
            )}
            {result.infectionWindowStatus === "closed" && (
              <p>
                The susceptible window has closed. Cedar apple rust risk has
                passed for this season. The infection window runs from bloom
                through 4 weeks after petal fall.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Spore Release Conditions */}
      <SectionCard
        title="Spore Release Conditions"
        icon={<CloudRain className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Qualifying Rain Events"
              value={result.recentRainEvents}
              sub=">2.5mm daily at >10\u00b0C"
            />
            <StatBox
              label="Sporulation Events"
              value={result.sporulationEvents}
              sub="Telial horn wetting (4+ hrs)"
            />
            <StatBox
              label="Window Status"
              value={
                <span className="capitalize">
                  {result.infectionWindowStatus}
                </span>
              }
              sub="Bloom \u2013 4 wks post petal fall"
            />
          </div>
        </div>
      </SectionCard>

      {/* Juniper Host Proximity */}
      <SectionCard title="Risk Factors">
        <div className="space-y-3">
          <ConditionDot
            met={result.juniperNearby}
            label="Juniper/cedar trees nearby (alternate host for spore source)"
          />
          <ConditionDot
            met={result.inSusceptibleWindow}
            label="Within susceptible window (bloom \u2013 4 weeks post petal fall)"
          />
          <ConditionDot
            met={result.recentRainEvents > 0}
            label="Warm rain event detected (>2.5mm at >10\u00b0C)"
          />
          <ConditionDot
            met={result.sporulationEvents > 0}
            label="Telial horn wetting event (4+ consecutive wet warm hours)"
          />
        </div>
      </SectionCard>

      {/* Product Suggestions */}
      {result.productSuggestions.length > 0 && (
        <SectionCard title="Product Suggestions">
          <ProductList products={result.productSuggestions} />
        </SectionCard>
      )}

      <ImageGallery slug="cedar-rust" />
      <ScoutingGuideSection slug="cedar-rust" />
      <ProductEfficacyTable slug="cedar-rust" />
      <CoincidenceAlerts slug="cedar-rust" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="cedar-rust" />
    </div>
  );
}
