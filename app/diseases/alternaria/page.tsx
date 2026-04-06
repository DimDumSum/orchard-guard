import { Leaf, Droplets, Flower2 } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateAlternaria } from "@/lib/models/alternaria";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Alternaria Detail | OrchardGuard",
  description:
    "Alternaria disease risk assessment for core rot and leaf blotch in apple orchards.",
};

export const dynamic = "force-dynamic";

const subRiskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  moderate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AlternariaPage() {
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

  const result = evaluateAlternaria(hourlyMapped, orchard.bloom_stage);

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
        icon={<Leaf className="h-8 w-8 text-grove-600" />}
        title="Alternaria"
        riskLevel={result.riskLevel}
        subtitle={`Core rot + leaf blotch assessment — ${orchard.name}, bloom stage: ${orchard.bloom_stage}`}
      />

      {/* About Alternaria */}
      <AboutCard title="Alternaria in Apples">
        <p>
          Alternaria presents two distinct faces in apple orchards, each driven
          by different conditions. <em>Alternaria mali</em> (and related species)
          can cause both core rot of fruit and leaf blotch, but the infection
          pathways and timing are entirely different.
        </p>
        <p>
          <strong>Core rot</strong> occurs when Alternaria spores land on open
          flowers during bloom. Rain splashes spores into the calyx end of
          developing fruit, where the fungus remains dormant until harvest. At
          cutting, the core reveals a dark, dry internal rot that makes fruit
          unmarketable. Wet bloom weather is the primary driver &mdash; the more
          rain events during open bloom, the greater the proportion of infected
          fruit.
        </p>
        <p>
          <strong>Leaf blotch</strong> is a summer disease that requires extended
          warm, humid conditions. The fungus needs at least 12 consecutive hours
          of leaf wetness at temperatures above 20&deg;C to infect. Symptoms
          appear as brown-to-black irregular spots expanding from leaf margins,
          sometimes with concentric rings. Severe defoliation can weaken trees
          and reduce return bloom.
        </p>
        <p>
          Management differs by phase: bloom-time fungicide protection for core
          rot, and summer cover sprays (Captan, Mancozeb) for leaf blotch.
          Cultivars with open calyx architecture (e.g., Delicious types) are
          particularly susceptible to core rot.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={accentColor}
      />

      {/* Sub-risk Indicators */}
      <SectionCard
        title="Risk Breakdown"
        icon={<Leaf className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Flower2 className="h-4 w-4 text-pink-500" />
                  Core Rot Risk
                </CardTitle>
                <Badge
                  className={cn(
                    "capitalize",
                    subRiskColors[result.coreRotRisk] ?? subRiskColors.low,
                  )}
                >
                  {result.coreRotRisk}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bloom-time rain drives core rot. Spores enter open flowers and
                cause internal fruit rot visible at harvest.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Leaf Blotch Risk
                </CardTitle>
                <Badge
                  className={cn(
                    "capitalize",
                    subRiskColors[result.leafBlotchRisk] ?? subRiskColors.low,
                  )}
                >
                  {result.leafBlotchRisk}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Summer wet periods above 20&deg;C promote leaf blotch. Extended
                leaf wetness (&gt;12h) is required for infection.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* Key Stats */}
      <SectionCard
        title="Key Indicators"
        icon={<Leaf className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox
            label="Bloom Rain Events"
            value={result.bloomRainEvents}
            sub=">0.5mm/hr during bloom"
          />
          <StatBox
            label="Summer Wet Periods"
            value={result.summerWetPeriods}
            sub=">12h wet at >20°C (Jun–Sep)"
          />
          <StatBox
            label="Bloom Stage"
            value={orchard.bloom_stage}
            sub="Current phenology"
          />
        </div>
      </SectionCard>

      {/* Conditions */}
      <SectionCard title="Condition Status">
        <div className="space-y-3">
          <ConditionDot
            met={["bloom", "full-bloom", "open-bloom"].includes(
              orchard.bloom_stage.toLowerCase(),
            )}
            label={`Open blossoms present (bloom stage: ${orchard.bloom_stage})`}
          />
          <ConditionDot
            met={result.bloomRainEvents >= 1}
            label={`Rain during bloom detected (${result.bloomRainEvents} event${result.bloomRainEvents !== 1 ? "s" : ""})`}
          />
          <ConditionDot
            met={result.summerWetPeriods >= 1}
            label={`Summer wet periods detected (${result.summerWetPeriods} period${result.summerWetPeriods !== 1 ? "s" : ""})`}
          />
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Current Assessment">
        <p className="text-sm text-bark-600">{result.details}</p>
        <ProductList products={result.productSuggestions} />
      </SectionCard>

      <ImageGallery slug="alternaria" />
      <ScoutingGuideSection slug="alternaria" />
      <ProductEfficacyTable slug="alternaria" />
      <CoincidenceAlerts slug="alternaria" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="alternaria" />
    </div>
  );
}
