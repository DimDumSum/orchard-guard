import { Flame, AlertTriangle, CheckCircle, Droplets, Thermometer } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db";
import { evaluateFireBlight, mapLegacyHistory } from "@/lib/models/fire-blight";
import { calcDegreeHoursFromHourly } from "@/lib/degree-days";
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
import { toImperial } from "@/lib/units";
import { DegreeHourChart } from "./degree-hour-chart";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Fire Blight Detail | OrchardGuard",
  description: "Detailed fire blight risk assessment using CougarBlight and MaryBlyt models.",
};

export const dynamic = "force-dynamic";

const riskBadgeColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  caution: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  extreme: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const riskIndicatorColors: Record<string, string> = {
  low: "[&_[data-slot=progress-indicator]]:bg-green-500",
  caution: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
  high: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  extreme: "[&_[data-slot=progress-indicator]]:bg-red-500",
};

function ConditionDot({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span
        className={cn(
          "text-sm",
          met
            ? "font-medium text-foreground"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default function FireBlightPage() {
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

  // Hourly data for the last 7 days
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = now.toISOString().slice(0, 10);
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);

  // Daily forecast for next 7 days
  const sevenAhead = new Date(now);
  sevenAhead.setDate(sevenAhead.getDate() + 7);
  const forecastDaily = getDailyWeather("default", hourlyEnd, sevenAhead.toISOString().slice(0, 10));

  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    humidity_pct: h.humidity_pct ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  // Run the fire blight model
  const result = evaluateFireBlight(
    hourlyMapped,
    orchard.bloom_stage,
    mapLegacyHistory(orchard.fire_blight_history),
  );

  // Build degree hour accumulation chart data (daily for last 7 days)
  const chartData: Array<{ date: string; degreeHours: number }> = [];

  // Group hourly data by date
  const hoursByDate = new Map<string, number[]>();
  for (const h of hourlyMapped) {
    const date = h.timestamp.slice(0, 10);
    const existing = hoursByDate.get(date);
    if (existing) {
      existing.push(h.temp_c);
    } else {
      hoursByDate.set(date, [h.temp_c]);
    }
  }

  let cumulativeDH = 0;
  const sortedDates = Array.from(hoursByDate.keys()).sort();
  for (const date of sortedDates) {
    const temps = hoursByDate.get(date)!;
    const dayDH = calcDegreeHoursFromHourly(temps, 15.5);
    cumulativeDH += dayDH;
    chartData.push({
      date,
      degreeHours: Math.round(cumulativeDH * 10) / 10,
    });
  }

  const { cougarBlight, maryBlyt, combinedRisk, riskScore, sprayRecommendation } = result;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-page-title">
              Fire Blight
            </h1>
            <Badge
              className={cn(
                "capitalize text-sm px-3 py-1",
                riskBadgeColors[combinedRisk] ?? riskBadgeColors.low
              )}
            >
              {combinedRisk}
            </Badge>
          </div>
          <p className="mt-1 text-body text-muted-foreground">
            Combined CougarBlight + MaryBlyt assessment &mdash;{" "}
            {orchard.name}, bloom stage:{" "}
            <span className="font-medium capitalize">
              {orchard.bloom_stage}
            </span>
          </p>
        </div>

        {/* About Fire Blight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">About Fire Blight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[14px] leading-[1.7] text-bark-600">
            <p>
              Fire blight is a bacterial disease (<em>Erwinia amylovora</em>) that can
              kill branches and entire trees. The bacteria overwinter in cankers
              on infected wood. In spring, ooze from cankers attracts insects
              that carry the bacteria to open flowers.
            </p>
            <p>
              <strong>Infection requires:</strong> open blossoms + warm temperatures
              (above 15&deg;C) + moisture (rain or heavy dew). When all three align,
              bacteria multiply rapidly and can infect flowers within hours.
            </p>
            <p>
              <strong>Why two models?</strong> OrchardGuard runs{" "}
              <TermTooltip term="CougarBlight" /> (which tracks bacterial growth
              potential from temperature) and{" "}
              <TermTooltip term="MaryBlyt" /> (which predicts specific infection
              events). When both models agree, confidence in the prediction is highest.
            </p>
            <p className="font-medium text-bark-900">
              Your orchard: Fire blight history &mdash;{" "}
              <span className="capitalize">{orchard.fire_blight_history.replace("_", " ")}</span>.
              {orchard.fire_blight_history === "in_orchard" && (
                <> This means lower thresholds for alerts because overwintering
                bacteria are likely still present.</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Combined Risk Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Combined Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold font-data tabular-nums">
                {riskScore}
              </span>
              <span className="text-caption">/ 100</span>
              <Progress
                value={riskScore}
                className={cn(
                  "flex-1",
                  riskIndicatorColors[combinedRisk] ?? riskIndicatorColors.low
                )}
              />
            </div>

            <Separator />

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Spray Recommendation
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {sprayRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CougarBlight Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-section-title">
                <Thermometer className="h-5 w-5 text-muted-foreground" />
                CougarBlight Model
              </CardTitle>
              <Badge
                className={cn(
                  "capitalize",
                  riskBadgeColors[cougarBlight.adjustedRisk] ??
                    riskBadgeColors.low
                )}
              >
                {cougarBlight.adjustedRisk}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  4-Day <TermTooltip term="Degree Hours">Degree Hours</TermTooltip>
                </p>
                <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                  {cougarBlight.degreeHours4Day.toFixed(1)}
                </p>
                <p className="text-caption">base 15.5 C</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  <TermTooltip term="Inoculum">Inoculum</TermTooltip> Factor
                </p>
                <p className="mt-1 text-2xl font-bold font-data tabular-nums">
                  {cougarBlight.inoculumFactor}x
                </p>
                <p className="text-caption capitalize">
                  History: {orchard.fire_blight_history.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-caption font-medium uppercase">
                  Raw Risk
                </p>
                <p className="mt-1 text-2xl font-bold font-data capitalize tabular-nums">
                  {cougarBlight.rawRisk}
                </p>
                <p className="text-caption">
                  Before inoculum adjustment
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Thresholds (adjusted): Caution at{" "}
                {(110 * cougarBlight.inoculumFactor).toFixed(0)} DH, High at{" "}
                {(220 * cougarBlight.inoculumFactor).toFixed(0)} DH, Extreme at{" "}
                {(400 * cougarBlight.inoculumFactor).toFixed(0)} DH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MaryBlyt Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-section-title">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                MaryBlyt Model
              </CardTitle>
              <Badge
                className={cn(
                  maryBlyt.infectionEvent
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : maryBlyt.conditionsMet >= 3
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}
              >
                {maryBlyt.conditionsMet}/4 conditions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <ConditionDot
                met={maryBlyt.openBlossoms}
                label={`Open blossoms present (bloom stage: ${orchard.bloom_stage})`}
              />
              <ConditionDot
                met={maryBlyt.degreehoursMet}
                label={`Degree hours >= 198 (base 18.3 C): ${maryBlyt.cumulativeDH183.toFixed(1)} DH accumulated`}
              />
              <ConditionDot
                met={maryBlyt.wettingEvent}
                label="Wetting event in last 24h (rain > 0.25mm or humidity > 90%)"
              />
              <ConditionDot
                met={maryBlyt.tempMet}
                label="Mean temperature >= 15.6 C in last 24h"
              />
            </div>

            {maryBlyt.infectionEvent && (
              <>
                <Separator />
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    INFECTION EVENT DETECTED
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    All four MaryBlyt conditions are met simultaneously. This
                    indicates an active fire blight infection event is likely in
                    progress.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 7-Day Forecast Projection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              7-Day Fire Blight Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const todayStr = now.toISOString().slice(0, 10);
              const fDays = forecastDaily.filter((d) => d.date >= todayStr).slice(0, 7);
              if (fDays.length === 0) return <p className="py-4 text-center text-sm text-muted-foreground">No forecast data available.</p>;

              const factor = orchard.fire_blight_history === "in_orchard" ? 0.7
                : orchard.fire_blight_history === "nearby" ? 0.85 : 1.0;
              const cautionTh = 110 * factor;
              const highTh = 220 * factor;

              let cumDH = result.cougarBlight.degreeHours4Day;
              const rows = fDays.map((d) => {
                const meanT = ((d.max_temp ?? 0) + (d.min_temp ?? 0)) / 2;
                let dayDH = meanT > 15.5 ? Math.max(0, (meanT - 15.5)) * 16 : 0;
                if (meanT > 31) dayDH = Math.max(0, (31 - 15.5) - (meanT - 31) * 0.5) * 16;
                cumDH += dayDH;
                const precip = d.total_precip ?? 0;
                let risk = "Low";
                let riskColor = "text-green-600";
                if (cumDH >= highTh) { risk = "HIGH"; riskColor = "text-red-600"; }
                else if (cumDH >= cautionTh) { risk = "CAUTION"; riskColor = "text-yellow-600"; }
                return {
                  date: d.date,
                  dayName: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                  meanTemp: Math.round(meanT),
                  projectedDH: Math.round(cumDH),
                  precip: Math.round(precip),
                  risk,
                  riskColor,
                  note: meanT >= 18 ? "warm" : meanT >= 15 ? "mild" : "cool",
                };
              });

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="py-2 text-left font-medium">Day</th>
                        <th className="py-2 text-right font-medium">Temp</th>
                        <th className="py-2 text-right font-medium">Rain</th>
                        <th className="py-2 text-right font-medium">Proj. DH</th>
                        <th className="py-2 text-left font-medium pl-3">Risk</th>
                        <th className="py-2 text-left font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.date} className="border-b last:border-0">
                          <td className="py-2 text-[13px]">{r.date === todayStr ? "Today" : r.dayName}</td>
                          <td className="py-2 text-right font-data text-[13px]">{r.meanTemp}°C <span className="text-muted-foreground">({toImperial(r.meanTemp, "temperature").toFixed(0)}°F)</span></td>
                          <td className="py-2 text-right font-data text-[13px]">{r.precip > 0 ? <>{r.precip}mm <span className="text-muted-foreground">({toImperial(r.precip, "rainfall").toFixed(2)}in)</span></> : "\u2014"}</td>
                          <td className="py-2 text-right font-data font-semibold text-[13px]">{r.projectedDH}</td>
                          <td className={cn("py-2 pl-3 text-[12px] font-bold uppercase", r.riskColor)}>{r.risk}</td>
                          <td className="py-2 text-[13px] text-muted-foreground">{r.note}{r.precip > 0 ? " + rain" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Degree Hour Accumulation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Degree Hour Accumulation (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <DegreeHourChart data={chartData} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No weather data available for chart. Fetch weather data to see
                degree hour accumulation.
              </p>
            )}
          </CardContent>
        </Card>

      <ImageGallery slug="fire-blight" />
      <ScoutingGuideSection slug="fire-blight" />
      <ProductEfficacyTable slug="fire-blight" />
      <CoincidenceAlerts slug="fire-blight" riskLevel={combinedRisk} />
      <ScoutingObservationButton slug="fire-blight" />
    </div>
  );
}
