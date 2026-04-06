"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface BloomStageSelectorProps {
  currentStage: string
  onUpdate: (stage: string) => void
}

const bloomStages = [
  { value: "dormant",       label: "Dormant",       color: "bg-stone-400" },
  { value: "silver-tip",    label: "Silver Tip",    color: "bg-gray-300" },
  { value: "green-tip",     label: "Green Tip",     color: "bg-green-600" },
  { value: "tight-cluster", label: "Tight Cluster", color: "bg-green-400" },
  { value: "pink",          label: "Pink",          color: "bg-pink-400" },
  { value: "bloom",         label: "Bloom",         color: "bg-pink-200" },
  { value: "petal-fall",    label: "Petal Fall",    color: "bg-white border border-gray-300" },
  { value: "fruit-set",     label: "Fruit Set",     color: "bg-lime-500" },
] as const

function getStageLabel(value: string): string {
  const stage = bloomStages.find((s) => s.value === value)
  return stage?.label ?? value
}

function getStageColor(value: string): string {
  const stage = bloomStages.find((s) => s.value === value)
  return stage?.color ?? "bg-gray-400"
}

function getStageIndex(value: string): number {
  return bloomStages.findIndex((s) => s.value === value)
}

export function BloomStageSelector({
  currentStage,
  onUpdate,
}: BloomStageSelectorProps) {
  const currentIndex = getStageIndex(currentStage)
  const progress =
    currentIndex >= 0
      ? Math.round((currentIndex / (bloomStages.length - 1)) * 100)
      : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-3 rounded-full shrink-0",
              getStageColor(currentStage)
            )}
          />
          <span className="text-lg font-semibold">
            {getStageLabel(currentStage)}
          </span>
        </div>

        <Select value={currentStage} onValueChange={(value) => { if (value) onUpdate(value) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {bloomStages.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn("size-2.5 rounded-full shrink-0", stage.color)}
                  />
                  <span>{stage.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage progress indicator */}
      <div className="flex items-center gap-1">
        {bloomStages.map((stage, idx) => (
          <div key={stage.value} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "size-2.5 rounded-full transition-all",
                stage.color,
                idx <= currentIndex
                  ? "ring-2 ring-offset-1 ring-primary/40 scale-110"
                  : "opacity-40"
              )}
            />
            <span
              className={cn(
                "text-[9px] leading-tight text-center hidden sm:block",
                idx <= currentIndex
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar connecting the dots */}
      <div className="relative h-1 w-full rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/60 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
