"use client"

import React, { useState } from "react"
import { Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ForecastDaySummary, ForecastRiskLevel } from "@/lib/forecast/types"

interface WeekAheadProps {
  days: ForecastDaySummary[]
}

const riskHex: Record<ForecastRiskLevel, string> = {
  low: "#22C55E",
  moderate: "#EAB308",
  high: "#EF4444",
  critical: "#DC2626",
}

export function WeekAhead({ days }: WeekAheadProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  if (days.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-3 flex items-center gap-2">
        <Calendar className="size-5 text-primary" />
        <h2 className="text-section-title text-bark-600">Your Week Ahead</h2>
      </div>

      {/* Timeline */}
      <div className="px-7 pb-5">
        <div className="relative pl-7">
          {/* Vertical line */}
          <div
            className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border"
          />

          {days.map((day) => {
            const isExpanded = expandedDay === day.date
            const hasRisks = day.risks.length > 0 && day.worstRisk !== "low"
            const hex = riskHex[day.worstRisk]

            return (
              <div key={day.date} className="relative py-3.5">
                {/* Dot */}
                <div
                  className="absolute left-[-23px] top-[19px] size-2 rounded-full border-[1.5px] bg-background"
                  style={{ borderColor: hasRisks ? hex : "var(--bark-300)" }}
                />

                {/* Content */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                  className="w-full text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-[15px] font-medium",
                        day.isToday ? "text-primary" : "text-bark-900",
                      )}
                    >
                      {day.dayName}
                    </span>

                    <span className="font-data text-[11px] text-bark-300">
                      {day.highTemp}&deg;/{day.lowTemp}&deg;
                      {day.precipMm > 0 && ` \u00b7 ${day.precipMm}mm`}
                    </span>

                    <span className="text-bark-400 ml-auto shrink-0 group-hover:text-bark-600 transition-colors">
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </span>
                  </div>

                  {/* Risk summary */}
                  {day.risks.length > 0 && !isExpanded && (
                    <p className="text-[13px] text-bark-400 leading-[1.65] mt-1">
                      {day.risks[0].summary.length > 100
                        ? day.risks[0].summary.slice(0, 97) + "..."
                        : day.risks[0].summary}
                    </p>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    {day.risks.map((risk, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border px-4 py-3"
                        style={{ borderLeftWidth: "3px", borderLeftColor: riskHex[risk.riskLevel] }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="size-[5px] rounded-full"
                            style={{ backgroundColor: riskHex[risk.riskLevel] }}
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
                            style={{ color: riskHex[risk.riskLevel] }}
                          >
                            {risk.action}
                          </p>
                        )}
                      </div>
                    ))}

                    {day.risks.length === 0 && (
                      <p className="text-[13px] text-bark-400 py-1">
                        No disease, pest, or abiotic risks expected. Good conditions for fieldwork.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
