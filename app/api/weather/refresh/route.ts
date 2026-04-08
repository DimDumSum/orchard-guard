import { NextRequest, NextResponse } from "next/server"
import { getOrchard } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { fetchAndStoreEnvCanada } from "@/lib/weather/env-canada"

/**
 * GET /api/weather/refresh
 *
 * Fetches weather data from BOTH sources:
 *   1. Environment Canada — real station observations (most accurate for
 *      current conditions)
 *   2. Open-Meteo — model-based forecast + recent reanalysis (provides
 *      7-day forecast that EC doesn't have)
 *
 * Both are stored with their respective source tags. The dashboard uses
 * the most recent hourly record regardless of source.
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

    // Fetch from both sources in parallel — EC for accurate observations,
    // Open-Meteo for forecast data
    const [omResult, ecResult] = await Promise.allSettled([
      fetchAndStoreWeather(orchard.latitude, orchard.longitude),
      fetchAndStoreEnvCanada(orchard.latitude, orchard.longitude),
    ])

    const omData = omResult.status === "fulfilled" ? omResult.value : null
    const ecData = ecResult.status === "fulfilled" ? ecResult.value : null

    const omCount = omData?.hourly.length ?? 0
    const ecCount = ecData?.hourly.length ?? 0

    if (omCount === 0 && ecCount === 0) {
      return NextResponse.json({
        success: false,
        error: "No data from either weather source",
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      sources: {
        openMeteo: { hourlyCount: omCount, dailyCount: omData?.daily.length ?? 0 },
        envCanada: { hourlyCount: ecCount, stationName: ecData?.stationName ?? null },
      },
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
