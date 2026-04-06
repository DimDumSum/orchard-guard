// ---------------------------------------------------------------------------
// OrchardGuard Irrigation Management Page
// ---------------------------------------------------------------------------

import { Droplets, TrendingDown, CloudRain, Activity } from "lucide-react"
import {
  getOrchard,
  getIrrigationConfig,
  getWaterBalance,
  getIrrigationLog,
  getDailyWeather,
} from "@/lib/db"
import { buildDashboardData } from "@/lib/irrigation/water-balance"
import { SYSTEM_EFFICIENCY, IRRIGATION_TYPE_LABELS, SOIL_TYPE_LABELS } from "@/lib/irrigation/soil-defaults"
import type { MoistureStatus } from "@/lib/irrigation/types"
import { IrrigationLogForm } from "./irrigation-log-form"

// ---------------------------------------------------------------------------

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const STATUS_HEX: Record<MoistureStatus, string> = {
  saturated: "#3B82F6",
  optimal: "#22C55E",
  watch: "#EAB308",
  irrigate: "#EF4444",
  stress: "#DC2626",
}

const STATUS_LABEL: Record<MoistureStatus, string> = {
  saturated: "SATURATED",
  optimal: "OPTIMAL",
  watch: "WATCH",
  irrigate: "IRRIGATE NOW",
  stress: "WATER STRESS",
}

// ---------------------------------------------------------------------------

