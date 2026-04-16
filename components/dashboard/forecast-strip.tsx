"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ForecastDaySummary, ForecastRiskLevel } from "@/lib/forecast/types"

interface TodayObserved {
  precipMm: number
  humidity: number | null
  currentPrecipRate: number
  updatedAt: string | null
}

interface ForecastStripProps {
  days: Array<{
    date: string
    high: number
    low: number
    precip: number
    icon: string
    riskLevel: string
  }>
  detailedDays: ForecastDaySummary[]
  bloomStage: string
  todayObserved?: TodayObserved
}

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

const BLOOM_LABELS: Record<string, string> = {
  dormant: "dormant",
  "silver-tip": "silver tip",
  "green-tip": "green tip",
  "tight-cluster": "tight cluster",
  pink: "pink",
  bloom: "bloom",
  "petal-fall": "petal fall",
  "fruit-set": "fruit set",
}

const dotColor: Record<string, string> = {
  low: "bg-bark-300",
  none: "bg-bark-300",
  caution: "bg-risk-moderate",
  moderate: "bg-risk-moderate shadow-[0_0_8px_rgba(234,179,8,0.3)]",
  high: "bg-risk-high shadow-[0_0_8px_rgba(239,68,68,0.3)]",
  extreme: "bg-risk-high shadow-[0_0_8px_rgba(239,68,68,0.3)]",
  critical: "bg-risk-high shadow-[0_0_8px_rgba(239,68,68,0.3)]",
}

const riskHex: Record<string, string> = {
  low: "#22C55E",
  moderate: "#EAB308",
  high: "#EF4444",
  critical: "#DC2626",
}

function formatDayName(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return "Today"
  }
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  ) {
    return "Tomorrow"
  }
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function getRiskMessage(
  day: { high: number; low: number; precip: number; riskLevel: string },
  bloomStage: string,
  observed?: TodayObserved,
): string {
  const level = day.riskLevel.toLowerCase()
  const thresholds = FROST_THRESHOLDS[bloomStage] ?? FROST_THRESHOLDS.dormant
  const stageLabel = BLOOM_LABELS[bloomStage] ?? bloomStage
  const marginToKill = day.low - thresholds.kill10

  // For today's row, use observed conditions to determine wet/dry state
  const effectivePrecip = observed ? observed.precipMm : day.precip
  const isWet = observed
    ? (observed.precipMm > 0.5 || (observed.humidity !== null && observed.humidity > 85) || observed.currentPrecipRate > 0)
    : day.precip > 0.5
  const isRaining = observed ? observed.currentPrecipRate > 0 : false

  if (level === "high" || level === "extreme" || level === "critical") {
    if (effectivePrecip > 5 && day.high > 10) return "Infection risk \u2014 rain + warmth"
    if (isRaining && day.high > 10) return "Infection risk \u2014 active rain + warmth"
    if (day.low <= -2) {
      // Only flag frost as real warning if within 3°C of kill threshold
      if (marginToKill <= 3) {
        return `Frost risk (${day.low}°C) \u2014 kill threshold at ${stageLabel} is ${thresholds.kill10}°C`
      }
      return `Sub-zero (${day.low}°C) \u2014 no concern at ${stageLabel}. Kill threshold is ${thresholds.kill10}°C`
    }
    return "Elevated risk \u2014 monitor closely"
  }
  if (level === "moderate" || level === "caution") {
    if (effectivePrecip > 5 && day.high > 10) return "Warm + rain \u2014 monitor for disease"
    if (isRaining) return "Rain in progress \u2014 monitor conditions"
    if (isWet && day.high > 10) return "Wet conditions \u2014 monitor for disease"
    if (effectivePrecip > 5) return "Heavy rain \u2014 watch conditions"
    if (day.low <= 0) {
      if (marginToKill <= 3) {
        return `Near-freezing (${day.low}°C) \u2014 ${Math.round(marginToKill)}°C above kill threshold`
      }
      return `Near-freezing (${day.low}°C) \u2014 no concern at ${stageLabel}`
    }
    return "Moderate conditions \u2014 stay aware"
  }
  // Low risk
  if (isRaining) return "Rain in progress \u2014 low disease risk"
  if (isWet && day.high > 10) return "Wet \u2014 watch for prolonged leaf wetness"
  if (isWet) return "Wet \u2014 low disease concern at current temps"
  if (effectivePrecip === 0 && day.high > 10) return "Dry \u2014 good fieldwork day"
  if (effectivePrecip === 0) return "No risks"
  if (effectivePrecip > 0 && day.high < 5) return "Cold rain \u2014 no disease concern"
  return "Low risk"
}

