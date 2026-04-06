import { Bug, Target, Calendar } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateCodlingMoth } from "@/lib/models/codling-moth";
import { calcCumulativeDegreeDays } from "@/lib/degree-days";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DegreeDayChart } from "./degree-day-chart";
import { BiofixForm } from "./biofix-form";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Codling Moth Detail | OrchardGuard",
  description: "Detailed codling moth risk assessment using degree-day phenology.",
};

export const dynamic = "force-dynamic";

const riskBadgeColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const riskIndicatorColors: Record<string, string> = {
  low: "[&_[data-slot=progress-indicator]]:bg-green-500",
  moderate: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
  high: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  critical: "[&_[data-slot=progress-indicator]]:bg-red-500",
};

// Thresholds from the model (replicated for display)
const THRESHOLDS = [
  { dd: 100, label: "1st gen egg hatch begins", gen: 1 },
  { dd: 250, label: "1st gen peak egg hatch", gen: 1 },
  { dd: 550, label: "1st generation complete", gen: 1 },
  { dd: 1050, label: "2nd gen egg hatch begins", gen: 2 },
  { dd: 1200, label: "2nd gen peak egg hatch", gen: 2 },
];

export default function CodlingMothPage() {
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
  const currentYear = now.getFullYear();

  // Daily data from January 1
  const dailyStart = `${currentYear}-01-01`;
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateCodlingMoth(dailyMapped, orchard.codling_moth_biofix_date);

  // Build chart data: cumulative DD accumulation by date from biofix
  const chartData: Array<{ date: string; dd: number }> = [];

  if (orchard.codling_moth_biofix_date) {
    const biofixData = dailyMapped.filter(
      (d) => d.date >= orchard.codling_moth_biofix_date!
    );
    let cumDD = 0;
    for (const day of biofixData) {
      const maxT = day.max_temp;
      const minT = day.min_temp;
      const baseTemp = 10;
      // Simple average method for per-day DD
      const dd = Math.max((maxT + minT) / 2 - baseTemp, 0);
      cumDD += dd;
      chartData.push({
        date: day.date,
        dd: Math.round(cumDD * 10) / 10,
      });
    }
  }

  // Find progress toward next threshold
  const nextThreshold = result.nextThreshold;
  const progressToNext =
    nextThreshold && result.cumulativeDD > 0
      ? Math.min((result.cumulativeDD / nextThreshold.dd) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <Bug className="h-8 w-8 text-amber-600" />
            <h1 className="text-page-title">
              Codling Moth
            </h1>
            <Badge
              className={cn(
                "capitalize text-sm px-3 py-1",
                riskBadgeColors[result.riskLevel] ?? riskBadgeColors.low
              )}
            >
              {result.riskLevel}
            </Badge>
          </div>
          <p className="mt-1 text-body text-muted-foreground">
            Degree-day phenology tracking &mdash; {orchard.name}
          </p>
        </div>

        {/* About Codling Moth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">About Codling Moth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[14px] leading-[1.7] text-bark-600">
            <p>
              Codling moth is the single most important insect pest in apple orchards.
              The larvae tunnel into fruit (&ldquo;wormy apples&rdquo;), causing direct
              damage and making fruit unmarketable.
            </p>
            <p>
              <strong>How <TermTooltip term="Degree Days">degree days</TermTooltip> work:</strong>{" "}
              Codling moth development is driven by temperature, not calendar dates.
              We count degree days (accumulated warmth above 10&deg;C) from the{" "}
              <TermTooltip term="Biofix">biofix</TermTooltip> date &mdash; the date
              you first consistently catch moths in pheromone traps. At 100 DD, eggs
              start hatching. At 250 DD, peak hatch occurs and spray coverage is critical.
            </p>
            <p>
              <strong>Biofix:</strong> {orchard.codling_moth_biofix_date
                ? `Set to ${orchard.codling_moth_biofix_date}. All degree-day predictions count from this date.`
                : "Not set yet. Set this in Settings once you get your first sustained moth catch in pheromone traps."}
            </p>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold font-data tabular-nums">
                {result.riskScore}
              </span>
              <span className="text-caption">/ 100</span>
              <Progress
                value={result.riskScore}
                className={cn(
                  "flex-1",
                  riskIndicatorColors[result.riskLevel] ??
                    riskIndicatorColors.low
                )}
              />
            </div>

            <Separator />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Recommendation
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {result.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DD Accumulation Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <Target className="h-5 w-5 text-muted-foreground" />
              Degree Day Accumulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  Cumulative DD
                </p>
                <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                  {result.cumulativeDD}
                </p>
                <p className="text-caption">base 10 C</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  Generation
                </p>
                <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                  {result.generation}
                </p>
                <p className="text-caption">
                  {result.generation === 1 ? "First" : "Second"} generation
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  Current Stage
                </p>
                <p className="mt-1 text-sm font-bold">
                  {result.currentThreshold}
                </p>
              </div>
            </div>

            {/* Next threshold progress */}
            {nextThreshold && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Next: {nextThreshold.label} ({nextThreshold.dd} DD)
                  </span>
                  <span className="text-sm font-bold font-data tabular-nums">
                    {result.ddToNextThreshold} DD away
                  </span>
                </div>
                <Progress
                  value={progressToNext}
                  className="[&_[data-slot=progress-indicator]]:bg-blue-500"
                />
              </div>
            )}

            <Separator />

            {/* All thresholds */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Threshold Timeline</p>
              {THRESHOLDS.map((t) => {
                const reached = result.cumulativeDD >= t.dd;
                return (
                  <div
                    key={t.dd}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                      reached
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          reached ? "bg-green-500" : "bg-muted-foreground/30"
                        )}
                      />
                      <span
                        className={cn(
                          reached
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {t.label}
                      </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {t.dd} DD
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Biofix Date Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Biofix Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BiofixForm
              currentBiofix={orchard.codling_moth_biofix_date}
              orchardId={orchard.id}
            />
          </CardContent>
        </Card>

        {/* Degree Day Accumulation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">DD Accumulation from Biofix</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <DegreeDayChart data={chartData} thresholds={THRESHOLDS} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {orchard.codling_moth_biofix_date
                  ? "No weather data available after biofix date. Fetch weather data to see accumulation."
                  : "Set a biofix date to begin tracking degree-day accumulation."}
              </p>
            )}
          </CardContent>
        </Card>

      <ImageGallery slug="codling-moth" />
      <ScoutingGuideSection slug="codling-moth" />
      <ProductEfficacyTable slug="codling-moth" />
      <CoincidenceAlerts slug="codling-moth" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="codling-moth" />
    </div>
  );
}
