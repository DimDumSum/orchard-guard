import { NextRequest, NextResponse } from "next/server";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateFireBlight, mapLegacyHistory } from "@/lib/models/fire-blight";

export async function GET(request: NextRequest) {
  try {
    const orchard = getOrchard();
    if (!orchard) {
      return NextResponse.json(
        { error: "No orchard configured" },
        { status: 404 }
      );
    }

    // Get the last 7 days of hourly data (need at least 96 hours for CougarBlight)
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);

    const hourlyData = getWeatherRange("default", startDate, endDate);

    const result = evaluateFireBlight(
      hourlyData.map((h) => ({
        timestamp: h.timestamp,
        temp_c: h.temp_c ?? 0,
        humidity_pct: h.humidity_pct ?? 0,
        precip_mm: h.precip_mm ?? 0,
      })),
      orchard.bloom_stage,
      mapLegacyHistory(orchard.fire_blight_history)
    );

    return NextResponse.json({
      model: "fire-blight",
      ...result,
      orchardId: orchard.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[models/fire-blight] Error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate fire blight model" },
      { status: 500 }
    );
  }
}
