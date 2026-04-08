import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  ClipboardList,
} from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { toImperial } from "@/lib/units";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshWeatherButton } from "./refresh-weather-button";

export const metadata = {
  title: "Weather Station | OrchardGuard",
  description: "Current weather conditions and 7-day hourly forecast.",
};

export const dynamic = "force-dynamic";

function ForecastInterpretation({ forecast }: { forecast: Array<{ timestamp: string; temp_c?: number | null; precip_mm?: number | null; humidity_pct?: number | null }> }) {
  // Group forecast by day and compute daily summaries
  const dayMap = new Map<string, { high: number; low: number; precip: number; dayLabel: string }>();

  for (const h of forecast) {
    const dt = new Date(h.timestamp);
    const dateKey = dt.toISOString().slice(0, 10);
    const existing = dayMap.get(dateKey);
    const temp = h.temp_c ?? 0;
    const precip = h.precip_mm ?? 0;
    const dayLabel = dt.toLocaleDateString("en-US", { weekday: "long" });

    if (existing) {
      existing.high = Math.max(existing.high, temp);
      existing.low = Math.min(existing.low, temp);
      existing.precip += precip;
    } else {
      dayMap.set(dateKey, { high: temp, low: temp, precip, dayLabel });
    }
  }

  const days = Array.from(dayMap.entries()).slice(0, 5);
  if (days.length === 0) return null;

  function interpretDay(day: { high: number; low: number; precip: number }, isFirst: boolean): string {
    const parts: string[] = [];
    if (day.precip > 5) {
      parts.push(`Rain forecast (${day.precip.toFixed(0)}\u00A0mm / ${toImperial(day.precip, "rainfall").toFixed(1)}\u00A0in)`);
    } else if (day.precip > 0.5) {
      parts.push(`Light rain possible (${day.precip.toFixed(1)}\u00A0mm / ${toImperial(day.precip, "rainfall").toFixed(2)}\u00A0in)`);
    } else {
      parts.push("Dry conditions");
    }

    if (day.high > 20) parts.push("warm temperatures");
    else if (day.high > 10) parts.push(`highs reaching ${day.high.toFixed(0)}\u00B0C (${toImperial(day.high, "temperature").toFixed(0)}\u00B0F)`);
    else parts.push(`cool, high of ${day.high.toFixed(0)}\u00B0C (${toImperial(day.high, "temperature").toFixed(0)}\u00B0F)`);

    if (day.low <= -2) parts.push(`\u2014 frost risk overnight (${day.low.toFixed(0)}\u00B0C / ${toImperial(day.low, "temperature").toFixed(0)}\u00B0F)`);
    else if (day.low <= 2) parts.push("\u2014 near-freezing overnight");

    return parts.join(", ") + ".";
  }

  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      <h2 className="text-section-title flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-primary" />
        What This Week&apos;s Weather Means For Your Orchard
      </h2>
      <ul className="space-y-2.5">
        {days.map(([dateKey, day], i) => (
          <li key={dateKey} className="flex items-start gap-2 text-[14px] leading-[1.7] text-bark-600">
            <span className="font-semibold text-bark-900 shrink-0 min-w-[100px]">
              {i === 0 ? `${day.dayLabel} (today)` : day.dayLabel}:
            </span>
            <span>{interpretDay(day, i === 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WeatherPage() {
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

  // Get 7 days of hourly data
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const allHourly = getWeatherRange("default", hourlyStart, hourlyEnd);

  // Find the most recent observation (closest to now)
  const nowMs = now.getTime();
  let current = allHourly.length > 0 ? allHourly[allHourly.length - 1] : null;
  let closestDiff = Infinity;
  for (const h of allHourly) {
    const diff = Math.abs(new Date(h.timestamp).getTime() - nowMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      current = h;
    }
  }

  // Split into past (observations) and future (forecast) relative to now
  const pastData = allHourly.filter(
    (h) => new Date(h.timestamp).getTime() <= nowMs
  );
  const futureData = allHourly.filter(
    (h) => new Date(h.timestamp).getTime() > nowMs
  );

  // Take the forecast (next 7 days of hourly data, grouped by 3-hour intervals for readability)
  const forecastSampled: typeof allHourly = [];
  for (let i = 0; i < futureData.length; i += 3) {
    forecastSampled.push(futureData[i]);
  }
  // Limit to a reasonable display count
  const forecastDisplay = forecastSampled.slice(0, 56); // ~7 days at 3h intervals

  // Weather source status
  const sourceCount = new Map<string, number>();
  for (const h of allHourly) {
    sourceCount.set(h.source, (sourceCount.get(h.source) ?? 0) + 1);
  }
  // Latest observation (not forecast) — use pastData for accurate "latest record" display
  const lastRecord = pastData.length > 0 ? pastData[pastData.length - 1] : null;

  // pastData is used for lastRecord and future enhancements

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-page-title">Weather Station</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {orchard.name} &mdash; {orchard.latitude.toFixed(2)},{" "}
            {orchard.longitude.toFixed(2)}. Weather data drives all disease and
            pest models.
          </p>
        </div>
        <RefreshWeatherButton
          lat={orchard.latitude}
          lon={orchard.longitude}
        />
      </div>

      {/* Current Conditions — Hero Card */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-section-title flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Current Conditions
          </h2>
          {current && (
            <span className="text-caption text-muted-foreground">
              {new Date(current.timestamp).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {current ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Big temperature hero */}
            <div className="flex items-center gap-3 sm:pr-8 sm:border-r sm:border-border">
              <Thermometer className="h-10 w-10 text-primary" />
              <div>
                <p className="font-data text-5xl font-bold">
                  {current.temp_c != null ? current.temp_c.toFixed(1) : "--"}
                  <span className="text-2xl font-semibold text-muted-foreground">&deg;C</span>
                </p>
                {current.temp_c != null && (
                  <p className="text-[14px] text-muted-foreground font-data">
                    {toImperial(current.temp_c, "temperature").toFixed(1)}&deg;F
                  </p>
                )}
              </div>
            </div>

            {/* Stat boxes */}
            <div className="grid flex-1 grid-cols-3 gap-3">
              <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-4">
                <Droplets className="mb-2 h-7 w-7 text-risk-info" />
                <p className="font-data text-2xl font-bold">
                  {current.humidity_pct != null
                    ? current.humidity_pct.toFixed(0)
                    : "--"}
                </p>
                <p className="text-caption text-muted-foreground">Humidity %</p>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-4">
                <Cloud className="mb-2 h-7 w-7 text-muted-foreground" />
                <p className="font-data text-2xl font-bold">
                  {current.precip_mm != null
                    ? current.precip_mm.toFixed(1)
                    : "--"}
                </p>
                <p className="text-caption text-muted-foreground">mm</p>
                {current.precip_mm != null && (
                  <p className="text-[11px] text-muted-foreground/70 font-data">
                    {toImperial(current.precip_mm, "rainfall").toFixed(2)}&nbsp;in
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-4">
                <Wind className="mb-2 h-7 w-7 text-primary" />
                <p className="font-data text-2xl font-bold">
                  {current.wind_kph != null
                    ? current.wind_kph.toFixed(1)
                    : "--"}
                </p>
                <p className="text-caption text-muted-foreground">km/h</p>
                {current.wind_kph != null && (
                  <p className="text-[11px] text-muted-foreground/70 font-data">
                    {toImperial(current.wind_kph, "windSpeed").toFixed(1)}&nbsp;mph
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-body text-muted-foreground">
            No weather data available. Click &quot;Refresh Weather&quot; to
            fetch current conditions.
          </p>
        )}
      </div>

      {/* Weather Source Status */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <h2 className="text-section-title flex items-center gap-2 mb-4">
          <Gauge className="h-5 w-5 text-primary" />
          Weather Source Status
        </h2>

        {allHourly.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-caption font-medium uppercase text-muted-foreground">
                Total Records
              </p>
              <p className="mt-1 font-data text-2xl font-bold">
                {allHourly.length}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-caption font-medium uppercase text-muted-foreground">
                Sources
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from(sourceCount.entries()).map(([src, count]) => (
                  <Badge key={src} variant="secondary">
                    {src}: <span className="font-data">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-caption font-medium uppercase text-muted-foreground">
                Latest Record
              </p>
              <p className="mt-1 text-body font-medium">
                {lastRecord
                  ? new Date(lastRecord.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "None"}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-body text-muted-foreground">
            No weather records in database.
          </p>
        )}
      </div>

      {/* Forecast Interpretation */}
      {forecastDisplay.length > 0 && (
        <ForecastInterpretation forecast={forecastDisplay} />
      )}

      {/* 7-Day Hourly Forecast Table */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <h2 className="text-section-title mb-4">Forecast (3-Hour Intervals)</h2>

        {forecastDisplay.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Temp (&deg;C/&deg;F)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>Precip (mm/in)</TableHead>
                  <TableHead>Wind (km/h / mph)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastDisplay.map((h, i) => {
                  const dt = new Date(h.timestamp);
                  const isNewDay =
                    i === 0 ||
                    dt.toDateString() !==
                      new Date(
                        forecastDisplay[i - 1].timestamp
                      ).toDateString();

                  return (
                    <TableRow
                      key={h.timestamp}
                      className={isNewDay ? "border-t-2 border-foreground/10" : ""}
                    >
                      <TableCell className="text-caption">
                        {isNewDay && (
                          <span className="mr-2 font-semibold">
                            {dt.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        <span className="font-data">
                          {dt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="font-data">
                        {h.temp_c != null ? (
                          <>{h.temp_c.toFixed(1)} <span className="text-muted-foreground">/ {toImperial(h.temp_c, "temperature").toFixed(0)}</span></>
                        ) : "--"}
                      </TableCell>
                      <TableCell className="font-data">
                        {h.humidity_pct != null
                          ? h.humidity_pct.toFixed(0)
                          : "--"}
                      </TableCell>
                      <TableCell className="font-data">
                        {h.precip_mm != null ? (
                          <>{h.precip_mm.toFixed(1)} <span className="text-muted-foreground">/ {toImperial(h.precip_mm, "rainfall").toFixed(2)}</span></>
                        ) : "--"}
                      </TableCell>
                      <TableCell className="font-data">
                        {h.wind_kph != null ? (
                          <>{h.wind_kph.toFixed(1)} <span className="text-muted-foreground">/ {toImperial(h.wind_kph, "windSpeed").toFixed(0)}</span></>
                        ) : "--"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-8 text-center text-body text-muted-foreground">
            No forecast data available. Click &quot;Refresh Weather&quot; to
            fetch forecast data from Open-Meteo.
          </p>
        )}
      </div>
    </div>
  );
}
