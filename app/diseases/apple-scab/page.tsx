import { Leaf, Droplets, AlertTriangle, CloudRain } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db";
import { evaluateAppleScab, findWetPeriods, getMillsThreshold } from "@/lib/models/apple-scab";
import { ScabForecastTable } from "./scab-forecast-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { WetPeriodChart } from "./wet-period-chart";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Apple Scab Detail | OrchardGuard",
  description: "Detailed apple scab risk assessment using the Modified Mills Table model.",
};

export const dynamic = "force-dynamic";

const severityBadgeColors: Record<string, string> = {
  none: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  light: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  moderate: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  severe: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const severityIndicatorColors: Record<string, string> = {
  none: "[&_[data-slot=progress-indicator]]:bg-green-500",
  light: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
  moderate: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  severe: "[&_[data-slot=progress-indicator]]:bg-red-500",
};

export default function AppleScabPage() {
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

  // Hourly data for the last 7 days
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = now.toISOString().slice(0, 10);
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);

  // Daily data from January 1 through 7 days ahead (for forecast)
  const dailyStart = `${currentYear}-01-01`;
  const sevenAhead = new Date(now);
  sevenAhead.setDate(sevenAhead.getDate() + 7);
  const dailyEnd = sevenAhead.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    humidity_pct: h.humidity_pct ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateAppleScab(
    hourlyMapped,
    dailyMapped,
    orchard.petal_fall_date,
    orchard.bloom_stage,
  );

  // Build chart data: recent wet periods with Mills thresholds
  const allWetPeriods = findWetPeriods(hourlyMapped);
  const chartData = allWetPeriods
    .filter((wp) => wp.durationHours >= 2)
    .slice(-10)
    .map((wp) => {
      const thresholds = getMillsThreshold(wp.meanTemp);
      return {
        startTime: wp.startTime,
        duration: wp.durationHours,
        meanTemp: wp.meanTemp,
        lightThreshold: thresholds?.light ?? null,
        moderateThreshold: thresholds?.moderate ?? null,
        severeThreshold: thresholds?.severe ?? null,
        severity: wp.severity,
        percentComplete: wp.percentComplete,
      };
    });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-page-title">
              Apple Scab
            </h1>
            <Badge
              className={cn(
                "capitalize text-sm px-3 py-1",
                severityBadgeColors[result.riskLevel] ?? severityBadgeColors.none
              )}
            >
              {result.riskLevel}
            </Badge>
          </div>
          <p className="mt-1 text-body text-muted-foreground">
            Modified Mills Table model &mdash; {orchard.name}
          </p>
        </div>

        {/* About Apple Scab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">About Apple Scab</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[14px] leading-[1.7] text-bark-600">
            <p>
              Apple scab is a fungal disease (<em>Venturia inaequalis</em>) that causes
              dark spots on leaves and fruit. It&apos;s the most important disease for
              Ontario apple orchards and requires active management every spring.
            </p>
            <p>
              <strong>How infection works:</strong> The fungus overwinters in fallen leaves.
              In spring, it releases spores during rain. If leaves stay wet long enough at
              the right temperature (see Mills Table below), infection occurs. Warmer
              temperatures need less wetting time.
            </p>
            <p>
              <strong><TermTooltip term="Ascospore maturity" /></strong> tracks how
              much of the season&apos;s total spore supply has matured. Primary scab
              season ends when ascospores are exhausted (roughly petal fall + 2 weeks).
              After that, only secondary spread from existing infections is possible.
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
                  severityIndicatorColors[result.riskLevel] ??
                    severityIndicatorColors.none
                )}
              />
            </div>

            {result.sprayWindow && (
              <>
                <Separator />
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        Spray Window
                      </p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        {result.sprayWindow}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Wet Period */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-section-title">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                Current Wet Period
              </CardTitle>
              {result.currentWetPeriod ? (
                <Badge
                  className={cn(
                    "capitalize",
                    severityBadgeColors[result.currentWetPeriod.severity] ??
                      severityBadgeColors.none
                  )}
                >
                  {result.currentWetPeriod.infectionOccurred
                    ? `${result.currentWetPeriod.severity} infection`
                    : "No infection"}
                </Badge>
              ) : (
                <Badge className={severityBadgeColors.none}>Dry</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result.currentWetPeriod ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-caption font-medium uppercase">
                      Duration
                    </p>
                    <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                      {result.currentWetPeriod.durationHours}h
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-caption font-medium uppercase">
                      Mean Temperature
                    </p>
                    <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                      {result.currentWetPeriod.meanTemp} C
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-caption font-medium uppercase">
                      Progress to Infection
                    </p>
                    <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                      {result.currentWetPeriod.percentComplete.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Progress toward light infection threshold
                  </p>
                  <Progress
                    value={Math.min(result.currentWetPeriod.percentComplete, 100)}
                    className={cn(
                      severityIndicatorColors[
                        result.currentWetPeriod.severity
                      ] ?? severityIndicatorColors.none
                    )}
                  />
                </div>

                {result.currentWetPeriod.hoursNeeded && (
                  <p className="text-sm text-muted-foreground">
                    Hours needed at {result.currentWetPeriod.meanTemp} C: Light{" "}
                    {result.currentWetPeriod.hoursNeeded.light.toFixed(0)}h,
                    Moderate{" "}
                    {result.currentWetPeriod.hoursNeeded.moderate.toFixed(0)}h,
                    Severe{" "}
                    {result.currentWetPeriod.hoursNeeded.severe.toFixed(0)}h
                  </p>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No active wet period. Conditions are currently dry.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ascospore Maturity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-section-title">Ascospore Maturity &amp; Primary Scab Season</CardTitle>
              <Badge
                className={cn(
                  result.primaryScabSeason
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}
              >
                {result.primaryScabSeason ? "Season Active" : "Season Ended"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Ascospore Maturity</span>
                  <span className="text-sm font-bold font-data tabular-nums">
                    {result.ascosporeMaturity.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={result.ascosporeMaturity}
                  className="[&_[data-slot=progress-indicator]]:bg-emerald-500"
                />
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  Cumulative Degree Days (base 0 C)
                </p>
                <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                  {result.cumulativeDegreeDays.toFixed(0)}
                </p>
                <p className="text-caption">From January 1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Infections Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Recent Infection Events (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {result.recentInfections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Mean Temp</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.recentInfections.map((wp, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">
                        {new Date(wp.startTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{wp.durationHours}h</TableCell>
                      <TableCell>{wp.meanTemp} C</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize",
                            severityBadgeColors[wp.severity] ??
                              severityBadgeColors.none
                          )}
                        >
                          {wp.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{wp.percentComplete.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No infection events detected in the last 7 days.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 7-Day Forecast Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <CloudRain className="h-5 w-5 text-muted-foreground" />
              7-Day Apple Scab Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const todayStr = now.toISOString().slice(0, 10);
              const forecastRows = dailyData
                .filter((d) => d.date >= todayStr)
                .slice(0, 7)
                .map((d) => {
                  const meanTemp = ((d.max_temp ?? 0) + (d.min_temp ?? 0)) / 2;
                  const precip = d.total_precip ?? 0;
                  // Estimate wet hours and risk
                  let estWetHrs = 0;
                  let risk: "low" | "moderate" | "high" = "low";
                  let action = "";
                  if (precip > 0.5 && meanTemp >= 1 && meanTemp <= 26) {
                    estWetHrs = precip <= 5 ? 7 : precip <= 15 ? 11 : 18;
                    const mills = getMillsThreshold(meanTemp);
                    if (mills) {
                      if (estWetHrs >= mills.severe) { risk = "high"; action = "Spray before rain"; }
                      else if (estWetHrs >= mills.light) { risk = "high"; action = "Spray before rain"; }
                      else if (estWetHrs >= mills.light * 0.7) { risk = "moderate"; action = "Monitor closely"; }
                    }
                  }
                  if (meanTemp < 1 || meanTemp > 26) action = "Too cold/hot";
                  if (risk === "low" && precip <= 0.5) {
                    const nextRainDay = dailyData.find((dd) => dd.date > d.date && (dd.total_precip ?? 0) > 2);
                    if (nextRainDay && (nextRainDay.total_precip ?? 0) > 2 && d.date < nextRainDay.date) {
                      action = "Best spray day";
                    } else {
                      action = "\u2014";
                    }
                  }
                  return {
                    date: d.date,
                    dayName: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                    meanTemp: Math.round(meanTemp),
                    precip: Math.round(precip),
                    estWetHrs,
                    risk,
                    action,
                  };
                });

              return forecastRows.length > 0 ? (
                <div className="space-y-3">
                  <ScabForecastTable rows={forecastRows} />
                  <p className="text-xs text-muted-foreground">
                    Ascospore maturity: {result.ascosporeMaturity.toFixed(1)}% &mdash;{" "}
                    {result.ascosporeMaturity < 5
                      ? "early season, low spore load. Even if infection occurs, severity limited by available spores."
                      : result.ascosporeMaturity < 50
                      ? "primary scab season active. Protect green tissue during wet periods."
                      : "spore load high. Maintain fungicide coverage through all rain events."}
                  </p>
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No forecast data available.
                </p>
              );
            })()}
          </CardContent>
        </Card>

        {/* Wet Period Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Wet Periods &amp; Mills Table Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <WetPeriodChart data={chartData} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No significant wet periods detected. Fetch weather data to
                populate this chart.
              </p>
            )}
          </CardContent>
        </Card>

      <ImageGallery slug="apple-scab" />
      <ScoutingGuideSection slug="apple-scab" />
      <ProductEfficacyTable slug="apple-scab" />
      <CoincidenceAlerts slug="apple-scab" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="apple-scab" />
    </div>
  );
}
