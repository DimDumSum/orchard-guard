"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"
import { cn } from "@/lib/utils"

interface BloomStageCardProps {
  currentStage: string
  orchardId?: number
}

const stages = [
  { value: "dormant", label: "Dormant" },
  { value: "silver-tip", label: "Silver Tip" },
  { value: "green-tip", label: "Green Tip" },
  { value: "tight-cluster", label: "Tight Cluster" },
  { value: "pink", label: "Pink" },
  { value: "bloom", label: "Bloom" },
  { value: "petal-fall", label: "Petal Fall" },
  { value: "fruit-set", label: "Fruit Set" },
]

const stageGuidance: Record<string, string> = {
  dormant:
    "Your trees are still fully dormant. Most disease and pest models won\u2019t activate until buds begin to push (green tip stage). Walk your orchard every few days \u2014 when you see the first green showing at bud tips, update to \u201cGreen Tip.\u201d",
  "silver-tip":
    "Buds are just starting to swell and show silver. Apply dormant copper spray now if planned. Watch for green tissue emerging.",
  "green-tip":
    "First green tissue is exposed \u2014 apple scab monitoring is now active. This is the last window for dormant oil sprays targeting mite eggs and scale.",
  "tight-cluster":
    "Flower buds are tightly clustered. Scab and mildew risk increasing. Maintain fungicide protection.",
  pink:
    "Flower buds are showing color. Fire blight risk begins. Frost damage at this stage can be severe.",
  bloom:
    "Flowers are open \u2014 this is the highest-risk period for fire blight. Do NOT apply insecticides (pollinators at work). Watch CougarBlight/MaryBlyt models closely.",
  "petal-fall":
    "Petals are falling. Key spray window for codling moth, plum curculio, and scab. Many post-bloom sprays are timed from this date.",
  "fruit-set":
    "Fruitlets are developing. Continue pest monitoring. Codling moth degree-day tracking is critical from here.",
}

function getLabel(value: string): string {
  return stages.find((s) => s.value === value)?.label ?? value
}

function getIndex(value: string): number {
  return stages.findIndex((s) => s.value === value)
}

export function BloomStageCard({
  currentStage,
  orchardId = 1,
}: BloomStageCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const currentIdx = getIndex(currentStage)

  async function handleSelect(stage: string) {
    if (stage === currentStage) return
    setError(null)
    try {
      const res = await fetch("/api/orchard/bloom-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orchardId, bloomStage: stage }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to update")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setError("Network error")
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card card-shadow py-5 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[11px] uppercase tracking-[2px] text-bark-400 font-medium">
          Growth Stage
        </span>
        <span className="font-data text-[12px] text-primary font-medium">
          {getLabel(currentStage)}
        </span>
      </div>

      {/* Dot track */}
      <div className="flex items-center mb-3">
        {stages.map((s, idx) => {
          const isCurrent = idx === currentIdx
          const isPast = idx < currentIdx
          return (
            <div key={s.value} className="contents">
              <button
                onClick={() => handleSelect(s.value)}
                disabled={isPending}
                className="relative z-[2] shrink-0 cursor-pointer"
                title={s.label}
              >
                <div
                  className={cn(
                    "rounded-full transition-all",
                    isCurrent
                      ? "size-3.5 bg-primary"
                      : isPast
                        ? "size-2.5 bg-bark-400"
                        : "size-2.5 bg-bark-300",
                  )}
                  style={
                    isCurrent
                      ? {
                          boxShadow:
                            "0 0 16px rgba(34,197,94,0.3), 0 0 4px #22C55E",
                        }
                      : undefined
                  }
                />
              </button>
              {idx < stages.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 relative z-[1]",
                    idx < currentIdx
                      ? "bg-primary/40"
                      : "bg-border",
                  )}
                  style={
                    idx < currentIdx
                      ? { boxShadow: "0 0 8px rgba(34,197,94,0.2)" }
                      : undefined
                  }
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        {stages.map((s, idx) => {
          const isCurrent = idx === currentIdx
          return (
            <span
              key={s.value}
              className={cn(
                "text-[10px] tracking-[0.3px]",
                idx === 0
                  ? "text-left"
                  : idx === stages.length - 1
                    ? "text-right"
                    : "text-center flex-1",
                isCurrent
                  ? "text-primary font-semibold text-[11px]"
                  : "text-bark-300",
                idx === 0 || idx === stages.length - 1 ? "" : "hidden sm:block",
              )}
            >
              {s.label}
            </span>
          )
        })}
      </div>

      {/* Guidance text */}
      {stageGuidance[currentStage] && (
        <p className="mt-4 text-[13px] leading-[1.65] text-bark-400">
          {stageGuidance[currentStage]}
        </p>
      )}

      {isPending && (
        <p className="mt-3 text-[11px] text-bark-400">Updating...</p>
      )}
      {error && (
        <p className="mt-3 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  )
}
