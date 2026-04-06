"use client"

import { useState } from "react"
import { RiskCard } from "./risk-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelCardData {
  key: string
  title: string
  category: "disease" | "pest" | "abiotic"
  riskLevel: string
  riskScore: number
  details: string
  recommendation?: string
  forecastNote?: string
  watchNote?: string
}

function Section({
  title,
  cards,
  hrefBase,
}: {
  title: string
  cards: ModelCardData[]
  hrefBase?: string
}) {
  if (cards.length === 0) return null
  return (
    <div>
      <h2 className="text-[16px] font-bold text-bark-900 mb-3">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <RiskCard
            key={card.key}
            title={card.title}
            riskLevel={card.riskLevel}
            riskScore={card.riskScore}
            details={card.details}
            recommendation={card.recommendation}
            forecastNote={card.forecastNote}
            watchNote={card.watchNote}
            href={hrefBase}
          />
        ))}
      </div>
    </div>
  )
}

export function SeasonalRiskGrid({
  primary,
  secondary,
  season,
  seasonLabel,
}: {
  primary: ModelCardData[]
  secondary: ModelCardData[]
  season: string
  seasonLabel: string
}) {
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? [...primary, ...secondary] : primary

  const diseases = displayed.filter((c) => c.category === "disease")
  const pests = displayed.filter((c) => c.category === "pest")
  const abiotic = displayed.filter((c) => c.category === "abiotic")

  const totalModels = primary.length + secondary.length

  return (
    <div className="space-y-6">
      {/* Season indicator */}
      <div className="flex items-center gap-2">
        <span
          className="font-data text-[11px] font-semibold capitalize px-3 py-1 rounded-[20px] border"
          style={{
            backgroundColor: '#F5F2EC',
            borderColor: '#E8E5DE',
            color: '#8B7355',
          }}
        >
          {seasonLabel}
        </span>
        <span className="text-[13px] text-bark-400">
          {primary.length} of {totalModels} models active
        </span>
      </div>

      <Section title="Disease Risk" cards={diseases} hrefBase="/diseases" />
      <Section title="Pest Risk" cards={pests} hrefBase="/pests" />
      <Section title="Abiotic &amp; Physiological" cards={abiotic} />

      {/* Show all toggle */}
      {secondary.length > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            "flex items-center gap-2 mx-auto py-2.5 px-5 rounded-lg text-sm font-medium transition-colors",
            "text-bark-400 hover:text-bark-900 hover:bg-earth-100",
          )}
        >
          {showAll ? (
            <>
              <ChevronUp className="size-4" />
              Show seasonal highlights only
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              Show all {totalModels} models
            </>
          )}
        </button>
      )}
    </div>
  )
}
