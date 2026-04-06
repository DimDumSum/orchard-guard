"use client"

import React from "react"
import { Tractor, Star, ThumbsUp, XCircle } from "lucide-react"
import type { SprayDay } from "@/lib/forecast/types"

interface SprayDaysProps {
  days: SprayDay[]
}

const ratingIcons: Record<string, React.ReactNode> = {
  best: <Star className="size-4 text-amber-500" />,
  good: <ThumbsUp className="size-4 text-primary" />,
  avoid: <XCircle className="size-4 text-risk-high" />,
}

const ratingLabels: Record<string, string> = {
  best: "BEST",
  good: "GOOD",
  avoid: "AVOID",
}

export function SprayDays({ days }: SprayDaysProps) {
  const bestDays = days.filter((d) => d.rating === "best" || d.rating === "good")
  const avoidDays = days.filter((d) => d.rating === "avoid")

  if (days.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-3 flex items-center gap-2">
        <Tractor className="size-5 text-primary" />
        <h2 className="text-section-title text-bark-600">Best Spray Days This Week</h2>
      </div>

      <div className="px-7 pb-5 space-y-2">
        {/* Good/Best days */}
        {bestDays.map((day) => (
          <div
            key={day.date}
            className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
          >
            <div className="shrink-0 mt-0.5">
              {ratingIcons[day.rating]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[14px] font-medium text-bark-900">{day.dayName}</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: day.rating === "best" ? "var(--badge-yellow-bg)" : "var(--badge-green-bg)",
                    color: day.rating === "best" ? "var(--badge-yellow-text)" : "var(--badge-green-text)",
                  }}
                >
                  {ratingLabels[day.rating]}
                </span>
              </div>
              <p className="text-[13px] text-bark-400 leading-[1.5]">{day.reason}</p>
            </div>
          </div>
        ))}

        {/* Avoid days */}
        {avoidDays.length > 0 && (
          <div className="pt-1">
            <p className="text-[12px] font-medium text-bark-400 uppercase tracking-wide mb-1.5">
              Days to avoid spraying:
            </p>
            <div className="space-y-1.5">
              {avoidDays.map((day) => (
                <div key={day.date} className="flex items-start gap-2 text-[13px] text-bark-400">
                  <XCircle className="size-3.5 text-risk-high/60 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-bark-600">{day.dayName}:</span> {day.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-[11px] text-bark-300 leading-[1.6]">
            Good spray conditions: No rain for 2+ hours after application, wind &lt;15 km/h,
            temp &gt;2&deg;C, humidity &lt;95%.
          </p>
        </div>
      </div>
    </div>
  )
}
