// ---------------------------------------------------------------------------
// Morning Briefing Email Generator
//
// Generates a branded daily summary email with:
//   - Today's weather and disease conditions
//   - Action items (urgent + warning alerts)
//   - This-week preparation items
//   - 3-day weather forecast summary
//
// Called from the cron API route at the configured briefing hour (default 6 AM).
// ---------------------------------------------------------------------------

import { getOrchard, getWeatherRange, getDailyWeather, getAlertPrefs, getSprayProducts, getDb } from "@/lib/db"
import type { SprayLogRow } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { runAllModels } from "@/lib/models"
import { generateWeekAhead } from "@/lib/forecast"
import { evaluateAlerts } from "@/lib/alerts"
import type { PendingAlert } from "./types"
import type { ForecastDaySummary, WeekAheadData } from "@/lib/forecast/types"
import { calcSeasonDD } from "@/lib/phenology"

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------

const BRAND_GREEN = "#2D6A4F"
const BRAND_DARK = "#1B1B18"
const BRAND_MUTED = "#8B7355"
const BRAND_BG = "#FAFAF7"
const BRAND_BORDER = "#E8E5DE"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function formatDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

function formatBloomStage(stage: string): string {
  return stage
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function weatherIcon(icon: string): string {
  switch (icon) {
    case "sunny": return "\u2600\uFE0F"
    case "cloudy": return "\u2601\uFE0F"
    case "rainy": return "\uD83C\uDF27\uFE0F"
    case "stormy": return "\u26C8\uFE0F"
    default: return "\uD83C\uDF24\uFE0F"
  }
}

function riskColor(level: string): string {
  switch (level) {
    case "critical": return "#D62828"
    case "high": return "#E36414"
    case "moderate": return "#E9A820"
    default: return BRAND_GREEN
  }
}

// ---------------------------------------------------------------------------
// Email HTML builder
// ---------------------------------------------------------------------------

function buildBriefingHtml(opts: {
  date: Date
  orchardName: string
  bloomStage: string
  todayWeather: ForecastDaySummary | null
  urgent: PendingAlert[]
  warning: PendingAlert[]
  preparation: PendingAlert[]
  weekAhead: WeekAheadData
  baseUrl: string
}): string {
  const { date, orchardName, bloomStage, todayWeather, urgent, warning, preparation, weekAhead, baseUrl } = opts

  // ── TODAY summary line ──
  let todayLine = ""
  if (todayWeather) {
    const conditions = todayWeather.precipMm > 1
      ? `rain (${todayWeather.precipMm.toFixed(0)} mm)`
      : todayWeather.avgHumidity > 80
        ? "humid/overcast"
        : "dry"

    const diseaseRisks = todayWeather.risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical")
    const diseaseSummary = diseaseRisks.length > 0
      ? diseaseRisks.map((r) => `${r.modelTitle} ${r.riskLevel}`).join(", ")
      : "No elevated disease risk"

    todayLine = `${todayWeather.highTemp.toFixed(0)}\u00B0C / ${todayWeather.lowTemp.toFixed(0)}\u00B0C, ${conditions}. ${diseaseSummary}.`
  }

  // ── ACTION ITEMS (urgent + warning) ──
  const actionItems = [...urgent, ...warning]
  const actionHtml = actionItems.length > 0
    ? actionItems.map((a) => {
        const emoji = a.level === "urgent" ? "\uD83D\uDEA8" : "\u26A0\uFE0F"
        const color = a.level === "urgent" ? "#D62828" : "#E9A820"
        return `<tr>
          <td style="padding: 6px 8px; vertical-align: top; color: ${color}; font-size: 14px;">${emoji}</td>
          <td style="padding: 6px 0; font-size: 14px; color: ${BRAND_DARK}; line-height: 1.5;">
            <strong>${a.title}</strong><br>
            <span style="color: #5A4A3A;">${a.action ?? a.message}</span>
          </td>
        </tr>`
      }).join("")
    : `<tr><td style="padding: 6px 8px; font-size: 14px; color: ${BRAND_GREEN};">None today \u2705</td></tr>`

  // ── THIS WEEK (preparation items) ──
  const weekItems = preparation.slice(0, 5)
  const weekHtml = weekItems.length > 0
    ? weekItems.map((a) => {
        return `<tr>
          <td style="padding: 4px 8px; vertical-align: top; color: ${BRAND_GREEN}; font-size: 14px;">\uD83D\uDCCB</td>
          <td style="padding: 4px 0; font-size: 14px; color: ${BRAND_DARK}; line-height: 1.5;">
            <strong>${a.title}</strong><br>
            <span style="color: #5A4A3A;">${a.action ?? a.message}</span>
          </td>
        </tr>`
      }).join("")
    : `<tr><td style="padding: 4px 8px; font-size: 14px; color: ${BRAND_GREEN};">All clear for the week ahead.</td></tr>`

  // ── WEATHER AHEAD (next 3 days) ──
  const next3 = weekAhead.days.filter((d) => !d.isToday).slice(0, 3)
  const weatherRows = next3.map((d) => {
    const icon = weatherIcon(d.weatherIcon)
    const worstColor = riskColor(d.worstRisk)
    return `<tr>
      <td style="padding: 4px 8px; font-size: 14px; font-weight: 600; color: ${BRAND_DARK};">${d.dayName}</td>
      <td style="padding: 4px 8px; font-size: 14px; color: ${BRAND_DARK};">${icon} ${d.highTemp.toFixed(0)}\u00B0/${d.lowTemp.toFixed(0)}\u00B0</td>
      <td style="padding: 4px 8px; font-size: 14px; color: ${BRAND_DARK};">${d.precipMm > 0 ? d.precipMm.toFixed(0) + " mm" : "\u2014"}</td>
      <td style="padding: 4px 8px; font-size: 13px; color: ${worstColor}; font-weight: 500;">${d.worstRisk !== "low" ? d.worstRisk : "\u2014"}</td>
    </tr>`
  }).join("")

  // ── Spray windows ──
  const bestSprayDays = weekAhead.sprayDays.filter((d) => d.rating === "best" || d.rating === "good").slice(0, 2)
  const sprayHint = bestSprayDays.length > 0
    ? `Best spray window: ${bestSprayDays.map((d) => `${d.dayName} (${d.rating})`).join(", ")}`
    : "No ideal spray windows this week"

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff;">
<tr><td align="center" style="padding: 20px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

  <!-- HEADER -->
  <tr><td style="padding: 24px 20px; background: ${BRAND_GREEN}; border-radius: 8px 8px 0 0;">
    <p style="margin: 0; font-size: 12px; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-transform: uppercase;">OrchardGuard</p>
    <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">\uD83C\uDF4E ${formatDate(date)}</h1>
    <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">${orchardName} \u00B7 ${formatBloomStage(bloomStage)}</p>
  </td></tr>

  <!-- TODAY -->
  <tr><td style="padding: 20px; background: ${BRAND_BG}; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};">
    <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND_MUTED}; font-weight: 600;">Today</p>
    <p style="margin: 0; font-size: 15px; color: ${BRAND_DARK}; line-height: 1.6;">${todayLine || "Weather data not yet available."}</p>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding: 0 20px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};"><hr style="border: none; border-top: 1px solid ${BRAND_BORDER}; margin: 0;"></td></tr>

  <!-- ACTION ITEMS -->
  <tr><td style="padding: 16px 20px 8px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};">
    <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND_MUTED}; font-weight: 600;">Action Items</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${actionHtml}
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding: 0 20px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};"><hr style="border: none; border-top: 1px solid ${BRAND_BORDER}; margin: 0;"></td></tr>

  <!-- THIS WEEK -->
  <tr><td style="padding: 16px 20px 8px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};">
    <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND_MUTED}; font-weight: 600;">This Week</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${weekHtml}
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding: 0 20px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};"><hr style="border: none; border-top: 1px solid ${BRAND_BORDER}; margin: 0;"></td></tr>

  <!-- WEATHER AHEAD -->
  <tr><td style="padding: 16px 20px; background: #ffffff; border-left: 1px solid ${BRAND_BORDER}; border-right: 1px solid ${BRAND_BORDER};">
    <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND_MUTED}; font-weight: 600;">Weather Ahead</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr style="border-bottom: 1px solid ${BRAND_BORDER};">
        <th style="padding: 4px 8px; text-align: left; font-size: 11px; color: ${BRAND_MUTED}; font-weight: 500;">Day</th>
        <th style="padding: 4px 8px; text-align: left; font-size: 11px; color: ${BRAND_MUTED}; font-weight: 500;">Temp</th>
        <th style="padding: 4px 8px; text-align: left; font-size: 11px; color: ${BRAND_MUTED}; font-weight: 500;">Rain</th>
        <th style="padding: 4px 8px; text-align: left; font-size: 11px; color: ${BRAND_MUTED}; font-weight: 500;">Risk</th>
      </tr>
      ${weatherRows}
    </table>
    <p style="margin: 12px 0 0; font-size: 13px; color: ${BRAND_MUTED};">\uD83D\uDCA8 ${sprayHint}</p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding: 16px 20px; background: ${BRAND_BG}; border: 1px solid ${BRAND_BORDER}; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0; text-align: center;">
      <a href="${baseUrl}" style="display: inline-block; padding: 10px 24px; background: ${BRAND_GREEN}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Open Dashboard</a>
    </p>
    <p style="margin: 12px 0 0; text-align: center; font-size: 12px; color: ${BRAND_MUTED};">
      Sent by OrchardGuard \u00B7
      <a href="${baseUrl}/alerts" style="color: ${BRAND_GREEN}; text-decoration: none;">Manage preferences</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Plain text builder
