"use client"

import React from "react"
import { ShieldCheck, ShieldAlert, Shield, ShieldOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SprayCoverageStatus } from "@/lib/forecast/types"

interface SprayCoverageProps {
  coverage: SprayCoverageStatus[]
}

const statusConfig: Record<string, {
  icon: React.ReactNode
  hex: string
  bg: string
  label: string
}> = {
  protected: {
    icon: <ShieldCheck className="size-4" />,
    hex: "#22C55E",
    bg: "bg-primary/[0.05]",
    label: "PROTECTED",
  },
  expiring: {
    icon: <ShieldAlert className="size-4" />,
    hex: "#EAB308",
    bg: "bg-risk-moderate/[0.05]",
    label: "EXPIRING",
  },
  unprotected: {
    icon: <ShieldOff className="size-4" />,
    hex: "#EF4444",
    bg: "bg-risk-high/[0.05]",
    label: "UNPROTECTED",
  },
  inactive: {
    icon: <Shield className="size-4" />,
    hex: "var(--bark-400)",
    bg: "bg-secondary",
    label: "NOT YET ACTIVE",
  },
}

export function SprayCoverage({ coverage }: SprayCoverageProps) {
  if (coverage.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-3 flex items-center gap-2">
        <Shield className="size-5 text-primary" />
        <h2 className="text-section-title text-bark-600">Spray Coverage Status</h2>
      </div>

      <div className="px-7 pb-5 space-y-2">
        {coverage.map((item) => {
          const config = statusConfig[item.status] ?? statusConfig.unprotected
          return (
            <div
              key={item.target}
              className={cn("rounded-lg border border-border px-4 py-3", config.bg)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: config.hex }}>{config.icon}</span>
                <span className="text-[14px] font-medium text-bark-900">{item.target}</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ml-auto"
                  style={{
                    backgroundColor: config.hex + "18",
                    color: config.hex,
                  }}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-[13px] text-bark-400 leading-[1.5]">{item.message}</p>
              {item.nextAction && (
                <p className="text-[12px] font-medium mt-1" style={{ color: config.hex }}>
                  {item.nextAction}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
