import { Sun, TreePine, ShieldAlert } from "lucide-react";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateSunscald } from "@/lib/models/sunscald";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Sunscald Detail | OrchardGuard",
  description:
    "Southwest injury (sunscald) risk assessment tracking thermal shock events through winter.",
};

export const dynamic = "force-dynamic";

export default function SunscaldPage() {
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
  // Fetch daily data spanning December through March of the current winter
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const winterStart = month <= 2
    ? `${year - 1}-12-01`
    : `${year}-12-01`;
  const winterEnd = month <= 2
    ? `${year}-03-31`
    : `${year + 1}-03-31`;
  const dailyStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateSunscald(dailyMapped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Sun className="h-8 w-8 text-amber-500" />}
        title="Sunscald"
        riskLevel={result.riskLevel}
        subtitle={`Southwest injury (thermal shock) tracking \u2014 ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Sunscald (Southwest Injury)">
        <p>
          Sunscald, also known as southwest injury, is a winter abiotic disorder
          caused by freeze-thaw cycles that damage bark on the south and
          southwest sides of tree trunks. On clear winter days in Ontario, the
          low-angle sun can warm south-facing bark to well above freezing &mdash;
          even while air temperatures remain below 0&deg;C. The bark tissue
          de-hardens and cells begin to rehydrate. When temperatures plunge
          overnight, ice crystals form inside the rehydrated cells, rupturing
          cell membranes and killing the tissue.
        </p>
        <p>
          <strong>Bark temperature vs. air temperature:</strong> The model
          estimates bark temperature as air maximum plus 15&deg;C on sunny,
          south-facing exposures. A day with an air max of &minus;5&deg;C can
          produce estimated bark temperatures of +10&deg;C on the south side,
          followed by a night low of &minus;20&deg;C &mdash; a thermal swing of
          30&deg;C in the bark tissue.
        </p>
        <p>
          <strong>Most vulnerable trees:</strong> Young trees (&lt;5 years) and
          recently replanted trees are most susceptible because their thin bark
          has less insulation. Mature trees with thick, corky bark are more
          resistant. The damage appears the following spring as sunken,
          discolored bark that may crack and peel, eventually girdling the trunk.
        </p>
        <p>
          <strong>Prevention:</strong> White latex paint applied to the trunk
          before November reflects sunlight and keeps bark cooler during the day,
          reducing the freeze-thaw differential. Trunk wraps and tree guards also
          help. In Ontario, this is standard practice for any new planting.
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

      {/* Thermal Shock Tracking */}
      <SectionCard
        title="Thermal Shock Events"
        icon={<Sun className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className={
              result.thermalShockEvents >= 3
                ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
                : result.thermalShockEvents >= 1
                  ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300"
                  : "border-muted-foreground/30 text-muted-foreground"
            }
          >
            {result.thermalShockEvents >= 5
              ? "Severe"
              : result.thermalShockEvents >= 3
                ? "Elevated"
                : result.thermalShockEvents >= 1
                  ? "Moderate"
                  : "None detected"}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Thermal Shock Events"
              value={result.thermalShockEvents}
              sub="Bark >0\u00b0C day, air <-15\u00b0C night"
            />
            <StatBox
              label="Est. Max Bark Temp"
              value={`${result.estimatedBarkTempMax}\u00b0C`}
              sub="Air max + 15\u00b0C (south facing)"
            />
            <StatBox
              label="Cumulative Events"
              value={result.cumulativeEvents}
              sub="Total this winter season"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              A thermal shock event is recorded when estimated south-facing bark
              temperature exceeds 0&deg;C during the day and the night minimum
              drops below &minus;15&deg;C. Each event increases the risk of
              cumulative bark damage.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Young Tree Advisory */}
      <SectionCard
        title="Young Tree Advisory"
        icon={<TreePine className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3 text-sm text-bark-600">
          <p>
            Trees planted within the last 5 years are at highest risk for
            southwest injury. Their thin bark absorbs solar radiation readily
            and provides little insulation against rapid temperature changes.
          </p>
          {result.thermalShockEvents > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Action Required for Young Trees
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                With {result.thermalShockEvents} thermal shock event(s) this
                winter, inspect young tree trunks for bark discoloration or
                splitting on the south and southwest sides this spring. Trees
                not yet painted should be protected with white latex paint before
                next November.
              </p>
            </div>
          ) : (
            <p>
              No thermal shock events detected this winter. Continue preventive
              white latex paint applications before November for all trees under
              5 years old.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                White Latex Paint
              </p>
              <p className="mt-0.5 text-[12px]">
                Apply diluted (1:1 with water) white interior latex paint to
                trunks from soil line to first scaffold branch before November.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                Trunk Wraps
              </p>
              <p className="mt-0.5 text-[12px]">
                Spiral plastic tree guards or paper wraps reflect sunlight.
                Remove in spring to prevent moisture-related bark issues.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                Tree Guards
              </p>
              <p className="mt-0.5 text-[12px]">
                Corrugated plastic guards placed on the south side shade bark
                during sunny winter days. Also protect from rodent damage.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <ImageGallery slug="sunscald" />
      <ScoutingGuideSection slug="sunscald" />
      <ProductEfficacyTable slug="sunscald" />
      <CoincidenceAlerts slug="sunscald" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="sunscald" />
    </div>
  );
}