// ---------------------------------------------------------------------------

function buildBriefingText(opts: {
  date: Date
  orchardName: string
  bloomStage: string
  todayWeather: ForecastDaySummary | null
  urgent: PendingAlert[]
  warning: PendingAlert[]
  preparation: PendingAlert[]
  weekAhead: WeekAheadData
  baseUrl: string
}): string {
  const { date, orchardName, bloomStage, todayWeather, urgent, warning, preparation, weekAhead, baseUrl } = opts
  const lines: string[] = []

  lines.push("\u2501".repeat(30))
  lines.push(`\uD83C\uDF4E OrchardGuard \u2014 ${formatDate(date)}`)
  lines.push(`   ${orchardName} \u00B7 ${formatBloomStage(bloomStage)}`)
  lines.push("\u2501".repeat(30))
  lines.push("")

  // Today
  if (todayWeather) {
    const conditions = todayWeather.precipMm > 1
      ? `rain (${todayWeather.precipMm.toFixed(0)} mm)`
      : todayWeather.avgHumidity > 80 ? "humid/overcast" : "dry"
    const diseaseRisks = todayWeather.risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical")
    const diseaseSummary = diseaseRisks.length > 0
      ? diseaseRisks.map((r) => `${r.modelTitle} ${r.riskLevel}`).join(", ")
      : "No elevated disease risk"
    lines.push(`TODAY: ${todayWeather.highTemp.toFixed(0)}\u00B0C / ${todayWeather.lowTemp.toFixed(0)}\u00B0C, ${conditions}. ${diseaseSummary}.`)
  } else {
    lines.push("TODAY: Weather data not yet available.")
  }
  lines.push("")

  // Action items
  lines.push("ACTION ITEMS:")
  const actionItems = [...urgent, ...warning]
  if (actionItems.length > 0) {
    for (const a of actionItems) {
      const emoji = a.level === "urgent" ? "\uD83D\uDEA8" : "\u26A0\uFE0F"
      lines.push(`\u2022 ${emoji} ${a.title}`)
      if (a.action) lines.push(`  >> ${a.action}`)
    }
  } else {
    lines.push("\u2022 None today \u2705")
  }
  lines.push("")

  // This week
  lines.push("THIS WEEK:")
  if (preparation.length > 0) {
    for (const a of preparation.slice(0, 5)) {
      lines.push(`\u2022 ${a.title}`)
      if (a.action) lines.push(`  >> ${a.action}`)
    }
  } else {
    lines.push("\u2022 All clear for the week ahead.")
  }
  lines.push("")

  // Weather ahead
  lines.push("WEATHER AHEAD:")
  const next3 = weekAhead.days.filter((d) => !d.isToday).slice(0, 3)
  for (const d of next3) {
    const rain = d.precipMm > 0 ? `, ${d.precipMm.toFixed(0)} mm rain` : ""
    const risk = d.worstRisk !== "low" ? ` [${d.worstRisk}]` : ""
    lines.push(`  ${d.dayName}: ${d.highTemp.toFixed(0)}\u00B0/${d.lowTemp.toFixed(0)}\u00B0${rain}${risk}`)
  }
  lines.push("")

  lines.push(`Full dashboard: ${baseUrl}`)
  lines.push("\u2501".repeat(30))

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateMorningBriefing(): Promise<{
  subject: string
  html: string
  text: string
} | null> {
  const orchardId = 1
  const orchard = getOrchard(orchardId)
  if (!orchard) {
    console.log("[morning-briefing] No orchard configured, skipping.")
    return null
  }

  // Refresh weather data
  try {
    await fetchAndStoreWeather(orchard.latitude, orchard.longitude)
  } catch {
    // Continue with existing data
  }

  // Fetch weather data — same pattern as app/api/alerts/send/route.ts
  const now = new Date()
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAhead = new Date(now)
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)

  const hourlyData = getWeatherRange("default", toDateStr(sevenDaysAgo), toDateStr(sevenDaysAhead))
  const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, toDateStr(sevenDaysAhead))

  if (hourlyData.length === 0) {
    console.log("[morning-briefing] No weather data available, skipping.")
    return null
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

  // Run all 55 models
  const results = runAllModels(pastHourly, dailyForModels, forecastHourly, orchardConfig)

  // Get spray data for the forecast engine
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

  // Evaluate alerts
  const ddData = dailyData
    .filter((d: any) => d.max_temp != null && d.min_temp != null)
    .map((d: any) => ({ date: d.date, max_temp: d.max_temp as number, min_temp: d.min_temp as number }))
  const seasonDD = calcSeasonDD(ddData)
  const evaluation = evaluateAlerts(results, weekAhead, orchard.bloom_stage, seasonDD)

  // Build email content
  const todayWeather = weekAhead.days.find((d) => d.isToday) ?? null
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const emailOpts = {
    date: now,
    orchardName: orchard.name,
    bloomStage: orchard.bloom_stage,
    todayWeather,
    urgent: evaluation.urgent,
    warning: evaluation.warning,
    preparation: evaluation.preparation,
    weekAhead,
    baseUrl,
  }

  const html = buildBriefingHtml(emailOpts)
  const text = buildBriefingText(emailOpts)

  // Subject line
  const alertCount = evaluation.urgent.length + evaluation.warning.length
  const subjectDate = `${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`
  const subjectPrefix = evaluation.urgent.length > 0
    ? `\uD83D\uDEA8 `
    : ""
  const subjectSuffix = alertCount > 0
    ? ` \u2014 ${alertCount} alert${alertCount > 1 ? "s" : ""}`
    : ""
  const subject = `${subjectPrefix}\uD83C\uDF4E OrchardGuard Briefing \u2014 ${subjectDate}${subjectSuffix}`

  return { subject, html, text }
}
