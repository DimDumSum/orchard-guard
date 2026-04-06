"use client"

import React from "react"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TERM_DEFINITIONS: Record<string, string> = {
  "degree hours":
    "A measure of accumulated warmth above a base temperature. Higher numbers mean pests and diseases develop faster.",
  "degree days":
    "Similar to degree hours but calculated daily. Used to predict when insects will emerge based on accumulated warmth.",
  biofix:
    "The date when you first consistently catch a pest in monitoring traps. All degree-day predictions are counted from this date.",
  phi:
    "Pre-Harvest Interval \u2014 the minimum number of days between the last spray application and harvest. Required by law for food safety.",
  rei:
    "Restricted Entry Interval \u2014 the minimum time after spraying before workers can safely enter the treated area without protective equipment.",
  "frac group":
    "Fungicide Resistance Action Committee classification. Rotating between FRAC groups prevents fungi from developing resistance to your sprays.",
  "irac group":
    "Insecticide Resistance Action Committee classification. Rotating between IRAC groups prevents insects from developing resistance.",
  kickback:
    "A fungicide\u2019s ability to stop an infection that has already started. Not all products have this \u2014 some only prevent new infections.",
  "ascospore maturity":
    "Apple scab fungus releases spores in spring. This percentage shows how much of the season\u2019s total spore supply has matured and is ready to cause infection.",
  inoculum:
    "The amount of disease-causing organisms present. Higher inoculum means higher infection risk when conditions are right.",
  cougarblight:
    "A published scientific model that tracks bacterial growth potential from temperature to predict fire blight risk.",
  maryblyt:
    "A published scientific model that predicts specific fire blight infection events by tracking four simultaneous conditions.",
}

interface TermTooltipProps {
  term: string
  children?: React.ReactNode
}

export function TermTooltip({ term, children }: TermTooltipProps) {
  const definition = TERM_DEFINITIONS[term.toLowerCase()]
  if (!definition) return <>{children ?? term}</>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 cursor-help">
          {children ?? term}
          <Info className="size-3 text-bark-400 shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-[13px] leading-[1.6]">
          <p>{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
