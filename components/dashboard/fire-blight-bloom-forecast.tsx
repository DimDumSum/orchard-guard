"use client"

import React from "react"
import { Flame, CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FireBlightBloomForecast as FBFData, ForecastRiskLevel } from "@/lib/forecast/types"

interface FireBlightBloomForecastProps {
  data: FBFData
}

const barColors: Record<ForecastRiskLevel, string> = {
  low: "#22C55E",
  moderate: "#EAB308",
  high: "#EF4444",
  critical: "#DC2626",
}

const riskLabels: Record<ForecastRiskLevel, string> = {
  low: "Low",
  moderate: "CAUTION",
  high: "HIGH",
  critical: "EXTREME",
}

export function FireBlightBloomForecast({ data }: FireBlightBloomForecastProps) {
  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-3 flex items-center gap-2">
        <Flame className="size-5 text-orange-500" />
        <h2 className="text-section-title text-bark-600">Fire Blight Bloom Forecast</h2>
      </div>

      <div className="px-7 pb-5 space-y-4">
        {/* Daily bars */}
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-bark-400 mb-2">
            Bacterial growth potential (next 7 days)
          </p>
          <div className="space-y-1.5">
            {data.days.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-[12px] font-data text-bark-600 w-[72px] shrink-0 text-right">
                  {day.dayName}
                </span>
                <div className="flex-1 h-3 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(day.barFraction * 100, 2)}%`,
                      backgroundColor: barColors[day.riskLevel],
                    }}
                  />
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-wide w-[70px] shrink-0"
                  style={{ color: barColors[day.riskLevel] }}
                >
                  {riskLabels[day.riskLevel]}
                </span>
                <span className="text-[11px] font-data text-bark-300 w-[50px] shrink-0 text-right">
                  {day.projectedDH} DH
                </span>
                <span className="text-[11px] text-bark-400 hidden sm:block w-[100px] shrink-0">
                  — {day.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical window callout */}
        {data.criticalWindow && (
          <div className="flex items-start gap-2 rounded-lg px-4 py-3"
            style={{ backgroundColor: 'var(--badge-red-bg)', border: '1px solid var(--badge-red-bg)' }}
          >
            <AlertTriangle className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--badge-red-text)' }} />
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--badge-red-text)' }}>
                {data.criticalWindow}
              </p>
              {data.recommendedAction && (
                <p className="text-[13px] text-bark-400 leading-[1.5] mt-0.5">
                  {data.recommendedAction}
                </p>
              )}
            </div>
          </div>
        )}

        {/* MaryBlyt conditions */}
        {data.maryBlytProjection && (
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-bark-400 mb-2">
              MaryBlyt infection conditions
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <ConditionRow met={data.maryBlytProjection.blossomOpen} label="Blossoms open" />
              <ConditionRow met={data.maryBlytProjection.dhMet} label="Cumulative DH \u2265198" />
              <ConditionRow
                met={data.maryBlytProjection.wettingLikely}
                label="Wetting event"
                qualifier={data.maryBlytProjection.wettingLikely ? undefined : "Rain likely in forecast"}
              />
              <ConditionRow met={data.maryBlytProjection.tempMet} label="Mean temp \u226515.6\u00b0C" />
            </div>
            <p className="text-[12px] text-bark-400 mt-1.5">
              {data.maryBlytProjection.conditionsMet} of 4 conditions{" "}
              {data.maryBlytProjection.conditionsMet >= 4
                ? "met"
                : data.maryBlytProjection.conditionsMet >= 3
                  ? "confirmed, 4th likely"
                  : "met"}{" "}
              {data.maryBlytProjection.conditionsMet >= 3 ? "= HIGH INFECTION RISK" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ConditionRow({
  met,
  label,
  qualifier,
}: {
  met: boolean
  label: string
  qualifier?: string
}) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
      ) : (
        <Circle className="size-3.5 text-bark-300 shrink-0" />
      )}
      <span className={cn("text-[12px]", met ? "text-bark-600" : "text-bark-400")}>
        {label}
        {qualifier && <span className="text-bark-300 ml-1">({qualifier})</span>}
      </span>
    </div>
  )
}
