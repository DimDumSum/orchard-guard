"use client"

import React from "react"

interface WeatherSummaryProps {
  temp: number | null
  humidity: number | null
  precip: number | null
  wind: number | null
  dewPoint: number | null
  updatedAt: string | null
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes === 1) return "1 min ago"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return "1 hr ago"
  if (diffHours < 24) return `${diffHours} hrs ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getTempContext(temp: number | null): string {
  if (temp === null) return ""
  if (temp <= 0) return "Cold \u00b7 freezing"
  if (temp <= 5) return "Cold \u00b7 overcast"
  if (temp <= 10) return "Cool \u00b7 no disease risk"
  if (temp <= 15) return "Mild \u00b7 fungal risk with moisture"
  if (temp <= 20) return "Warm \u00b7 disease-favorable"
  if (temp <= 25) return "Warm \u00b7 fire blight active"
  return "Hot \u00b7 heat stress possible"
}

export function WeatherSummary({
  temp,
  humidity,
  precip,
  wind,
  dewPoint,
  updatedAt,
}: WeatherSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      {/* Top row: big temp + description */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-data text-[54px] font-light leading-none text-bark-900">
            {temp !== null ? temp : "--"}
            <span className="text-[22px] text-bark-400">&deg;</span>
          </span>
        </div>
        <div className="text-right">
          <p className="text-[14px] text-bark-600">
            {getTempContext(temp)}
          </p>
          {updatedAt && (
            <p className="text-[11px] text-bark-300">
              {formatTimeAgo(updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <StatItem label="Humidity" value={humidity !== null ? `${humidity}%` : "--"} />
        <StatItem label="Precip 24h" value={precip !== null ? `${precip} mm` : "--"} />
        <StatItem label="Wind" value={wind !== null ? `${wind} km/h` : "--"} />
        <StatItem label="Dew Point" value={dewPoint !== null ? `${dewPoint}\u00b0C` : "--"} />
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-1">
        {label}
      </p>
      <p className="font-data text-[16px] text-bark-600">
        {value}
      </p>
    </div>
  )
}
