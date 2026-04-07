"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface PlantedBlock {
  id: number
  orchard_id: number
  block_name: string
  variety: string
  rootstock: string | null
  planted_year: number | null
  tree_count: number | null
  spacing_in_row_m: number | null
  spacing_between_rows_m: number | null
  area_ha: number | null
  notes: string | null
  created_at: string
}

interface IrrigationData {
  enabled: boolean
  soil_type: string
  root_depth_cm: number
  management_allowable_depletion: number
  irrigation_type: string
  irrigation_rate_mm_per_hour: number
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
  { value: "none", label: "None (rain-fed)" },
] as const

const SOIL_AWC: Record<string, number> = {
  sand: 80, "loamy-sand": 100, "sandy-loam": 140, loam: 190, "clay-loam": 190, clay: 190,
}

const SYSTEM_EFF: Record<string, number> = {
  drip: 0.90, "micro-sprinkler": 0.80, overhead: 0.70, none: 1.0,
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
// Block Manager — replaces VarietyTagInput + RootstockSelector
// ---------------------------------------------------------------------------

function BlockManager({ orchardId, initialBlocks }: { orchardId: number; initialBlocks: PlantedBlock[] }) {
  const [blocks, setBlocks] = useState<PlantedBlock[]>(initialBlocks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<PlantedBlock | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form fields
  const [blockName, setBlockName] = useState("")
  const [variety, setVariety] = useState("")
  const [rootstock, setRootstock] = useState("")
  const [plantedYear, setPlantedYear] = useState("")
  const [treeCount, setTreeCount] = useState("")
  const [spacingInRow, setSpacingInRow] = useState("")
  const [spacingBetweenRows, setSpacingBetweenRows] = useState("")
  const [areaHa, setAreaHa] = useState("")
  const [blockNotes, setBlockNotes] = useState("")

  function resetForm() {
    setBlockName("")
    setVariety("")
    setRootstock("")
    setPlantedYear("")
    setTreeCount("")
    setSpacingInRow("")
    setSpacingBetweenRows("")
    setAreaHa("")
    setBlockNotes("")
    setEditingBlock(null)
  }

  function openAdd() {
    resetForm()
    setDialogOpen(true)
  }

  function openEdit(block: PlantedBlock) {
    setEditingBlock(block)
    setBlockName(block.block_name)
    setVariety(block.variety)
    setRootstock(block.rootstock ?? "")
    setPlantedYear(block.planted_year ? String(block.planted_year) : "")
    setTreeCount(block.tree_count ? String(block.tree_count) : "")
    setSpacingInRow(block.spacing_in_row_m ? String(block.spacing_in_row_m) : "")
    setSpacingBetweenRows(block.spacing_between_rows_m ? String(block.spacing_between_rows_m) : "")
    setAreaHa(block.area_ha ? String(block.area_ha) : "")
    setBlockNotes(block.notes ?? "")
    setDialogOpen(true)
  }

  // Auto-calculate area from tree count and spacing
  const computedArea = (() => {
    const count = parseInt(treeCount)
    const inRow = parseFloat(spacingInRow)
    const betweenRows = parseFloat(spacingBetweenRows)
    if (count > 0 && inRow > 0 && betweenRows > 0) {
      return ((count * inRow * betweenRows) / 10000).toFixed(2)
    }
    return null
  })()

  async function handleSaveBlock() {
    if (!blockName.trim() || !variety.trim()) return
    setSaving(true)
    try {
      const payload = {
        orchardId,
        blockName: blockName.trim(),
        variety: variety.trim(),
        rootstock: rootstock.trim() || null,
        plantedYear: plantedYear ? parseInt(plantedYear) : null,
        treeCount: treeCount ? parseInt(treeCount) : null,
        spacingInRowM: spacingInRow ? parseFloat(spacingInRow) : null,
        spacingBetweenRowsM: spacingBetweenRows ? parseFloat(spacingBetweenRows) : null,
        areaHa: areaHa ? parseFloat(areaHa) : computedArea ? parseFloat(computedArea) : null,
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
      }
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current = setTimeout(() => setDeleteConfirmId(null), 3000)
      return
    }
    setDeleteConfirmId(null)
    try {
      const res = await fetch("/api/orchard/blocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, orchardId }),
      })
      if (!res.ok) throw new Error("Failed to delete block")
      setBlocks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const varietyGroups = (["early", "mid", "late", "heritage"] as const).map((season) => ({
    label: SEASON_LABELS[season],
    items: APPLE_VARIETIES.filter((v) => v.season === season).map((v) => ({
      value: v.name,
      description: Object.entries(v.traits)
        .filter(([, level]) => level === "high" || level === "very_high" || level === "susceptible")
        .map(([key]) => TRAIT_LABELS[key])
        .join(", ") || undefined,
    })),
  }))

  const rootstockGroups = (["dwarfing", "semi-dwarfing", "semi-vigorous", "vigorous"] as const).map((vigor) => ({
    label: VIGOR_LABELS[vigor],
    items: ROOTSTOCK_DATA.filter((r) => r.vigor === vigor).map((r) => ({
      value: r.name,
      description: `${r.sizePercent}% standard size \u2014 ${r.description}`,
    })),
  }))

  function getBlockTraits(block: PlantedBlock) {
    const traits: { label: string; level: string; icon: string }[] = []
    const varietyInfo = APPLE_VARIETIES.find((v) => v.name === block.variety)
    const rootstockInfo = ROOTSTOCK_DATA.find((r) => r.name === block.rootstock)

    if (varietyInfo) {
      for (const [key, level] of Object.entries(varietyInfo.traits)) {
        if (level === "high" || level === "very_high" || level === "susceptible") {
          traits.push({ label: `${TRAIT_LABELS[key] ?? key} (${block.variety})`, level, icon: TRAIT_ICONS[level] ?? "" })
        }
        if (level === "resistant" || level === "tolerant") {
          traits.push({ label: `${TRAIT_LABELS[key] ?? key} (${block.variety})`, level, icon: TRAIT_ICONS[level] ?? "" })
        }
      }
    }
    if (rootstockInfo) {
      for (const [key, level] of Object.entries(rootstockInfo.traits)) {
        if (level === "resistant" || level === "tolerant") {
          traits.push({ label: `${TRAIT_LABELS[key] ?? key} (${block.rootstock})`, level, icon: TRAIT_ICONS[level] ?? "" })
        }
        if (level === "very_susceptible" || level === "susceptible") {
          traits.push({ label: `${TRAIT_LABELS[key] ?? key} (${block.rootstock})`, level, icon: TRAIT_ICONS[level] ?? "" })
        }
      }
    }

    // Sort: warnings first, then positives
    const order: Record<string, number> = { very_high: 0, very_susceptible: 0, susceptible: 1, high: 1, moderate: 2, tolerant: 3, resistant: 4, low: 5 }
    traits.sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3))
    return traits.slice(0, 6)
  }

  return (
    <div className="space-y-3">
      {/* Block cards */}
      <div className="grid grid-cols-1 gap-3">
        {blocks.map((block) => {
          const traits = getBlockTraits(block)
          return (
            <div key={block.id} className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-foreground truncate">
                    {block.block_name}
                    <span className="font-normal text-bark-400">
                      {" \u2014 "}{block.variety}{block.rootstock ? ` on ${block.rootstock}` : ""}
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-bark-400 mt-0.5">
                    {block.planted_year && <span>Planted {block.planted_year}</span>}
                    {block.area_ha && <span>{block.area_ha} ha</span>}
                    {block.tree_count && <span>{block.tree_count.toLocaleString()} trees</span>}
                    {block.spacing_in_row_m && block.spacing_between_rows_m && (
                      <span>{block.spacing_in_row_m}m &times; {block.spacing_between_rows_m}m</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(block)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-bark-400 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(block.id)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors cursor-pointer",
                      deleteConfirmId === block.id
                        ? "bg-red-500/20 text-red-400"
                        : "hover:bg-white/5 text-bark-400 hover:text-foreground",
                    )}
                    title={deleteConfirmId === block.id ? "Click again to confirm delete" : "Delete block"}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {block.notes && (
                <p className="text-[12px] text-bark-400 italic">{block.notes}</p>
              )}
              {traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {traits.map((t, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        TRAIT_COLORS[t.level] ?? "bg-zinc-500/15 text-zinc-400",
                      )}
                    >
                      {t.icon} {t.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add block button */}
      <button
        type="button"
        onClick={openAdd}
        className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-transparent p-4 flex items-center justify-center gap-2 text-[13px] text-bark-400 hover:text-primary transition-colors cursor-pointer"
      >
        <Plus className="size-4" />
        Add Block
      </button>

      {/* Block form dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); } setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlock ? "Edit Block" : "Add Block"}</DialogTitle>
            <DialogDescription>
              Define a planting block with variety, rootstock, and spacing details.
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

            <div className="space-y-1.5">
              <Label>Variety <span className="text-red-400">*</span></Label>
              <SearchableCombobox
                value={variety}
                onChange={setVariety}
                placeholder="Search varieties..."
                groups={varietyGroups}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rootstock</Label>
              <SearchableCombobox
                value={rootstock}
                onChange={setRootstock}
                placeholder="Search rootstocks..."
                groups={rootstockGroups}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Year Planted</Label>
                <Input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={plantedYear}
                  onChange={(e) => setPlantedYear(e.target.value)}
                  placeholder="e.g. 2018"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tree Count</Label>
                <Input
                  type="number"
                  min={1}
                  value={treeCount}
                  onChange={(e) => setTreeCount(e.target.value)}
                  placeholder="e.g. 1200"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Spacing In Row (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={spacingInRow}
                  onChange={(e) => setSpacingInRow(e.target.value)}
                  placeholder="e.g. 1.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Spacing Between Rows (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={spacingBetweenRows}
                  onChange={(e) => setSpacingBetweenRows(e.target.value)}
                  placeholder="e.g. 4.0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Area (ha)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={areaHa || (computedArea ?? "")}
                onChange={(e) => setAreaHa(e.target.value)}
                placeholder={computedArea ? `Auto-calculated: ${computedArea} ha` : "e.g. 1.2"}
              />
              {computedArea && !areaHa && (
                <p className="text-[11px] text-muted-foreground">
                  Auto-calculated from {treeCount} trees at {spacingInRow}m &times; {spacingBetweenRows}m
                </p>
              )}
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
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false) }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBlock}
              disabled={saving || !blockName.trim() || !variety.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : editingBlock ? "Update Block" : "Add Block"}
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
  initialBlocks?: PlantedBlock[]
}) {
  const router = useRouter()

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

  // ── Save state ──
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

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
    setSaving(true)
    try {
      // 1. Save orchard config
      const res = await fetch("/api/orchard/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: initialData.id,
          name,
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
          elevation: parseFloat(elevation),
          fire_blight_history: fireBlightHistory,
          bloom_stage: bloomStage,
          petal_fall_date: petalFallDate || null,
          codling_moth_biofix_date: codlingMothBiofix || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save orchard settings")
      }

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
          water_cost_per_m3: parseFloat(waterCost) || 0.06,
          block_area_ha: parseFloat(blockArea) || 1.0,
        }),
      })
      if (!irrigRes.ok) {
        const err = await irrigRes.json()
        throw new Error(err.error ?? "Failed to save irrigation settings")
      }

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

      setToast({ message: "Settings saved successfully.", type: "success" })
      router.refresh()
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }, [
    initialData.id, name, latitude, longitude, elevation,
    fireBlightHistory, bloomStage, petalFallDate, codlingMothBiofix,
    irrigEnabled, soilType, rootDepth, mad, irrigType, irrigRate, waterCost, blockArea,
    alertEmail, alertPhone, alertChannel, urgentEnabled, warningEnabled, preparationEnabled,
    quietStart, quietEnd, router,
  ])

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
                      <Label htmlFor="elev" className="text-[11px] text-bark-400">Elevation (m)</Label>
                      <Input id="elev" type="number" step="any" value={elevation} onChange={(e) => setElevation(e.target.value)} />
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
                        <Label htmlFor="rootDepth">Root Depth (cm)</Label>
                        <Input id="rootDepth" type="number" min="30" max="120" step="5" value={rootDepth} onChange={(e) => setRootDepth(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mad">Irrigation Trigger (%)</Label>
                        <Input id="mad" type="number" min="30" max="70" step="5" value={mad} onChange={(e) => setMad(e.target.value)} />
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/50 px-4 py-3">
                      <p className="text-[12px] text-bark-400">
                        Available water: <span className="font-data font-medium text-bark-600">{availableWaterMm} mm</span>
                        {" "}&middot; Trigger at <span className="font-data font-medium text-bark-600">{triggerMm} mm</span> depleted
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

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="irrigRate">Rate (mm/hr)</Label>
                        <Input id="irrigRate" type="number" step="0.5" value={irrigRate} onChange={(e) => setIrrigRate(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="waterCost">Water Cost ($/m&sup3;)</Label>
                        <Input id="waterCost" type="number" step="0.01" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="blockArea">Block Area (ha)</Label>
                        <Input id="blockArea" type="number" step="0.1" value={blockArea} onChange={(e) => setBlockArea(e.target.value)} />
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/50 px-4 py-3">
                      <p className="text-[12px] text-bark-400">
                        Efficiency: <span className="font-data font-medium text-bark-600">{Math.round(efficiency * 100)}%</span>
                        {" "}&middot; Gross to refill: <span className="font-data font-medium text-bark-600">{Math.round((triggerMm / efficiency) * 10) / 10} mm</span>
                        {parseFloat(irrigRate) > 0 && (
                          <>
                            {" "}&middot; <span className="font-data font-medium text-bark-600">
                              ~{Math.round((triggerMm / efficiency / parseFloat(irrigRate)) * 10) / 10} hrs
                            </span> run time
                          </>
                        )}
                      </p>
                    </div>
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

            {/* ── Save Button ── */}
            <div className="mt-6 sticky bottom-4 z-10 sm:static sm:bottom-auto">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
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
