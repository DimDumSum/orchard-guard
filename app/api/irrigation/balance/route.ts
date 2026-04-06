import { NextResponse } from "next/server"
import {
  getOrchard,
  getIrrigationConfig,
  getWaterBalance,
  getDailyWeather,
} from "@/lib/db"
import { buildDashboardData } from "@/lib/irrigation/water-balance"

export async function GET() {
  const orchard = getOrchard()
  if (!orchard) {
    return NextResponse.json({ error: "No orchard configured" }, { status: 404 })
  }

  const config = getIrrigationConfig(orchard.id)
  if (!config || !config.enabled) {
    return NextResponse.json({
      data: {
        enabled: false,
        status: "optimal",
        availablePct: 100,
        soilWaterMm: 0,
        availableWaterMm: 0,
        todayEtMm: 0,
        rain24hMm: 0,
        daysToIrrigation: -1,
        seasonRainMm: 0,
        seasonIrrigationMm: 0,
        seasonEtMm: 0,
        recommendation: null,
        forecast: [],
      },
    })
  }

  const now = new Date()
  const jan1 = `${now.getFullYear()}-01-01`
  const todayStr = now.toISOString().slice(0, 10)
  const sevenAhead = new Date(now)
  sevenAhead.setDate(sevenAhead.getDate() + 7)
  const endStr = sevenAhead.toISOString().slice(0, 10)

  // Fetch season water balance rows
  const balanceRows = getWaterBalance(orchard.id, jan1, todayStr)

  // Fetch forecast daily data
  const dailyData = getDailyWeather("default", todayStr, endStr)
  const forecastDays = dailyData
    .filter((d) => d.max_temp != null && d.min_temp != null)
    .map((d) => ({
      date: d.date,
      maxTemp: d.max_temp as number,
      minTemp: d.min_temp as number,
      precipMm: d.total_precip ?? 0,
    }))

  // Calculate rain in last 24h
  const rain24h = dailyData.find((d) => d.date === todayStr)?.total_precip ?? 0

  const data = buildDashboardData(
    config,
    balanceRows,
    forecastDays,
    orchard.latitude,
    orchard.bloom_stage,
    rain24h,
  )

  return NextResponse.json({ data })
}
