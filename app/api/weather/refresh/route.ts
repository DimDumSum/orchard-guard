import { NextRequest, NextResponse } from "next/server"
import { getOrchard } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"

/**
 * GET /api/weather/refresh
 *
 * Refreshes weather data from Open-Meteo and stores it in the database.
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

    const result = await fetchAndStoreWeather(orchard.latitude, orchard.longitude)

    return NextResponse.json({
      success: true,
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
