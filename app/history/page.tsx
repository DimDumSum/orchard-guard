// ---------------------------------------------------------------------------
// OrchardGuard Season History Page — Server Component
//
// Displays season milestones, spray summary, and degree day accumulation
// chart for the current growing season.
// ---------------------------------------------------------------------------

import { getDb, getOrchard } from "@/lib/db";
import type { SprayLogRow, WeatherDailyRow } from "@/lib/db";

export const dynamic = "force-dynamic";
import { calcDegreeDaysSine } from "@/lib/degree-days";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Flower2,
  Bug,
  Droplets,
  Thermometer,
  SprayCan,
  Target,
} from "lucide-react";
import { DegreeDayChart } from "./dd-chart";

export default async function HistoryPage() {
  const db = getDb();
  const orchard = getOrchard();

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  // --- Spray entries for this season ------------------------------------
  const sprayEntries = db
    .prepare(
      `SELECT * FROM spray_log
       WHERE orchard_id = 1 AND date >= ? AND date <= ?
       ORDER BY date ASC`,
    )
    .all(yearStart, yearEnd) as SprayLogRow[];

  // --- Infection count ---------------------------------------------------
  let infectionCount = 0;
  try {
    const infectionRow = db
      .prepare(
        `SELECT count(*) AS cnt FROM scab_infection_log
         WHERE orchard_id = 1 AND date >= ? AND date <= ?`,
      )
      .get(yearStart, yearEnd) as { cnt: number };
    infectionCount = infectionRow?.cnt ?? 0;
  } catch {
    // Table may not exist in older schemas
  }

  // --- Degree day data from weather_daily view --------------------------
  let dailyRows: Pick<WeatherDailyRow, "date" | "max_temp" | "min_temp">[] =
    [];
  try {
    dailyRows = db
      .prepare(
        `SELECT date, max_temp, min_temp FROM weather_daily
         WHERE date >= ? AND date <= ?
         ORDER BY date ASC`,
      )
      .all(yearStart, yearEnd) as Pick<
      WeatherDailyRow,
      "date" | "max_temp" | "min_temp"
    >[];
  } catch {
    // View may not exist yet
  }

  const BASE_TEMP = 5;
  let cumulativeDD = 0;
  const degreeDayData: Array<{ date: string; cumulativeDD: number }> = [];

  for (const row of dailyRows) {
    if (row.max_temp == null || row.min_temp == null) continue;
    const dd = calcDegreeDaysSine(row.max_temp, row.min_temp, BASE_TEMP);
    cumulativeDD += dd;
    degreeDayData.push({
      date: row.date,
      cumulativeDD: Math.round(cumulativeDD * 10) / 10,
    });
  }

  // --- Spray breakdown by category --------------------------------------
  const fungicideTargets = new Set([
    "fire_blight",
    "apple_scab",
    "powdery_mildew",
    "cedar_rust",
    "sooty_blotch",
    "black_rot",
    "general_fungicide",
  ]);
  const insecticideTargets = new Set([
    "codling_moth",
    "plum_curculio",
    "apple_maggot",
    "oriental_fruit_moth",
    "leafroller",
    "european_red_mite",
    "general_insecticide",
  ]);

  let fungicideCount = 0;
  let insecticideCount = 0;
  let growthRegulatorCount = 0;
  let otherCount = 0;

  for (const entry of sprayEntries) {
    const t = entry.target ?? "";
    if (fungicideTargets.has(t)) fungicideCount++;
    else if (insecticideTargets.has(t)) insecticideCount++;
    else if (t.includes("thinning") || t.includes("growth")) growthRegulatorCount++;
    else otherCount++;
  }

  // Format date helper
  function fmtDate(dateStr: string | null): string {
    if (!dateStr) return "Not set";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Bloom stage display
  function formatBloomStage(stage: string): string {
    return stage
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-page-title flex items-center gap-2">
          <Calendar className="size-6 text-blue-600" />
          Season History
        </h1>
        <p className="text-body text-muted-foreground">
          {year} growing season milestones, spray summary, and degree day
          accumulation.
        </p>
      </div>

      {/* Current season milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <Flower2 className="size-5 text-pink-500" />
            Season Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orchard ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Stage</p>
                <Badge variant="secondary" className="text-sm">
                  {formatBloomStage(orchard.bloom_stage)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Biofix Date</p>
                <p className="text-sm font-medium">
                  {fmtDate(orchard.codling_moth_biofix_date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Petal Fall Date</p>
                <p className="text-sm font-medium">
                  {fmtDate(orchard.petal_fall_date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Thermometer className="size-3.5" />
                  Degree Days (base 5 C)
                </p>
                <p className="text-sm font-medium">
                  {Math.round(cumulativeDD)} DD
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <SprayCan className="size-3.5" />
                  Season Sprays
                </p>
                <p className="text-sm font-medium">{sprayEntries.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Droplets className="size-3.5" />
                  Infection Events
                </p>
                <p className="text-sm font-medium">{infectionCount}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No orchard configured. Visit Settings to set up your orchard.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Spray summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <Target className="size-5 text-orange-500" />
            Spray Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sprayEntries.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Sprays</p>
                  <p className="text-2xl font-semibold font-data">
                    {sprayEntries.length}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-1.5">
                    <Bug className="size-3.5 text-green-600" />
                    <p className="text-sm text-muted-foreground">Fungicide</p>
                  </div>
                  <p className="text-2xl font-semibold font-data">{fungicideCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-1.5">
                    <Bug className="size-3.5 text-red-600" />
                    <p className="text-sm text-muted-foreground">Insecticide</p>
                  </div>
                  <p className="text-2xl font-semibold font-data">{insecticideCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Growth Regulator / Other
                  </p>
                  <p className="text-2xl font-semibold font-data">
                    {growthRegulatorCount + otherCount}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Year-over-year comparison available after first full season.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No spray applications recorded for {year}. Log sprays on the{" "}
              <a href="/spray-log" className="underline underline-offset-4">
                Spray Log
              </a>{" "}
              page.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Degree day chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <Thermometer className="size-5 text-emerald-600" />
            Degree Day Accumulation ({year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DegreeDayChart
            data={degreeDayData}
            biofixDate={orchard?.codling_moth_biofix_date}
            petalFallDate={orchard?.petal_fall_date}
          />
        </CardContent>
      </Card>
    </div>
  );
}
