"use client"

import React, { useState } from "react"
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertItem {
  id: number
  model: string
  riskLevel: string
  message: string
  sentAt: string
}

interface AlertBannerProps {
  alerts: AlertItem[]
}

const severityOrder: Record<string, number> = {
  critical: 6,
  extreme: 5,
  high: 4,
  moderate: 3,
  caution: 2,
  low: 1,
  none: 0,
}

const bannerStyles: Record<string, { bg: string; border: string; text: string }> = {
  low:      { bg: "bg-green-50 dark:bg-green-950/30",   border: "border-green-300 dark:border-green-700",   text: "text-green-800 dark:text-green-200" },
  none:     { bg: "bg-green-50 dark:bg-green-950/30",   border: "border-green-300 dark:border-green-700",   text: "text-green-800 dark:text-green-200" },
  caution:  { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-200" },
  moderate: { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-200" },
  high:     { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200" },
  extreme:  { bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-300 dark:border-red-700",       text: "text-red-800 dark:text-red-200" },
  critical: { bg: "bg-red-50 dark:bg-red-950/30",       border: "border-red-300 dark:border-red-700",       text: "text-red-800 dark:text-red-200" },
}

function getWorstLevel(alerts: AlertItem[]): string {
  let worst = "none"
  let worstSeverity = -1

  for (const alert of alerts) {
    const level = alert.riskLevel.toLowerCase()
    const severity = severityOrder[level] ?? 0
    if (severity > worstSeverity) {
      worstSeverity = severity
      worst = level
    }
  }

  return worst
}

function getMostCriticalAlert(alerts: AlertItem[]): AlertItem {
  return alerts.reduce((most, current) => {
    const mostSev = severityOrder[most.riskLevel.toLowerCase()] ?? 0
    const currentSev = severityOrder[current.riskLevel.toLowerCase()] ?? 0
    return currentSev > mostSev ? current : most
  })
}

function formatTimestamp(sentAt: string): string {
  const date = new Date(sentAt)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false)

  if (!alerts || alerts.length === 0) {
    return null
  }

  const worstLevel = getWorstLevel(alerts)
  const mostCritical = getMostCriticalAlert(alerts)
  const styles = bannerStyles[worstLevel] ?? bannerStyles.none

  return (
    <div className={cn("sticky top-0 z-40 w-full", styles.bg, styles.border, "border-b")}>
      <div className="mx-auto max-w-7xl px-4 py-2">
        {/* Primary alert row */}
        <div className="flex items-center gap-3">
          <AlertTriangle className={cn("size-5 shrink-0", styles.text)} />
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-semibold", styles.text)}>
              {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
            </p>
            <p className={cn("text-sm truncate", styles.text)}>
              {mostCritical.message}
            </p>
          </div>
          {alerts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className={cn("shrink-0", styles.text)}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  Hide <ChevronUp className="ml-1 size-4" />
                </>
              ) : (
                <>
                  Show all <ChevronDown className="ml-1 size-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Expanded alert list */}
        {expanded && (
          <div className="mt-2 space-y-2 border-t border-current/10 pt-2">
            {alerts.map((alert) => {
              const level = alert.riskLevel.toLowerCase()
              const alertStyle = bannerStyles[level] ?? bannerStyles.none

              return (
                <Alert key={alert.id} className={cn(alertStyle.bg, alertStyle.border, "border")}>
                  <Bell className={cn("size-4", alertStyle.text)} />
                  <AlertTitle className={alertStyle.text}>
                    {alert.model}{" "}
                    <span className="capitalize font-normal">
                      ({alert.riskLevel})
                    </span>
                  </AlertTitle>
                  <AlertDescription className={alertStyle.text}>
                    {alert.message}
                    <span className="ml-2 text-xs opacity-70">
                      {formatTimestamp(alert.sentAt)}
                    </span>
                  </AlertDescription>
                </Alert>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
