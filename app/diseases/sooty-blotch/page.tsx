import { CloudRain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateSootyBlotch } from "@/lib/models/sooty-blotch";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
  ConditionDot,
  riskIndicatorColors,
} from "@/components/models/model-detail-layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Sooty Blotch & Flyspeck Detail | OrchardGuard",
  description:
    "Detailed sooty blotch and flyspeck risk assessment tracking cumulative humidity hours.",
};

export const dynamic = "force-dynamic";

export default function SootyBlotchPage() {
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

  const result = evaluateSootyBlotch(hourlyMapped, orchard.petal_fall_date);

  const TrendIcon =
    result.trendDirection === "increasing"
      ? TrendingUp
      : result.trendDirection === "decreasing"
        ? TrendingDown
        : Minus;

  const trendLabel = {
    increasing: "Increasing",
    stable: "Stable",
    decreasing: "Decreasing",
  }[result.trendDirection];

  const trendColor = {
    increasing: "text-red-600 dark:text-red-400",
    stable: "text-muted-foreground",
    decreasing: "text-green-600 dark:text-green-400",
  }[result.trendDirection];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<CloudRain className="h-8 w-8 text-slate-500" />}
        title="Sooty Blotch & Flyspeck"
        riskLevel={result.riskLevel}
        subtitle={`Humidity hour accumulation tracker \u2014 ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Sooty Blotch & Flyspeck">
        <p>
          Sooty blotch and flyspeck (SBFS) are a complex of fungi that
          colonize the waxy cuticle of apple fruit. Sooty blotch appears as
          dark, smudgy or sooty patches on the fruit surface, while flyspeck
          produces clusters of tiny black dots. Although the fungi do not
          penetrate the fruit flesh, they severely reduce fruit
          marketability &mdash; cosmetic damage can downgrade fruit from fresh
          market to processing grade, significantly reducing returns.
        </p>
        <p>
          SBFS fungi thrive in humid environments with poor air circulation.
          The key environmental driver is cumulative hours of high humidity
          (&gt;97%) from petal fall onward. Research has established that
          first symptoms typically appear after 175&ndash;270 cumulative
          hours of near-saturated humidity, depending on the microclimate.
          Cool, wet orchards with dense canopies and poor airflow hit the
          threshold sooner; warm, dry sites with good ventilation take longer.
        </p>
        <p>
          Extended dry periods can partially or fully reset the accumulation.
          A single dry day subtracts from the running total, while 7 or more
          consecutive dry days reset the clock entirely. This <strong>wetting
          hour accumulation with dry reset</strong> model accurately predicts
          when SBFS risk transitions from low to actionable.
        </p>
        <p>
          For Ontario apple growers, managing SBFS centers on maintaining
          fungicide coverage (especially captan) through the summer, improving
          canopy airflow through pruning, and timing fungicide applications to
          stay ahead of the accumulation threshold. This model tracks your
          progress toward the threshold so you can make informed spray
          decisions.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={result.riskLevel === "high" ? "red" : result.riskLevel === "moderate" ? "amber" : "green"}
      />

      {/* Humidity Hour Accumulation — key visualization */}
      <SectionCard
        title="Humidity Hour Accumulation"
        icon={<CloudRain className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            className={cn(
              result.percentToThreshold >= 100
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : result.percentToThreshold >= 74
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            )}
          >
            {result.percentToThreshold.toFixed(1)}% of threshold
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {result.cumulativeHumidHours} hrs accumulated
              </span>
              <span className="font-medium">
                {result.threshold} hrs threshold
              </span>
            </div>
            <Progress
              value={Math.min(result.percentToThreshold, 100)}
              className={cn(
                "h-4",
                riskIndicatorColors[result.riskLevel] ??
                  riskIndicatorColors.low,
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0 hrs</span>
              <span>
                {Math.round(result.threshold * 0.74)} hrs (moderate)
              </span>
              <span>{result.threshold} hrs (high)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Humid Hours"
              value={result.cumulativeHumidHours}
              sub=">97% humidity since petal fall"
            />
            <StatBox
              label="Days Since Petal Fall"
              value={result.daysSincePetalFall}
              sub={
                orchard.petal_fall_date
                  ? `Petal fall: ${orchard.petal_fall_date}`
                  : "Not yet set"
              }
            />
            <StatBox
              label="Threshold"
              value={result.thresholdForMicroclimate}
              sub={`${result.microclimate} microclimate`}
            />
          </div>
        </div>
      </SectionCard>

      {/* Trend Direction */}
      <SectionCard
        title="48-Hour Trend"
        icon={<TrendIcon className={cn("h-5 w-5", trendColor)} />}
        badge={
          <Badge variant="outline" className={trendColor}>
            {trendLabel}
          </Badge>
        }
      >
        <div className="space-y-3 text-sm text-bark-600">
          {result.trendDirection === "increasing" && (
            <p>
              Humidity has been <strong>increasing</strong> over the last 48
              hours. More humid hours are accumulating in the most recent 24h
              compared to the preceding 24h. The threshold could be reached
              sooner than expected &mdash; ensure fungicide coverage is
              current.
            </p>
          )}
          {result.trendDirection === "decreasing" && (
            <p>
              Humidity has been <strong>decreasing</strong> over the last 48
              hours. Drier conditions are helping slow the accumulation rate.
              If dry weather persists for 7+ consecutive days, the
              accumulation will fully reset.
            </p>
          )}
          {result.trendDirection === "stable" && (
            <p>
              Humidity levels have been <strong>stable</strong> over the last
              48 hours. No significant change in accumulation rate. Continue
              monitoring and maintain your current spray schedule.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Microclimate Context */}
      <SectionCard title="Microclimate Context">
        <div className="space-y-3 text-sm text-bark-600">
          <p>
            Your orchard is classified as a <strong>{result.microclimate}</strong>{" "}
            microclimate, which sets the appearance threshold at{" "}
            <strong>{result.thresholdForMicroclimate} hours</strong>.
          </p>
          <div className="space-y-2">
            <ConditionDot
              met={result.microclimate === "cool_wet"}
              label="Cool/wet microclimate: 175 hour threshold (dense canopy, low sites, poor airflow)"
            />
            <ConditionDot
              met={result.microclimate === "moderate"}
              label="Moderate microclimate: 200 hour threshold (typical Ontario conditions)"
            />
            <ConditionDot
              met={result.microclimate === "warm_dry"}
              label="Warm/dry microclimate: 270 hour threshold (open canopy, good airflow, hilltop sites)"
            />
          </div>
        </div>
      </SectionCard>

      {/* Product Suggestions */}
      {result.productSuggestions.length > 0 && (
        <SectionCard title="Product Suggestions">
          <ProductList products={result.productSuggestions} />
        </SectionCard>
      )}

      <ImageGallery slug="sooty-blotch" />
      <ScoutingGuideSection slug="sooty-blotch" />
      <ProductEfficacyTable slug="sooty-blotch" />
      <CoincidenceAlerts slug="sooty-blotch" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="sooty-blotch" />
    </div>
  );
}