export default async function IrrigationPage() {
  const orchard = getOrchard()
  if (!orchard) {
    return (
      <div className="text-center py-24">
        <h1 className="text-page-title mb-2">Irrigation</h1>
        <p className="text-muted-foreground">No orchard configured.</p>
      </div>
    )
  }

  const config = getIrrigationConfig(orchard.id)

  if (!config || !config.enabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: "-0.02em" }}>
            Irrigation Management
          </h1>
          <p className="text-[14px] text-bark-400 mt-1">
            Track soil moisture, forecast water needs, and schedule irrigation.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card card-shadow p-12 text-center">
          <Droplets className="size-10 text-bark-300 mx-auto mb-3" />
          <p className="text-[16px] font-medium text-bark-900 mb-2">
            Irrigation module is not enabled
          </p>
          <p className="text-[13px] text-bark-400 max-w-md mx-auto mb-4">
            Go to Settings and enable the irrigation module. Configure your soil
            type, irrigation system, and water source to start tracking soil moisture.
          </p>
          <a
            href="/settings"
            className="inline-flex text-[13px] font-medium px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open Settings
          </a>
        </div>
      </div>
    )
  }

  // Fetch data
  const now = new Date()
  const jan1 = `${now.getFullYear()}-01-01`
  const todayStr = toDateStr(now)
  const sevenAhead = new Date(now)
  sevenAhead.setDate(sevenAhead.getDate() + 7)
  const endStr = toDateStr(sevenAhead)

  const balanceRows = getWaterBalance(orchard.id, jan1, todayStr)
  const dailyData = getDailyWeather("default", todayStr, endStr)
  const forecastDays = dailyData
    .filter((d) => d.max_temp != null && d.min_temp != null)
    .map((d) => ({
      date: d.date,
      maxTemp: d.max_temp as number,
      minTemp: d.min_temp as number,
      precipMm: d.total_precip ?? 0,
    }))

  const rain24h = dailyData.find((d) => d.date === todayStr)?.total_precip ?? 0
  const data = buildDashboardData(
    config,
    balanceRows,
    forecastDays,
    orchard.latitude,
    orchard.bloom_stage,
    rain24h,
  )

  const recentLog = getIrrigationLog(orchard.id)
  const hex = STATUS_HEX[data.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: "-0.02em" }}>
          Irrigation Management
        </h1>
        <p className="text-[14px] text-bark-400 mt-1">
          Soil moisture tracking, ET forecasting, and irrigation scheduling.
        </p>
      </div>

      {/* Main status + gauge */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Soil moisture gauge */}
        <div className="rounded-xl border border-border bg-card card-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="size-5 text-blue-400" />
              <h2 className="text-[16px] font-semibold text-bark-900">Soil Moisture</h2>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
              style={{ backgroundColor: hex + "18", color: hex }}
            >
              {STATUS_LABEL[data.status]}
            </span>
          </div>

          {/* Big gauge */}
          <div className="flex items-end gap-3 mb-4">
            <span className="font-data text-[48px] font-light leading-none" style={{ color: hex }}>
              {data.availablePct}
            </span>
            <span className="text-[14px] text-bark-400 mb-1.5">% available</span>
          </div>

          {/* Progress bar */}
          <div className="h-4 rounded-full bg-border overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.max(data.availablePct, 2), 100)}%`,
                backgroundColor: hex,
              }}
            />
          </div>

          {/* Thresholds label */}
          <div className="flex justify-between text-[10px] text-bark-300">
            <span>Stress 30%</span>
            <span>Irrigate {Math.round((1 - config.management_allowable_depletion) * 100)}%</span>
            <span>Field capacity 100%</span>
          </div>
        </div>

        {/* Today's water budget */}
        <div className="rounded-xl border border-border bg-card card-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-5 text-primary" />
            <h2 className="text-[16px] font-semibold text-bark-900">Today&apos;s Water Budget</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">ET (crop use)</p>
                <p className="font-data text-[20px] text-bark-600">{data.todayEtMm} <span className="text-[12px] text-bark-300">mm</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Rainfall 24h</p>
                <p className="font-data text-[20px] text-bark-600">{data.rain24hMm} <span className="text-[12px] text-bark-300">mm</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Soil water</p>
                <p className="font-data text-[20px] text-bark-600">{data.soilWaterMm} <span className="text-[12px] text-bark-300">/ {data.availableWaterMm} mm</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Next irrigation</p>
                <p className="font-data text-[20px] text-bark-600">
                  {data.daysToIrrigation < 0
                    ? "N/A"
                    : data.daysToIrrigation === 0
                      ? "Today"
                      : `~${data.daysToIrrigation}d`}
                </p>
              </div>
            </div>

            {/* System info */}
            <div className="border-t border-border pt-3">
              <p className="text-[11px] text-bark-300">
                {SOIL_TYPE_LABELS[config.soil_type]} &middot;{" "}
                {IRRIGATION_TYPE_LABELS[config.irrigation_type]} &middot;{" "}
                {config.irrigation_rate_mm_per_hour} mm/hr &middot;{" "}
                {config.root_depth_cm}cm root zone
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation card */}
      {data.recommendation && data.recommendation.needed && (
        <div
          className="rounded-xl border-l-[3px] p-5 card-shadow bg-card"
          style={{ borderLeftColor: "#3B82F6" }}
        >
          <div className="flex items-start gap-3">
            <Droplets className="size-5 shrink-0 mt-0.5 text-blue-400" />
            <div>
              <p className="text-[14px] font-medium text-bark-900 mb-1">
                Irrigation Recommended
              </p>
              <p className="text-[13px] text-bark-400 leading-[1.65] mb-2">
                {data.recommendation.message}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bark-400">Apply</p>
                  <p className="font-data text-[14px] text-bark-600">{data.recommendation.grossAmountMm} mm</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bark-400">Run time</p>
                  <p className="font-data text-[14px] text-bark-600">~{data.recommendation.runTimeHours} hrs</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bark-400">Volume</p>
                  <p className="font-data text-[14px] text-bark-600">{data.recommendation.volumeM3PerHa} m&sup3;/ha</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bark-400">Est. cost</p>
                  <p className="font-data text-[14px] text-bark-600">${data.recommendation.costPerHa}/ha</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      {data.forecast.length > 0 && (
        <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
          <div className="px-7 pt-5 pb-3 flex items-center gap-2">
            <TrendingDown className="size-5 text-primary" />
            <h2 className="text-section-title text-bark-600">7-Day Water Balance Forecast</h2>
          </div>
          <div className="px-7 pb-5">
            <div className="space-y-1.5">
              {/* Header */}
              <div
                className="grid text-[10px] uppercase tracking-wider text-bark-400 pb-1 border-b border-border"
                style={{ gridTemplateColumns: "80px 60px 60px 60px 1fr 70px" }}
              >
                <span>Day</span>
                <span className="text-right">Rain</span>
                <span className="text-right">ET</span>
                <span className="text-right">Soil</span>
                <span className="pl-3">Status</span>
                <span className="text-right">Available</span>
              </div>

              {data.forecast.map((day, i) => {
                const dayHex = STATUS_HEX[day.status]
                const barW = Math.min(Math.max(100 - day.depletionPct, 2), 100)
                const isToday = i === 0

                return (
                  <div
                    key={day.date}
                    className="grid items-center py-1.5"
                    style={{
                      gridTemplateColumns: "80px 60px 60px 60px 1fr 70px",
                      ...(isToday ? { borderLeft: `2px solid ${dayHex}`, paddingLeft: 6, marginLeft: -8 } : {}),
                    }}
                  >
                    <span className={`text-[13px] ${isToday ? "font-medium text-primary" : "text-bark-600"}`}>
                      {isToday ? "Today" : day.dayName}
                    </span>
                    <span className="font-data text-[12px] text-bark-400 text-right">
                      {day.rainMm > 0 ? `${day.rainMm}mm` : "—"}
                    </span>
                    <span className="font-data text-[12px] text-bark-400 text-right">
                      {day.etMm}mm
                    </span>
                    <span className="font-data text-[12px] text-bark-600 text-right">
                      {day.soilWaterMm}mm
                    </span>
                    <div className="pl-3 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden max-w-[120px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${barW}%`, backgroundColor: dayHex }}
                        />
                      </div>
                    </div>
                    <span
                      className="font-data text-[11px] font-medium text-right"
                      style={{ color: dayHex }}
                    >
                      {100 - day.depletionPct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Season water budget */}
      <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
        <div className="px-7 pt-5 pb-3 flex items-center gap-2">
          <CloudRain className="size-5 text-primary" />
          <h2 className="text-section-title text-bark-600">Season Water Budget</h2>
        </div>
        <div className="px-7 pb-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Rainfall</p>
              <p className="font-data text-[20px] text-bark-600">{data.seasonRainMm} <span className="text-[12px] text-bark-300">mm</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Irrigated</p>
              <p className="font-data text-[20px] text-bark-600">{data.seasonIrrigationMm} <span className="text-[12px] text-bark-300">mm</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400 mb-1">Crop ET</p>
              <p className="font-data text-[20px] text-bark-600">{data.seasonEtMm} <span className="text-[12px] text-bark-300">mm</span></p>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-3">
            <p className="text-[12px] text-bark-400">
              Balance:{" "}
              <span className="font-data font-medium text-bark-600">
                {data.seasonRainMm + data.seasonIrrigationMm - data.seasonEtMm > 0 ? "+" : ""}
                {Math.round((data.seasonRainMm + data.seasonIrrigationMm - data.seasonEtMm) * 10) / 10} mm
              </span>
              {" "}{data.seasonRainMm + data.seasonIrrigationMm >= data.seasonEtMm
                ? "(supply meets demand)"
                : "(deficit — trees may be moisture-stressed)"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick log + History */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Log form */}
        <IrrigationLogForm
          irrigationType={config.irrigation_type}
          rateMmPerHour={config.irrigation_rate_mm_per_hour}
          blockAreaHa={config.block_area_ha}
          waterCostPerM3={config.water_cost_per_m3}
        />

        {/* Recent history */}
        <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
          <div className="px-7 pt-5 pb-3">
            <h2 className="text-section-title text-bark-600">Recent Irrigation</h2>
          </div>
          <div className="px-7 pb-5">
            {recentLog.length === 0 ? (
              <p className="text-[13px] text-bark-400 py-4">No irrigation logged yet.</p>
            ) : (
              <div className="space-y-2">
                {recentLog.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-bark-900">
                        {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-bark-400">
                        {entry.duration_hours}h &middot; {entry.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-data text-[14px] text-bark-600">{entry.amount_mm} mm</p>
                      <p className="text-[11px] text-bark-300">${entry.cost?.toFixed(2) ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
