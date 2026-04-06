import { GitBranch, Thermometer, CloudRain } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateNectriaCanker } from "@/lib/models/nectria-canker";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Nectria Canker Detail | OrchardGuard",
  description:
    "Nectria canker risk assessment tracking rain at optimal infection temperatures during wound-healing windows.",
};

export const dynamic = "force-dynamic";

export default function NectriaCancerPage() {
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

  const result = evaluateNectriaCanker(hourlyMapped);

  const accentColor =
    result.riskLevel === "high"
      ? "red"
      : result.riskLevel === "moderate"
        ? "amber"
        : "green";

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<GitBranch className="h-8 w-8 text-amber-700 dark:text-amber-400" />}
        title="Nectria Canker"
        riskLevel={result.riskLevel}
        subtitle={`European canker risk assessment — ${orchard.name}`}
      />

      {/* About Nectria Canker */}
      <AboutCard title="Nectria Canker">
        <p>
          European canker, caused by <em>Neonectria ditissima</em> (formerly{" "}
          <em>Nectria galligena</em>), is one of the most damaging canker
          diseases of apple in cool, wet climates. The fungus attacks through
          wounds &mdash; primarily leaf scars in autumn and pruning wounds in
          spring &mdash; producing sunken, target-shaped cankers that girdle
          branches and kill fruiting wood.
        </p>
        <p>
          <strong>Infection timing is critical.</strong> The fungus requires rain
          at mild temperatures (11&ndash;16&deg;C) to splash spores into fresh
          wounds. Two windows are most dangerous: the fall leaf-drop period
          (October&ndash;November), when every abscising leaf creates a fresh
          scar, and the spring pruning season (March&ndash;April), when cuts
          expose fresh wood. Six or more hours of rain at the right temperature
          during these windows significantly elevates infection risk.
        </p>
        <p>
          <strong>Wound healing is the defense.</strong> Dry weather after leaf
          drop or pruning allows wounds to suberize (form a protective cork
          layer) before spores arrive. This is why timing pruning to dry
          forecasts is the single most effective cultural control for Nectria
          canker.
        </p>
        <p>
          Chemical control relies on copper applications at 50% and 90% leaf
          drop in fall, and again at silver tip in spring. Removing and
          destroying visible cankers during dormant pruning reduces inoculum
          load. Cultivars like Gala, Cox, and Braeburn are particularly
          susceptible.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={accentColor}
      />

      {/* Infection Windows */}
      <SectionCard
        title="Infection Window Status"
        icon={<CloudRain className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3">
          <ConditionDot
            met={result.fallLeafDropRisk}
            label="Fall leaf-drop risk — rain at 11-16°C during October/November (>6 hours)"
          />
          <ConditionDot
            met={result.springWoundRisk}
            label="Spring wound risk — rain at 11-16°C during March/April (>6 hours)"
          />
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-bark-600">
            <strong>Wound healing window:</strong> Fresh leaf scars and pruning
            wounds need dry conditions to seal. The model tracks rain hours at
            11&ndash;16&deg;C &mdash; the optimal range for{" "}
            <em>Neonectria</em> spore germination and wound infection.
          </p>
        </div>
      </SectionCard>

      {/* Rain at Infection Temperature */}
      <SectionCard
        title="Rain at Infection Temperature (11-16°C)"
        icon={<Thermometer className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox
            label="Temp Range"
            value="11-16°C"
            sub="Optimal for spore germination"
          />
          <StatBox
            label="Rain Threshold"
            value=">0.5mm/hr"
            sub="Enough to splash spores"
          />
          <StatBox
            label="Infection Threshold"
            value="6+ hours"
            sub="Rain at optimal temp"
          />
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Current Assessment">
        <p className="text-sm text-bark-600">{result.details}</p>
        <ProductList products={result.productSuggestions} />
      </SectionCard>

      <ImageGallery slug="nectria-canker" />
      <ScoutingGuideSection slug="nectria-canker" />
      <ProductEfficacyTable slug="nectria-canker" />
      <CoincidenceAlerts slug="nectria-canker" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="nectria-canker" />
    </div>
  );
}
