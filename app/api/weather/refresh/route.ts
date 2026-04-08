import { NextRequest, NextResponse } from "next/server"
import { getOrchard } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { fetchAndStoreEnvCanada } from "@/lib/weather/env-canada"

/**
 * GET /api/weather/refresh
 *
 * Refreshes weather data from Open-Meteo (primary) with Environment Canada
 * as a fallback. Stores results in the database.
 *
 * Designed to be called by:
 *   - The instrumentation.ts hourly cron loop
 *   - Railway cron as a backup
 *   - The manual "Refresh" button on the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const orchard = getOrchard()
    if (!orchard) {
      return NextResponse.json(
        { error: "No orchard configured" },
        { status: 400 },
      )
    }

    // Try Open-Meteo first (primary source)
    const result = await fetchAndStoreWeather(orchard.latitude, orchard.longitude)

    // If Open-Meteo returned no data, fall back to Environment Canada
    if (result.hourly.length === 0) {
      console.log("[weather/refresh] Open-Meteo returned no data — trying Environment Canada fallback")
      const ecResult = await fetchAndStoreEnvCanada(orchard.latitude, orchard.longitude)

      return NextResponse.json({
        success: ecResult.hourly.length > 0,
        source: "env-canada",
        stationName: ecResult.stationName,
        hourlyCount: ecResult.hourly.length,
        dailyCount: 0,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      source: "open-meteo",
      hourlyCount: result.hourly.length,
      dailyCount: result.daily.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[weather/refresh] Error:", err)
    return NextResponse.json(
      { error: "Failed to refresh weather data" },
      { status: 500 },
    )
  }
}
