"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DualUnitInput } from "@/components/ui/dual-unit-input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  MapPin,
  Flower2,
  ShieldAlert,
  CloudSun,
  Bell,
  Droplets,
  Users,
  Database,
  Check,
  AlertCircle,
  Loader2,
  X,
  Plus,
  LocateFixed,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrchardData {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation_m: number
  primary_varieties: string[]
  rootstock: string
  fire_blight_history: "none" | "nearby" | "in_orchard"
  bloom_stage: string
  petal_fall_date: string
  codling_moth_biofix_date: string
}

interface BlockPlanting {
  id: number
  block_id: number
  variety: string
  rootstock: string | null
  tree_count: number | null
  spacing_in_row_m: number | null
  spacing_between_rows_m: number | null
  rows_description: string | null
  planted_year: number | null
  sub_notes: string | null
  created_at: string
}

interface OrchardBlock {
  id: number
  orchard_id: number
  block_name: string
  total_area_ha: number | null
  year_established: number | null
  soil_type: string | null
  irrigation_system: string | null
  notes: string | null
  created_at: string
  plantings: BlockPlanting[]
}

interface IrrigationData {
  enabled: boolean
  soil_type: string
  root_depth_cm: number
  management_allowable_depletion: number
  irrigation_type: string
  irrigation_rate_mm_per_hour: number
  irrigation_system_specs: string | null
  water_cost_per_m3: number
  block_area_ha: number
  available_water_mm: number
}

