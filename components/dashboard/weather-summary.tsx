"use client"

import React, { useState, useCallback, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { toImperial } from "@/lib/units"

interface WeatherSummaryProps {
  temp: number | null
  humidity: number | null
  precip: number | null
  wind: number | null
  dewPoint: number | null
  updatedAt: string | null
  latitude: number | null
  longitude: number | null
}

function getAgeMs(dateString: string): number {
  return Date.now() - new Date(dateString).getTime()
}

function formatTimeAgo(dateString: string): string {
  const diffMs = getAgeMs(dateString)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes === 1) return "1 min ago"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return "1 hr ago"
  if (diffHours < 24) return `${diffHours} hrs ago`

  const date = new Date(dateString)
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

function formatCoord(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value)
  const dir = value >= 0 ? pos : neg
  return `${abs.toFixed(2)}\u00b0${dir}`
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export function WeatherSummary({
  temp,
  humidity,
  precip,
  wind,
  dewPoint,
  updatedAt,
  latitude,
  longitude,
}: WeatherSummaryProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<"success" | "error" | null>(null)

  const isStale = updatedAt ? getAgeMs(updatedAt) > TWO_HOURS_MS : false

  // Clear result message after a few seconds
  useEffect(() => {
    if (refreshResult) {
      const t = setTimeout(() => setRefreshResult(null), 3000)
      return () => clearTimeout(t)
    }
  }, [refreshResult])

  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setRefreshResult(null)
    try {
      const res = await fetch("/api/weather/refresh")
      if (res.ok) {
        setRefreshResult("success")
        // Reload page to pick up new data (server component)
        setTimeout(() => window.location.reload(), 800)
      } else {
        setRefreshResult("error")
      }
    } catch {
      setRefreshResult("error")
    } finally {
      setRefreshing(false)
    }
  }, [refreshing])

  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      {/* Top row: big temp + description */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-data text-[54px] font-light leading-none text-bark-900">
            {temp !== null ? temp : "--"}
            <span className="text-[22px] text-bark-400">&deg;C</span>
          </span>
          {temp !== null && (
            <p className="font-data text-[16px] text-bark-400 mt-0.5">
              {toImperial(temp, "temperature").toFixed(1)}&deg;F
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[14px] text-bark-600">
            {getTempContext(temp)}
          </p>
          {updatedAt && (
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`text-[11px] cursor-pointer hover:underline transition-colors ${
                  isStale ? "text-risk-moderate font-medium" : "text-bark-300"
                }`}
                title="Click to refresh weather data"
              >
                {formatTimeAgo(updatedAt)}
                {isStale && " — stale"}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-bark-300 hover:text-bark-600 transition-colors cursor-pointer"
                title="Refresh now"
                aria-label="Refresh weather data"
              >
                <RefreshCw className={`size-3 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
          {refreshResult === "success" && (
            <p className="text-[10px] text-primary mt-0.5">Updated</p>
          )}
          {refreshResult === "error" && (
            <p className="text-[10px] text-risk-high mt-0.5">Refresh failed</p>
          )}
        </div>
      </div>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <StatItem label="Humidity" value={humidity !== null ? `${humidity}%` : "--"} />
        <StatItem
          label="Precip 24h"
          value={precip !== null ? `${precip} mm` : "--"}
          secondary={precip !== null ? `${toImperial(precip, "rainfall").toFixed(2)} in` : undefined}
        />
        <StatItem
          label="Wind"
          value={wind !== null ? `${wind} km/h` : "--"}
          secondary={wind !== null ? `${toImperial(wind, "windSpeed").toFixed(1)} mph` : undefined}
        />
        <StatItem
          label="Dew Point"
          value={dewPoint !== null ? `${dewPoint}\u00b0C` : "--"}
          secondary={dewPoint !== null ? `${toImperial(dewPoint, "temperature").toFixed(1)}\u00b0F` : undefined}
        />
      </div>

      {/* Coordinates */}
      {latitude != null && longitude != null && (
        <p className="text-[10px] text-bark-300 mt-3 pt-3 border-t border-border">
          Weather for {formatCoord(latitude, "N", "S")}, {formatCoord(longitude, "E", "W")}
        </p>
      )}
    </div>
  )
}

function StatItem({ label, value, secondary }: { label: string; value: string; secondary?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-1">
        {label}
      </p>
      <p className="font-data text-[16px] text-bark-600">
        {value}
      </p>
      {secondary && (
        <p className="font-data text-[11px] text-bark-300 mt-0.5">
          {secondary}
        </p>
      )}
    </div>
  )
}
