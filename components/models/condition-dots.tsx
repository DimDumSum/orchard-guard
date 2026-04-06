"use client"

import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ConditionDotsProps {
  conditions: Array<{
    label: string
    met: boolean
    description: string
  }>
}

export function ConditionDots({ conditions }: ConditionDotsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {conditions.map((condition) => (
          <Tooltip key={condition.label}>
            <TooltipTrigger
              className="flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
            >
              <div
                className={cn(
                  "size-4 rounded-full border-2 transition-colors",
                  condition.met
                    ? "bg-green-500 border-green-600"
                    : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                )}
              />
              <span
                className={cn(
                  "text-xs leading-tight text-center max-w-[72px]",
                  condition.met
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {condition.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                <span className="font-semibold">{condition.label}:</span>{" "}
                {condition.description}
              </p>
              <p className="mt-1 text-xs opacity-80">
                Status: {condition.met ? "Condition met" : "Not met"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
