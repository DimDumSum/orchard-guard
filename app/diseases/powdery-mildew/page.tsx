import { Wind, Leaf, ShieldAlert } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluatePowderyMildew } from "@/lib/models/powdery-mildew";
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
  title: "Powdery Mildew Detail | OrchardGuard",
  description:
    "Detailed powdery mildew risk assessment tracking favorable conditions and infection windows.",
};

export const dynamic = "force-dynamic";

export default function PowderyMildewPage() {
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

  const result = evaluatePowderyMildew(hourlyMapped, orchard.bloom_stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Wind className="h-8 w-8 text-purple-500" />}
        title="Powdery Mildew"
        riskLevel={result.riskLevel}
        subtitle={`Favorable conditions analysis \u2014 ${orchard.name}, bloom stage: ${orchard.bloom_stage}`}
      />

      {/* About */}
      <AboutCard title="Powdery Mildew">
        <p>
          Powdery mildew (<em>Podosphaera leucotricha</em>) is one of the most
          common fungal diseases of apple in Ontario. Unlike most fungal
          pathogens, powdery mildew thrives in warm, dry weather with high
          humidity but no rainfall. The fungus overwinters inside infected buds
          as mycelium. When those buds break in spring, the emerging shoots and
          leaves are already coated with white, powdery fungal growth &mdash;
          these are called <strong>flag shoots</strong>.
        </p>
        <p>
          <strong>Primary infection</strong> occurs from green-tip through
          tight-cluster, when overwintering chasmothecia (fruiting bodies)
          release ascospores during rain events. These spores land on developing
          tissue and establish new infections. <strong>Secondary infection</strong>{" "}
          then takes over from pink through fruit-set, as conidia (asexual
          spores) spread from infected tissue to new growth during periods of
          moderate temperature (10&ndash;25&deg;C) and high humidity (&gt;70%)
          without rain washing spores away.
        </p>
        <p>
          <strong>Flag shoots</strong> are critically important because they
          serve as the primary source of inoculum each spring. Infected flag
          shoots produce millions of conidia that spread to healthy leaves, new
          shoots, and developing fruit. Removing flag shoots early in the season
          is one of the most effective cultural controls. Fruit infection leads
          to russeting, which downgrades fruit quality.
        </p>
        <p>
          This model tracks consecutive hours of favorable conditions
          (10&ndash;25&deg;C, &gt;70% humidity, no rain) and cross-references
          with your current bloom stage to determine whether powdery mildew is
          likely to develop. Susceptible varieties such as McIntosh, Cortland,
          and Idared require lower thresholds for action.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={result.riskLevel === "high" ? "red" : result.riskLevel === "moderate" ? "amber" : "green"}
      />

      {/* Favorable Conditions */}
      <SectionCard
        title="Favorable Conditions"
        icon={<Wind className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className={
              result.consecutiveFavorableHours >= 48
                ? "border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300"
                : "border-muted-foreground/30 text-muted-foreground"
            }
          >
            {result.consecutiveFavorableHours >= 72
              ? "Extended streak"
              : result.consecutiveFavorableHours >= 48
                ? "Moderate streak"
                : "Normal"}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Consecutive Favorable Hours"
              value={result.consecutiveFavorableHours}
              sub="10\u201325\u00b0C, >70% RH, no rain"
            />
            <StatBox
              label="Favorable Days"
              value={result.favorableDays}
              sub="\u22656 favorable hours per day"
            />
            <StatBox
              label="Variety Risk"
              value={
                <span className="capitalize">
                  {result.varietyRisk.replace("_", " ")}
                </span>
              }
              sub="Susceptibility rating"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Powdery mildew risk increases significantly after 48 consecutive
              favorable hours. High risk is triggered at 72+ hours during a
              susceptible bloom stage.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Infection Windows */}
      <SectionCard
        title="Infection Windows"
        icon={<Leaf className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3">
          <ConditionDot
            met={result.primaryInfectionWindow}
            label="Primary infection window (green-tip \u2013 tight-cluster): ascospore release from overwintering chasmothecia"
          />
          <ConditionDot
            met={result.secondaryInfectionWindow}
            label="Secondary infection window (pink \u2013 fruit-set): conidial spread from active infections"
          />
          <ConditionDot
            met={result.ascosporeReleaseTriggered}
            label="Ascospore release triggered (rain >2.5mm after green-tip)"
          />
          <ConditionDot
            met={result.susceptibleStage}
            label={`Susceptible bloom stage (current: ${orchard.bloom_stage})`}
          />
        </div>
      </SectionCard>

      {/* Flag Shoot Risk */}
      <SectionCard
        title="Flag Shoot Risk"
        icon={<ShieldAlert className="h-5 w-5 text-muted-foreground" />}
        badge={
          result.susceptibleStage && result.consecutiveFavorableHours > 0 ? (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Elevated
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Normal
            </Badge>
          )
        }
      >
        <div className="space-y-3 text-sm text-bark-600">
          <p>
            Flag shoots are new growth emerging from buds that were infected
            with powdery mildew the previous season. They appear as stunted,
            silver-white shoots coated in fungal mycelium and are the primary
            source of inoculum each spring.
          </p>
          {result.susceptibleStage && result.consecutiveFavorableHours > 0 ? (
            <p className="font-medium text-orange-700 dark:text-orange-300">
              Current conditions favor flag shoot activity &mdash; scout for
              white, powdery growth on new terminal shoots and remove infected
              shoots promptly.
            </p>
          ) : (
            <p>
              No elevated flag shoot activity expected at this time. Continue
              routine scouting during pink through petal-fall stages.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Product Suggestions */}
      {result.productSuggestions.length > 0 && (
        <SectionCard title="Product Suggestions">
          <ProductList products={result.productSuggestions} />
        </SectionCard>
      )}

      <ImageGallery slug="powdery-mildew" />
      <ScoutingGuideSection slug="powdery-mildew" />
      <ProductEfficacyTable slug="powdery-mildew" />
      <CoincidenceAlerts slug="powdery-mildew" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="powdery-mildew" />
    </div>
  );
}
