import { Shrub, Droplets, Thermometer } from "lucide-react";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { toImperial } from "@/lib/units";
import { evaluatePhytophthora } from "@/lib/models/phytophthora";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Phytophthora Detail | OrchardGuard",
  description:
    "Phytophthora crown and root rot risk assessment based on soil saturation and temperature.",
};

export const dynamic = "force-dynamic";

export default function PhytophthoraPage() {
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
  const dailyStart = `${now.getFullYear()}-01-01`;
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluatePhytophthora(dailyMapped);

  const accentColor =
    result.riskLevel === "high"
      ? "red"
      : result.riskLevel === "moderate"
        ? "amber"
        : "green";

  const soilActive = result.estimatedSoilTemp >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Shrub className="h-8 w-8 text-grove-700 dark:text-grove-400" />}
        title="Phytophthora"
        riskLevel={result.riskLevel}
        subtitle={`Crown and root rot risk assessment — ${orchard.name}`}
      />

      {/* About Phytophthora */}
      <AboutCard title="Phytophthora Crown & Root Rot">
        <p>
          Phytophthora spp. (primarily <em>P. cactorum</em> and{" "}
          <em>P. cambivora</em> in apple) are oomycete pathogens that attack the
          root system and crown of trees, particularly in poorly drained soils.
          Unlike true fungi, Phytophthora zoospores are motile and literally swim
          through saturated soil to reach roots &mdash; making waterlogging the
          single most important risk factor.
        </p>
        <p>
          <strong>The waterlogging connection:</strong> Consecutive days of heavy
          rain (&gt;10mm/day) saturate the root zone, creating conditions where
          zoospores thrive. As few as 2&ndash;3 consecutive wet days can trigger
          infection if soil temperatures are above 10&deg;C, with activity
          peaking at 15&ndash;25&deg;C. Trees in low-lying areas, at the bottom
          of slopes, or in heavy clay soils face the highest risk.
        </p>
        <p>
          <strong>Rootstock matters enormously.</strong> Dwarfing rootstocks like
          M.9 and M.26 are highly susceptible to Phytophthora crown rot. Their
          shallow, brittle root systems offer less resilience to waterlogging.
          Geneva rootstocks (G.41, G.935, G.210) show significantly better
          tolerance. If planting into sites with a Phytophthora history, rootstock
          selection is the most important long-term decision.
        </p>
        <p>
          Management focuses on drainage improvement, avoiding over-irrigation,
          and chemical protection with mefenoxam (Ridomil) or phosphonate trunk
          injections on high-value trees. Raised beds and tile drainage can
          transform a high-risk site into a manageable one.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={accentColor}
      />

      {/* Key Stats */}
      <SectionCard
        title="Soil & Moisture Indicators"
        icon={<Droplets className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox
            label="Consecutive Wet Days"
            value={result.consecutiveWetDays}
            sub=">10mm precipitation/day"
          />
          <StatBox
            label="Est. Soil Temperature"
            value={`${result.estimatedSoilTemp}°C (${toImperial(result.estimatedSoilTemp, "temperature").toFixed(0)}°F)`}
            sub={soilActive ? "Active (>10°C / 50°F)" : "Inactive (<10°C / 50°F)"}
          />
          <StatBox
            label="Activation Threshold"
            value="10°C (50°F)"
            sub="Soil temp for Phytophthora"
          />
        </div>
      </SectionCard>

      {/* Conditions */}
      <SectionCard
        title="Condition Status"
        icon={<Thermometer className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3">
          <ConditionDot
            met={soilActive}
            label={`Soil temperature active for Phytophthora (est. ${result.estimatedSoilTemp}°C / ${toImperial(result.estimatedSoilTemp, "temperature").toFixed(0)}°F, needs >10°C / 50°F)`}
          />
          <ConditionDot
            met={result.consecutiveWetDays >= 2}
            label={`Prolonged soil saturation (${result.consecutiveWetDays} consecutive wet days, needs 2+)`}
          />
          <ConditionDot
            met={result.consecutiveWetDays > 3}
            label={`Extended waterlogging (${result.consecutiveWetDays} days, high risk at 3+)`}
          />
        </div>
      </SectionCard>

      {/* Rootstock Advisory */}
      <SectionCard title="Rootstock Risk Assessment">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Rootstock Susceptibility Note
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Dwarfing rootstocks M.9 and M.26 are highly susceptible to
            Phytophthora crown rot. If your orchard uses these rootstocks,
            consider the risk score above as conservative &mdash; actual risk may
            be higher. Geneva rootstocks (G.41, G.935, G.210) offer improved
            tolerance.
          </p>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Current Assessment">
        <p className="text-sm text-bark-600">{result.details}</p>
      </SectionCard>

      <ImageGallery slug="phytophthora" />
      <ScoutingGuideSection slug="phytophthora" />
      <ProductEfficacyTable slug="phytophthora" />
      <CoincidenceAlerts slug="phytophthora" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="phytophthora" />
    </div>
  );
}
