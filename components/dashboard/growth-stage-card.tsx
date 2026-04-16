// ---------------------------------------------------------------------------
// GrowthStageCard — Visual phenology indicator with SVG illustrations
// ---------------------------------------------------------------------------

import {
  PHENOLOGY_STAGES,
  getStageFromDD,
  calcSeasonDD,
  estimateDaysToNextStage,
  getModelStageRelevance,
  type PhenologyStage,
} from "@/lib/phenology"

// ---------------------------------------------------------------------------
// SVG Illustrations — one per stage
//
// Consistent line-art style, 200x160 viewBox.  Uses currentColor for strokes
// and CSS custom properties for fills so dark/light themes work automatically.
// ---------------------------------------------------------------------------

function BranchBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto" aria-hidden>
      {/* Branch */}
      <path
        d="M20 140 Q60 135 100 120 Q140 105 180 95"
        fill="none"
        stroke="var(--bark-500, #8B7355)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {children}
    </svg>
  )
}

const STAGE_SVGS: Record<string, React.ReactNode> = {
  dormancy: (
    <BranchBase>
      {/* Bare dormant buds */}
      <circle cx="100" cy="115" r="4" fill="var(--bark-400, #A0926B)" />
      <circle cx="130" cy="107" r="3.5" fill="var(--bark-400, #A0926B)" />
      <circle cx="70" cy="128" r="3" fill="var(--bark-400, #A0926B)" />
      {/* Snow flakes */}
      <text x="50" y="60" fontSize="16" fill="var(--bark-300, #C4B89A)" opacity="0.5">*</text>
      <text x="140" y="45" fontSize="14" fill="var(--bark-300, #C4B89A)" opacity="0.4">*</text>
    </BranchBase>
  ),

  "silver-tip": (
    <BranchBase>
      {/* Swelling buds with silver tips */}
      <ellipse cx="100" cy="113" rx="5" ry="7" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="100" cy="108" rx="3" ry="4" fill="#C0C0C0" opacity="0.8" />
      <ellipse cx="130" cy="105" rx="4" ry="6" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="130" cy="101" rx="2.5" ry="3" fill="#C0C0C0" opacity="0.8" />
      <ellipse cx="70" cy="126" rx="4" ry="5.5" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="70" cy="122" rx="2.5" ry="3" fill="#C0C0C0" opacity="0.7" />
    </BranchBase>
  ),

  "green-tip": (
    <BranchBase>
      {/* Buds with green tips emerging */}
      <ellipse cx="100" cy="113" rx="5" ry="7" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="100" cy="107" rx="3" ry="5" fill="#4CAF50" opacity="0.85" />
      <ellipse cx="130" cy="105" rx="4" ry="6" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="130" cy="100" rx="2.5" ry="4" fill="#4CAF50" opacity="0.85" />
      <ellipse cx="70" cy="126" rx="4" ry="5.5" fill="var(--bark-400, #A0926B)" />
      <ellipse cx="70" cy="121" rx="2.5" ry="4" fill="#4CAF50" opacity="0.8" />
    </BranchBase>
  ),

  "half-inch-green": (
    <BranchBase>
      {/* Small leaves emerging ~1cm */}
      <ellipse cx="100" cy="113" rx="5" ry="7" fill="var(--bark-400, #A0926B)" />
      <path d="M97 105 Q100 92 103 105" fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.5" />
      <path d="M95 108 Q92 98 100 105" fill="#81C784" stroke="#4CAF50" strokeWidth="0.5" />
      <ellipse cx="130" cy="104" rx="4" ry="6" fill="var(--bark-400, #A0926B)" />
      <path d="M128 98 Q130 88 132 98" fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.5" />
      <ellipse cx="70" cy="125" rx="4" ry="5.5" fill="var(--bark-400, #A0926B)" />
      <path d="M68 119 Q70 110 72 119" fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.5" />
    </BranchBase>
  ),

  "tight-cluster": (
    <BranchBase>
      {/* Tight flower bud cluster */}
      <ellipse cx="100" cy="112" rx="5" ry="6" fill="var(--bark-400, #A0926B)" />
      <circle cx="97" cy="103" r="4" fill="#81C784" />
      <circle cx="103" cy="103" r="4" fill="#81C784" />
      <circle cx="100" cy="98" r="3.5" fill="#A5D6A7" />
      <circle cx="94" cy="99" r="3" fill="#81C784" />
      <circle cx="106" cy="99" r="3" fill="#81C784" />
      {/* Leaf behind */}
      <path d="M88 110 Q82 95 92 100" fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.5" />
      <path d="M112 104 Q118 90 108 96" fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.5" />
    </BranchBase>
  ),

  pink: (
    <BranchBase>
      {/* Pink buds showing color */}
      <ellipse cx="100" cy="112" rx="5" ry="6" fill="var(--bark-400, #A0926B)" />
      <circle cx="96" cy="102" r="5" fill="#F48FB1" />
      <circle cx="104" cy="102" r="5" fill="#F48FB1" />
      <circle cx="100" cy="96" r="4.5" fill="#F06292" />
      <circle cx="92" cy="98" r="3.5" fill="#F48FB1" />
      <circle cx="108" cy="98" r="3.5" fill="#F48FB1" />
      {/* Leaves */}
      <path d="M85 112 Q78 96 90 102" fill="#66BB6A" />
      <path d="M115 106 Q122 90 110 98" fill="#66BB6A" />
    </BranchBase>
  ),

  "first-pink": (
    <BranchBase>
      {/* Some buds opening, pink petals visible */}
      <circle cx="96" cy="100" r="6" fill="#F48FB1" />
      <circle cx="104" cy="100" r="6" fill="#F48FB1" />
      <circle cx="100" cy="94" r="5.5" fill="#F06292" />
      {/* One bud starting to open */}
      <path d="M96 94 Q100 82 104 94" fill="#FCE4EC" stroke="#F48FB1" strokeWidth="0.5" />
      <circle cx="100" cy="92" r="2" fill="#FFEB3B" />
      {/* Leaves */}
      <path d="M82 110 Q76 94 88 100" fill="#66BB6A" />
      <path d="M118 104 Q124 88 110 96" fill="#66BB6A" />
    </BranchBase>
  ),

  "full-bloom": (
    <BranchBase>
      {/* Open apple blossoms — 5-petal flowers */}
      <g transform="translate(100, 94)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-10"
            rx="5"
            ry="9"
            fill="#FFF0F5"
            stroke="#F48FB1"
            strokeWidth="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="4" fill="#FFEB3B" />
        <circle cx="-1.5" cy="-1" r="0.8" fill="#F9A825" />
        <circle cx="1.5" cy="-1" r="0.8" fill="#F9A825" />
        <circle cx="0" cy="1.5" r="0.8" fill="#F9A825" />
      </g>
      {/* Second bloom */}
      <g transform="translate(135, 88) scale(0.7)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-10"
            rx="5"
            ry="9"
            fill="#FFF0F5"
            stroke="#F48FB1"
            strokeWidth="0.7"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="4" fill="#FFEB3B" />
      </g>
      {/* Leaves */}
      <path d="M78 112 Q70 94 86 100" fill="#66BB6A" />
      <path d="M120 108 Q128 92 112 100" fill="#66BB6A" />
    </BranchBase>
  ),

  "petal-fall": (
    <BranchBase>
      {/* Flower losing petals, some falling */}
      <g transform="translate(100, 96)">
        <ellipse cx="0" cy="-9" rx="4" ry="7" fill="#FFF0F5" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(0)" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" fill="#FFF0F5" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(144)" />
        <circle cx="0" cy="0" r="4" fill="#C5E1A5" />
      </g>
      {/* Falling petals */}
      <ellipse cx="80" cy="125" rx="3" ry="5" fill="#FCE4EC" opacity="0.6" transform="rotate(30, 80, 125)" />
      <ellipse cx="120" cy="135" rx="2.5" ry="4" fill="#FCE4EC" opacity="0.5" transform="rotate(-20, 120, 135)" />
      <ellipse cx="60" cy="140" rx="2" ry="3.5" fill="#FCE4EC" opacity="0.4" transform="rotate(45, 60, 140)" />
      {/* Leaves */}
      <path d="M82 108 Q74 92 90 98" fill="#66BB6A" />
      <path d="M118 102 Q126 86 110 94" fill="#66BB6A" />
    </BranchBase>
  ),

  "fruit-set": (
    <BranchBase>
      {/* Tiny 6mm fruitlets */}
      <circle cx="100" cy="108" r="5" fill="#C5E1A5" stroke="#8BC34A" strokeWidth="0.8" />
      <circle cx="100" cy="105" r="1" fill="#795548" /> {/* Calyx */}
      <circle cx="130" cy="98" r="4" fill="#C5E1A5" stroke="#8BC34A" strokeWidth="0.8" />
      <circle cx="72" cy="118" r="4.5" fill="#C5E1A5" stroke="#8BC34A" strokeWidth="0.8" />
      {/* Leaves */}
      <path d="M85 112 Q76 96 92 104" fill="#4CAF50" />
      <path d="M115 100 Q122 84 108 94" fill="#4CAF50" />
      <path d="M60 124 Q52 112 66 116" fill="#4CAF50" />
    </BranchBase>
  ),

  "12mm-fruitlet": (
    <BranchBase>
      {/* 12mm fruitlets — bigger */}
      <circle cx="100" cy="106" r="7" fill="#AED581" stroke="#7CB342" strokeWidth="0.8" />
      <circle cx="100" cy="101" r="1.2" fill="#795548" />
      <circle cx="132" cy="96" r="6" fill="#AED581" stroke="#7CB342" strokeWidth="0.8" />
      <circle cx="70" cy="118" r="6.5" fill="#AED581" stroke="#7CB342" strokeWidth="0.8" />
      {/* Leaves */}
      <path d="M82 110 Q72 92 90 100" fill="#43A047" />
      <path d="M118 98 Q126 80 108 90" fill="#43A047" />
      <path d="M56 124 Q46 110 64 116" fill="#43A047" />
    </BranchBase>
  ),

  "20mm-fruitlet": (
    <BranchBase>
      {/* 20mm fruitlets — larger, starting to look like apples */}
      <circle cx="100" cy="104" r="10" fill="#9CCC65" stroke="#689F38" strokeWidth="0.8" />
      <circle cx="100" cy="96" r="1.5" fill="#795548" />
      <line x1="100" y1="95" x2="100" y2="89" stroke="#795548" strokeWidth="1" />
      <circle cx="134" cy="92" r="8" fill="#9CCC65" stroke="#689F38" strokeWidth="0.8" />
      <circle cx="68" cy="116" r="9" fill="#9CCC65" stroke="#689F38" strokeWidth="0.8" />
      {/* Leaves */}
      <path d="M82 108 Q70 88 90 98" fill="#388E3C" />
      <path d="M118 94 Q128 74 108 88" fill="#388E3C" />
    </BranchBase>
  ),

  "summer-growth": (
    <BranchBase>
      {/* Growing apples on branch */}
      <circle cx="100" cy="100" r="14" fill="#8BC34A" stroke="#558B2F" strokeWidth="0.8" />
      <circle cx="100" cy="88" r="2" fill="#795548" />
      <line x1="100" y1="87" x2="100" y2="80" stroke="#795548" strokeWidth="1.2" />
      {/* Small leaf at stem */}
      <path d="M101 82 Q106 76 103 82" fill="#388E3C" />
      <circle cx="136" cy="88" r="11" fill="#8BC34A" stroke="#558B2F" strokeWidth="0.8" />
      <circle cx="66" cy="112" r="12" fill="#8BC34A" stroke="#558B2F" strokeWidth="0.8" />
      {/* Leaves */}
      <path d="M78 106 Q66 86 86 96" fill="#2E7D32" />
      <path d="M120 88 Q130 68 112 82" fill="#2E7D32" />
    </BranchBase>
  ),

  "pre-harvest": (
    <BranchBase>
      {/* Mature apples — starting to color */}
      <circle cx="100" cy="98" r="16" fill="#F44336" stroke="#C62828" strokeWidth="0.5" />
      {/* Highlight */}
      <ellipse cx="94" cy="92" rx="5" ry="4" fill="#EF5350" opacity="0.5" />
      <circle cx="100" cy="84" r="2" fill="#795548" />
      <line x1="100" y1="83" x2="100" y2="76" stroke="#795548" strokeWidth="1.3" />
      <path d="M101 78 Q108 72 104 78" fill="#388E3C" />
      <circle cx="140" cy="86" r="12" fill="#E53935" stroke="#B71C1C" strokeWidth="0.5" />
      <circle cx="62" cy="110" r="13" fill="#EF5350" stroke="#C62828" strokeWidth="0.5" />
      {/* Leaves */}
      <path d="M76 104 Q64 86 84 96" fill="#2E7D32" />
    </BranchBase>
  ),

  harvest: (
    <BranchBase>
      {/* Ripe red apples */}
      <circle cx="100" cy="96" r="18" fill="#D32F2F" stroke="#B71C1C" strokeWidth="0.6" />
      <ellipse cx="93" cy="88" rx="6" ry="5" fill="#E53935" opacity="0.4" />
      <circle cx="100" cy="80" r="2.2" fill="#5D4037" />
      <line x1="100" y1="79" x2="100" y2="70" stroke="#5D4037" strokeWidth="1.5" />
      <path d="M101 73 Q110 66 106 74" fill="#2E7D32" />
      <circle cx="142" cy="84" r="14" fill="#C62828" stroke="#B71C1C" strokeWidth="0.6" />
      <ellipse cx="137" cy="78" rx="4" ry="3.5" fill="#E53935" opacity="0.4" />
      <circle cx="60" cy="108" r="15" fill="#D32F2F" stroke="#B71C1C" strokeWidth="0.6" />
      {/* Leaf */}
      <path d="M74 102 Q62 84 82 94" fill="#1B5E20" />
    </BranchBase>
  ),

  "post-harvest": (
    <BranchBase>
      {/* Bare branch with a few remaining leaves turning color */}
      <path d="M95 110 Q88 96 100 104" fill="#FF8F00" opacity="0.7" />
      <path d="M112 100 Q118 86 106 94" fill="#BF360C" opacity="0.6" />
      <path d="M70 126 Q64 116 76 120" fill="#F57F17" opacity="0.5" />
      {/* Fallen leaves on ground */}
      <ellipse cx="40" cy="148" rx="6" ry="2.5" fill="#BF360C" opacity="0.4" transform="rotate(-15, 40, 148)" />
      <ellipse cx="160" cy="150" rx="5" ry="2" fill="#FF8F00" opacity="0.35" transform="rotate(10, 160, 150)" />
    </BranchBase>
  ),
}

