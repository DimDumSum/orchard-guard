// ---------------------------------------------------------------------------
// PhenologyStrip — Horizontal 16-stage progress indicator
// ---------------------------------------------------------------------------

"use client"

import { useState } from "react"
import {
  PHENOLOGY_STAGES,
  getStageFromDD,
  type PhenologyStage,
} from "@/lib/phenology"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mini SVG icons for each stage (simplified, ~20x16)
// ---------------------------------------------------------------------------

function MiniIcon({ stageId, active }: { stageId: string; active: boolean }) {
  const color = active ? "var(--primary)" : "var(--bark-300, #C4B89A)"
  const accent = active ? "var(--primary)" : "var(--bark-300, #C4B89A)"

  const icons: Record<string, React.ReactNode> = {
    dormancy: (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="2" fill={accent} />
      </svg>
    ),
    "silver-tip": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="10" cy="9" rx="2" ry="3" fill={accent} />
        <ellipse cx="10" cy="7.5" rx="1.2" ry="1.5" fill={active ? "#C0C0C0" : accent} opacity="0.8" />
      </svg>
    ),
    "green-tip": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="10" cy="9" rx="2" ry="3" fill={accent} />
        <ellipse cx="10" cy="7" rx="1.5" ry="2" fill={active ? "#4CAF50" : accent} />
      </svg>
    ),
    "half-inch-green": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 8 Q10 3 11 8" fill={active ? "#66BB6A" : accent} />
        <ellipse cx="10" cy="9.5" rx="2" ry="2.5" fill={accent} />
      </svg>
    ),
    "tight-cluster": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2" fill={active ? "#81C784" : accent} />
        <circle cx="11" cy="7" r="2" fill={active ? "#81C784" : accent} />
        <circle cx="10" cy="5.5" r="1.8" fill={active ? "#A5D6A7" : accent} />
      </svg>
    ),
    pink: (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2.2" fill={active ? "#F48FB1" : accent} />
        <circle cx="11" cy="7" r="2.2" fill={active ? "#F48FB1" : accent} />
        <circle cx="10" cy="5" r="2" fill={active ? "#F06292" : accent} />
      </svg>
    ),
    "first-pink": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2.2" fill={active ? "#F48FB1" : accent} />
        <circle cx="11.5" cy="7" r="2.2" fill={active ? "#F48FB1" : accent} />
        <path d="M9.5 5 Q10 2 10.5 5" fill={active ? "#FCE4EC" : accent} />
      </svg>
    ),
    "full-bloom": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="10" cy="4.5" rx="1.5" ry="3" fill={active ? "#FFF0F5" : accent}
            stroke={active ? "#F48FB1" : accent} strokeWidth="0.3"
            transform={`rotate(${a}, 10, 7)`} />
        ))}
        <circle cx="10" cy="7" r="1.5" fill={active ? "#FFEB3B" : accent} />
      </svg>
    ),
    "petal-fall": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="8" r="2.5" fill={active ? "#C5E1A5" : accent} />
        <ellipse cx="7" cy="12" rx="1" ry="1.5" fill={active ? "#FCE4EC" : accent} opacity="0.6" transform="rotate(20, 7, 12)" />
        <ellipse cx="14" cy="13" rx="1" ry="1.5" fill={active ? "#FCE4EC" : accent} opacity="0.5" transform="rotate(-15, 14, 13)" />
      </svg>
    ),
    "fruit-set": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="8" r="3" fill={active ? "#C5E1A5" : accent} stroke={active ? "#8BC34A" : accent} strokeWidth="0.5" />
      </svg>
    ),
    "12mm-fruitlet": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="7.5" r="3.5" fill={active ? "#AED581" : accent} stroke={active ? "#7CB342" : accent} strokeWidth="0.5" />
      </svg>
    ),
    "20mm-fruitlet": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="7" r="4" fill={active ? "#9CCC65" : accent} stroke={active ? "#689F38" : accent} strokeWidth="0.5" />
        <line x1="10" y1="3" x2="10" y2="1" stroke={color} strokeWidth="0.7" />
      </svg>
    ),
    "summer-growth": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="6.5" r="5" fill={active ? "#8BC34A" : accent} stroke={active ? "#558B2F" : accent} strokeWidth="0.5" />
        <line x1="10" y1="2" x2="10" y2="0" stroke={color} strokeWidth="0.8" />
      </svg>
    ),
    "pre-harvest": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="6" r="5.5" fill={active ? "#F44336" : accent} stroke={active ? "#C62828" : accent} strokeWidth="0.5" />
        <line x1="10" y1="1" x2="10" y2="-1" stroke={color} strokeWidth="0.8" />
      </svg>
    ),
    harvest: (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="5.5" r="6" fill={active ? "#D32F2F" : accent} stroke={active ? "#B71C1C" : accent} strokeWidth="0.5" />
        <line x1="10" y1="0" x2="10" y2="-2" stroke={color} strokeWidth="1" />
        <path d="M10.5 -0.5 Q13 -2.5 12 0" fill={active ? "#2E7D32" : accent} />
      </svg>
    ),
    "post-harvest": (
      <svg viewBox="0 0 20 16" className="w-5 h-4">
        <line x1="3" y1="13" x2="17" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 9 Q7 5 10 7" fill={active ? "#FF8F00" : accent} opacity="0.6" />
        <path d="M12 8 Q14 4 11 6" fill={active ? "#BF360C" : accent} opacity="0.5" />
      </svg>
    ),
  }

  return icons[stageId] ?? icons.dormancy
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PhenologyStripProps {
  currentDD: number
}

