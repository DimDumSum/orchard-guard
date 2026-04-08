import { NextRequest, NextResponse } from "next/server";
import { getOrchard, getWeatherRange, getDailyWeather, getDb, cacheModelResults, getCachedModelResults } from "@/lib/db";
import type { SprayLogRow } from "@/lib/db";
import { runAllModels, persistScabInfections } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const orchard = getOrchard();
    if (!orchard) {
      return NextResponse.json(
        { error: "No orchard configured" },
        { status: 404 }
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

    // Daily data from January 1 of the current year
    const dailyStart = `${currentYear}-01-01`;
    const dailyEnd = now.toISOString().slice(0, 10);

    const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

    // Map hourly data to the shape expected by models
    const hourlyMapped = hourlyData.map((h) => ({
      timestamp: h.timestamp,
      temp_c: h.temp_c ?? 0,
      humidity_pct: h.humidity_pct ?? 0,
      precip_mm: h.precip_mm ?? 0,
    }));

    // Split into past (observations) and future (forecast)
    const pastHourly = hourlyMapped.filter(
      (h) => new Date(h.timestamp).getTime() <= now.getTime(),
    );
    const forecastHourly = hourlyMapped.filter(
      (h) => new Date(h.timestamp).getTime() > now.getTime(),
    );

    // Map daily data to the shape expected by models
    const dailyMapped = dailyData.map((d) => ({
      date: d.date,
      max_temp: d.max_temp ?? 0,
      min_temp: d.min_temp ?? 0,
    }));

    // Count calcium sprays this season for bitter pit tracking
    const db = getDb();
    const calciumProducts = ["calcium chloride", "calcimax", "maestro"];
    const sprayLog = db
      .prepare("SELECT * FROM spray_log WHERE orchard_id = ? AND date >= ? ORDER BY date DESC")
      .all(orchard.id, `${currentYear}-01-01`) as SprayLogRow[];
    const calciumSpraysCompleted = sprayLog.filter((s) =>
      calciumProducts.some((cp) => s.product.toLowerCase().includes(cp)),
    ).length;

    // Extract primary variety from orchard config
    let primaryVariety: string | undefined;
    try {
      const varieties = JSON.parse(orchard.primary_varieties || "[]") as string[];
      if (varieties.length > 0) primaryVariety = varieties[0];
    } catch { /* use undefined */ }

    const orchard_config = {
      bloom_stage: orchard.bloom_stage,
      fire_blight_history: orchard.fire_blight_history,
      petal_fall_date: orchard.petal_fall_date,
      codling_moth_biofix_date: orchard.codling_moth_biofix_date,
      primary_variety: primaryVariety,
      calcium_sprays_completed: calciumSpraysCompleted,
    };

    // Run all models with forecast data for fire blight projection
    const results = runAllModels(pastHourly, dailyMapped, forecastHourly, orchard_config);

    // Persist scab infection events to database
    try {
      persistScabInfections(orchard.id, results.appleScab);
    } catch { /* non-critical — don't fail the API response */ }

    // Compute orchard health score: worst-case (highest) risk score across all models
    const allScores = Object.values(results)
      .map((r) => (r as { riskScore?: number }).riskScore)
      .filter((s): s is number => typeof s === "number");

    const orchardHealthScore =
      allScores.length > 0 ? Math.max(...allScores) : 0;

    const response = {
      ...results,
      orchardHealthScore,
      timestamp: new Date().toISOString(),
    };

    // Cache results for offline resilience
    try {
      cacheModelResults(orchard.id, response);
    } catch { /* non-critical */ }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[models/all] Error:", err);

    // Serve cached results if available
    try {
      const orchard = getOrchard();
      if (orchard) {
        const cached = getCachedModelResults(orchard.id);
        if (cached) {
          return NextResponse.json({
            ...(cached.results as Record<string, unknown>),
            _cached: true,
            _cachedAt: cached.cachedAt,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch { /* can't serve cache either */ }

    return NextResponse.json(
      { error: "Failed to evaluate models" },
      { status: 500 }
    );
  }
}