// ---------------------------------------------------------------------------
// Props & Component
// ---------------------------------------------------------------------------

interface GrowthStageCardProps {
  dailyData: { max_temp: number; min_temp: number; date: string }[]
  forecastDaily: { max_temp: number; min_temp: number }[]
  bloomStage: string
  activeModelKeys?: string[]
}

export function GrowthStageCard({
  dailyData,
  forecastDaily,
  bloomStage,
  activeModelKeys,
}: GrowthStageCardProps) {
  const dd = calcSeasonDD(dailyData)
  const stage = getStageFromDD(dd)
  const stageIdx = PHENOLOGY_STAGES.indexOf(stage)
  const nextStage = stageIdx < PHENOLOGY_STAGES.length - 1 ? PHENOLOGY_STAGES[stageIdx + 1] : null
  const daysToNext = estimateDaysToNextStage(dd, stage, forecastDaily)

  // Model relevance for active models
  const relevantModels = stage.activeModels.slice(0, 6)

  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] uppercase tracking-[2px] text-bark-400 font-medium">
          Phenological Stage
        </span>
        <span className="font-data text-[11px] text-bark-400">
          BBCH {stage.bbch}
        </span>
      </div>

      <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-5">
        {/* SVG illustration */}
        <div className="rounded-lg border border-border bg-[var(--card)] p-2 flex items-center justify-center">
          {STAGE_SVGS[stage.id] ?? STAGE_SVGS.dormancy}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-[18px] font-semibold text-bark-900 mb-1">
              {stage.name}
            </h3>
            <p className="text-[13px] text-bark-400 leading-[1.6] mb-3">
              {stage.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-0.5">DD (base 4.4°C)</p>
              <p className="font-data text-[15px] font-medium text-bark-900">{Math.round(dd)}</p>
            </div>
            {nextStage && daysToNext != null && (
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-0.5">Next: {nextStage.name}</p>
                <p className="font-data text-[15px] font-medium text-bark-900">
                  ~{daysToNext} day{daysToNext !== 1 ? "s" : ""}
                </p>
              </div>
            )}
            {nextStage && (
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-0.5">DD to next</p>
                <p className="font-data text-[15px] font-medium text-bark-900">
                  {Math.round(nextStage.ddMin - dd)} DD
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active models for this stage */}
      {relevantModels.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] uppercase tracking-[1.5px] text-bark-300 mb-2">
            Key models this stage
          </p>
          <div className="flex flex-wrap gap-1.5">
            {relevantModels.map((modelKey) => (
              <span
                key={modelKey}
                className="text-[11px] px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium"
              >
                {formatModelName(modelKey)}
              </span>
            ))}
            {stage.activeModels.length > 6 && (
              <span className="text-[11px] px-2.5 py-1 rounded-md text-bark-400">
                +{stage.activeModels.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatModelName(key: string): string {
  const names: Record<string, string> = {
    fireBlight: "Fire Blight",
    appleScab: "Apple Scab",
    frostRisk: "Frost Risk",
    powderyMildew: "Powdery Mildew",
    cedarRust: "Cedar Rust",
    codlingMoth: "Codling Moth",
    plumCurculio: "Plum Curculio",
    europeanRedMite: "European Red Mite",
    rosyAppleAphid: "Rosy Apple Aphid",
    orientalFruitMoth: "Oriental Fruit Moth",
    leafroller: "Leafroller",
    sootyBlotch: "Sooty Blotch",
    bitterRot: "Bitter Rot",
    blackRot: "Black Rot",
    whiteRot: "White Rot",
    twoSpottedSpiderMite: "Spider Mite",
    japaneseBeetle: "Japanese Beetle",
    appleMaggot: "Apple Maggot",
    bmsb: "BMSB",
    swd: "SWD",
    voles: "Voles",
    deer: "Deer",
    sunscald: "Sunscald",
    nectriaCanker: "Nectria Canker",
    winterMoth: "Winter Moth",
    sanJoseScale: "San Jose Scale",
    tarnishedPlantBug: "Tarnished Plant Bug",
    europeanAppleSawfly: "Apple Sawfly",
    mulleinBug: "Mullein Bug",
    tentiformLeafminer: "Leafminer",
    greenAppleAphid: "Green Aphid",
    appleFleaWeevil: "Flea Weevil",
    woollyAppleAphid: "Woolly Aphid",
    waterCore: "Water Core",
    sunburn: "Sunburn",
    bitterPit: "Bitter Pit",
    postHarvest: "Post-harvest",
    bullsEyeRot: "Bull's Eye Rot",
    phytophthora: "Phytophthora",
    appleLeafMidge: "Leaf Midge",
    frostRing: "Frost Ring",
  }
  return names[key] ?? key.replace(/([A-Z])/g, " $1").trim()
}
