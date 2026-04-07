// ---------------------------------------------------------------------------
// OrchardGuard Seasonal Checklist Page — Server Component
//
// Displays a stage-appropriate checklist based on the orchard's current bloom
// stage. Checkboxes are visual-only (no client state).
// ---------------------------------------------------------------------------

import { getOrchard } from "@/lib/db"
import { CheckSquare } from "lucide-react"

export const dynamic = "force-dynamic"

// ---------------------------------------------------------------------------
// Checklist data — hardcoded seasonal checklists keyed by bloom stage
// ---------------------------------------------------------------------------

const CHECKLISTS: Record<string, { title: string; sections: Array<{ heading: string; items: string[] }> }> = {
  dormant: {
    title: "Dormant Season Checklist",
    sections: [
      {
        heading: "Pruning",
        items: [
          "Complete dormant pruning",
          "Remove all fire blight cankers (cut 30cm beyond visible infection)",
          "Remove mummified fruit (black rot inoculum)",
          "Prune out dead wood and crossing branches",
          "Sterilize pruning tools between trees",
        ],
      },
      {
        heading: "Pest Monitoring",
        items: [
          "Inspect for overwintering mite eggs on bark",
          "Check trunks for vole damage",
          "Inspect graft unions for borer damage",
          "Check deer fence integrity",
          "Set up weather station / verify data feed",
        ],
      },
      {
        heading: "Spray Preparation",
        items: [
          "Inventory spray products for season",
          "Calibrate sprayer",
          "Order dormant oil",
          "Order copper for silver tip spray",
          "Order streptomycin for bloom",
        ],
      },
      {
        heading: "Orchard Prep",
        items: [
          "Mow orchard floor short (vole management)",
          "Pull mulch away from trunks (15cm minimum)",
          "Replace damaged trunk guards",
          "Check irrigation system",
          "Soil test if not done in 3 years",
        ],
      },
    ],
  },
  "silver-tip": {
    title: "Silver Tip Checklist",
    sections: [
      {
        heading: "Spray Program",
        items: [
          "Apply dormant oil (before green tip)",
          "Apply copper spray at silver tip to 1/4\" green",
          "Verify sprayer calibration",
        ],
      },
      {
        heading: "Monitoring",
        items: [
          "Watch for bud development daily",
          "Check for European red mite eggs",
          "Monitor for San Jose scale crawlers",
          "Set up apple scab spore traps if available",
        ],
      },
      {
        heading: "Preparation",
        items: [
          "Ensure fungicide inventory is ready for green tip",
          "Confirm streptomycin supply for bloom",
          "Review spray schedule with team",
        ],
      },
    ],
  },
  "green-tip": {
    title: "Green Tip Checklist",
    sections: [
      {
        heading: "Disease Management",
        items: [
          "Begin apple scab fungicide program",
          "Apply protectant fungicide before first rain",
          "Monitor for powdery mildew on susceptible varieties",
        ],
      },
      {
        heading: "Pest Monitoring",
        items: [
          "Scout for rosy apple aphid (check bud clusters)",
          "Monitor green apple aphid colonies",
          "Watch for European apple sawfly emergence",
        ],
      },
      {
        heading: "Frost Protection",
        items: [
          "Monitor overnight temperatures closely",
          "Prepare frost protection equipment",
          "Know your critical temperatures for this stage (-5\u00b0C for 10% kill)",
        ],
      },
    ],
  },
  "tight-cluster": {
    title: "Tight Cluster Checklist",
    sections: [
      {
        heading: "Disease Management",
        items: [
          "Continue scab fungicide program (before every rain)",
          "Add mildew control if needed",
          "Watch for cedar-apple rust (check nearby junipers)",
        ],
      },
      {
        heading: "Insect Management",
        items: [
          "Apply insecticide for rosy apple aphid if present",
          "Scout for tarnished plant bug",
          "Monitor tent caterpillar egg masses",
        ],
      },
      {
        heading: "Frost Protection",
        items: [
          "Critical temperature now -3\u00b0C for 10% kill",
          "Run irrigation for frost protection when needed",
        ],
      },
    ],
  },
  pink: {
    title: "Pink Stage Checklist",
    sections: [
      {
        heading: "Disease Management",
        items: [
          "Continue scab protectant program",
          "Prepare fire blight materials (streptomycin or Kasumin)",
          "Apply mildew fungicide if needed",
        ],
      },
      {
        heading: "Pre-Bloom Prep",
        items: [
          "Place honeybee hives in orchard (1-2 per acre)",
          "Stop all insecticide applications (protect pollinators)",
          "Notify neighbors of bloom timing",
        ],
      },
      {
        heading: "Frost Protection",
        items: [
          "Critical temperature now -2\u00b0C for 10% kill",
          "Most vulnerable stage approaching",
        ],
      },
    ],
  },
  bloom: {
    title: "Bloom Checklist",
    sections: [
      {
        heading: "Fire Blight Management",
        items: [
          "Monitor CougarBlight and MaryBlyt models daily",
          "Apply streptomycin before rain events when risk is high",
          "Rotate to Kasumin after 3 streptomycin applications",
          "Track total antibiotic applications this season",
        ],
      },
      {
        heading: "Pollination",
        items: [
          "NO insecticide applications during bloom",
          "Verify bee activity on warm days",
          "Monitor bloom progression for petal fall timing",
        ],
      },
      {
        heading: "Scab Management",
        items: [
          "Continue protectant fungicide program",
          "Can tank-mix Captan with streptomycin",
          "Track rain events and wetting periods",
        ],
      },
    ],
  },
  "petal-fall": {
    title: "Petal Fall Checklist",
    sections: [
      {
        heading: "Key Spray Window",
        items: [
          "Apply codling moth insecticide at petal fall",
          "Apply plum curculio insecticide",
          "Continue scab fungicide program",
          "First calcium chloride foliar spray (Honeycrisp)",
        ],
      },
      {
        heading: "Pest Monitoring",
        items: [
          "Set codling moth pheromone traps (2-3 per block)",
          "Begin fruit damage scouting",
          "Monitor for leafminer damage",
        ],
      },
      {
        heading: "Thinning",
        items: [
          "Chemical thinning at 8-12mm fruit size",
          "Assess fruit set before thinning",
          "Plan follow-up hand thinning",
        ],
      },
    ],
  },
  "fruit-set": {
    title: "Fruit Development Checklist",
    sections: [
      {
        heading: "Pest Management",
        items: [
          "Continue codling moth spray program based on DD",
          "Scout for plum curculio damage",
          "Monitor mite populations (threshold: 5 per leaf)",
          "Watch for apple maggot flies (starting late June)",
        ],
      },
      {
        heading: "Disease Management",
        items: [
          "Continue summer fungicide program",
          "Scout for fire blight shoot blight",
          "Watch for sooty blotch and flyspeck after June",
        ],
      },
      {
        heading: "Crop Management",
        items: [
          "Hand thin to target crop load",
          "Continue calcium chloride sprays every 10-14 days",
          "Monitor fruit size and adjust irrigation",
          "Begin summer pruning if needed",
        ],
      },
    ],
  },
}

