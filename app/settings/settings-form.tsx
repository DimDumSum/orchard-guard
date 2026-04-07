"use client"

import { useState, useEffect, useCallback } from "react"
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

const COMMON_ROOTSTOCKS = ["M.9", "B.9", "G.41", "M.26", "MM.106", "G.935", "M.7"]

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

function VarietyTagInput({ varieties, onChange }: { varieties: string[]; onChange: (v: string[]) => void }) {
  const [inputValue, setInputValue] = useState("")

  function addVariety() {
    const trimmed = inputValue.trim()
    if (trimmed && !varieties.includes(trimmed)) {
      onChange([...varieties, trimmed])
      setInputValue("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addVariety()
    }
    if (e.key === "Backspace" && inputValue === "" && varieties.length > 0) {
      onChange(varieties.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {varieties.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary"
          >
            {v}
            <button type="button" onClick={() => onChange(varieties.filter((x) => x !== v))} className="cursor-pointer hover:text-primary/70">
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type variety and press Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addVariety} disabled={!inputValue.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>
      <p className="text-caption text-muted-foreground mt-1.5">
        Honeycrisp is highly susceptible to fire blight. McIntosh is susceptible to scab.
      </p>
    </div>
  )
}

function RootstockSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value.split(",").map((s) => s.trim()).filter(Boolean)
  const customRootstocks = selected.filter((r) => !COMMON_ROOTSTOCKS.includes(r))
  const [otherValue, setOtherValue] = useState(customRootstocks.join(", "))

  function toggle(rs: string) {
    const newSelected = selected.includes(rs)
      ? selected.filter((x) => x !== rs)
      : [...selected, rs]
    onChange(newSelected.join(", "))
  }

  function handleOtherChange(val: string) {
    setOtherValue(val)
    const common = selected.filter((r) => COMMON_ROOTSTOCKS.includes(r))
    const custom = val.split(",").map((s) => s.trim()).filter(Boolean)
    onChange([...common, ...custom].join(", "))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COMMON_ROOTSTOCKS.map((rs) => (
          <button
            key={rs}
            type="button"
            onClick={() => toggle(rs)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all cursor-pointer",
              selected.includes(rs)
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-bark-600 hover:border-bark-400",
            )}
          >
            {rs}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rootstock-other" className="text-[12px]">Other rootstock</Label>
        <Input
          id="rootstock-other"
          value={otherValue}
          onChange={(e) => handleOtherChange(e.target.value)}
          placeholder="e.g. CG.4210, Antonovka"
          className="max-w-xs"
        />
      </div>
      <p className="text-caption text-muted-foreground">
        Dwarfing rootstocks (M.9, B.9) are more susceptible to fire blight, Phytophthora, and borers.
      </p>
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
}: {
  initialData: OrchardData
  irrigationData?: IrrigationData | null
  alertData?: AlertData | null
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
  const [varieties, setVarieties] = useState<string[]>(initialData.primary_varieties)
  const [rootstock, setRootstock] = useState(initialData.rootstock)
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
          varieties,
          rootstock: rootstock || null,
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
    initialData.id, name, latitude, longitude, elevation, varieties, rootstock,
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

                <div className="space-y-1.5">
                  <Label>Primary Varieties</Label>
                  <VarietyTagInput varieties={varieties} onChange={setVarieties} />
                </div>

                <div className="space-y-1.5">
                  <Label>Rootstock</Label>
                  <RootstockSelector value={rootstock} onChange={setRootstock} />
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