export function PhenologyStrip({ currentDD }: PhenologyStripProps) {
  const currentStage = getStageFromDD(currentDD)
  const currentIdx = PHENOLOGY_STAGES.indexOf(currentStage)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-border bg-card card-shadow py-4 px-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-[2px] text-bark-400 font-medium">
          Season Progress
        </span>
        <span className="font-data text-[11px] text-bark-400">
          {currentStage.name} &middot; BBCH {currentStage.bbch}
        </span>
      </div>

      {/* Strip */}
      <div className="flex items-end gap-0">
        {PHENOLOGY_STAGES.map((stage, idx) => {
          const isCurrent = idx === currentIdx
          const isPast = idx < currentIdx
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={stage.id}
              className="flex-1 flex flex-col items-center cursor-default relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-bark-900 text-white text-[10px] whitespace-nowrap z-10 pointer-events-none"
                  style={{ transform: "translateX(-50%)", left: "50%" }}
                >
                  <span className="font-medium">{stage.name}</span>
                  <span className="text-bark-300 ml-1.5">BBCH {stage.bbch}</span>
                  <span className="text-bark-300 ml-1.5">{stage.ddMin} DD</span>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "transition-all mb-1",
                  isCurrent && "scale-125",
                  !isCurrent && !isPast && "opacity-40",
                  isPast && "opacity-60",
                )}
              >
                <MiniIcon stageId={stage.id} active={isCurrent} />
              </div>

              {/* Progress bar segment */}
              <div
                className={cn(
                  "w-full h-1.5 transition-all",
                  idx === 0 && "rounded-l-full",
                  idx === PHENOLOGY_STAGES.length - 1 && "rounded-r-full",
                  isCurrent && "bg-primary",
                  isPast && "bg-primary/40",
                  !isCurrent && !isPast && "bg-border",
                )}
                style={isCurrent ? { boxShadow: "0 0 8px rgba(34,197,94,0.3)" } : undefined}
              />

              {/* Label — only show for current + first + last on mobile, all on desktop */}
              <span
                className={cn(
                  "text-[8px] mt-1 text-center leading-tight",
                  isCurrent
                    ? "text-primary font-semibold text-[9px]"
                    : "text-bark-300",
                  !isCurrent && idx !== 0 && idx !== PHENOLOGY_STAGES.length - 1
                    ? "hidden xl:block"
                    : "",
                )}
              >
                {stage.name.length > 10 ? stage.name.split(" ")[0] : stage.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
