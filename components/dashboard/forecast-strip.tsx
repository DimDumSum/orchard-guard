"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ForecastDay {
  date: string
  high: number
  low: number
  precip: number
  icon: string
  riskLevel: string
}

interface ForecastStripProps {
  days: ForecastDay[]
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

function getRiskMessage(day: ForecastDay): string {
  const level = day.riskLevel.toLowerCase()
  if (level === "high" || level === "extreme" || level === "critical") {
    if (day.precip > 5 && day.high > 10) return "Infection risk \u2014 rain + warmth"
    if (day.low <= -2) return "Frost risk overnight"
    return "Elevated risk \u2014 monitor closely"
  }
  if (level === "moderate" || level === "caution") {
    if (day.precip > 5 && day.high > 10) return "Warm + rain \u2014 monitor for disease"
    if (day.precip > 5) return "Heavy rain \u2014 watch conditions"
    if (day.low <= 0) return "Near-freezing overnight"
    return "Moderate conditions \u2014 stay aware"
  }
  // Low risk
  if (day.precip === 0 && day.high > 10) return "Dry \u2014 good fieldwork day"
  if (day.precip === 0) return "No risks"
  if (day.precip > 0 && day.high < 5) return "Cold rain \u2014 no disease concern"
  return "Low risk"
}

export function ForecastStrip({ days }: ForecastStripProps) {
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

        return (
          <div
            key={day.date}
            className={cn(
              "grid items-center px-7 py-3.5 gap-4 transition-colors cursor-pointer hover:bg-card-hover",
              today && "bg-primary/[0.06] border-l-2 border-l-primary pl-[26px]",
              !today && "border-t border-border/50",
            )}
            style={{ gridTemplateColumns: "130px 90px 55px 1fr" }}
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

            {/* Precip */}
            <span className="font-data text-[12px] text-bark-400">
              {day.precip > 0 ? `${day.precip}mm` : "\u2014"}
            </span>

            {/* Risk */}
            <span
              className={cn(
                "text-[13px] flex items-center gap-2.5",
                isElevated ? "text-risk-moderate" : "text-bark-400",
              )}
            >
              <span className={cn("size-[5px] rounded-full shrink-0", dot)} />
              {getRiskMessage(day)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
