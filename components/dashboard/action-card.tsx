"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Shield, AlertTriangle, CheckSquare, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActionCard as ActionCardData, ProductRecommendation, ForecastRiskLevel } from "@/lib/forecast/types"

interface ActionCardProps {
  card: ActionCardData
}

const riskHex: Record<ForecastRiskLevel, string> = {
  low: "#22C55E",
  moderate: "#EAB308",
  high: "#EF4444",
  critical: "#DC2626",
}

const tierLabels: Record<string, string> = {
  best: "BEST",
  good: "GOOD",
  budget: "BUDGET",
}

const tierColors: Record<string, { bg: string; text: string }> = {
  best: { bg: "var(--badge-green-bg)", text: "var(--badge-green-text)" },
  good: { bg: "var(--badge-blue-bg)", text: "var(--badge-blue-text)" },
  budget: { bg: "var(--badge-yellow-bg)", text: "var(--badge-yellow-text)" },
}

function ProductCard({ product }: { product: ProductRecommendation }) {
  const tier = tierColors[product.tier] ?? tierColors.good

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 card-shadow">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: tier.bg, color: tier.text }}
        >
          {tierLabels[product.tier] ?? product.tier}
        </span>
        <span className="text-[14px] font-medium text-bark-900">{product.name}</span>
        {product.fracIracGroup && (
          <span className="text-[11px] text-bark-400 font-data">
            (FRAC {product.fracIracGroup})
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bark-600 font-data">
        {product.ratePerHectare && (
          <span>Rate: {product.ratePerHectare} {product.rateUnit ?? ""}/ha</span>
        )}
        {product.kickbackHours != null && product.kickbackHours > 0 && (
          <span>Kickback: up to {product.kickbackHours}h</span>
        )}
        {product.phiDays != null && <span>PHI: {product.phiDays} days</span>}
        {product.reiHours != null && <span>REI: {product.reiHours}h</span>}
        {product.costPerHectare != null && <span>~${product.costPerHectare.toFixed(0)}/ha</span>}
      </div>

      {product.note && (
        <p className="mt-1.5 text-[12px] text-bark-400 leading-[1.5]">
          {product.note}
        </p>
      )}
    </div>
  )
}

export function ActionCardComponent({ card }: ActionCardProps) {
  const [showProducts, setShowProducts] = useState(
    card.type === "active-infection"
  )

  const hex = riskHex[card.riskLevel]

  const typeLabels: Record<string, string> = {
    "active-infection": "ACTIVE INFECTION",
    "pre-infection": "INFECTION RISK AHEAD",
    preparation: "HEADS UP",
  }

  const typeIcons: Record<string, React.ReactNode> = {
    "active-infection": <AlertTriangle className="size-4" />,
    "pre-infection": <Shield className="size-4" />,
    preparation: <CheckSquare className="size-4" />,
  }

  return (
    <div
      className="rounded-xl border border-border bg-card card-shadow-elevated overflow-hidden"
      style={{ borderLeftWidth: "3px", borderLeftColor: hex }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: hex }}>{typeIcons[card.type]}</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${hex}18`,
              color: hex,
            }}
          >
            {typeLabels[card.type] ?? card.type}
          </span>
        </div>

        <h3 className="text-[15px] font-medium text-bark-900">
          {card.modelTitle}
          {card.type === "pre-infection" && card.forecast && (
            <span className="text-bark-400 font-normal text-[14px] ml-2">
              — {card.forecast.match(/expected\s+(\w+\s+\w+\s+\d+)/)?.[1] ?? "upcoming"}
            </span>
          )}
        </h3>
      </div>

      {/* Content */}
      <div className="px-6 pb-5 space-y-3">
        {card.whatHappened && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-bark-400 mb-1">
              What happened
            </p>
            <p className="text-[13px] leading-[1.7] text-bark-600">{card.whatHappened}</p>
          </div>
        )}

        {card.forecast && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-bark-400 mb-1">
              {card.type === "pre-infection" ? "Forecast" : "Looking ahead"}
            </p>
            <p className="text-[13px] leading-[1.7] text-bark-600">{card.forecast}</p>
          </div>
        )}

        {card.kickbackWindow && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: `${hex}0A` }}>
            <Clock className="size-4 shrink-0 mt-0.5" style={{ color: hex }} />
            <p className="text-[13px] leading-[1.5] font-medium" style={{ color: hex }}>
              {card.kickbackWindow}
            </p>
          </div>
        )}

        {card.products.length > 0 && (
          <div>
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors mb-2 cursor-pointer"
            >
              {showProducts ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {card.type === "active-infection"
                ? `Spray now \u2014 pick one (${card.products.length} options)`
                : `Recommended products (${card.products.length})`}
            </button>

            {showProducts && (
              <div className="space-y-2">
                {card.products.map((p, i) => (
                  <ProductCard key={i} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {card.bestSprayDay && (
          <div className="flex items-start gap-2 rounded-lg bg-primary/[0.06] px-3 py-2.5">
            <span className="text-[13px] leading-[1.5] text-primary font-medium">
              Best spray day: {card.bestSprayDay}
            </span>
          </div>
        )}

        {card.preparationChecklist.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-bark-400 mb-1.5">
              Prepare
            </p>
            <ul className="space-y-1">
              {card.preparationChecklist.map((item, i) => (
                <li key={i} className="text-[13px] text-bark-600 flex items-start gap-2">
                  <span className="text-bark-400 shrink-0">&square;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {card.lookingAhead && (
          <div className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5">
            <Eye className="size-4 text-bark-400 shrink-0 mt-0.5" />
            <p className="text-[13px] leading-[1.5] text-bark-600">{card.lookingAhead}</p>
          </div>
        )}
      </div>
    </div>
  )
}
