import { NextRequest, NextResponse } from "next/server";
import { getDb, getOrchard } from "@/lib/db";
import type { SprayLogRow, WeatherDailyRow } from "@/lib/db";
import { calcDegreeDaysSine } from "@/lib/degree-days";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10);

    const db = getDb();
    const orchard = getOrchard(orchardId);

    if (!orchard) {
      return NextResponse.json(
        { error: "No orchard configured" },
        { status: 404 },
      );
    }

    // Current year boundaries
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    // --- Spray summary ---------------------------------------------------
    const sprayEntries = db
      .prepare(
        `SELECT * FROM spray_log
         WHERE orchard_id = ? AND date >= ? AND date <= ?
         ORDER BY date ASC`,
      )
      .all(orchardId, yearStart, yearEnd) as SprayLogRow[];

    const sprayCount = sprayEntries.length;

    // Breakdown by target category
    const targetBreakdown: Record<string, number> = {};
    for (const entry of sprayEntries) {
      const t = entry.target ?? "unknown";
      targetBreakdown[t] = (targetBreakdown[t] ?? 0) + 1;
    }

    // Group by broad category
    const fungicideTargets = [
      "fire_blight",
      "apple_scab",
      "powdery_mildew",
      "cedar_rust",
      "sooty_blotch",
      "black_rot",
      "general_fungicide",
    ];
    const insecticideTargets = [
      "codling_moth",
      "plum_curculio",
      "apple_maggot",
      "oriental_fruit_moth",
      "leafroller",
      "european_red_mite",
      "general_insecticide",
    ];

    let fungicideCount = 0;
    let insecticideCount = 0;
    let growthRegulatorCount = 0;
    let otherCount = 0;

    for (const [target, count] of Object.entries(targetBreakdown)) {
      if (fungicideTargets.includes(target)) {
        fungicideCount += count;
      } else if (insecticideTargets.includes(target)) {
        insecticideCount += count;
      } else if (target.includes("thinning") || target.includes("growth")) {
        growthRegulatorCount += count;
      } else {
        otherCount += count;
      }
    }

    // --- Infection count -------------------------------------------------
    const infectionRow = db
      .prepare(
        `SELECT count(*) AS cnt FROM scab_infection_log
         WHERE orchard_id = ? AND date >= ? AND date <= ?`,
      )
      .get(orchardId, yearStart, yearEnd) as { cnt: number };

    const infectionCount = infectionRow?.cnt ?? 0;

    // --- Degree day data -------------------------------------------------
    const dailyRows = db
      .prepare(
        `SELECT date, max_temp, min_temp FROM weather_daily
         WHERE date >= ? AND date <= ?
         ORDER BY date ASC`,
      )
      .all(yearStart, yearEnd) as Pick<
      WeatherDailyRow,
      "date" | "max_temp" | "min_temp"
    >[];

    const BASE_TEMP = 5; // base 5 C for general apple DD
    let cumulativeDD = 0;
    const degreeDayData: Array<{
      date: string;
      dailyDD: number;
      cumulativeDD: number;
    }> = [];

    for (const row of dailyRows) {
      if (row.max_temp == null || row.min_temp == null) continue;
      const dd = calcDegreeDaysSine(row.max_temp, row.min_temp, BASE_TEMP);
      cumulativeDD += dd;
      degreeDayData.push({
        date: row.date,
        dailyDD: Math.round(dd * 10) / 10,
        cumulativeDD: Math.round(cumulativeDD * 10) / 10,
      });
    }

    // --- Key dates -------------------------------------------------------
    const keyDates = {
      bloomStage: orchard.bloom_stage,
      biofixDate: orchard.codling_moth_biofix_date,
      petalFallDate: orchard.petal_fall_date,
    };

    return NextResponse.json({
      orchardId,
      year,
      keyDates,
      sprayCount,
      sprayBreakdown: {
        fungicide: fungicideCount,
        insecticide: insecticideCount,
        growthRegulator: growthRegulatorCount,
        other: otherCount,
      },
      infectionCount,
      totalDegreeDays: Math.round(cumulativeDD * 10) / 10,
      degreeDayData,
    });
  } catch (err) {
    console.error("[history] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch season history" },
      { status: 500 },
    );
  }
}
