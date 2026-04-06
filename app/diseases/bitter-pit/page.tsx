import { Apple, Droplets, Leaf } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateBitterPit } from "@/lib/models/bitter-pit";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Bitter Pit Detail | OrchardGuard",
  description:
    "Bitter pit risk assessment tracking calcium compliance, heat stress, and variety susceptibility.",
};

export const dynamic = "force-dynamic";

export default function BitterPitPage() {
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
  const hourlyStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
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

  const result = evaluateBitterPit(hourlyMapped);

  const compliancePct =
    result.calciumSpraysRecommended > 0
      ? Math.round(
          (result.calciumSpraysCompleted / result.calciumSpraysRecommended) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Apple className="h-8 w-8 text-red-500" />}
        title="Bitter Pit"
        riskLevel={result.riskLevel}
        subtitle={`Calcium deficiency disorder risk \u2014 ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Bitter Pit">
        <p>
          Bitter pit is a physiological disorder caused by calcium deficiency in
          fruit tissue, not a pathogen. It appears as small, sunken, brown spots
          under the skin of the apple, usually developing in storage but
          sometimes visible at harvest. The disorder is driven by an imbalance
          between calcium and other nutrients (especially potassium and
          magnesium) within the fruit.
        </p>
        <p>
          <strong>Variety susceptibility</strong> is a major factor. Honeycrisp
          and Northern Spy are notoriously prone to bitter pit &mdash; their
          large fruit size and vigorous growth create high calcium demand.
          Cortland and Jonagold are moderately susceptible, while McIntosh and
          Red Delicious are relatively resistant. In Ontario, Honeycrisp growers
          routinely apply 8&ndash;12 calcium sprays per season as insurance.
        </p>
        <p>
          <strong>Heat stress</strong> during June and July accelerates bitter
          pit risk. When temperatures exceed 30&deg;C, transpiration increases
          and calcium transport to fruit decreases as the tree prioritizes
          leaves. Extended heat waves during the cell-division phase of fruit
          growth are particularly damaging.
        </p>
        <p>
          <strong>Crop load</strong> also plays a significant role. Light crop
          loads (fewer, larger fruit) increase the risk because each fruit has a
          higher demand for calcium relative to supply. Aggressive thinning,
          while beneficial for fruit size, can inadvertently raise bitter pit
          incidence. The balance between fruit size and calcium availability is
          the central management challenge.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={
          result.riskLevel === "critical" || result.riskLevel === "high"
            ? "red"
            : result.riskLevel === "moderate"
              ? "amber"
              : "green"
        }
      />

      {/* Calcium Spray Compliance */}
      <SectionCard
        title="Calcium Spray Compliance"
        icon={<Droplets className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className={cn(
              compliancePct >= 75
                ? "border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                : compliancePct >= 50
                  ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300"
                  : "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
            )}
          >
            {compliancePct}% complete
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-data tabular-nums">
              {result.calciumSpraysCompleted}
            </span>
            <span className="text-caption">
              / {result.calciumSpraysRecommended} sprays
            </span>
            <Progress
              value={compliancePct}
              className={cn(
                "flex-1",
                compliancePct >= 75
                  ? "[&_[data-slot=progress-indicator]]:bg-green-500"
                  : compliancePct >= 50
                    ? "[&_[data-slot=progress-indicator]]:bg-yellow-500"
                    : "[&_[data-slot=progress-indicator]]:bg-red-500"
              )}
            />
          </div>
          {result.nextCalciumSprayDue && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Next Spray Due
              </p>
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                {result.nextCalciumSprayDue}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Calcium sprays should be applied at 10&ndash;14 day intervals from
            pink through August. Coverage is critical &mdash; calcium moves very
            poorly within the fruit, so each spray only protects the tissue it
            contacts.
          </p>
        </div>
      </SectionCard>

      {/* Risk Factors */}
      <SectionCard
        title="Risk Factors"
        icon={<Leaf className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Variety Risk"
              value={
                <span className="capitalize">
                  {result.varietyRisk.replace("_", " ")}
                </span>
              }
              sub="Susceptibility rating"
            />
            <StatBox
              label="Crop Load"
              value={
                <span className="capitalize">{result.cropLoadFactor}</span>
              }
              sub={
                result.cropLoadFactor === "light"
                  ? "Larger fruit = higher risk"
                  : "Standard"
              }
            />
            <StatBox
              label="Heat Stress Hours"
              value={result.heatStressHours}
              sub=">30\u00b0C during Jun\u2013Jul"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Bitter pit risk is the product of variety susceptibility, crop load
              factor, heat stress, and calcium compliance. High susceptibility
              varieties with light crop loads and poor calcium spray compliance
              are at greatest risk.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Product Suggestions */}
      {result.productSuggestions.length > 0 && (
        <SectionCard title="Product Suggestions">
          <ProductList products={result.productSuggestions} />
        </SectionCard>
      )}

      <ImageGallery slug="bitter-pit" />
      <ScoutingGuideSection slug="bitter-pit" />
      <ProductEfficacyTable slug="bitter-pit" />
      <CoincidenceAlerts slug="bitter-pit" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="bitter-pit" />
    </div>
  );
}
