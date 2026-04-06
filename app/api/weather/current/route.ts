import { NextRequest, NextResponse } from "next/server";
import { getDb, getOrchard } from "@/lib/db";
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    // Fetch the most recent hourly weather row
    const current = db
      .prepare(
        `SELECT * FROM weather_hourly
         ORDER BY timestamp DESC
         LIMIT 1`
      )
      .get() as Record<string, unknown> | undefined;

    // Determine whether data is stale (older than 1 hour)
    let stale = true;
    if (current && typeof current.timestamp === "string") {
      const lastTime = new Date(current.timestamp).getTime();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      stale = lastTime < oneHourAgo;
    }

    // Trigger a background weather fetch when data is stale or missing
    if (stale) {
      const orchard = getOrchard();
      if (orchard) {
        // Fire-and-forget — don't block the response
        fetchAndStoreWeather(orchard.latitude, orchard.longitude).catch(
          (err) => console.error("[weather/current] Background fetch failed:", err)
        );
      }
    }

    return NextResponse.json({
      current: current ?? null,
      source: "open-meteo",
      updatedAt: current?.timestamp ?? null,
    });
  } catch (err) {
    console.error("[weather/current] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch current weather" },
      { status: 500 }
    );
  }
}

/**
 * POST — Explicitly trigger a weather data refresh from Open-Meteo.
 *
 * Accepts optional `lat` and `lon` query parameters; falls back to the
 * default orchard coordinates when they are not provided.
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let lat = parseFloat(url.searchParams.get("lat") ?? "");
    let lon = parseFloat(url.searchParams.get("lon") ?? "");

    if (isNaN(lat) || isNaN(lon)) {
      const orchard = getOrchard();
      if (!orchard) {
        return NextResponse.json(
          { error: "No orchard configured and no coordinates provided" },
          { status: 400 }
        );
      }
      lat = orchard.latitude;
      lon = orchard.longitude;
    }

    const result = await fetchAndStoreWeather(lat, lon);

    return NextResponse.json({
      success: true,
      hourlyCount: result.hourly.length,
      dailyCount: result.daily.length,
    });
  } catch (err) {
    console.error("[weather/current] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to refresh weather data" },
      { status: 500 }
    );
  }
}
