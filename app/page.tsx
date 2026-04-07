// ---------------------------------------------------------------------------
// OrchardGuard Dashboard — Smart Advisor Mode
//
// Reorganized around what matters TODAY: action-required items surface first,
// preparation items next, then a forward-looking forecast, and finally a
// collapsed summary of all 55 models so nothing is lost.
// ---------------------------------------------------------------------------

import { AlertTriangle, Clock, ShieldOff, ShieldAlert, ChevronRight, RefreshCw } from "lucide-react"
import { getOrchard, getWeatherRange, getDailyWeather, getSprayProducts, getDb, getIrrigationConfig, getWaterBalance } from "@/lib/db"
import type { SprayLogRow } from "@/lib/db"
import { fetchAndStoreWeather } from "@/lib/weather/open-meteo"
import { runAllModels } from "@/lib/models"
import {
  getCurrentSeason,
  extractModelCards,
  getSeasonalCards,
} from "@/lib/seasonal-filter"
import { generateWeekAhead } from "@/lib/forecast"
import { enrichCardsWithForecast } from "@/lib/forecast/enrich-cards"

import { WeatherSummary } from "@/components/dashboard/weather-summary"
import { BloomStageCard } from "@/components/dashboard/bloom-stage-card"
import { ForecastStrip } from "@/components/dashboard/forecast-strip"
import { ActionCardComponent } from "@/components/dashboard/action-card"
import { SprayDays } from "@/components/dashboard/spray-days"
import { FireBlightBloomForecast } from "@/components/dashboard/fire-blight-bloom-forecast"
import { SprayCoverage } from "@/components/dashboard/spray-coverage"
import { HealthScoreCard } from "@/components/dashboard/health-score-card"
import { SoilMoistureCard } from "@/components/dashboard/soil-moisture-card"
import { buildDashboardData } from "@/lib/irrigation/water-balance"
import { updateDailyWaterBalance } from "@/lib/irrigation/update-balance"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function r1(n: number): number {
  return Math.round(n * 10) / 10
}

function pickWeatherIcon(precip: number): string {
  if (precip > 5) return "rainy"
  if (precip > 0.5) return "cloudy"
  return "sunny"
}

