"use client"

import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface RiskCardProps {
  title: string
  riskLevel: string
  riskScore: number
  details: string
  recommendation?: string
  forecastNote?: string
  watchNote?: string
  icon?: React.ReactNode
  href?: string
  stageRelevance?: "active" | "upcoming" | "complete"
}

const riskHex: Record<string, string> = {
  low: "#22C55E",
  none: "#71717A",
  moderate: "#EAB308",
  caution: "#F97316",
  high: "#EF4444",
  severe: "#EF4444",
  extreme: "#DC2626",
  critical: "#DC2626",
}

const isElevated = new Set(["high", "severe", "extreme", "critical"])

const RELEVANCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "var(--badge-green-bg)", text: "var(--badge-green-text)", label: "Active now" },
  upcoming: { bg: "var(--badge-blue-bg, #DBEAFE)", text: "var(--badge-blue-text, #1E40AF)", label: "Upcoming" },
  complete: { bg: "var(--bark-100, #F5F0E8)", text: "var(--bark-400, #A0926B)", label: "Season complete" },
}

export function RiskCard({
  title,
  riskLevel,
  riskScore,
  details,
  recommendation,
  forecastNote,
  watchNote,
  icon,
  href,
  stageRelevance,
}: RiskCardProps) {
  const level = riskLevel.toLowerCase()
  const hex = riskHex[level] ?? riskHex.none
  const elevated = isElevated.has(level)

  const content = (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-6 transition-all duration-200",
        elevated ? "card-shadow-elevated" : "card-shadow",
        href && "cursor-pointer hover:-translate-y-px hover:card-shadow-elevated",
      )}
      style={{ borderLeftWidth: '3px', borderLeftColor: hex }}
    >
      {/* Header: icon + title + badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="text-muted-foreground shrink-0">{icon}</span>
          )}
          <h3 className="text-[15px] font-medium text-bark-900 truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {stageRelevance && (
            <span
              className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[20px]"
              style={{
                backgroundColor: RELEVANCE_STYLES[stageRelevance]?.bg,
                color: RELEVANCE_STYLES[stageRelevance]?.text,
              }}
            >
              {RELEVANCE_STYLES[stageRelevance]?.label}
            </span>
          )}
          <span
            className="text-[11px] uppercase font-bold tracking-wide px-3 py-0.5 rounded-[20px]"
            style={{
              backgroundColor: `${hex}18`,
              color: hex,
            }}
          >
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Summary line */}
      <p className="text-[13px] leading-[1.7] text-bark-400 line-clamp-3 mb-3">
        {details}
      </p>

      {/* Progress bar + score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(riskScore, 100)}%`, backgroundColor: hex }}
          />
        </div>
        <span className="font-data text-xs text-bark-300 shrink-0">
          {riskScore}
        </span>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <p
          className="mt-3 text-[13px] leading-[1.6] font-medium flex items-start gap-1.5"
          style={{ color: elevated ? hex : "var(--grove-600)" }}
        >
          <span className="shrink-0 mt-px">{elevated ? "!" : "\u2713"}</span>
          <span className="line-clamp-2">{recommendation}</span>
        </p>
      )}

      {/* Forecast note */}
      {forecastNote && (
        <p className="mt-2 text-[12px] leading-[1.5] text-bark-400 flex items-start gap-1.5">
          <span className="shrink-0 mt-px font-data">&#8226;</span>
          <span>{forecastNote}</span>
        </p>
      )}

      {/* Watch note */}
      {watchNote && !elevated && (
        <p className="mt-2 text-[12px] leading-[1.5] text-bark-300 flex items-start gap-1.5">
          <span className="shrink-0 mt-px font-data">&#8226;</span>
          <span>{watchNote}</span>
        </p>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        {content}
      </Link>
    )
  }

  return content
}
