import { NextRequest, NextResponse } from "next/server";
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db";
import { runAllModels } from "@/lib/models";

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

    // Map daily data to the shape expected by models
    const dailyMapped = dailyData.map((d) => ({
      date: d.date,
      max_temp: d.max_temp ?? 0,
      min_temp: d.min_temp ?? 0,
    }));

    const orchard_config = {
      bloom_stage: orchard.bloom_stage,
      fire_blight_history: orchard.fire_blight_history,
      petal_fall_date: orchard.petal_fall_date,
      codling_moth_biofix_date: orchard.codling_moth_biofix_date,
    };

    // Run all models
    const results = runAllModels(hourlyMapped, dailyMapped, [], orchard_config);

    // Compute orchard health score: worst-case (highest) risk score across all models
    const allScores = Object.values(results)
      .map((r) => (r as { riskScore?: number }).riskScore)
      .filter((s): s is number => typeof s === "number");

    const orchardHealthScore =
      allScores.length > 0 ? Math.max(...allScores) : 0;

    return NextResponse.json({
      ...results,
      orchardHealthScore,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[models/all] Error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate models" },
      { status: 500 }
    );
  }
}