function worstRiskLevel(levels: string[]): string {
  const order = ["low", "none", "caution", "moderate", "high", "extreme", "critical"]
  let worst = 0
  for (const level of levels) {
    const idx = order.indexOf(level.toLowerCase())
    if (idx > worst) worst = idx
  }
  return order[worst]
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const BLOOM_LABELS: Record<string, string> = {
  dormant: "Dormant",
  "silver-tip": "Silver Tip",
  "green-tip": "Green Tip",
  "tight-cluster": "Tight Cluster",
  pink: "Pink",
  bloom: "Bloom",
  "petal-fall": "Petal Fall",
  "fruit-set": "Fruit Set",
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const orchard = getOrchard()

  if (!orchard) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-page-title mb-2">Welcome to OrchardGuard</h1>
        <p className="text-muted-foreground max-w-md">
          No orchard configured yet. Go to Settings to set up your orchard
          location and start monitoring.
        </p>
      </div>
    )
  }

  // Refresh weather
  let weatherFetchError = false
  try {
    await fetchAndStoreWeather(orchard.latitude, orchard.longitude)
  } catch (err) {
    console.error("[dashboard] Weather fetch failed:", err)
    weatherFetchError = true
  }

  // Prepare date ranges
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAhead = new Date(now)
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)
  const jan1 = `${now.getFullYear()}-01-01`

  // Fetch data
  const hourlyData = getWeatherRange("default", toDateStr(sevenDaysAgo), toDateStr(sevenDaysAhead))
  const dailyData = getDailyWeather("default", jan1, toDateStr(sevenDaysAhead))

  if (hourlyData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-page-title text-bark-900">{orchard.name}</h1>
          <p className="text-[14px] text-bark-400">{formatDate()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card card-shadow p-12 text-center">
          <RefreshCw className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium mb-1 text-bark-900">Loading weather data...</p>
          <p className="text-sm text-bark-400 max-w-md mx-auto">
            {weatherFetchError
              ? "Could not reach the weather service. Check your connection and refresh."
              : "Weather data is being fetched. Refresh the page in a moment."}
          </p>
        </div>
      </div>
    )
  }

  // Prepare model input
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

  const pastHourly = hourlyForModels.filter(
    (h) => new Date(h.timestamp).getTime() <= now.getTime(),
  )
  const forecastHourly = hourlyForModels.filter(
    (h) => new Date(h.timestamp).getTime() > now.getTime(),
  )
  const dailyForModels = dailyData
    .filter((d) => d.max_temp != null && d.min_temp != null)
    .map((d) => ({
      date: d.date,
      max_temp: d.max_temp as number,
      min_temp: d.min_temp as number,
    }))

  // Run all 55 models
  const orchardConfig = {
    bloom_stage: orchard.bloom_stage,
    fire_blight_history: orchard.fire_blight_history,
    petal_fall_date: orchard.petal_fall_date,
    codling_moth_biofix_date: orchard.codling_moth_biofix_date,
  }
  const results = runAllModels(pastHourly, dailyForModels, forecastHourly, orchardConfig)

  // Extract + compute
  const allCards = extractModelCards(results)
  const highRiskSet = new Set(["high", "extreme", "critical", "severe"])
  const highRiskCount = allCards.filter((c) => highRiskSet.has(c.riskLevel.toLowerCase())).length

  // Seasonal filter
  const season = getCurrentSeason(orchard.bloom_stage)

  // --- Forecast engine ---
  const todayStr = toDateStr(now)
  const forecastDaily = dailyData.filter((d) => d.date >= todayStr).slice(0, 7)
  const products = getSprayProducts()

  // Get spray log for coverage tracking
  let sprayLog: SprayLogRow[] = []
  try {
    const db = getDb()
    sprayLog = db.prepare("SELECT * FROM spray_log WHERE orchard_id = ? ORDER BY date DESC").all(orchard.id) as SprayLogRow[]
  } catch {
    // Spray log unavailable
  }

  const weekAhead = generateWeekAhead(
    forecastDaily,
    forecastHourly,
    results as unknown as Record<string, any>,
    orchardConfig,
    products,
    sprayLog,
  )

  // Enrich cards with forecast context
  const enrichedCards = enrichCardsWithForecast(allCards, weekAhead.days, forecastDaily, orchard.bloom_stage)
  const { primary, secondary } = getSeasonalCards(enrichedCards, season)

  // Current weather for header
  const latestHourly = pastHourly.length > 0 ? pastHourly[pastHourly.length - 1] : null
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const precipLast24h = pastHourly
    .filter((h) => new Date(h.timestamp).getTime() >= twentyFourHoursAgo.getTime())
    .reduce((sum, h) => sum + (h.precip_mm ?? 0), 0)

  // Frost thresholds for current bloom stage
  const FROST_THRESHOLDS: Record<string, { kill10: number; kill90: number }> = {
    dormant: { kill10: -17, kill90: -25 },
    "silver-tip": { kill10: -12, kill90: -17 },
    "green-tip": { kill10: -8, kill90: -12 },
    "tight-cluster": { kill10: -5, kill90: -8 },
    pink: { kill10: -3, kill90: -5 },
    bloom: { kill10: -2, kill90: -3 },
    "petal-fall": { kill10: -1, kill90: -2 },
    "fruit-set": { kill10: -1, kill90: -2 },
  }
  const frostTh = FROST_THRESHOLDS[orchard.bloom_stage] ?? FROST_THRESHOLDS.dormant

  // Forecast strip
  const forecastStripDays: Array<{
    date: string; high: number; low: number; precip: number; icon: string; riskLevel: string
  }> = []
  for (const day of dailyData.filter((d) => d.date >= todayStr).slice(0, 7)) {
    const high = day.max_temp != null ? r1(day.max_temp) : 0
    const low = day.min_temp != null ? r1(day.min_temp) : 0
    const precip = day.total_precip != null ? r1(day.total_precip) : 0
    const dayRisks: string[] = []
    // Only flag frost as a real risk when within 3°C of kill threshold for current stage
    if (day.min_temp != null && day.min_temp <= frostTh.kill10 + 3) {
      if (day.min_temp <= frostTh.kill10) dayRisks.push("high")
      else dayRisks.push("moderate")
    }
    if (precip > 5 && high > 10) dayRisks.push("moderate")
    if (dayRisks.length === 0) dayRisks.push("low")
    forecastStripDays.push({
      date: day.date, high, low, precip, icon: pickWeatherIcon(precip),
      riskLevel: worstRiskLevel(dayRisks),
    })
  }

  // ── Categorize action cards for smart advisor sections ──
  const actionRequired = weekAhead.actionCards.filter((c) => c.type === "active-infection")
  const prepareThisWeek = weekAhead.actionCards.filter(
    (c) => c.type === "pre-infection" || c.type === "preparation",
  )

  // Split spray coverage
  const unprotectedCoverage = weekAhead.sprayCoverage.filter((c) => c.status === "unprotected")
  const expiringCoverage = weekAhead.sprayCoverage.filter((c) => c.status === "expiring")
  const protectedCoverage = weekAhead.sprayCoverage.filter((c) => c.status === "protected")
  const inactiveCoverage = weekAhead.sprayCoverage.filter((c) => c.status === "inactive")

  const hasSprayNeed = actionRequired.length > 0 || prepareThisWeek.length > 0 ||
    unprotectedCoverage.length > 0 || expiringCoverage.length > 0

  const hasActionRequired = actionRequired.length > 0 || unprotectedCoverage.length > 0 || highRiskCount > 0
  const hasPrepare = prepareThisWeek.length > 0 || expiringCoverage.length > 0 ||
    (hasSprayNeed && weekAhead.sprayDays.length > 0) || weekAhead.fireBlightBloom != null

  // Model counts
  const totalModels = allCards.length
  const inactiveModels = secondary.length
  const activeModels = primary.length
  const lowRiskActive = primary.filter((c) => !highRiskSet.has(c.riskLevel.toLowerCase())).length

  // Health score breakdown
  const activeInfections = actionRequired.length
  const overdueSprayCount = unprotectedCoverage.length
  const elevatedPestRisks = enrichedCards.filter((c) => {
    const level = c.riskLevel.toLowerCase()
    return (level === "moderate" || level === "high") &&
      (c.title?.toLowerCase().includes("moth") || c.title?.toLowerCase().includes("mite") || c.title?.toLowerCase().includes("pest") || c.title?.toLowerCase().includes("aphid"))
  }).length
  const healthScore = Math.max(0, Math.min(100,
    100 - highRiskCount * 8 - activeInfections * 5 - overdueSprayCount * 3 - elevatedPestRisks * 4
  ))

  // Irrigation data — update daily balance
  try {
    updateDailyWaterBalance(orchard.id)
  } catch {
    // Irrigation balance update failed — non-critical
  }
  const irrigConfig = getIrrigationConfig(orchard.id)
  let irrigData: ReturnType<typeof buildDashboardData> | null = null
  if (irrigConfig && irrigConfig.enabled) {
    const irrigBalance = getWaterBalance(orchard.id, jan1, toDateStr(now))
    const irrigForecast = dailyData
      .filter((d) => d.date >= todayStr && d.max_temp != null && d.min_temp != null)
      .slice(0, 7)
      .map((d) => ({
        date: d.date,
        maxTemp: d.max_temp as number,
        minTemp: d.min_temp as number,
        precipMm: d.total_precip ?? 0,
      }))
    irrigData = buildDashboardData(
      irrigConfig,
      irrigBalance,
      irrigForecast,
      orchard.latitude,
      orchard.bloom_stage,
      precipLast24h,
    )
  }

  // Status message
  const statusMessage = hasActionRequired
    ? `${actionRequired.length + unprotectedCoverage.length} issue${actionRequired.length + unprotectedCoverage.length !== 1 ? "s" : ""} need attention`
    : "All clear today"
  const statusDetail = hasActionRequired
    ? "Active infections or critical risks detected. Review the action items below."
    : "No active infections or critical risks. Too cold for most disease and pest activity."

  // ── Render ──
  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      <div className="py-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[26px] font-semibold text-bark-900" style={{ letterSpacing: '-0.3px' }}>
              {orchard.name}
            </h1>
            <p className="text-[14px] text-bark-400">{formatDate()}</p>
          </div>
          <HealthScoreCard
            score={healthScore}
            highRiskCount={highRiskCount}
            totalModels={totalModels}
            activeInfections={activeInfections}
            overdueSprayCount={overdueSprayCount}
            elevatedPestRisks={elevatedPestRisks}
          />
        </div>
      </div>

      {/* ── TOP ROW: Weather + Status ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <WeatherSummary
          temp={latestHourly ? r1(latestHourly.temp_c) : null}
          humidity={latestHourly ? Math.round(latestHourly.humidity_pct) : null}
          precip={r1(precipLast24h)}
          wind={latestHourly ? r1(latestHourly.wind_kph) : null}
          dewPoint={latestHourly ? r1(latestHourly.dew_point_c) : null}
          updatedAt={latestHourly?.timestamp ?? null}
          latitude={orchard.latitude}
          longitude={orchard.longitude}
        />

        {/* Status card */}
        <div className="rounded-xl border border-border bg-card card-shadow p-6 flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-4">
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0 text-[18px] mt-0.5"
              style={{
                backgroundColor: hasActionRequired ? 'var(--badge-red-bg)' : 'var(--badge-green-bg)',
                border: `1px solid ${hasActionRequired ? 'var(--badge-red-bg)' : 'var(--badge-green-bg)'}`,
                color: hasActionRequired ? 'var(--badge-red-text)' : 'var(--badge-green-text)',
              }}
            >
              {hasActionRequired ? "!" : "\u2713"}
            </div>
            <div>
              <p className="text-[16px] font-medium text-bark-900 mb-1">{statusMessage}</p>
              <p className="text-[13px] text-bark-400 leading-[1.6]">{statusDetail}</p>
            </div>
          </div>
          <div className="flex gap-2.5 mt-auto">
            <a
              href="/settings"
              className="text-[12px] font-medium px-4 py-2.5 rounded-lg border border-border bg-card text-bark-600 hover:text-bark-900 hover:border-[var(--glass-border-hover)] transition-all cursor-pointer backdrop-blur-sm"
            >
              Update Stage
            </a>
            <a
              href="/spray-log"
              className="text-[12px] font-medium px-4 py-2.5 rounded-lg border border-border bg-card text-bark-600 hover:text-bark-900 hover:border-[var(--glass-border-hover)] transition-all cursor-pointer backdrop-blur-sm"
            >
              Log Spray
            </a>
            <a
              href="/checklist"
              className="text-[12px] font-medium px-4 py-2.5 rounded-lg border border-border bg-card text-bark-600 hover:text-bark-900 hover:border-[var(--glass-border-hover)] transition-all cursor-pointer backdrop-blur-sm"
            >
              Scout
            </a>
          </div>
        </div>
      </div>

      {/* ── SOIL MOISTURE (if irrigation enabled) ── */}
      {irrigData && irrigData.enabled && (
        <SoilMoistureCard
          enabled={irrigData.enabled}
          status={irrigData.status}
          availablePct={irrigData.availablePct}
          todayEtMm={irrigData.todayEtMm}
          rain24hMm={irrigData.rain24hMm}
          daysToIrrigation={irrigData.daysToIrrigation}
          seasonRainMm={irrigData.seasonRainMm}
          seasonIrrigationMm={irrigData.seasonIrrigationMm}
          seasonEtMm={irrigData.seasonEtMm}
        />
      )}

      {/* ── BLOOM PROGRESS ── */}
      <BloomStageCard
        currentStage={orchard.bloom_stage}
        orchardId={orchard.id}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ACTION REQUIRED                                                  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {hasActionRequired && (
        <section>
          <div className="flex items-center gap-2 mb-4 pt-2">
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--badge-red-bg)', color: 'var(--badge-red-text)', letterSpacing: '1.5px' }}
            >
              <AlertTriangle className="size-3.5" />
              Action Required
            </span>
            <span className="text-[12px] text-bark-300">do today</span>
          </div>

          <div className="space-y-4">
            {actionRequired.map((card, i) => (
              <ActionCardComponent key={`action-${i}`} card={card} />
            ))}

            {unprotectedCoverage.length > 0 && (
              <div className="space-y-2">
                {unprotectedCoverage.map((item) => (
                  <div
                    key={item.target}
                    className="flex items-start gap-3 rounded-xl border-l-[3px] p-4 card-shadow bg-card"
                    style={{ borderLeftColor: '#EF4444' }}
                  >
                    <ShieldOff className="size-5 shrink-0 mt-0.5 text-risk-high" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-medium text-bark-900">{item.target}</p>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--badge-red-bg)', color: 'var(--badge-red-text)' }}
                        >
                          Unprotected
                        </span>
                      </div>
                      <p className="text-[13px] text-bark-400 leading-[1.5]">{item.message}</p>
                      {item.nextAction && (
                        <p className="text-[12px] font-medium mt-1 text-risk-high">{item.nextAction}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {highRiskCount > 0 && actionRequired.length === 0 && (
              <div className="space-y-2">
                {enrichedCards
                  .filter((c) => highRiskSet.has(c.riskLevel.toLowerCase()))
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 4)
                  .map((alert, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border-l-[3px] border-l-risk-high p-4 card-shadow-elevated bg-card"
                    >
                      <AlertTriangle className="size-5 text-risk-high shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-bark-900">{alert.title}</p>
                        <p className="text-[13px] text-bark-400 line-clamp-2">
                          {alert.recommendation ?? alert.details}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Nothing urgent — all clear message */}
      {!hasActionRequired && (
        <div className="rounded-xl border border-border bg-card card-shadow px-6 py-5 text-center">
          <p className="text-[15px] font-medium text-primary">
            Nothing urgent today.
          </p>
          <p className="text-[13px] text-bark-400 mt-1">
            No active infections or critical risks detected.
          </p>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* PREPARE THIS WEEK                                                */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {hasPrepare && (
        <section>
          <div className="flex items-center gap-2 mb-4 pt-2">
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--badge-yellow-bg)', color: 'var(--badge-yellow-text)', letterSpacing: '1.5px' }}
            >
              <Clock className="size-3.5" />
              Prepare This Week
            </span>
          </div>

          <div className="space-y-4">
            {prepareThisWeek.map((card, i) => (
              <ActionCardComponent key={`prep-${i}`} card={card} />
            ))}

            {expiringCoverage.length > 0 && (
              <div className="space-y-2">
                {expiringCoverage.map((item) => (
                  <div
                    key={item.target}
                    className="flex items-start gap-3 rounded-xl border-l-[3px] p-4 card-shadow bg-card"
                    style={{ borderLeftColor: '#EAB308' }}
                  >
                    <ShieldAlert className="size-5 shrink-0 mt-0.5 text-risk-moderate" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-medium text-bark-900">{item.target}</p>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--badge-yellow-bg)', color: 'var(--badge-yellow-text)' }}
                        >
                          Expiring
                        </span>
                      </div>
                      <p className="text-[13px] text-bark-400 leading-[1.5]">{item.message}</p>
                      {item.nextAction && (
                        <p className="text-[12px] font-medium mt-1 text-risk-moderate">{item.nextAction}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {weekAhead.fireBlightBloom && (
              <FireBlightBloomForecast data={weekAhead.fireBlightBloom} />
            )}

            {hasSprayNeed && weekAhead.sprayDays.length > 0 && (
              <SprayDays days={weekAhead.sprayDays} />
            )}
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 7-DAY FORECAST                                                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {forecastStripDays.length > 0 && (
        <ForecastStrip
          days={forecastStripDays}
          detailedDays={weekAhead.days}
          bloomStage={orchard.bloom_stage}
        />
      )}

      {/* Spray coverage (protected/inactive) */}
      {(protectedCoverage.length > 0 || inactiveCoverage.length > 0) && (
        <SprayCoverage coverage={[...protectedCoverage, ...inactiveCoverage]} />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODELS BAR                                                       */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex justify-between items-center py-6">
        <p className="font-data text-[12px] text-bark-300">
          <span className="text-primary">{totalModels}</span> models active
          {inactiveModels > 0 && <> &middot; {inactiveModels} dormant</>}
          {lowRiskActive > 0 && <> &middot; all nominal</>}
        </p>
        <a
          href="/diseases"
          className="text-[12px] text-bark-400 hover:text-bark-900 transition-colors cursor-pointer"
        >
          View all models &rarr;
        </a>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center">
        <p className="text-[10px] text-bark-300 uppercase tracking-[3px]">
          OrchardGuard &middot; v1.0
        </p>
      </div>
    </div>
  )
}
