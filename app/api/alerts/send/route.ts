// ---------------------------------------------------------------------------
// Alert Send API — Evaluate current model results and send any pending alerts.
//
// Call this endpoint on a schedule (e.g. every 30 minutes via cron, or from
// the dashboard refresh). It evaluates all models, checks for alert
// conditions, and sends via email/SMS based on user preferences.
// ---------------------------------------------------------------------------

import { getOrchard, getWeatherRange, getDailyWeather, getAlertPrefs, getSprayProducts, getDb } from "@/lib/db"
import type { SprayLogRow } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { runAllModels } from "@/lib/models"
import { generateWeekAhead } from "@/lib/forecast"
import { evaluateAlerts, sendAlerts } from "@/lib/alerts"
import type { AlertPreferences } from "@/lib/alerts/types"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const orchardId = body.orchardId ?? 1

    const orchard = getOrchard(orchardId)
    if (!orchard) {
      return Response.json({ error: "Orchard not found" }, { status: 404 })
    }

    // Load alert preferences
    const prefsRow = getAlertPrefs(orchardId)
    if (!prefsRow || (!prefsRow.email && !prefsRow.phone)) {
      return Response.json({
        success: true,
        message: "No alert recipients configured. Set up email or phone in alert preferences.",
        alertsSent: 0,
      })
    }

    const prefs: AlertPreferences = {
      orchardId,
      email: prefsRow.email,
      phone: prefsRow.phone,
      urgentEnabled: prefsRow.urgent_enabled === 1,
      warningEnabled: prefsRow.warning_enabled === 1,
      preparationEnabled: prefsRow.preparation_enabled === 1,
      quietStart: prefsRow.quiet_start,
      quietEnd: prefsRow.quiet_end,
      channel: prefsRow.channel,
    }

    // Refresh weather
    try {
      await fetchAndStoreWeather(orchard.latitude, orchard.longitude)
    } catch {
      // Continue with existing data
    }

    // Fetch data
    const now = new Date()
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAhead = new Date(now)
    sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)

    const hourlyData = getWeatherRange("default", toDateStr(sevenDaysAgo), toDateStr(sevenDaysAhead))
    const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, toDateStr(sevenDaysAhead))

    if (hourlyData.length === 0) {
      return Response.json({ success: true, message: "No weather data available", alertsSent: 0 })
    }

    const hourlyForModels = hourlyData
      .filter((h) => h.temp_c != null && h.humidity_pct != null && h.precip_mm != null)
      .map((h) => ({
        timestamp: h.timestamp,
        temp_c: h.temp_c as number,
        humidity_pct: h.humidity_pct as number,
        precip_mm: h.precip_mm as number,
        wind_kph: h.wind_kph as number,
        dew_point_c: h.dew_point_c as number,
      }))

    const pastHourly = hourlyForModels.filter((h) => new Date(h.timestamp).getTime() <= now.getTime())
    const forecastHourly = hourlyForModels.filter((h) => new Date(h.timestamp).getTime() > now.getTime())
    const dailyForModels = dailyData
      .filter((d) => d.max_temp != null && d.min_temp != null)
      .map((d) => ({ date: d.date, max_temp: d.max_temp as number, min_temp: d.min_temp as number }))

    const orchardConfig = {
      bloom_stage: orchard.bloom_stage,
      fire_blight_history: orchard.fire_blight_history,
      petal_fall_date: orchard.petal_fall_date,
      codling_moth_biofix_date: orchard.codling_moth_biofix_date,
    }

    // Run models
    const results = runAllModels(pastHourly, dailyForModels, forecastHourly, orchardConfig)

    // Get spray data for forecast engine
    const products = getSprayProducts()
    let sprayLog: SprayLogRow[] = []
    try {
      const db = getDb()
      sprayLog = db.prepare("SELECT * FROM spray_log WHERE orchard_id = ? ORDER BY date DESC").all(orchardId) as SprayLogRow[]
    } catch { /* ok */ }

    const forecastDaily = dailyData.filter((d) => d.date >= toDateStr(now)).slice(0, 7)
    const weekAhead = generateWeekAhead(
      forecastDaily, forecastHourly,
      results as unknown as Record<string, any>,
      orchardConfig, products, sprayLog,
    )

    // Evaluate and send
    const evaluation = evaluateAlerts(results, weekAhead, orchard.bloom_stage)
    const sendResults = await sendAlerts(evaluation, prefs, orchard.name)

    const totalAlerts = evaluation.urgent.length + evaluation.warning.length + evaluation.preparation.length
    const sentOk = sendResults.filter((r) => r.success).length

    return Response.json({
      success: true,
      alertsEvaluated: totalAlerts,
      urgent: evaluation.urgent.length,
      warning: evaluation.warning.length,
      preparation: evaluation.preparation.length,
      sendResults,
      sentOk,
    })
  } catch (err) {
    console.error("[alerts/send] Error:", err)
    return Response.json(
      { error: err instanceof Error ? err.message : "Alert evaluation failed" },
      { status: 500 },
    )
  }
}
