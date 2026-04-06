"use client"

import { cn } from "@/lib/utils"

interface HealthScoreCardProps {
  score: number
  highRiskCount: number
  totalModels: number
}

function getScoreHex(score: number): string {
  if (score >= 80) return "#22C55E"
  if (score >= 60) return "#F97316"
  if (score >= 40) return "#EF4444"
  return "#DC2626"
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Good"
  if (score >= 60) return "Fair"
  if (score >= 40) return "Caution"
  return "At Risk"
}

export function HealthScoreCard({
  score,
  highRiskCount,
  totalModels,
}: HealthScoreCardProps) {
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference
  const hex = getScoreHex(score)

  return (
    <div className="relative size-[100px]">
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
    </div>
  )
}