interface AlertData {
  email: string
  phone: string
  channel: string
  urgentEnabled: boolean
  warningEnabled: boolean
  preparationEnabled: boolean
  quietStart: number
  quietEnd: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOIL_TYPES = [
  { value: "sand", label: "Sand" },
  { value: "loamy-sand", label: "Loamy Sand" },
  { value: "sandy-loam", label: "Sandy Loam" },
  { value: "loam", label: "Loam" },
  { value: "clay-loam", label: "Clay Loam" },
  { value: "clay", label: "Clay" },
] as const

const IRRIGATION_TYPES = [
  { value: "drip", label: "Drip" },
  { value: "micro-sprinkler", label: "Micro-sprinkler" },
  { value: "overhead", label: "Overhead Sprinkler" },
  { value: "travelling-gun", label: "Travelling Gun" },
  { value: "none", label: "None (rain-fed)" },
] as const

const SOIL_AWC: Record<string, number> = {
  sand: 80, "loamy-sand": 100, "sandy-loam": 140, loam: 190, "clay-loam": 190, clay: 190,
}

const SYSTEM_EFF: Record<string, number> = {
  drip: 0.90, "micro-sprinkler": 0.80, overhead: 0.70, "travelling-gun": 0.65, none: 1.0,
}

const BLOOM_STAGES = [
  { value: "dormant", label: "Dormant" },
  { value: "silver-tip", label: "Silver Tip" },
  { value: "green-tip", label: "Green Tip" },
  { value: "tight-cluster", label: "Tight Cluster" },
  { value: "pink", label: "Pink" },
  { value: "bloom", label: "Bloom" },
  { value: "petal-fall", label: "Petal Fall" },
  { value: "fruit-set", label: "Fruit Set" },
] as const

const STAGE_GUIDANCE: Record<string, string> = {
  dormant: "Trees are fully dormant. Most models won\u2019t activate until green tip.",
  "silver-tip": "Buds starting to swell. Apply dormant copper now if planned.",
  "green-tip": "First green tissue exposed \u2014 scab monitoring is now active.",
  "tight-cluster": "Flower buds tightly clustered. Scab and mildew risk increasing.",
  pink: "Buds showing color. Fire blight risk begins. Frost can be severe.",
  bloom: "Flowers open \u2014 highest risk for fire blight. No insecticides (pollinators).",
  "petal-fall": "Key spray window for codling moth, plum curculio, and scab.",
  "fruit-set": "Fruitlets developing. Codling moth DD tracking is critical.",
}

// ---------------------------------------------------------------------------
// Variety & Rootstock data with disease susceptibility traits
// ---------------------------------------------------------------------------

interface VarietyInfo {
  name: string
  season: "early" | "mid" | "late" | "heritage"
  traits: Record<string, "resistant" | "tolerant" | "low" | "moderate" | "susceptible" | "high" | "very_high">
}

interface RootstockInfo {
  name: string
  vigor: "dwarfing" | "semi-dwarfing" | "semi-vigorous" | "vigorous"
  sizePercent: number
  description: string
  traits: Record<string, "resistant" | "tolerant" | "low" | "moderate" | "susceptible" | "high" | "very_susceptible">
}

const APPLE_VARIETIES: VarietyInfo[] = [
  // EARLY SEASON
  { name: "Paula Red", season: "early", traits: { fire_blight: "moderate", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Ginger Gold", season: "early", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "Zestar", season: "early", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Sansa", season: "early", traits: { fire_blight: "low", scab: "moderate", bitter_pit: "low", powdery_mildew: "low" } },
  // MID SEASON
  { name: "Gala", season: "mid", traits: { fire_blight: "high", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low", cedar_apple_rust: "moderate" } },
  { name: "Royal Gala", season: "mid", traits: { fire_blight: "high", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Buckeye Gala", season: "mid", traits: { fire_blight: "high", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Brookfield Gala", season: "mid", traits: { fire_blight: "high", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "McIntosh", season: "mid", traits: { fire_blight: "moderate", scab: "very_high", bitter_pit: "low", powdery_mildew: "susceptible", cedar_apple_rust: "resistant" } },
  { name: "Cortland", season: "mid", traits: { fire_blight: "moderate", scab: "susceptible", bitter_pit: "high", powdery_mildew: "susceptible", cedar_apple_rust: "moderate" } },
  { name: "Empire", season: "mid", traits: { fire_blight: "moderate", scab: "susceptible", bitter_pit: "low", powdery_mildew: "moderate", cedar_apple_rust: "resistant" } },
  { name: "Honeycrisp", season: "mid", traits: { fire_blight: "high", scab: "moderate", bitter_pit: "very_high", powdery_mildew: "low", cedar_apple_rust: "moderate" } },
  { name: "Jonagold", season: "mid", traits: { fire_blight: "susceptible", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "susceptible" } },
  { name: "Spartan", season: "mid", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "low", powdery_mildew: "moderate" } },
  // LATE SEASON
  { name: "Red Delicious", season: "late", traits: { fire_blight: "susceptible", scab: "moderate", bitter_pit: "low", powdery_mildew: "low", cedar_apple_rust: "resistant" } },
  { name: "Golden Delicious", season: "late", traits: { fire_blight: "susceptible", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "moderate" } },
  { name: "Northern Spy", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "high", powdery_mildew: "moderate" } },
  { name: "Idared", season: "late", traits: { fire_blight: "moderate", scab: "susceptible", bitter_pit: "low", powdery_mildew: "susceptible" } },
  { name: "Mutsu/Crispin", season: "late", traits: { fire_blight: "susceptible", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "moderate" } },
  { name: "Fuji", season: "late", traits: { fire_blight: "high", scab: "susceptible", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Braeburn", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "Pink Lady", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "Ambrosia", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "SweeTango", season: "late", traits: { fire_blight: "high", scab: "moderate", bitter_pit: "high", powdery_mildew: "low" } },
  { name: "SnapDragon", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "Envy", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "RubyFrost", season: "late", traits: { fire_blight: "low", scab: "tolerant", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Cosmic Crisp", season: "late", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  // HERITAGE/CIDER
  { name: "Wolf River", season: "heritage", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "low" } },
  { name: "Golden Russet", season: "heritage", traits: { fire_blight: "low", scab: "tolerant", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Roxbury Russet", season: "heritage", traits: { fire_blight: "low", scab: "tolerant", bitter_pit: "low", powdery_mildew: "low" } },
  { name: "Baldwin", season: "heritage", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "moderate", powdery_mildew: "moderate" } },
  { name: "Kingston Black", season: "heritage", traits: { fire_blight: "moderate", scab: "susceptible", bitter_pit: "low", powdery_mildew: "moderate" } },
  { name: "Dabinett", season: "heritage", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "low", powdery_mildew: "moderate" } },
  { name: "Yarlington Mill", season: "heritage", traits: { fire_blight: "moderate", scab: "moderate", bitter_pit: "low", powdery_mildew: "moderate" } },
]

const SEASON_LABELS: Record<string, string> = {
  early: "Early Season",
  mid: "Mid Season",
  late: "Late Season",
  heritage: "Heritage / Cider",
}

const ROOTSTOCK_DATA: RootstockInfo[] = [
  // DWARFING
  { name: "M.27", vigor: "dwarfing", sizePercent: 25, description: "Extremely dwarfing", traits: { fire_blight: "susceptible", phytophthora: "susceptible", woolly_aphid: "susceptible" } },
  { name: "B.9", vigor: "dwarfing", sizePercent: 30, description: "Very dwarfing, cold hardy, fire blight tolerant", traits: { fire_blight: "tolerant", phytophthora: "moderate", woolly_aphid: "moderate" } },
  { name: "M.9", vigor: "dwarfing", sizePercent: 30, description: "Very dwarfing, fire blight susceptible", traits: { fire_blight: "very_susceptible", phytophthora: "susceptible", woolly_aphid: "susceptible" } },
  { name: "G.11", vigor: "dwarfing", sizePercent: 35, description: "Dwarfing, fire blight resistant", traits: { fire_blight: "resistant", phytophthora: "tolerant", woolly_aphid: "resistant" } },
  { name: "G.41", vigor: "dwarfing", sizePercent: 35, description: "Dwarfing, fire blight resistant, replant tolerant", traits: { fire_blight: "resistant", phytophthora: "tolerant", woolly_aphid: "resistant" } },
  // SEMI-DWARFING
  { name: "M.26", vigor: "semi-dwarfing", sizePercent: 40, description: "Semi-dwarf, fire blight susceptible", traits: { fire_blight: "susceptible", phytophthora: "susceptible", woolly_aphid: "susceptible" } },
  { name: "G.935", vigor: "semi-dwarfing", sizePercent: 50, description: "Semi-dwarf, fire blight resistant", traits: { fire_blight: "resistant", phytophthora: "tolerant", woolly_aphid: "resistant" } },
  { name: "G.214", vigor: "semi-dwarfing", sizePercent: 50, description: "Semi-dwarf", traits: { fire_blight: "resistant", phytophthora: "tolerant", woolly_aphid: "resistant" } },
  // SEMI-VIGOROUS
  { name: "MM.106", vigor: "semi-vigorous", sizePercent: 65, description: "Semi-vigorous, susceptible to collar rot", traits: { fire_blight: "moderate", phytophthora: "very_susceptible", woolly_aphid: "moderate" } },
  { name: "M.7", vigor: "semi-vigorous", sizePercent: 65, description: "Semi-vigorous", traits: { fire_blight: "moderate", phytophthora: "moderate", woolly_aphid: "susceptible" } },
  { name: "G.890", vigor: "semi-vigorous", sizePercent: 70, description: "Semi-vigorous, fire blight resistant", traits: { fire_blight: "resistant", phytophthora: "tolerant", woolly_aphid: "resistant" } },
  // VIGOROUS
  { name: "MM.111", vigor: "vigorous", sizePercent: 80, description: "Vigorous", traits: { fire_blight: "moderate", phytophthora: "moderate", woolly_aphid: "moderate" } },
  { name: "M.25", vigor: "vigorous", sizePercent: 90, description: "Vigorous", traits: { fire_blight: "moderate", phytophthora: "moderate", woolly_aphid: "moderate" } },
  { name: "Antonovka", vigor: "vigorous", sizePercent: 100, description: "Seedling, very cold hardy", traits: { fire_blight: "moderate", phytophthora: "tolerant", woolly_aphid: "moderate" } },
  { name: "Standard seedling", vigor: "vigorous", sizePercent: 100, description: "Full size", traits: { fire_blight: "moderate", phytophthora: "moderate", woolly_aphid: "moderate" } },
]

const VIGOR_LABELS: Record<string, string> = {
  dwarfing: "Dwarfing",
  "semi-dwarfing": "Semi-Dwarfing",
  "semi-vigorous": "Semi-Vigorous",
  vigorous: "Vigorous",
}

const TRAIT_LABELS: Record<string, string> = {
  fire_blight: "Fire Blight",
  scab: "Apple Scab",
  bitter_pit: "Bitter Pit",
  powdery_mildew: "Powdery Mildew",
  cedar_apple_rust: "Cedar Apple Rust",
  phytophthora: "Phytophthora",
  woolly_aphid: "Woolly Apple Aphid",
}

const TRAIT_COLORS: Record<string, string> = {
  resistant: "bg-emerald-500/15 text-emerald-400",
  tolerant: "bg-emerald-500/15 text-emerald-400",
  low: "bg-emerald-500/15 text-emerald-400",
  moderate: "bg-yellow-500/15 text-yellow-400",
  susceptible: "bg-orange-500/15 text-orange-400",
  high: "bg-red-500/15 text-red-400",
  very_high: "bg-red-500/15 text-red-400",
  very_susceptible: "bg-red-500/15 text-red-400",
}

const TRAIT_ICONS: Record<string, string> = {
  resistant: "\u2705",
  tolerant: "\u2705",
  low: "\u2705",
  moderate: "\u26A0\uFE0F",
  susceptible: "\u26A0\uFE0F",
  high: "\u26A0\uFE0F",
  very_high: "\u{1F6A8}",
  very_susceptible: "\u{1F6A8}",
}

const FIRE_BLIGHT_OPTIONS = [
  {
    value: "none" as const,
    label: "None",
    description: "No fire blight observed in or near your orchard last season.",
    color: "text-primary",
    bgActive: "bg-primary/10 ring-primary",
  },
  {
    value: "nearby" as const,
    label: "Nearby",
    description: "Fire blight reported in orchards within a few km. Bacteria may spread via insects or wind-driven rain.",
    color: "text-risk-moderate",
    bgActive: "bg-yellow-500/10 ring-yellow-500",
  },
  {
    value: "in_orchard" as const,
    label: "In Orchard",
    description: "Active cankers in your trees. Lower alert thresholds and more aggressive spray recommendations.",
    color: "text-risk-high",
    bgActive: "bg-red-500/10 ring-red-500",
  },
]

const TAB_SECTIONS = [
  { value: "profile", label: "Orchard Profile", icon: MapPin },
  { value: "phenology", label: "Phenology", icon: Flower2 },
  { value: "disease", label: "Disease History", icon: ShieldAlert },
  { value: "weather", label: "Weather", icon: CloudSun },
  { value: "irrigation", label: "Irrigation", icon: Droplets },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "workers", label: "Workers", icon: Users },
  { value: "data", label: "Data & Backup", icon: Database },
] as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BloomStagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const currentIdx = BLOOM_STAGES.findIndex((s) => s.value === value)

  return (
    <div>
      <div className="flex items-center mb-3">
        {BLOOM_STAGES.map((s, idx) => {
          const isCurrent = idx === currentIdx
          const isPast = idx < currentIdx
          return (
            <div key={s.value} className="contents">
              <button
                type="button"
                onClick={() => onChange(s.value)}
                className="relative z-[2] shrink-0 cursor-pointer"
                title={s.label}
              >
                <div
                  className={cn(
                    "rounded-full transition-all",
                    isCurrent ? "size-3.5 bg-primary" : isPast ? "size-2.5 bg-bark-400" : "size-2.5 bg-bark-300",
                  )}
                  style={isCurrent ? { boxShadow: "0 0 16px rgba(34,197,94,0.3), 0 0 4px #22C55E" } : undefined}
                />
              </button>
              {idx < BLOOM_STAGES.length - 1 && (
                <div
                  className={cn("flex-1 h-0.5 relative z-[1]", idx < currentIdx ? "bg-primary/40" : "bg-border")}
                  style={idx < currentIdx ? { boxShadow: "0 0 8px rgba(34,197,94,0.2)" } : undefined}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mb-3">
        {BLOOM_STAGES.map((s, idx) => (
          <span
            key={s.value}
            className={cn(
              "text-[10px] tracking-[0.3px]",
              idx === 0 ? "text-left" : idx === BLOOM_STAGES.length - 1 ? "text-right" : "text-center flex-1",
              idx === currentIdx ? "text-primary font-semibold text-[11px]" : "text-bark-300",
              idx === 0 || idx === BLOOM_STAGES.length - 1 ? "" : "hidden sm:block",
            )}
          >
            {s.label}
          </span>
        ))}
      </div>
      {STAGE_GUIDANCE[value] && (
        <p className="text-[13px] leading-[1.65] text-bark-400">{STAGE_GUIDANCE[value]}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Searchable Combobox — reusable for variety and rootstock pickers
// ---------------------------------------------------------------------------

function SearchableCombobox({
  value,
  onChange,
  placeholder,
  groups,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  groups: { label: string; items: { value: string; description?: string }[] }[]
}) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const query = search.toLowerCase()
  const filtered = groups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.value.toLowerCase().includes(query) ||
          (i.description && i.description.toLowerCase().includes(query))
      ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={open ? search : value}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
            setSearch("")
          }}
          placeholder={placeholder}
          className="pr-8"
        />
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
      {open && (
        <div
          className="absolute z-[200] mt-1 w-full max-h-64 overflow-y-auto rounded-lg border text-sm"
          style={{
            background: "#18181B",
            border: "1px solid #27272A",
            boxShadow: "0 10px 38px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.4)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-muted-foreground text-[13px]">
              No matches. Type a custom value and press Enter.
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.label}>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-[#18181B]">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors",
                      value === item.value && "bg-primary/10 text-primary",
                    )}
                    onClick={() => {
                      onChange(item.value)
                      setSearch("")
                      setOpen(false)
                    }}
                  >
                    <div className="text-[13px]">{item.value}</div>
                    {item.description && (
                      <div className="text-[11px] text-muted-foreground">{item.description}</div>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
          {search.trim() && !APPLE_VARIETIES.some((v) => v.name.toLowerCase() === query) && !ROOTSTOCK_DATA.some((r) => r.name.toLowerCase() === query) && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 cursor-pointer hover:bg-white/5 border-t border-zinc-800 text-[13px] text-primary"
              onClick={() => {
                onChange(search.trim())
                setSearch("")
                setOpen(false)
              }}
            >
              Use &ldquo;{search.trim()}&rdquo; as custom value
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block Manager — blocks contain multiple plantings (variety + rootstock)
// ---------------------------------------------------------------------------

const BLOCK_SOIL_TYPES = [
  { value: "sand", label: "Sand" },
  { value: "loamy-sand", label: "Loamy Sand" },
  { value: "sandy-loam", label: "Sandy Loam" },
  { value: "loam", label: "Loam" },
  { value: "clay-loam", label: "Clay Loam" },
  { value: "clay", label: "Clay" },
] as const

const BLOCK_IRRIGATION_TYPES = [
  { value: "drip", label: "Drip" },
  { value: "micro-sprinkler", label: "Micro-sprinkler" },
  { value: "overhead", label: "Overhead" },
  { value: "none", label: "None (rain-fed)" },
] as const

function getPlantingTraits(planting: BlockPlanting) {
  const traits: { label: string; level: string; icon: string }[] = []
  const varietyInfo = APPLE_VARIETIES.find((v) => v.name === planting.variety)
  const rootstockInfo = ROOTSTOCK_DATA.find((r) => r.name === planting.rootstock)

  if (varietyInfo) {
    for (const [key, level] of Object.entries(varietyInfo.traits)) {
      if (level === "high" || level === "very_high" || level === "susceptible") {
        traits.push({ label: TRAIT_LABELS[key] ?? key, level, icon: TRAIT_ICONS[level] ?? "" })
      }
    }
  }
  if (rootstockInfo) {
    for (const [key, level] of Object.entries(rootstockInfo.traits)) {
      if (level === "very_susceptible" || level === "susceptible") {
        traits.push({ label: `${TRAIT_LABELS[key] ?? key}`, level, icon: TRAIT_ICONS[level] ?? "" })
      }
      if (level === "resistant" || level === "tolerant") {
        traits.push({ label: `${TRAIT_LABELS[key] ?? key}`, level, icon: TRAIT_ICONS[level] ?? "" })
      }
    }
  }

  const order: Record<string, number> = { very_high: 0, very_susceptible: 0, susceptible: 1, high: 1, moderate: 2, tolerant: 3, resistant: 4, low: 5 }
  traits.sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3))
  return traits.slice(0, 4)
}

const VARIETY_GROUPS = (["early", "mid", "late", "heritage"] as const).map((season) => ({
  label: SEASON_LABELS[season],
  items: APPLE_VARIETIES.filter((v) => v.season === season).map((v) => ({
    value: v.name,
    description: Object.entries(v.traits)
      .filter(([, level]) => level === "high" || level === "very_high" || level === "susceptible")
      .map(([key]) => TRAIT_LABELS[key])
      .join(", ") || undefined,
  })),
}))

const ROOTSTOCK_GROUPS = (["dwarfing", "semi-dwarfing", "semi-vigorous", "vigorous"] as const).map((vigor) => ({
  label: VIGOR_LABELS[vigor],
  items: ROOTSTOCK_DATA.filter((r) => r.vigor === vigor).map((r) => ({
    value: r.name,
    description: `${r.sizePercent}% standard size \u2014 ${r.description}`,
  })),
}))

function BlockManager({ orchardId, initialBlocks }: { orchardId: number; initialBlocks: OrchardBlock[] }) {
  const [blocks, setBlocks] = useState<OrchardBlock[]>(initialBlocks)

  // Block dialog state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<OrchardBlock | null>(null)
  const [blockSaving, setBlockSaving] = useState(false)
  const [blockName, setBlockName] = useState("")
  const [totalAreaHa, setTotalAreaHa] = useState("")
  const [yearEstablished, setYearEstablished] = useState("")
  const [blockSoilType, setBlockSoilType] = useState("")
  const [blockIrrigation, setBlockIrrigation] = useState("")
  const [blockNotes, setBlockNotes] = useState("")

  // Planting dialog state
  const [plantingDialogOpen, setPlantingDialogOpen] = useState(false)
  const [plantingBlockId, setPlantingBlockId] = useState<number | null>(null)
  const [editingPlanting, setEditingPlanting] = useState<BlockPlanting | null>(null)
  const [plantingSaving, setPlantingSaving] = useState(false)
  const [variety, setVariety] = useState("")
  const [rootstock, setRootstock] = useState("")
  const [treeCount, setTreeCount] = useState("")
  const [spacingInRow, setSpacingInRow] = useState("")
  const [spacingBetweenRows, setSpacingBetweenRows] = useState("")
  const [rowsDescription, setRowsDescription] = useState("")
  const [plantedYear, setPlantedYear] = useState("")
  const [subNotes, setSubNotes] = useState("")

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expanded blocks
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(() => new Set(initialBlocks.map((b) => b.id)))

  function toggleExpand(id: number) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // Block form helpers
  function resetBlockForm() {
    setBlockName("")
    setTotalAreaHa("")
    setYearEstablished("")
    setBlockSoilType("")
    setBlockIrrigation("")
    setBlockNotes("")
    setEditingBlock(null)
  }

  function openAddBlock() {
    resetBlockForm()
    setBlockDialogOpen(true)
  }

  function openEditBlock(block: OrchardBlock) {
    setEditingBlock(block)
    setBlockName(block.block_name)
    setTotalAreaHa(block.total_area_ha ? String(block.total_area_ha) : "")
    setYearEstablished(block.year_established ? String(block.year_established) : "")
    setBlockSoilType(block.soil_type ?? "")
    setBlockIrrigation(block.irrigation_system ?? "")
    setBlockNotes(block.notes ?? "")
    setBlockDialogOpen(true)
  }

  async function handleSaveBlock() {
    if (!blockName.trim()) return
    setBlockSaving(true)
    try {
      const payload = {
        orchardId,
        blockName: blockName.trim(),
        totalAreaHa: totalAreaHa ? parseFloat(totalAreaHa) : null,
        yearEstablished: yearEstablished ? parseInt(yearEstablished) : null,
        soilType: blockSoilType || null,
        irrigationSystem: blockIrrigation || null,
        notes: blockNotes.trim() || null,
      }

      if (editingBlock) {
        const res = await fetch("/api/orchard/blocks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBlock.id, ...payload }),
        })
        if (!res.ok) throw new Error("Failed to update block")
        const data = await res.json()
        setBlocks((prev) => prev.map((b) => (b.id === editingBlock.id ? data.block : b)))
      } else {
        const res = await fetch("/api/orchard/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to create block")
        const data = await res.json()
        setBlocks((prev) => [...prev, data.block])
        setExpandedBlocks((prev) => new Set([...prev, data.block.id]))
      }
      setBlockDialogOpen(false)
      resetBlockForm()
    } catch (err) {
      console.error(err)
    } finally {
      setBlockSaving(false)
    }
  }

  // Planting form helpers
  function resetPlantingForm() {
    setVariety("")
    setRootstock("")
    setTreeCount("")
    setSpacingInRow("")
    setSpacingBetweenRows("")
    setRowsDescription("")
    setPlantedYear("")
    setSubNotes("")
    setEditingPlanting(null)
    setPlantingBlockId(null)
  }

  function openAddPlanting(blockId: number) {
    resetPlantingForm()
    setPlantingBlockId(blockId)
    setPlantingDialogOpen(true)
  }

  function openEditPlanting(planting: BlockPlanting) {
    setEditingPlanting(planting)
    setPlantingBlockId(planting.block_id)
    setVariety(planting.variety)
    setRootstock(planting.rootstock ?? "")
    setTreeCount(planting.tree_count ? String(planting.tree_count) : "")
    setSpacingInRow(planting.spacing_in_row_m ? String(planting.spacing_in_row_m) : "")
    setSpacingBetweenRows(planting.spacing_between_rows_m ? String(planting.spacing_between_rows_m) : "")
    setRowsDescription(planting.rows_description ?? "")
    setPlantedYear(planting.planted_year ? String(planting.planted_year) : "")
    setSubNotes(planting.sub_notes ?? "")
    setPlantingDialogOpen(true)
  }

  async function handleSavePlanting() {
    if (!variety.trim() || !plantingBlockId) return
    setPlantingSaving(true)
    try {
      const payload = {
        blockId: plantingBlockId,
        variety: variety.trim(),
        rootstock: rootstock.trim() || null,
        treeCount: treeCount ? parseInt(treeCount) : null,
        spacingInRowM: spacingInRow ? parseFloat(spacingInRow) : null,
        spacingBetweenRowsM: spacingBetweenRows ? parseFloat(spacingBetweenRows) : null,
        rowsDescription: rowsDescription.trim() || null,
        plantedYear: plantedYear ? parseInt(plantedYear) : null,
        subNotes: subNotes.trim() || null,
      }

      if (editingPlanting) {
        const res = await fetch("/api/orchard/plantings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPlanting.id, ...payload }),
        })
        if (!res.ok) throw new Error("Failed to update planting")
        const data = await res.json()
        setBlocks((prev) => prev.map((b) =>
          b.id === plantingBlockId
            ? { ...b, plantings: b.plantings.map((p) => (p.id === editingPlanting.id ? data.planting : p)) }
            : b
        ))
      } else {
        const res = await fetch("/api/orchard/plantings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to create planting")
        const data = await res.json()
        setBlocks((prev) => prev.map((b) =>
          b.id === plantingBlockId
            ? { ...b, plantings: [...b.plantings, data.planting] }
            : b
        ))
      }
      setPlantingDialogOpen(false)
      resetPlantingForm()
    } catch (err) {
      console.error(err)
    } finally {
      setPlantingSaving(false)
    }
  }

  // Generic delete handler for both blocks and plantings
  function confirmDelete(key: string, action: () => Promise<void>) {
    if (deleteConfirmId !== key) {
      setDeleteConfirmId(key)
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current = setTimeout(() => setDeleteConfirmId(null), 3000)
      return
    }
    setDeleteConfirmId(null)
    action().catch(console.error)
  }

  async function handleDeleteBlock(id: number) {
    const res = await fetch("/api/orchard/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, orchardId }),
    })
    if (!res.ok) throw new Error("Failed to delete block")
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  async function handleDeletePlanting(plantingId: number, blockId: number) {
    const res = await fetch("/api/orchard/plantings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plantingId }),
    })
    if (!res.ok) throw new Error("Failed to delete planting")
    setBlocks((prev) => prev.map((b) =>
      b.id === blockId
        ? { ...b, plantings: b.plantings.filter((p) => p.id !== plantingId) }
        : b
    ))
  }

  return (
    <div className="space-y-3">
      {/* Block cards */}
      {blocks.map((block) => {
        const totalTrees = block.plantings.reduce((sum, p) => sum + (p.tree_count ?? 0), 0)
        const isExpanded = expandedBlocks.has(block.id)

        return (
          <div key={block.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Block header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(block.id)}
                  className="flex items-start gap-2 min-w-0 text-left cursor-pointer"
                >
                  <ChevronDown className={cn("size-4 mt-0.5 shrink-0 transition-transform text-bark-400", isExpanded && "rotate-180")} />
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-foreground">
                      {block.block_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-bark-400 mt-0.5">
                      {block.total_area_ha && <span>{block.total_area_ha}&nbsp;ha ({(block.total_area_ha * 2.47105).toFixed(1)}&nbsp;ac)</span>}
                      {block.soil_type && <span>{BLOCK_SOIL_TYPES.find((s) => s.value === block.soil_type)?.label ?? block.soil_type}</span>}
                      {block.irrigation_system && <span>{BLOCK_IRRIGATION_TYPES.find((t) => t.value === block.irrigation_system)?.label ?? block.irrigation_system}</span>}
                      {block.year_established && <span>Est. {block.year_established}</span>}
                    </div>
                    <p className="text-[12px] text-bark-400 mt-0.5">
                      {block.plantings.length} {block.plantings.length === 1 ? "planting" : "plantings"}
                      {totalTrees > 0 && <> &middot; {totalTrees.toLocaleString()} trees total</>}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditBlock(block)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-bark-400 hover:text-foreground transition-colors cursor-pointer"
                    title="Edit block"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(`block-${block.id}`, () => handleDeleteBlock(block.id))}
                    className={cn(
                      "p-1.5 rounded-md transition-colors cursor-pointer",
                      deleteConfirmId === `block-${block.id}`
                        ? "bg-red-500/20 text-red-400"
                        : "hover:bg-white/5 text-bark-400 hover:text-foreground",
                    )}
                    title={deleteConfirmId === `block-${block.id}` ? "Click again to confirm" : "Delete block"}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {block.notes && (
                <p className="text-[12px] text-bark-400 italic mt-1.5 ml-6">{block.notes}</p>
              )}
            </div>

            {/* Plantings list (expanded) */}
            {isExpanded && (
              <div className="border-t border-border">
                {block.plantings.map((planting) => {
                  const traits = getPlantingTraits(planting)
                  return (
                    <div key={planting.id} className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-2 ml-6">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground">
                            {planting.variety}
                            {planting.rootstock && <span className="text-bark-400 font-normal"> / {planting.rootstock}</span>}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-bark-400 mt-0.5">
                            {planting.tree_count && <span>{planting.tree_count.toLocaleString()} trees</span>}
                            {planting.rows_description && <span>{planting.rows_description}</span>}
                            {planting.planted_year && <span>Planted {planting.planted_year}</span>}
                            {planting.spacing_in_row_m && planting.spacing_between_rows_m && (
                              <span>{planting.spacing_in_row_m}&nbsp;m &times; {planting.spacing_between_rows_m}&nbsp;m ({(planting.spacing_in_row_m * 3.28084).toFixed(1)}&nbsp;ft &times; {(planting.spacing_between_rows_m * 3.28084).toFixed(1)}&nbsp;ft)</span>
                            )}
                          </div>
                          {traits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {traits.map((t, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium",
                                    TRAIT_COLORS[t.level] ?? "bg-zinc-500/15 text-zinc-400",
                                  )}
                                >
                                  {t.icon} {t.label}
                                </span>
                              ))}
                            </div>
                          )}
                          {planting.sub_notes && (
                            <p className="text-[11px] text-bark-400 italic mt-1">{planting.sub_notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditPlanting(planting)}
                            className="p-1 rounded-md hover:bg-white/5 text-bark-400 hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(`planting-${planting.id}`, () => handleDeletePlanting(planting.id, block.id))}
                            className={cn(
                              "p-1 rounded-md transition-colors cursor-pointer",
                              deleteConfirmId === `planting-${planting.id}`
                                ? "bg-red-500/20 text-red-400"
                                : "hover:bg-white/5 text-bark-400 hover:text-foreground",
                            )}
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Add Planting button inside block */}
                <div className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => openAddPlanting(block.id)}
                    className="ml-6 inline-flex items-center gap-1.5 text-[12px] text-bark-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Planting
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add block button */}
      <button
        type="button"
        onClick={openAddBlock}
        className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-transparent p-4 flex items-center justify-center gap-2 text-[13px] text-bark-400 hover:text-primary transition-colors cursor-pointer"
      >
        <Plus className="size-4" />
        Add Block
      </button>

      {/* Block form dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={(open) => { if (!open) resetBlockForm(); setBlockDialogOpen(open) }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlock ? "Edit Block" : "Add Block"}</DialogTitle>
            <DialogDescription>
              A block is a physical area of your orchard. Add plantings inside it after creating.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Block Name <span className="text-red-400">*</span></Label>
              <Input
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder='e.g. "North Block", "Block A"'
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Total Area</Label>
                <DualUnitInput
                  value={totalAreaHa}
                  unitType="area"
                  onChange={setTotalAreaHa}
                  placeholder="e.g. 2.4 ha or 5.9 ac"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Year Established</Label>
                <Input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={yearEstablished}
                  onChange={(e) => setYearEstablished(e.target.value)}
                  placeholder="e.g. 2015"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Soil Type</Label>
                <Select value={blockSoilType} onValueChange={(v) => v && setBlockSoilType(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select soil..." /></SelectTrigger>
                  <SelectContent>
                    {BLOCK_SOIL_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Irrigation</Label>
                <Select value={blockIrrigation} onValueChange={(v) => v && setBlockIrrigation(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {BLOCK_IRRIGATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value)}
                placeholder="Optional notes about this block"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetBlockForm(); setBlockDialogOpen(false) }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBlock} disabled={blockSaving || !blockName.trim()}>
              {blockSaving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingBlock ? "Update Block" : "Add Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Planting form dialog */}
      <Dialog open={plantingDialogOpen} onOpenChange={(open) => { if (!open) resetPlantingForm(); setPlantingDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlanting ? "Edit Planting" : "Add Planting"}</DialogTitle>
            <DialogDescription>
              A planting is a variety + rootstock combination within a block.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Variety <span className="text-red-400">*</span></Label>
              <SearchableCombobox
                value={variety}
                onChange={setVariety}
                placeholder="Search varieties..."
                groups={VARIETY_GROUPS}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rootstock</Label>
              <SearchableCombobox
                value={rootstock}
                onChange={setRootstock}
                placeholder="Search rootstocks..."
                groups={ROOTSTOCK_GROUPS}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tree Count</Label>
                <Input type="number" min={1} value={treeCount} onChange={(e) => setTreeCount(e.target.value)} placeholder="e.g. 1200" />
              </div>
              <div className="space-y-1.5">
                <Label>Year Planted</Label>
                <Input type="number" min={1900} max={new Date().getFullYear()} value={plantedYear} onChange={(e) => setPlantedYear(e.target.value)} placeholder="e.g. 2018" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Spacing In Row</Label>
                <DualUnitInput value={spacingInRow} unitType="length" onChange={setSpacingInRow} placeholder="e.g. 1.0 m or 3.3 ft" />
              </div>
              <div className="space-y-1.5">
                <Label>Between Rows</Label>
                <DualUnitInput value={spacingBetweenRows} unitType="length" onChange={setSpacingBetweenRows} placeholder="e.g. 4.0 m or 13 ft" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Rows</Label>
              <Input
                value={rowsDescription}
                onChange={(e) => setRowsDescription(e.target.value)}
                placeholder='e.g. "rows 1-12", "south end"'
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={subNotes}
                onChange={(e) => setSubNotes(e.target.value)}
                placeholder="Optional notes about this planting"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetPlantingForm(); setPlantingDialogOpen(false) }}>
              Cancel
            </Button>
            <Button onClick={handleSavePlanting} disabled={plantingSaving || !variety.trim()}>
              {plantingSaving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingPlanting ? "Update Planting" : "Add Planting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FireBlightHistoryPicker({
  value,
  onChange,
}: {
  value: "none" | "nearby" | "in_orchard"
  onChange: (v: "none" | "nearby" | "in_orchard") => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {FIRE_BLIGHT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
            value === opt.value
              ? `${opt.bgActive} ring-2`
              : "border-border bg-card hover:border-bark-400",
          )}
        >
          <p className={cn("text-[14px] font-semibold mb-1", value === opt.value ? opt.color : "text-bark-900")}>
            {opt.label}
          </p>
          <p className="text-[12px] leading-[1.5] text-bark-400">{opt.description}</p>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Form
// ---------------------------------------------------------------------------

export function SettingsForm({
  initialData,
  irrigationData,
  alertData,
  initialBlocks = [],
}: {
  initialData: OrchardData
  irrigationData?: IrrigationData | null
  alertData?: AlertData | null
  initialBlocks?: OrchardBlock[]
}) {
  const router = useRouter()

  // ── Debug: log what the server component passed as props ──
  useEffect(() => {
    console.log("[SettingsForm] mounted with props:", {
      initialData: { id: initialData.id, name: initialData.name },
      irrigationData: irrigationData ? { type: irrigationData.irrigation_type, rate: irrigationData.irrigation_rate_mm_per_hour, enabled: irrigationData.enabled } : null,
      alertData: alertData ? { email: alertData.email, channel: alertData.channel } : null,
      blocksCount: initialBlocks.length,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Responsive tabs ──
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // ── Orchard state ──
  const [name, setName] = useState(initialData.name)
  const [latitude, setLatitude] = useState(String(initialData.latitude))
  const [longitude, setLongitude] = useState(String(initialData.longitude))
  const [elevation, setElevation] = useState(String(initialData.elevation_m))
  const [fireBlightHistory, setFireBlightHistory] = useState(initialData.fire_blight_history)
  const [bloomStage, setBloomStage] = useState(initialData.bloom_stage)
  const [petalFallDate, setPetalFallDate] = useState(initialData.petal_fall_date)
  const [codlingMothBiofix, setCodlingMothBiofix] = useState(initialData.codling_moth_biofix_date)

  // ── Geolocation ──
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser")
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
        if (pos.coords.altitude != null) {
          setElevation(String(Math.round(pos.coords.altitude)))
        }
        setGeoLoading(false)
      },
      (err) => {
        setGeoError(err.message)
        setGeoLoading(false)
      },
    )
  }

  // ── Irrigation state ──
  const [irrigEnabled, setIrrigEnabled] = useState(irrigationData?.enabled ?? false)
  const [soilType, setSoilType] = useState(irrigationData?.soil_type ?? "loam")
  const [rootDepth, setRootDepth] = useState(String(irrigationData?.root_depth_cm ?? 60))
  const [mad, setMad] = useState(String((irrigationData?.management_allowable_depletion ?? 0.5) * 100))
  const [irrigType, setIrrigType] = useState(irrigationData?.irrigation_type ?? "none")
  const [irrigRate, setIrrigRate] = useState(String(irrigationData?.irrigation_rate_mm_per_hour ?? 4))
  const [waterCost, setWaterCost] = useState(String(irrigationData?.water_cost_per_m3 ?? 0.06))
  const [blockArea, setBlockArea] = useState(String(irrigationData?.block_area_ha ?? 1.0))

  // Hardware specs — parsed from JSON on load
  const initSpecs = useMemo(() => {
    try { return irrigationData?.irrigation_system_specs ? JSON.parse(irrigationData.irrigation_system_specs) : {} }
    catch { return {} }
  }, [irrigationData?.irrigation_system_specs])

  // Drip
  const [dripEmitterFlow, setDripEmitterFlow] = useState(String(initSpecs.emitter_flow_rate_lph ?? ""))
  const [dripEmitterSpacing, setDripEmitterSpacing] = useState(String(initSpecs.emitter_spacing_cm ?? ""))
  const [dripLinesPerRow, setDripLinesPerRow] = useState(String(initSpecs.drip_lines_per_row ?? "1"))
  const [dripRowLength, setDripRowLength] = useState(String(initSpecs.row_length_m ?? ""))
  const [dripNumRows, setDripNumRows] = useState(String(initSpecs.num_rows ?? ""))
  const [dripRowSpacing, setDripRowSpacing] = useState(String(initSpecs.row_spacing_m ?? ""))

  // Micro-sprinkler
  const [microFlowRate, setMicroFlowRate] = useState(String(initSpecs.sprinkler_flow_rate_lph ?? ""))
  const [microTreesPerSprinkler, setMicroTreesPerSprinkler] = useState(String(initSpecs.trees_per_sprinkler ?? "1"))
  const [microWettedDiam, setMicroWettedDiam] = useState(String(initSpecs.wetted_diameter_m ?? ""))
  const [microTreeSpacing, setMicroTreeSpacing] = useState(String(initSpecs.tree_spacing_m ?? ""))
  const [microRowSpacing, setMicroRowSpacing] = useState(String(initSpecs.row_spacing_m ?? ""))
  const [microNumTrees, setMicroNumTrees] = useState(String(initSpecs.num_trees ?? ""))

  // Overhead
  const [overheadModel, setOverheadModel] = useState(String(initSpecs.sprinkler_model ?? ""))
  const [overheadFlowRate, setOverheadFlowRate] = useState(String(initSpecs.flow_rate_per_head_lpm ?? ""))
  const [overheadHeadSpacing, setOverheadHeadSpacing] = useState(String(initSpecs.head_spacing_m ?? ""))
  const [overheadLateralSpacing, setOverheadLateralSpacing] = useState(String(initSpecs.lateral_spacing_m ?? ""))
  const [overheadPressure, setOverheadPressure] = useState(String(initSpecs.operating_pressure_kpa ?? ""))
  const [overheadFrostProtection, setOverheadFrostProtection] = useState(initSpecs.frost_protection ?? false)

  // Travelling gun
  const [gunFlowRate, setGunFlowRate] = useState(String(initSpecs.flow_rate_lpm ?? ""))
  const [gunLaneSpacing, setGunLaneSpacing] = useState(String(initSpecs.lane_spacing_m ?? ""))
  const [gunTravelSpeed, setGunTravelSpeed] = useState(String(initSpecs.travel_speed_m_per_hr ?? ""))
  const [gunWettedWidth, setGunWettedWidth] = useState(String(initSpecs.wetted_width_m ?? ""))

  // Auto-calculate precipitation rate from hardware specs
  type DripCalc = { type: "drip"; precipRate: number; emittersPerRow: number; totalEmitters: number; totalFlowLph: number; blockAreaM2: number }
  type MicroCalc = { type: "micro"; precipRate: number; numSprinklers: number; totalFlowLph: number }
  type SimpleCalc = { type: "simple"; precipRate: number }
  type CalcResult = DripCalc | MicroCalc | SimpleCalc

  const calculatedRate: CalcResult | null = useMemo(() => {
    if (irrigType === "drip") {
      const flow = parseFloat(dripEmitterFlow)
      const spacing = parseFloat(dripEmitterSpacing) / 100 // cm → m
      const lines = parseInt(dripLinesPerRow) || 1
      const rowLen = parseFloat(dripRowLength)
      const rows = parseInt(dripNumRows)
      const rowSpc = parseFloat(dripRowSpacing)
      if (!flow || !spacing || !rowLen || !rows || !rowSpc) return null
      const emittersPerRow = Math.floor(rowLen / spacing) * lines
      const totalEmitters = emittersPerRow * rows
      const totalFlowLph = totalEmitters * flow
      const blockAreaM2 = rowLen * rowSpc * rows
      const precipRate = totalFlowLph / blockAreaM2
      return { type: "drip", precipRate, emittersPerRow, totalEmitters, totalFlowLph, blockAreaM2 }
    }
    if (irrigType === "micro-sprinkler") {
      const flow = parseFloat(microFlowRate)
      const treesPerSpr = parseInt(microTreesPerSprinkler) || 1
      const treeSpc = parseFloat(microTreeSpacing)
      const rowSpc = parseFloat(microRowSpacing)
      const numTrees = parseInt(microNumTrees)
      if (!flow || !treeSpc || !rowSpc) return null
      const precipRate = flow / (treeSpc * rowSpc * treesPerSpr)
      const numSprinklers = numTrees ? Math.ceil(numTrees / treesPerSpr) : 0
      const totalFlowLph = numSprinklers * flow
      return { type: "micro", precipRate, numSprinklers, totalFlowLph }
    }
    if (irrigType === "overhead") {
      const flowLpm = parseFloat(overheadFlowRate)
      const headSpc = parseFloat(overheadHeadSpacing)
      const latSpc = parseFloat(overheadLateralSpacing)
      if (!flowLpm || !headSpc || !latSpc) return null
      const precipRate = (flowLpm * 60) / (headSpc * latSpc)
      return { type: "simple", precipRate }
    }
    if (irrigType === "travelling-gun") {
      const flowLpm = parseFloat(gunFlowRate)
      const laneSpc = parseFloat(gunLaneSpacing)
      const speed = parseFloat(gunTravelSpeed)
      if (!flowLpm || !laneSpc || !speed) return null
      const precipRate = (flowLpm * 60) / (laneSpc * speed)
      return { type: "simple", precipRate }
    }
    return null
  }, [
    irrigType,
    dripEmitterFlow, dripEmitterSpacing, dripLinesPerRow, dripRowLength, dripNumRows, dripRowSpacing,
    microFlowRate, microTreesPerSprinkler, microTreeSpacing, microRowSpacing, microNumTrees,
    overheadFlowRate, overheadHeadSpacing, overheadLateralSpacing,
    gunFlowRate, gunLaneSpacing, gunTravelSpeed,
  ])

  // Sync calculated rate → irrigRate when hardware specs produce a valid result
  useEffect(() => {
    if (calculatedRate?.precipRate && irrigType !== "none") {
      const rounded = String(Math.round(calculatedRate.precipRate * 100) / 100)
      if (rounded !== irrigRate) setIrrigRate(rounded)
    }
  }, [calculatedRate?.precipRate, irrigType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build specs JSON for saving
  const specsJson = useMemo(() => {
    if (irrigType === "drip") {
      return JSON.stringify({
        emitter_flow_rate_lph: parseFloat(dripEmitterFlow) || 0,
        emitter_spacing_cm: parseFloat(dripEmitterSpacing) || 0,
        drip_lines_per_row: parseInt(dripLinesPerRow) || 1,
        row_length_m: parseFloat(dripRowLength) || 0,
        num_rows: parseInt(dripNumRows) || 0,
        row_spacing_m: parseFloat(dripRowSpacing) || 0,
      })
    }
    if (irrigType === "micro-sprinkler") {
      return JSON.stringify({
        sprinkler_flow_rate_lph: parseFloat(microFlowRate) || 0,
        trees_per_sprinkler: parseInt(microTreesPerSprinkler) || 1,
        wetted_diameter_m: parseFloat(microWettedDiam) || 0,
        tree_spacing_m: parseFloat(microTreeSpacing) || 0,
        row_spacing_m: parseFloat(microRowSpacing) || 0,
        num_trees: parseInt(microNumTrees) || 0,
      })
    }
    if (irrigType === "overhead") {
      return JSON.stringify({
        sprinkler_model: overheadModel,
        flow_rate_per_head_lpm: parseFloat(overheadFlowRate) || 0,
        head_spacing_m: parseFloat(overheadHeadSpacing) || 0,
        lateral_spacing_m: parseFloat(overheadLateralSpacing) || 0,
        operating_pressure_kpa: parseFloat(overheadPressure) || 0,
        frost_protection: overheadFrostProtection,
      })
    }
    if (irrigType === "travelling-gun") {
      return JSON.stringify({
        flow_rate_lpm: parseFloat(gunFlowRate) || 0,
        lane_spacing_m: parseFloat(gunLaneSpacing) || 0,
        travel_speed_m_per_hr: parseFloat(gunTravelSpeed) || 0,
        wetted_width_m: parseFloat(gunWettedWidth) || 0,
      })
    }
    return null
  }, [
    irrigType,
    dripEmitterFlow, dripEmitterSpacing, dripLinesPerRow, dripRowLength, dripNumRows, dripRowSpacing,
    microFlowRate, microTreesPerSprinkler, microWettedDiam, microTreeSpacing, microRowSpacing, microNumTrees,
    overheadModel, overheadFlowRate, overheadHeadSpacing, overheadLateralSpacing, overheadPressure, overheadFrostProtection,
    gunFlowRate, gunLaneSpacing, gunTravelSpeed, gunWettedWidth,
  ])

  const awcPerM = SOIL_AWC[soilType] ?? 190
  const depthM = (parseFloat(rootDepth) || 60) / 100
  const availableWaterMm = Math.round(awcPerM * depthM * 10) / 10
  const triggerMm = Math.round(availableWaterMm * (parseFloat(mad) || 50) / 100 * 10) / 10
  const efficiency = SYSTEM_EFF[irrigType] ?? 1.0

  // ── Alert state ──
  const [alertEmail, setAlertEmail] = useState(alertData?.email ?? "")
  const [alertPhone, setAlertPhone] = useState(alertData?.phone ?? "")
  const [alertChannel, setAlertChannel] = useState(alertData?.channel ?? "email")
  const [urgentEnabled, setUrgentEnabled] = useState(alertData?.urgentEnabled ?? true)
  const [warningEnabled, setWarningEnabled] = useState(alertData?.warningEnabled ?? true)
  const [preparationEnabled, setPreparationEnabled] = useState(alertData?.preparationEnabled ?? false)
  const [quietStart, setQuietStart] = useState(String(alertData?.quietStart ?? 22))
  const [quietEnd, setQuietEnd] = useState(String(alertData?.quietEnd ?? 5))

  // ── Weather ──
  const [envCanadaStationId, setEnvCanadaStationId] = useState("")

  // ── Save / autosave state ──
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const savingRef = useRef(false)
  const isInitialMount = useRef(true)
  const [savedState, setSavedState] = useState({
    name, latitude, longitude, elevation,
    fireBlightHistory, bloomStage, petalFallDate, codlingMothBiofix,
    irrigEnabled, soilType, rootDepth, mad, irrigType, irrigRate, waterCost, blockArea, specsJson,
    alertEmail, alertPhone, alertChannel, urgentEnabled, warningEnabled, preparationEnabled,
    quietStart, quietEnd,
  })

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (autoSaveStatus !== "saved") return
    const timer = setTimeout(() => setAutoSaveStatus("idle"), 2000)
    return () => clearTimeout(timer)
  }, [autoSaveStatus])

  // Per-tab dirty tracking
  const dirtyTabs = useMemo(() => {
    const s = savedState
    const dirty = new Set<string>()
    if (name !== s.name || latitude !== s.latitude || longitude !== s.longitude || elevation !== s.elevation) dirty.add("profile")
    if (bloomStage !== s.bloomStage || codlingMothBiofix !== s.codlingMothBiofix || petalFallDate !== s.petalFallDate) dirty.add("phenology")
    if (fireBlightHistory !== s.fireBlightHistory) dirty.add("disease")
    if (irrigEnabled !== s.irrigEnabled || soilType !== s.soilType || rootDepth !== s.rootDepth || mad !== s.mad || irrigType !== s.irrigType || irrigRate !== s.irrigRate || waterCost !== s.waterCost || blockArea !== s.blockArea || specsJson !== s.specsJson) dirty.add("irrigation")
    if (alertEmail !== s.alertEmail || alertPhone !== s.alertPhone || alertChannel !== s.alertChannel || urgentEnabled !== s.urgentEnabled || warningEnabled !== s.warningEnabled || preparationEnabled !== s.preparationEnabled || quietStart !== s.quietStart || quietEnd !== s.quietEnd) dirty.add("notifications")
    return dirty
  }, [name, latitude, longitude, elevation, fireBlightHistory, bloomStage, petalFallDate, codlingMothBiofix, irrigEnabled, soilType, rootDepth, mad, irrigType, irrigRate, waterCost, blockArea, specsJson, alertEmail, alertPhone, alertChannel, urgentEnabled, warningEnabled, preparationEnabled, quietStart, quietEnd, savedState])

  // ── Test alerts ──
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)

  async function handleTestAlert(channel: "email" | "sms") {
    const setter = channel === "email" ? setTestingEmail : setTestingSms
    setter(true)
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: initialData.id,
          channel,
          email: alertEmail || null,
          phone: alertPhone || null,
        }),
      })
      if (res.ok) {
        setToast({ message: `Test ${channel} sent!`, type: "success" })
      } else {
        const data = await res.json()
        setToast({ message: data.error ?? `Test ${channel} failed`, type: "error" })
      }
    } catch {
      setToast({ message: `Test ${channel} failed`, type: "error" })
    } finally {
      setter(false)
    }
  }

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    if (savingRef.current) return
    savingRef.current = true
    setAutoSaveStatus("saving")
    console.log("[SettingsForm] autosave triggered — sending to API…")
    try {
      // 1. Save orchard config
      const orchardPayload = {
          orchardId: initialData.id,
          name,
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
          elevation: parseFloat(elevation),
          fire_blight_history: fireBlightHistory,
          bloom_stage: bloomStage,
          petal_fall_date: petalFallDate || null,
          codling_moth_biofix_date: codlingMothBiofix || null,
      }
      console.log("[SettingsForm] POST /api/orchard/config", orchardPayload)
      const res = await fetch("/api/orchard/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orchardPayload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save orchard settings")
      }
      console.log("[SettingsForm] orchard config saved OK")

      // 2. Save irrigation config
      const irrigRes = await fetch("/api/irrigation/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: irrigEnabled,
          soil_type: soilType,
          root_depth_cm: parseFloat(rootDepth) || 60,
          management_allowable_depletion: (parseFloat(mad) || 50) / 100,
          irrigation_type: irrigType,
          irrigation_rate_mm_per_hour: parseFloat(irrigRate) || 4,
          irrigation_system_specs: specsJson,
          water_cost_per_m3: parseFloat(waterCost) || 0.06,
          block_area_ha: parseFloat(blockArea) || 1.0,
        }),
      })
      if (!irrigRes.ok) {
        const err = await irrigRes.json()
        throw new Error(err.error ?? "Failed to save irrigation settings")
      }
      console.log("[SettingsForm] irrigation config saved OK")

      // 3. Save alert preferences
      const alertRes = await fetch("/api/alerts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: initialData.id,
          email: alertEmail || null,
          phone: alertPhone || null,
          channel: alertChannel,
          urgentEnabled,
          warningEnabled,
          preparationEnabled,
          quietStart: parseInt(quietStart) || 22,
          quietEnd: parseInt(quietEnd) || 5,
        }),
      })
      if (!alertRes.ok) {
        const err = await alertRes.json()
        throw new Error(err.error ?? "Failed to save alert preferences")
      }
      console.log("[SettingsForm] all 3 APIs saved OK — calling router.refresh()")

      setSavedState({
        name, latitude, longitude, elevation,
        fireBlightHistory, bloomStage, petalFallDate, codlingMothBiofix,
        irrigEnabled, soilType, rootDepth, mad, irrigType, irrigRate, waterCost, blockArea, specsJson,
        alertEmail, alertPhone, alertChannel, urgentEnabled, warningEnabled, preparationEnabled,
        quietStart, quietEnd,
      })
      setAutoSaveStatus("saved")
      router.refresh()
    } catch (err) {
      console.error("[SettingsForm] save FAILED:", err)
      setAutoSaveStatus("error")
      setToast({
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      savingRef.current = false
    }
  }, [
    initialData.id, name, latitude, longitude, elevation,
    fireBlightHistory, bloomStage, petalFallDate, codlingMothBiofix,
    irrigEnabled, soilType, rootDepth, mad, irrigType, irrigRate, waterCost, blockArea, specsJson,
    alertEmail, alertPhone, alertChannel, urgentEnabled, warningEnabled, preparationEnabled,
    quietStart, quietEnd, router,
  ])

  // ── Autosave with 1s debounce ──
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      handleSave()
    }, 1000)

    return () => clearTimeout(timer)
  }, [handleSave])

  const today = new Date().toISOString().split("T")[0]

  return (
    <>
      <Tabs defaultValue="profile" orientation={isDesktop ? "vertical" : "horizontal"}>
        <div className={cn(
          isDesktop ? "flex gap-6" : "flex flex-col gap-4",
        )}>
          {/* ── Sidebar / Tab List ── */}
          <TabsList
            variant="line"
            className={cn(
              isDesktop
                ? "flex-col w-[200px] shrink-0 items-stretch gap-0.5 h-auto p-0 sticky top-4 self-start"
                : "overflow-x-auto scrollbar-hide gap-0 p-0 w-full",
            )}
          >
            {TAB_SECTIONS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "gap-2 text-[13px] justify-start px-3 py-2.5 rounded-lg",
                  isDesktop ? "w-full" : "shrink-0",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                <span className={isDesktop ? "" : "hidden sm:inline"}>{tab.label}</span>
                {dirtyTabs.has(tab.value) && (
                  <span className="size-1.5 rounded-full bg-yellow-400 shrink-0 ml-auto" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Content Pane ── */}
          <div className="flex-1 min-w-0">
            {/* ── ORCHARD PROFILE ── */}
            <TabsContent value="profile">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <h2 className="text-card-title font-semibold">Orchard Profile</h2>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Orchard Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Apple Orchard" />
                </div>

                <div>
                  <Label className="mb-1.5 block">Location</Label>
                  <div className="grid gap-3 sm:grid-cols-3 mb-2">
                    <div className="space-y-1">
                      <Label htmlFor="lat" className="text-[11px] text-bark-400">Latitude</Label>
                      <Input id="lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lon" className="text-[11px] text-bark-400">Longitude</Label>
                      <Input id="lon" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="elev" className="text-[11px] text-bark-400">Elevation</Label>
                      <DualUnitInput id="elev" value={elevation} unitType="elevation" onChange={setElevation} placeholder="e.g. 200 m or 656 ft" />
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleGeolocation} disabled={geoLoading} className="gap-2">
                    <LocateFixed className="size-4" />
                    {geoLoading ? "Locating..." : "Use my current location"}
                  </Button>
                  {geoError && <p className="text-[12px] text-destructive mt-1">{geoError}</p>}
                </div>

                <div className="space-y-2">
                  <div>
                    <Label>Planted Blocks</Label>
                    <p className="text-caption text-muted-foreground mt-1">
                      Define your orchard blocks with variety, rootstock, and planting details.
                      Disease risk traits are shown based on known susceptibilities.
                    </p>
                  </div>
                  <BlockManager orchardId={initialData.id} initialBlocks={initialBlocks} />
                </div>
              </div>
            </TabsContent>

            {/* ── PHENOLOGY ── */}
            <TabsContent value="phenology">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <div>
                  <h2 className="text-card-title font-semibold">Phenology & Growth</h2>
                  <p className="text-caption text-muted-foreground mt-1">
                    Keep your bloom stage current &mdash; most disease and pest models depend on it.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Bloom Stage</Label>
                  <BloomStagePicker value={bloomStage} onChange={setBloomStage} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="codlingMothBiofix">Codling Moth Biofix Date</Label>
                  <div className="flex gap-2 items-end">
                    <Input
                      id="codlingMothBiofix"
                      type="date"
                      value={codlingMothBiofix}
                      onChange={(e) => setCodlingMothBiofix(e.target.value)}
                      className="flex-1 max-w-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setCodlingMothBiofix(today)} className="gap-1.5 shrink-0">
                      <Calendar className="size-3.5" />
                      Set to today
                    </Button>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Date of first sustained codling moth catch in pheromone traps.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="petalFallDate">Petal Fall Date</Label>
                  <div className="flex gap-2 items-end">
                    <Input
                      id="petalFallDate"
                      type="date"
                      value={petalFallDate}
                      onChange={(e) => setPetalFallDate(e.target.value)}
                      className="flex-1 max-w-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setPetalFallDate(today)} className="gap-1.5 shrink-0">
                      <Calendar className="size-3.5" />
                      Set to today
                    </Button>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Several pest models count degree days from this date. Set when most petals have dropped.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ── DISEASE HISTORY ── */}
            <TabsContent value="disease">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <div>
                  <h2 className="text-card-title font-semibold">Disease & Pest History</h2>
                  <p className="text-caption text-muted-foreground mt-1">
                    Set based on last season. This adjusts alert thresholds and spray recommendations.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Fire Blight History</Label>
                  <FireBlightHistoryPicker value={fireBlightHistory} onChange={setFireBlightHistory} />
                </div>
              </div>
            </TabsContent>

            {/* ── WEATHER SOURCES ── */}
            <TabsContent value="weather">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <h2 className="text-card-title font-semibold">Weather Sources</h2>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                  <div>
                    <p className="text-body font-medium">Open-Meteo</p>
                    <p className="text-caption text-muted-foreground">Free weather API for forecast and historical data</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-medium text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="envCanadaStation">Environment Canada Station ID</Label>
                  <Input
                    id="envCanadaStation"
                    value={envCanadaStationId}
                    onChange={(e) => setEnvCanadaStationId(e.target.value)}
                    placeholder="e.g. ON/s0000458"
                  />
                  <p className="text-caption text-muted-foreground">
                    Optional. Adds Environment Canada observations as a secondary data source.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ── IRRIGATION ── */}
            <TabsContent value="irrigation">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <h2 className="text-card-title font-semibold">Irrigation</h2>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                  <div>
                    <p className="text-body font-medium">Enable Irrigation Module</p>
                    <p className="text-caption text-muted-foreground">Track soil moisture, ET, and irrigation scheduling</p>
                  </div>
                  <Switch checked={irrigEnabled} onCheckedChange={(val) => setIrrigEnabled(val as boolean)} />
                </div>

                {irrigEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Soil Type</Label>
                      <Select value={soilType} onValueChange={(val) => val && setSoilType(val)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SOIL_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="rootDepth">Root Depth</Label>
                        <DualUnitInput id="rootDepth" value={rootDepth} unitType="lengthSmall" onChange={setRootDepth} placeholder="e.g. 60 cm or 24 in" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mad">Irrigation Trigger (%)</Label>
                        <Input id="mad" type="number" min="30" max="70" step="5" value={mad} onChange={(e) => setMad(e.target.value)} />
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/50 px-4 py-3">
                      <p className="text-[12px] text-bark-400">
                        Available water: <span className="font-data font-medium text-bark-600">{availableWaterMm}&nbsp;mm ({(availableWaterMm / 25.4).toFixed(1)}&nbsp;in)</span>
                        {" "}&middot; Trigger at <span className="font-data font-medium text-bark-600">{triggerMm}&nbsp;mm ({(triggerMm / 25.4).toFixed(2)}&nbsp;in)</span> depleted
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Irrigation System</Label>
                      <Select value={irrigType} onValueChange={(val) => val && setIrrigType(val)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {IRRIGATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ── DRIP SYSTEM SPECS ── */}
                    {irrigType === "drip" && (
                      <div className="space-y-4 rounded-lg border border-border/50 p-4">
                        <p className="text-sm font-medium text-bark-500">Drip System Specs</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="dripEmitterFlow">Emitter Flow Rate</Label>
                            <DualUnitInput id="dripEmitterFlow" value={dripEmitterFlow} unitType="waterFlowHourly" onChange={setDripEmitterFlow} placeholder="e.g. 2.0 L/hr or 0.53 gph" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dripEmitterSpacing">Emitter Spacing</Label>
                            <DualUnitInput id="dripEmitterSpacing" value={dripEmitterSpacing} unitType="lengthSmall" onChange={setDripEmitterSpacing} placeholder="e.g. 30 cm or 12 in" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dripLinesPerRow">Drip Lines per Row</Label>
                            <Select value={dripLinesPerRow} onValueChange={(val) => val && setDripLinesPerRow(val)}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dripRowLength">Row Length</Label>
                            <DualUnitInput id="dripRowLength" value={dripRowLength} unitType="length" onChange={setDripRowLength} placeholder="e.g. 100 m or 328 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dripNumRows">Number of Rows</Label>
                            <Input id="dripNumRows" type="number" min="1" step="1" value={dripNumRows} onChange={(e) => setDripNumRows(e.target.value)} placeholder="e.g. 25" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="dripRowSpacing">Row Spacing</Label>
                            <DualUnitInput id="dripRowSpacing" value={dripRowSpacing} unitType="length" onChange={setDripRowSpacing} placeholder="e.g. 4.0 m or 13.1 ft" />
                          </div>
                        </div>
                        {calculatedRate && calculatedRate.type === "drip" && (
                          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 space-y-1">
                            <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">Calculated System Performance</p>
                            <div className="text-[12px] text-emerald-600 dark:text-emerald-400/80 space-y-0.5">
                              <p>Total emitters: <span className="font-data font-medium">{calculatedRate.totalEmitters.toLocaleString()}</span> ({calculatedRate.emittersPerRow.toLocaleString()} per row &times; {dripNumRows} rows)</p>
                              <p>Total flow: <span className="font-data font-medium">{(calculatedRate.totalFlowLph / 1000).toFixed(1)}&nbsp;m&sup3;/hr</span> ({(calculatedRate.totalFlowLph * 0.264172).toLocaleString(undefined, { maximumFractionDigits: 0 })}&nbsp;gal/hr)</p>
                              <p>Precipitation rate: <span className="font-data font-medium">{calculatedRate.precipRate.toFixed(2)}&nbsp;mm/hr</span> ({(calculatedRate.precipRate / 25.4).toFixed(3)}&nbsp;in/hr)</p>
                              {triggerMm > 0 && (
                                <>
                                  <p>To apply {(triggerMm / efficiency).toFixed(0)}&nbsp;mm ({((triggerMm / efficiency) / 25.4).toFixed(1)}&nbsp;in): <span className="font-data font-medium">~{((triggerMm / efficiency) / calculatedRate.precipRate).toFixed(1)} hours</span> run time</p>
                                  <p>Water volume per cycle: <span className="font-data font-medium">{((triggerMm / efficiency) * calculatedRate.blockAreaM2 / 1000).toFixed(0)}&nbsp;m&sup3;</span> ({((triggerMm / efficiency) * calculatedRate.blockAreaM2 / 1000 * 264.172).toLocaleString(undefined, { maximumFractionDigits: 0 })}&nbsp;gal)</p>
                                  {parseFloat(waterCost) > 0 && (
                                    <p>Cost per cycle: <span className="font-data font-medium">${((triggerMm / efficiency) * calculatedRate.blockAreaM2 / 1000 * parseFloat(waterCost)).toFixed(2)}</span></p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── MICRO-SPRINKLER SPECS ── */}
                    {irrigType === "micro-sprinkler" && (
                      <div className="space-y-4 rounded-lg border border-border/50 p-4">
                        <p className="text-sm font-medium text-bark-500">Micro-sprinkler Specs</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="microFlowRate">Sprinkler Flow Rate</Label>
                            <DualUnitInput id="microFlowRate" value={microFlowRate} unitType="waterFlowHourly" onChange={setMicroFlowRate} placeholder="e.g. 50 L/hr or 13.2 gph" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="microTreesPerSprinkler">Trees per Sprinkler</Label>
                            <Select value={microTreesPerSprinkler} onValueChange={(val) => val && setMicroTreesPerSprinkler(val)}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="microWettedDiam">Wetted Diameter</Label>
                            <DualUnitInput id="microWettedDiam" value={microWettedDiam} unitType="length" onChange={setMicroWettedDiam} placeholder="e.g. 4.0 m or 13 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="microTreeSpacing">Tree Spacing in Row</Label>
                            <DualUnitInput id="microTreeSpacing" value={microTreeSpacing} unitType="length" onChange={setMicroTreeSpacing} placeholder="e.g. 3.5 m or 11.5 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="microRowSpacing">Row Spacing</Label>
                            <DualUnitInput id="microRowSpacing" value={microRowSpacing} unitType="length" onChange={setMicroRowSpacing} placeholder="e.g. 4.5 m or 14.8 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="microNumTrees">Number of Trees in Block</Label>
                            <Input id="microNumTrees" type="number" min="1" step="1" value={microNumTrees} onChange={(e) => setMicroNumTrees(e.target.value)} placeholder="e.g. 500" />
                          </div>
                        </div>
                        {calculatedRate && calculatedRate.type === "micro" && (
                          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 space-y-1">
                            <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">Calculated System Performance</p>
                            <div className="text-[12px] text-emerald-600 dark:text-emerald-400/80 space-y-0.5">
                              {calculatedRate.numSprinklers > 0 && (
                                <>
                                  <p>Sprinklers: <span className="font-data font-medium">{calculatedRate.numSprinklers.toLocaleString()}</span></p>
                                  <p>Total flow: <span className="font-data font-medium">{(calculatedRate.totalFlowLph / 1000).toFixed(1)}&nbsp;m&sup3;/hr</span> ({(calculatedRate.totalFlowLph * 0.264172).toLocaleString(undefined, { maximumFractionDigits: 0 })}&nbsp;gal/hr)</p>
                                </>
                              )}
                              <p>Precipitation rate: <span className="font-data font-medium">{calculatedRate.precipRate.toFixed(2)}&nbsp;mm/hr</span> ({(calculatedRate.precipRate / 25.4).toFixed(3)}&nbsp;in/hr)</p>
                              {triggerMm > 0 && (
                                <p>To apply {(triggerMm / efficiency).toFixed(0)}&nbsp;mm: <span className="font-data font-medium">~{((triggerMm / efficiency) / calculatedRate.precipRate).toFixed(1)} hours</span> run time</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── OVERHEAD SPRINKLER SPECS ── */}
                    {irrigType === "overhead" && (
                      <div className="space-y-4 rounded-lg border border-border/50 p-4">
                        <p className="text-sm font-medium text-bark-500">Overhead Sprinkler Specs</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="overheadModel">Sprinkler Model/Type</Label>
                            <Input id="overheadModel" value={overheadModel} onChange={(e) => setOverheadModel(e.target.value)} placeholder="e.g. Nelson R33" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="overheadFlowRate">Flow Rate per Head</Label>
                            <DualUnitInput id="overheadFlowRate" value={overheadFlowRate} unitType="waterFlow" onChange={setOverheadFlowRate} placeholder="e.g. 15 L/min or 4 gpm" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="overheadHeadSpacing">Head-to-Head Spacing</Label>
                            <DualUnitInput id="overheadHeadSpacing" value={overheadHeadSpacing} unitType="length" onChange={setOverheadHeadSpacing} placeholder="e.g. 12 m or 39 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="overheadLateralSpacing">Lateral-to-Lateral Spacing</Label>
                            <DualUnitInput id="overheadLateralSpacing" value={overheadLateralSpacing} unitType="length" onChange={setOverheadLateralSpacing} placeholder="e.g. 12 m or 39 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="overheadPressure">Operating Pressure</Label>
                            <DualUnitInput id="overheadPressure" value={overheadPressure} unitType="pressure" onChange={setOverheadPressure} placeholder="e.g. 275 kPa or 40 psi" />
                          </div>
                          <div className="flex items-center gap-3 pt-5">
                            <Switch checked={overheadFrostProtection} onCheckedChange={(val) => setOverheadFrostProtection(val as boolean)} id="overheadFrost" />
                            <Label htmlFor="overheadFrost">Frost Protection Capable</Label>
                          </div>
                        </div>
                        {calculatedRate && (
                          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 space-y-1">
                            <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">Calculated System Performance</p>
                            <div className="text-[12px] text-emerald-600 dark:text-emerald-400/80 space-y-0.5">
                              <p>Precipitation rate: <span className="font-data font-medium">{calculatedRate.precipRate.toFixed(2)}&nbsp;mm/hr</span> ({(calculatedRate.precipRate / 25.4).toFixed(3)}&nbsp;in/hr)</p>
                              {triggerMm > 0 && (
                                <p>To apply {(triggerMm / efficiency).toFixed(0)}&nbsp;mm: <span className="font-data font-medium">~{((triggerMm / efficiency) / calculatedRate.precipRate).toFixed(1)} hours</span> run time</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── TRAVELLING GUN SPECS ── */}
                    {irrigType === "travelling-gun" && (
                      <div className="space-y-4 rounded-lg border border-border/50 p-4">
                        <p className="text-sm font-medium text-bark-500">Travelling Gun Specs</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="gunFlowRate">Flow Rate</Label>
                            <DualUnitInput id="gunFlowRate" value={gunFlowRate} unitType="waterFlow" onChange={setGunFlowRate} placeholder="e.g. 500 L/min or 132 gpm" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="gunLaneSpacing">Lane Spacing</Label>
                            <DualUnitInput id="gunLaneSpacing" value={gunLaneSpacing} unitType="length" onChange={setGunLaneSpacing} placeholder="e.g. 60 m or 197 ft" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="gunTravelSpeed">Travel Speed</Label>
                            <DualUnitInput id="gunTravelSpeed" value={gunTravelSpeed} unitType="speed" onChange={setGunTravelSpeed} placeholder="e.g. 30 m/hr or 98 ft/hr" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="gunWettedWidth">Wetted Width</Label>
                            <DualUnitInput id="gunWettedWidth" value={gunWettedWidth} unitType="length" onChange={setGunWettedWidth} placeholder="e.g. 50 m or 164 ft" />
                          </div>
                        </div>
                        {calculatedRate && (
                          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 space-y-1">
                            <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">Calculated System Performance</p>
                            <div className="text-[12px] text-emerald-600 dark:text-emerald-400/80 space-y-0.5">
                              <p>Precipitation rate: <span className="font-data font-medium">{calculatedRate.precipRate.toFixed(2)}&nbsp;mm/hr</span> ({(calculatedRate.precipRate / 25.4).toFixed(3)}&nbsp;in/hr)</p>
                              {triggerMm > 0 && (
                                <p>To apply {(triggerMm / efficiency).toFixed(0)}&nbsp;mm: <span className="font-data font-medium">~{((triggerMm / efficiency) / calculatedRate.precipRate).toFixed(1)} hours</span> run time</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── MANUAL RATE (for "none" or as fallback display) ── */}
                    {irrigType === "none" && (
                      <div className="rounded-lg bg-secondary/50 px-4 py-3">
                        <p className="text-[12px] text-bark-400">No irrigation system configured. Rainfall tracking only.</p>
                      </div>
                    )}

                    {irrigType !== "none" && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="waterCost">Water Cost ($/m&sup3;)</Label>
                            <Input id="waterCost" type="number" step="0.01" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="blockArea">Block Area</Label>
                            <DualUnitInput id="blockArea" value={blockArea} unitType="area" onChange={setBlockArea} placeholder="e.g. 1.0 ha or 2.5 ac" />
                          </div>
                        </div>

                        <div className="rounded-lg bg-secondary/50 px-4 py-3">
                          <p className="text-[12px] text-bark-400">
                            Efficiency: <span className="font-data font-medium text-bark-600">{Math.round(efficiency * 100)}%</span>
                            {calculatedRate ? (
                              <>
                                {" "}&middot; Precip. rate: <span className="font-data font-medium text-bark-600">{calculatedRate.precipRate.toFixed(2)}&nbsp;mm/hr ({(calculatedRate.precipRate / 25.4).toFixed(3)}&nbsp;in/hr)</span>
                              </>
                            ) : (
                              <>
                                {" "}&middot; <span className="text-amber-600 dark:text-amber-400">Enter system specs above to auto-calculate rate</span>
                              </>
                            )}
                            {triggerMm > 0 && parseFloat(irrigRate) > 0 && (
                              <>
                                {" "}&middot; Gross to refill: <span className="font-data font-medium text-bark-600">{Math.round((triggerMm / efficiency) * 10) / 10}&nbsp;mm</span>
                                {" "}&middot; <span className="font-data font-medium text-bark-600">~{Math.round((triggerMm / efficiency / parseFloat(irrigRate)) * 10) / 10} hrs</span> run time
                              </>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── NOTIFICATIONS ── */}
            <TabsContent value="notifications">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-5">
                <h2 className="text-card-title font-semibold">Notifications</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="alertEmail">Email</Label>
                    <div className="flex gap-2">
                      <Input id="alertEmail" type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} placeholder="you@example.com" className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAlert("email")}
                        disabled={testingEmail || !alertEmail}
                        className="shrink-0"
                      >
                        {testingEmail ? <Loader2 className="size-4 animate-spin" /> : "Test"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="alertPhone">Phone (SMS)</Label>
                    <div className="flex gap-2">
                      <Input id="alertPhone" type="tel" value={alertPhone} onChange={(e) => setAlertPhone(e.target.value)} placeholder="+1 555-123-4567" className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAlert("sms")}
                        disabled={testingSms || !alertPhone}
                        className="shrink-0"
                      >
                        {testingSms ? <Loader2 className="size-4 animate-spin" /> : "Test"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Delivery Channel</Label>
                  <Select value={alertChannel} onValueChange={(val) => val && setAlertChannel(val)}>
                    <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email only</SelectItem>
                      <SelectItem value="sms">SMS only</SelectItem>
                      <SelectItem value="both">Email + SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                    <div>
                      <p className="text-body font-medium">Urgent Alerts</p>
                      <p className="text-caption text-muted-foreground">Fire blight extreme, active infections, critical frost</p>
                    </div>
                    <Switch checked={urgentEnabled} onCheckedChange={(val) => setUrgentEnabled(val as boolean)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                    <div>
                      <p className="text-body font-medium">Warning Alerts</p>
                      <p className="text-caption text-muted-foreground">High risk forecasts, spray coverage expiring</p>
                    </div>
                    <Switch checked={warningEnabled} onCheckedChange={(val) => setWarningEnabled(val as boolean)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                    <div>
                      <p className="text-body font-medium">Preparation Alerts</p>
                      <p className="text-caption text-muted-foreground">Upcoming spray windows, stage change reminders</p>
                    </div>
                    <Switch checked={preparationEnabled} onCheckedChange={(val) => setPreparationEnabled(val as boolean)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="quietStart">Quiet Hours Start</Label>
                    <Select value={quietStart} onValueChange={(val) => val && setQuietStart(val)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quietEnd">Quiet Hours End</Label>
                    <Select value={quietEnd} onValueChange={(val) => val && setQuietEnd(val)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-caption text-muted-foreground">
                  Non-urgent alerts are held during quiet hours. Critical frost and active infection alerts always send immediately.
                </p>
              </div>
            </TabsContent>

            {/* ── WORKERS ── */}
            <TabsContent value="workers">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-4">
                <h2 className="text-card-title font-semibold">Workers</h2>
                <p className="text-[14px] text-bark-400 leading-[1.6]">
                  Manage your crew, track REI/PHI windows, and send spray notifications to field workers.
                </p>
                <a
                  href="/workers"
                  className="inline-flex items-center gap-2 text-body text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Open Worker Management
                </a>
              </div>
            </TabsContent>

            {/* ── DATA & BACKUP ── */}
            <TabsContent value="data">
              <div className="rounded-xl border border-border bg-card card-shadow p-6 space-y-4">
                <h2 className="text-card-title font-semibold">Data & Backup</h2>
                <p className="text-[14px] text-bark-400 leading-[1.6]">
                  Your data is stored locally in a SQLite database. Backups can be triggered from the server command line.
                </p>
                <div className="rounded-lg bg-secondary/50 px-4 py-3">
                  <p className="text-[12px] text-bark-400 font-mono">npx tsx scripts/backup.ts</p>
                  <p className="text-caption text-muted-foreground mt-1">Creates a snapshot in the backups/ directory. Last 30 kept automatically.</p>
                </div>
              </div>
            </TabsContent>

            {/* ── Autosave Status ── */}
            <div className="mt-6 flex items-center gap-2 text-[13px] h-8">
              {autoSaveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-bark-400">
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="flex items-center gap-1.5 text-primary">
                  <Check className="size-3.5" />
                  Saved
                </span>
              )}
              {autoSaveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="size-3.5" />
                  Save failed
                </span>
              )}
              {autoSaveStatus === "idle" && dirtyTabs.size > 0 && (
                <span className="text-bark-400">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
      </Tabs>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-medium shadow-lg",
              toast.type === "success"
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {toast.type === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
}