export function ForecastStrip({ days, detailedDays, bloomStage, todayObserved }: ForecastStripProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // Build a lookup from date to detailed risks
  const detailMap = new Map<string, ForecastDaySummary>()
  for (const d of detailedDays) {
    detailMap.set(d.date, d)
  }

  return (
    <div className="rounded-xl border border-border bg-card glass-static overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-baseline px-7 pt-5 pb-4">
        <h2 className="text-section-title text-bark-600">7-Day Forecast</h2>
        <span className="font-data text-[11px] text-bark-300">Open-Meteo</span>
      </div>

      {/* Forecast rows */}
      {days.map((day) => {
        const today = isToday(day.date)
        const level = day.riskLevel.toLowerCase()
        const isElevated = level === "moderate" || level === "caution" || level === "high" || level === "extreme" || level === "critical"
        const dot = dotColor[level] ?? dotColor.low
        const isExpanded = expandedDate === day.date
        const detail = detailMap.get(day.date)
        const hasRisks = detail && detail.risks.length > 0 && detail.worstRisk !== "low"

        // For today: use observed precip instead of forecast
        const observed = today ? todayObserved : undefined
        const displayPrecip = observed ? observed.precipMm : day.precip

        return (
          <div key={day.date}>
            <button
              onClick={() => setExpandedDate(isExpanded ? null : day.date)}
              className={cn(
                "w-full grid items-center px-7 py-3.5 gap-4 transition-colors cursor-pointer hover:bg-card-hover text-left",
                today && "bg-primary/[0.06] border-l-2 border-l-primary pl-[26px]",
                !today && "border-t border-border/50",
              )}
              style={{ gridTemplateColumns: "130px 90px 55px 1fr auto" }}
            >
              {/* Day name */}
              <span
                className={cn(
                  "text-[14px]",
                  today ? "text-primary font-semibold" : "text-bark-900",
                )}
              >
                {formatDayName(day.date)}
              </span>

              {/* Temps */}
              <span className="font-data text-[14px] text-bark-900">
                {day.high}&deg; <span className="text-bark-300">{day.low}&deg;</span>
              </span>

              {/* Precip — today shows observed, future shows forecast */}
              <span className="font-data text-[12px] text-bark-400">
                {displayPrecip > 0 ? `${displayPrecip}mm` : "\u2014"}
              </span>

              {/* Risk — today uses observed conditions */}
              <span
                className={cn(
                  "text-[13px] flex items-center gap-2.5",
                  isElevated ? "text-risk-moderate" : "text-bark-400",
                )}
              >
                <span className={cn("size-[5px] rounded-full shrink-0", dot)} />
                {getRiskMessage(day, bloomStage, observed)}
                {today && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium ml-1 shrink-0">
                    <span className="size-[6px] rounded-full bg-primary animate-pulse" />
                    live
                  </span>
                )}
              </span>

              {/* Expand indicator */}
              <span className="text-bark-400 shrink-0">
                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </span>
            </button>

            {/* Expanded risk detail */}
            {isExpanded && detail && (
              <div className="px-7 pb-4 pt-1 border-t border-border/30 bg-card-hover/30">
                {detail.risks.length > 0 && detail.risks.some(r => r.riskLevel !== "low") ? (
                  <div className="space-y-2 mt-1">
                    {detail.risks.map((risk, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border px-4 py-3"
                        style={{ borderLeftWidth: "3px", borderLeftColor: riskHex[risk.riskLevel] ?? "#22C55E" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="size-[5px] rounded-full"
                            style={{ backgroundColor: riskHex[risk.riskLevel] ?? "#22C55E" }}
                          />
                          <span className="text-[13px] font-medium text-bark-900 uppercase tracking-wide">
                            {risk.modelTitle}
                          </span>
                        </div>
                        <p className="text-[13px] leading-[1.65] text-bark-600">
                          {risk.summary}
                        </p>
                        {risk.action && (
                          <p
                            className="mt-1.5 text-[13px] font-medium leading-[1.5]"
                            style={{ color: riskHex[risk.riskLevel] ?? "#22C55E" }}
                          >
                            {risk.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-bark-400 py-2">
                    No disease, pest, or abiotic risks expected. Good conditions for fieldwork.
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
