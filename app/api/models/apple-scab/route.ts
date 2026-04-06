import { NextRequest, NextResponse } from "next/server";
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db";
import { evaluateAppleScab } from "@/lib/models/apple-scab";

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

    // Hourly data for the last 7 days (for wet-period detection)
    const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const hourlyEnd = now.toISOString().slice(0, 10);

    const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);

    // Daily data from January 1 of the current year (for degree-day accumulation)
    const dailyStart = `${currentYear}-01-01`;
    const dailyEnd = now.toISOString().slice(0, 10);

    const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

    const result = evaluateAppleScab(
      hourlyData.map((h) => ({
        timestamp: h.timestamp,
        temp_c: h.temp_c ?? 0,
        humidity_pct: h.humidity_pct ?? 0,
        precip_mm: h.precip_mm ?? 0,
      })),
      dailyData.map((d) => ({
        date: d.date,
        max_temp: d.max_temp ?? 0,
        min_temp: d.min_temp ?? 0,
      })),
      orchard.petal_fall_date,
      orchard.bloom_stage,
    );

    return NextResponse.json({
      model: "apple-scab",
      ...result,
      orchardId: orchard.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[models/apple-scab] Error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate apple scab model" },
      { status: 500 }
    );
  }
}
