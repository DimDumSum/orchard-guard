import { Droplets, Thermometer, Apple } from "lucide-react";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateWaterCore } from "@/lib/models/water-core";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Water Core Detail | OrchardGuard",
  description:
    "Water core risk assessment tracking pre-harvest temperature differentials and variety susceptibility.",
};

export const dynamic = "force-dynamic";

export default function WaterCorePage() {
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
  // Fetch daily data covering September-October window
  const dailyStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateWaterCore(dailyMapped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Droplets className="h-8 w-8 text-cyan-500" />}
        title="Water Core"
        riskLevel={result.riskLevel}
        subtitle={`Pre-harvest temperature differential analysis \u2014 ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Water Core">
        <p>
          Water core is a physiological disorder where intercellular spaces in
          apple flesh fill with sorbitol-rich fluid, giving affected tissue a
          glassy, translucent appearance when cut open. While consumers sometimes
          consider mild water core a sign of sweetness (the affected areas do
          taste sweeter), severe water core leads to flesh browning in storage,
          off-flavours, and breakdown &mdash; a serious quality defect.
        </p>
        <p>
          <strong>Temperature differentials drive it:</strong> Water core
          develops during September and October when warm days (&gt;20&deg;C)
          and cool nights (&lt;10&deg;C) occur over consecutive days. This
          day-night temperature swing disrupts normal sorbitol-to-fructose
          conversion in fruit tissue. Sorbitol accumulates in the intercellular
          spaces and draws water by osmosis, creating the waterlogged appearance.
        </p>
        <p>
          <strong>Variety susceptibility:</strong> Red Delicious and Fuji are
          particularly prone to water core. In Ontario, late-season Delicious
          blocks frequently develop water core in years with wide September
          temperature swings. Honeycrisp can also develop water core but is more
          commonly affected by bitter pit.
        </p>
        <p>
          <strong>Harvest timing is critical:</strong> Advancing harvest by
          7&ndash;10 days on susceptible varieties when water core conditions
          are present can prevent the disorder from reaching severe levels. Use
          starch-iodine maturity testing to guide the decision &mdash; harvest at
          starch index 5&ndash;6 rather than waiting for full starch conversion.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={
          result.riskLevel === "high"
            ? "red"
            : result.riskLevel === "moderate"
              ? "amber"
              : "green"
        }
      />

      {/* Pre-Harvest Maturity Risk */}
      <SectionCard
        title="Pre-Harvest Maturity Risk"
        icon={<Thermometer className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className={
              result.consecutiveDays >= 7
                ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
                : result.consecutiveDays >= 3
                  ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300"
                  : "border-muted-foreground/30 text-muted-foreground"
            }
          >
            {result.consecutiveDays >= 7
              ? "High differential"
              : result.consecutiveDays >= 3
                ? "Moderate differential"
                : "Normal"}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatBox
              label="Consecutive Days"
              value={result.consecutiveDays}
              sub="Days with >20\u00b0C / <10\u00b0C swing"
            />
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-caption font-medium uppercase">
                Night/Day Differential
              </p>
              <div className="mt-2">
                <ConditionDot
                  met={result.nightDayDifferential}
                  label={
                    result.nightDayDifferential
                      ? "Temperature differential detected"
                      : "No significant differential"
                  }
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Water core risk increases with consecutive days of warm days
              (&gt;20&deg;C) and cool nights (&lt;10&deg;C) during September
              and October. Three or more consecutive days triggers moderate risk;
              seven or more days on a susceptible variety triggers high risk.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Variety Susceptibility */}
      <SectionCard
        title="Variety Susceptibility"
        icon={<Apple className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3 text-sm text-bark-600">
          <p>
            Water core susceptibility varies significantly by variety.
            Late-maturing varieties with high sorbitol content are most prone.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <p className="font-semibold text-red-800 dark:text-red-200 text-[13px]">
                High Susceptibility
              </p>
              <p className="mt-0.5 text-[12px] text-red-700 dark:text-red-300">
                Red Delicious, Fuji &mdash; These late-maturing varieties
                accumulate more sorbitol and are most vulnerable to day-night
                temperature swings. Consider advancing harvest by 7&ndash;10 days
                when conditions are present.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                Lower Susceptibility
              </p>
              <p className="mt-0.5 text-[12px]">
                Gala, McIntosh, Empire, Cortland &mdash; Earlier-maturing
                varieties are typically harvested before peak water core
                conditions develop. Standard maturity testing is sufficient.
              </p>
            </div>
          </div>
          {result.consecutiveDays >= 3 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Harvest Timing Advisory
              </p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                With {result.consecutiveDays} consecutive days of temperature
                differential, consider advancing harvest on Red Delicious and
                Fuji. Test fruit with starch-iodine at maturity &mdash; harvest
                at starch index 5&ndash;6 rather than waiting for full
                conversion.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      <ImageGallery slug="water-core" />
      <ScoutingGuideSection slug="water-core" />
      <ProductEfficacyTable slug="water-core" />
      <CoincidenceAlerts slug="water-core" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="water-core" />
    </div>
  );
}