// Human-readable labels for bloom stages
const STAGE_LABELS: Record<string, string> = {
  dormant: "Dormant",
  "silver-tip": "Silver Tip",
  "green-tip": "Green Tip",
  "tight-cluster": "Tight Cluster",
  pink: "Pink",
  bloom: "Bloom",
  "petal-fall": "Petal Fall",
  "fruit-set": "Fruit Set",
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ChecklistPage() {
  const orchard = getOrchard()

  if (!orchard) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-page-title mb-2">Seasonal Checklist</h1>
        <p className="text-muted-foreground max-w-md">
          No orchard configured yet. Go to Settings to set up your orchard
          location and start monitoring.
        </p>
      </div>
    )
  }

  const bloomStage = orchard.bloom_stage
  const checklist = CHECKLISTS[bloomStage]

  if (!checklist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>
            Seasonal Checklist
          </h1>
          <p className="text-[14px] text-bark-400">
            No checklist available for the current bloom stage.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>
          {checklist.title}
        </h1>
        <p className="text-[14px] text-bark-400">
          Current stage: {STAGE_LABELS[bloomStage] ?? bloomStage}
        </p>
      </div>

      {/* Checklist sections */}
      {checklist.sections.map((section) => (
        <div
          key={section.heading}
          className="rounded-xl border border-border bg-card card-shadow"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <CheckSquare className="size-4 text-grove-600" />
            <h2 className="text-[15px] font-semibold text-bark-900">
              {section.heading}
            </h2>
          </div>
          <ul className="divide-y divide-earth-200">
            {section.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 px-5 py-3"
              >
                <span className="mt-0.5 text-bark-400">&square;</span>
                <span className="text-[14px] leading-[1.6] text-bark-600">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
