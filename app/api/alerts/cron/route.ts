// ---------------------------------------------------------------------------
// Cron API Route — Scheduled alert evaluation and morning briefing delivery.
//
// Designed to be called by a cron service (e.g. Vercel Cron, Railway cron,
// or a simple `curl` in crontab) every hour.
//
// Behavior:
//   - Every hour: Evaluate all models and send urgent alerts immediately
//   - At BRIEFING_HOUR (default 6 AM): Also generate and send the morning
//     briefing email digest
//
// Authentication:
//   - If CRON_SECRET is set, requires `Authorization: Bearer <secret>` header
//   - If CRON_SECRET is not set, allows unauthenticated access (local dev)
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import { getOrchard, getAlertPrefs, getWeatherRange, getDailyWeather, getSprayProducts, getDb } from "@/lib/db"
import type { SprayLogRow } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { runAllModels } from "@/lib/models"
import { generateWeekAhead } from "@/lib/forecast"
import { evaluateAlerts, sendAlerts, isEmailConfigured } from "@/lib/alerts"
import type { AlertPreferences } from "@/lib/alerts/types"
import { generateMorningBriefing } from "@/lib/alerts/morning-briefing"
import { calcSeasonDD } from "@/lib/phenology"
import { Resend } from "resend"

// ---------------------------------------------------------------------------
// Auth check
// ---------------------------------------------------------------------------

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // No secret configured — allow (local dev)

  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  const token = authHeader.replace(/^Bearer\s+/i, "")
  return token === secret
}

// ---------------------------------------------------------------------------
// Briefing hour check
// ---------------------------------------------------------------------------

function isBriefingHour(): boolean {
  const briefingHour = parseInt(process.env.BRIEFING_HOUR ?? "6", 10)
  const currentHour = new Date().getHours()
  return currentHour === briefingHour
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // ── Auth ──
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer <CRON_SECRET> header." },
      { status: 401 },
    )
  }

  const startTime = Date.now()
  const results: {
    alerts: { evaluated: number; sent: number; error?: string } | null
    briefing: { sent: boolean; to?: string; error?: string } | null
  } = {
    alerts: null,
    briefing: null,
  }

  try {
    const orchardId = 1
    const orchard = getOrchard(orchardId)
    if (!orchard) {
      return NextResponse.json({
        success: true,
        message: "No orchard configured. Skipping.",
        results,
        durationMs: Date.now() - startTime,
      })
    }

    // ── Load alert preferences ──
    const prefsRow = getAlertPrefs(orchardId)

    // ── Refresh weather data ──
    try {
      await fetchAndStoreWeather(orchard.latitude, orchard.longitude)
    } catch {
      // Continue with existing data
    }

    // ── Fetch data (same pattern as app/api/alerts/send/route.ts) ──
    const now = new Date()
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAhead = new Date(now)
    sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)

    const hourlyData = getWeatherRange("default", toDateStr(sevenDaysAgo), toDateStr(sevenDaysAhead))
    const dailyData = getDailyWeather("default", `${now.getFullYear()}-01-01`, toDateStr(sevenDaysAhead))

    if (hourlyData.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No weather data available.",
        results,
        durationMs: Date.now() - startTime,
      })
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

    // ── Run all models ──
    const modelResults = runAllModels(pastHourly, dailyForModels, forecastHourly, orchardConfig)

    // ── Generate week-ahead forecast ──
    const products = getSprayProducts()
    let sprayLog: SprayLogRow[] = []
    try {
      const db = getDb()
      sprayLog = db.prepare("SELECT * FROM spray_log WHERE orchard_id = ? ORDER BY date DESC").all(orchardId) as SprayLogRow[]
    } catch { /* ok */ }

    const forecastDaily = dailyData.filter((d) => d.date >= toDateStr(now)).slice(0, 7)
    const weekAhead = generateWeekAhead(
      forecastDaily, forecastHourly,
      modelResults as unknown as Record<string, any>,
      orchardConfig, products, sprayLog,
    )

    // ── Evaluate alerts (with phenology stage-relevance filtering) ──
    const ddData = dailyData
      .filter((d: any) => d.max_temp != null && d.min_temp != null)
      .map((d: any) => ({ date: d.date, max_temp: d.max_temp as number, min_temp: d.min_temp as number }))
    const seasonDD = calcSeasonDD(ddData)
    const evaluation = evaluateAlerts(modelResults, weekAhead, orchard.bloom_stage, seasonDD)
    const totalAlerts = evaluation.urgent.length + evaluation.warning.length + evaluation.preparation.length

    // ── Send urgent alerts (every hour) ──
    if (prefsRow && (prefsRow.email || prefsRow.phone)) {
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

      try {
        const sendResults = await sendAlerts(evaluation, prefs, orchard.name)
        const sentOk = sendResults.filter((r) => r.success).length
        results.alerts = { evaluated: totalAlerts, sent: sentOk }
      } catch (err) {
        results.alerts = {
          evaluated: totalAlerts,
          sent: 0,
          error: err instanceof Error ? err.message : "Failed to send alerts",
        }
      }
    } else {
      results.alerts = { evaluated: totalAlerts, sent: 0, error: "No alert recipients configured" }
    }

    // ── Morning briefing (only at briefing hour) ──
    if (isBriefingHour()) {
      const recipientEmail = prefsRow?.email ?? null

      if (!recipientEmail) {
        results.briefing = { sent: false, error: "No email address configured for briefing" }
      } else if (!isEmailConfigured()) {
        results.briefing = { sent: false, error: "Resend API key not configured" }
      } else {
        try {
          const briefing = await generateMorningBriefing()
          if (!briefing) {
            results.briefing = { sent: false, error: "Briefing generation returned null" }
          } else {
            // Send via Resend
            const resend = new Resend(process.env.RESEND_API_KEY)
            const fromAddress = process.env.RESEND_FROM_EMAIL ?? "OrchardGuard <onboarding@resend.dev>"

            const { error } = await resend.emails.send({
              from: fromAddress,
              to: recipientEmail,
              subject: briefing.subject,
              html: briefing.html,
              text: briefing.text,
            })

            if (error) {
              results.briefing = { sent: false, to: recipientEmail, error: error.message }
            } else {
              results.briefing = { sent: true, to: recipientEmail }

              // Log the briefing send
              try {
                const db = getDb()
                db.prepare(
                  `INSERT INTO alert_log (orchard_id, model, risk_level, message, channel)
                   VALUES (?, ?, ?, ?, ?)`,
                ).run(orchardId, "morning-briefing", "info", `Morning briefing sent to ${recipientEmail}`, "email")
              } catch { /* ok */ }
            }
          }
        } catch (err) {
          results.briefing = {
            sent: false,
            error: err instanceof Error ? err.message : "Failed to generate/send briefing",
          }
        }
      }
    } else {
      results.briefing = { sent: false, error: `Not briefing hour (current: ${new Date().getHours()}, configured: ${process.env.BRIEFING_HOUR ?? "6"})` }
    }

    return NextResponse.json({
      success: true,
      orchardName: orchard.name,
      bloomStage: orchard.bloom_stage,
      isBriefingHour: isBriefingHour(),
      results,
      durationMs: Date.now() - startTime,
    })
  } catch (err) {
    console.error("[alerts/cron] Error:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Cron job failed",
        results,
        durationMs: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}
