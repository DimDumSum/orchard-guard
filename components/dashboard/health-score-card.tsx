"use client"

import { useState } from "react"

interface HealthScoreCardProps {
  score: number
  highRiskCount: number
  totalModels: number
  activeInfections: number
  overdueSprayCount: number
  elevatedPestRisks: number
}

function getScoreHex(score: number): string {
  if (score >= 80) return "#22C55E"
  if (score >= 60) return "#F97316"
  if (score >= 40) return "#EF4444"
  return "#DC2626"
}

export function HealthScoreCard({
  score,
  highRiskCount,
  totalModels,
  activeInfections,
  overdueSprayCount,
  elevatedPestRisks,
}: HealthScoreCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference
  const hex = getScoreHex(score)

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="relative size-[100px] cursor-pointer"
        aria-label="Show health score breakdown"
      >
        <svg className="-rotate-90 size-[100px]" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            strokeWidth="4"
            className="stroke-border"
          />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              stroke: hex,
              filter: `drop-shadow(0 0 6px ${hex}50)`,
              transition: "stroke-dashoffset 0.7s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-data text-[32px] font-normal leading-none" style={{ color: hex }}>
            {score}
          </span>
          <span className="text-[9px] uppercase tracking-[1.5px] text-bark-400 mt-1">
            Health
          </span>
        </div>
      </button>

      {/* Tooltip breakdown */}
      {showTooltip && (
        <div className="absolute right-0 top-[108px] z-50 w-[240px] rounded-xl border border-border bg-card card-shadow p-4 text-left">
          <p className="text-[12px] font-medium text-bark-900 mb-2">Score breakdown</p>
          <div className="space-y-1.5 text-[12px] text-bark-600">
            <div className="flex justify-between">
              <span>{activeInfections} active infection{activeInfections !== 1 ? "s" : ""}</span>
              {activeInfections > 0 && <span className="text-risk-high font-medium">-{activeInfections * 5}</span>}
            </div>
            <div className="flex justify-between">
              <span>{highRiskCount} elevated risk{highRiskCount !== 1 ? "s" : ""}</span>
              {highRiskCount > 0 && <span className="text-risk-high font-medium">-{highRiskCount * 8}</span>}
            </div>
            <div className="flex justify-between">
              <span>{overdueSprayCount} overdue spray{overdueSprayCount !== 1 ? "s" : ""}</span>
              {overdueSprayCount > 0 && <span className="text-risk-moderate font-medium">-{overdueSprayCount * 3}</span>}
            </div>
            <div className="flex justify-between">
              <span>{elevatedPestRisks} elevated pest risk{elevatedPestRisks !== 1 ? "s" : ""}</span>
              {elevatedPestRisks > 0 && <span className="text-risk-moderate font-medium">-{elevatedPestRisks * 4}</span>}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-bark-400">
            Starts at 100, drops as risks are detected.
          </div>
        </div>
      )}
    </div>
  )
}
