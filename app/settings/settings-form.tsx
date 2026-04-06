"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
import {
  MapPin,
  Flower2,
  ShieldAlert,
  CloudSun,
  Bell,
  Droplets,
  Check,
  AlertCircle,
  Loader2,
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
  sand: 80,
  "loamy-sand": 100,
  "sandy-loam": 140,
  loam: 190,
  "clay-loam": 190,
  clay: 190,
}

const SYSTEM_EFF: Record<string, number> = {
  drip: 0.90,
  "micro-sprinkler": 0.80,
  overhead: 0.70,
  none: 1.0,
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

const FIRE_BLIGHT_HISTORIES = [
  { value: "none", label: "None" },
  { value: "nearby", label: "Nearby" },
  { value: "in_orchard", label: "In Orchard" },
] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsForm({
  initialData,
  irrigationData,
}: {
  initialData: OrchardData
  irrigationData?: IrrigationData | null
}) {
  const router = useRouter()

  // Form state
  const [name, setName] = useState(initialData.name)
  const [latitude, setLatitude] = useState(String(initialData.latitude))
  const [longitude, setLongitude] = useState(String(initialData.longitude))
  const [elevation, setElevation] = useState(String(initialData.elevation_m))
  const [varieties, setVarieties] = useState(
    initialData.primary_varieties.join(", "),
  )
  const [rootstock, setRootstock] = useState(initialData.rootstock)
  const [fireBlightHistory, setFireBlightHistory] = useState(
    initialData.fire_blight_history,
  )
  const [bloomStage, setBloomStage] = useState(initialData.bloom_stage)
  const [petalFallDate, setPetalFallDate] = useState(
    initialData.petal_fall_date,
  )
  const [codlingMothBiofix, setCodlingMothBiofix] = useState(
    initialData.codling_moth_biofix_date,
  )

  // Irrigation state
  const [irrigEnabled, setIrrigEnabled] = useState(irrigationData?.enabled ?? false)
  const [soilType, setSoilType] = useState(irrigationData?.soil_type ?? "loam")
  const [rootDepth, setRootDepth] = useState(String(irrigationData?.root_depth_cm ?? 60))
  const [mad, setMad] = useState(String((irrigationData?.management_allowable_depletion ?? 0.5) * 100))
  const [irrigType, setIrrigType] = useState(irrigationData?.irrigation_type ?? "none")
  const [irrigRate, setIrrigRate] = useState(String(irrigationData?.irrigation_rate_mm_per_hour ?? 4))
  const [waterCost, setWaterCost] = useState(String(irrigationData?.water_cost_per_m3 ?? 0.06))
  const [blockArea, setBlockArea] = useState(String(irrigationData?.block_area_ha ?? 1.0))

  // Auto-calculated soil values
  const awcPerM = SOIL_AWC[soilType] ?? 190
  const depthM = (parseFloat(rootDepth) || 60) / 100
  const availableWaterMm = Math.round(awcPerM * depthM * 10) / 10
  const triggerMm = Math.round(availableWaterMm * (parseFloat(mad) || 50) / 100 * 10) / 10
  const efficiency = SYSTEM_EFF[irrigType] ?? 1.0

  // Weather config
  const [envCanadaStationId, setEnvCanadaStationId] = useState("")

  // Alert config (placeholder)
  const [alertEmail, setAlertEmail] = useState("")
  const [alertPhone, setAlertPhone] = useState("")
  const [fireBlightAlerts, setFireBlightAlerts] = useState(true)
  const [frostAlerts, setFrostAlerts] = useState(true)
  const [sprayReminders, setSprayReminders] = useState(false)

  // Feedback state
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  async function handleSave() {
    setSaving(true)
    setFeedback(null)

    try {
      // Parse varieties from comma-separated string
      const varietyArray = varieties
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)

      const res = await fetch("/api/orchard/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: initialData.id,
          name,
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
          elevation: parseFloat(elevation),
          varieties: varietyArray,
          rootstock: rootstock || null,
          fire_blight_history: fireBlightHistory,
          bloom_stage: bloomStage,
          petal_fall_date: petalFallDate || null,
          codling_moth_biofix_date: codlingMothBiofix || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save settings")
      }

      // Save irrigation config
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

      setFeedback({ type: "success", message: "Settings saved successfully." })
      router.refresh()
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Orchard Profile ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Orchard Profile</h2>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Apple Orchard"
            />
          </div>

          {/* Location row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="43.65"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-79.38"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="elevation">Elevation (m)</Label>
              <Input
                id="elevation"
                type="number"
                step="any"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Varieties */}
          <div className="space-y-1.5">
            <Label htmlFor="varieties">Primary Varieties</Label>
            <Input
              id="varieties"
              value={varieties}
              onChange={(e) => setVarieties(e.target.value)}
              placeholder="Honeycrisp, Gala, McIntosh"
            />
            <p className="text-caption text-muted-foreground">
              Your varieties affect disease susceptibility ratings. Honeycrisp
              is highly susceptible to bitter pit and fire blight. McIntosh is
              susceptible to scab and powdery mildew.
            </p>
          </div>

          {/* Rootstock */}
          <div className="space-y-1.5">
            <Label htmlFor="rootstock">Rootstock</Label>
            <Input
              id="rootstock"
              value={rootstock}
              onChange={(e) => setRootstock(e.target.value)}
              placeholder="M.9, B.9, G.41"
            />
            <p className="text-caption text-muted-foreground">
              Dwarfing rootstocks (M.9, B.9) are more susceptible to fire
              blight, Phytophthora, and borer insects. This adjusts risk
              thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* ── Phenology ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flower2 className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Phenology</h2>
        </div>

        <div className="space-y-4">
          {/* Bloom stage */}
          <div className="space-y-1.5">
            <Label>Bloom Stage</Label>
            <Select
              value={bloomStage}
              onValueChange={(val) => val && setBloomStage(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOM_STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-caption text-muted-foreground">
              This is the most important setting to keep current. Many models
              depend on knowing your growth stage. Walk your orchard regularly
              and update this as buds progress. When in doubt, set it one stage
              behind &mdash; it&apos;s better to get an alert a day late than to
              miss an early one.
            </p>
          </div>

          {/* Codling moth biofix */}
          <div className="space-y-1.5">
            <Label htmlFor="codlingMothBiofix">
              Codling Moth Biofix Date
            </Label>
            <Input
              id="codlingMothBiofix"
              type="date"
              value={codlingMothBiofix}
              onChange={(e) => setCodlingMothBiofix(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">
              Date of first sustained codling moth catch in pheromone traps
            </p>
          </div>

          {/* Petal fall date */}
          <div className="space-y-1.5">
            <Label htmlFor="petalFallDate">Petal Fall Date</Label>
            <Input
              id="petalFallDate"
              type="date"
              value={petalFallDate}
              onChange={(e) => setPetalFallDate(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">
              Several pest models (plum curculio, sooty blotch) count degree
              days from this date. Set it when most petals have dropped.
            </p>
          </div>
        </div>
      </div>

      {/* ── Disease History ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Disease History</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Fire Blight History</Label>
            <Select
              value={fireBlightHistory}
              onValueChange={(val) =>
                setFireBlightHistory(
                  val as "none" | "nearby" | "in_orchard",
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIRE_BLIGHT_HISTORIES.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-caption text-muted-foreground">
              Set this based on last season. &ldquo;In orchard&rdquo; means fire
              blight bacteria are almost certainly overwintering in your trees
              &mdash; the system will use lower alert thresholds and more
              aggressive spray recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* ── Weather Sources ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <CloudSun className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Weather Sources</h2>
        </div>

        <div className="space-y-4">
          {/* Open-Meteo status */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-body font-medium">Open-Meteo</p>
              <p className="text-caption text-muted-foreground">
                Free weather API for forecast and historical data
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Active
            </span>
          </div>

          {/* Environment Canada station */}
          <div className="space-y-1.5">
            <Label htmlFor="envCanadaStation">
              Environment Canada Station ID
            </Label>
            <Input
              id="envCanadaStation"
              value={envCanadaStationId}
              onChange={(e) => setEnvCanadaStationId(e.target.value)}
              placeholder="e.g. ON/s0000458"
            />
            <p className="text-caption text-muted-foreground">
              Optional. Adds Environment Canada observations as a secondary
              data source.
            </p>
          </div>
        </div>
      </div>

      {/* ── Irrigation ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="size-5 text-blue-400" />
          <h2 className="text-card-title font-semibold">Irrigation</h2>
        </div>

        <div className="space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-body font-medium">Enable Irrigation Module</p>
              <p className="text-caption text-muted-foreground">
                Track soil moisture, ET, and irrigation scheduling
              </p>
            </div>
            <Switch
              checked={irrigEnabled}
              onCheckedChange={(val) => setIrrigEnabled(val as boolean)}
            />
          </div>

          {irrigEnabled && (
            <>
              {/* Soil type */}
              <div className="space-y-1.5">
                <Label>Soil Type</Label>
                <Select
                  value={soilType}
                  onValueChange={(val) => val && setSoilType(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">
                  Determines water-holding capacity. Sandy soils drain quickly and
                  need more frequent irrigation. Clay soils hold more water but
                  drain slowly.
                </p>
              </div>

              {/* Root depth + MAD */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rootDepth">Root Depth (cm)</Label>
                  <Input
                    id="rootDepth"
                    type="number"
                    min="30"
                    max="120"
                    step="5"
                    value={rootDepth}
                    onChange={(e) => setRootDepth(e.target.value)}
                  />
                  <p className="text-caption text-muted-foreground">
                    Active root zone. Typical apple: 45&ndash;90 cm.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mad">Irrigation Trigger (%)</Label>
                  <Input
                    id="mad"
                    type="number"
                    min="30"
                    max="70"
                    step="5"
                    value={mad}
                    onChange={(e) => setMad(e.target.value)}
                  />
                  <p className="text-caption text-muted-foreground">
                    Irrigate when this % of available water is depleted. Default 50%.
                  </p>
                </div>
              </div>

              {/* Auto-calculated summary */}
              <div className="rounded-lg bg-secondary/50 px-4 py-3">
                <p className="text-[12px] text-bark-400">
                  Available water in root zone:{" "}
                  <span className="font-data font-medium text-bark-600">
                    {availableWaterMm} mm
                  </span>
                  {" "}&middot;{" "}Irrigation trigger at{" "}
                  <span className="font-data font-medium text-bark-600">
                    {triggerMm} mm
                  </span>
                  {" "}depleted
                </p>
              </div>

              {/* Irrigation system */}
              <div className="space-y-1.5">
                <Label>Irrigation System</Label>
                <Select
                  value={irrigType}
                  onValueChange={(val) => val && setIrrigType(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IRRIGATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">
                  Drip: 90% efficient. Micro-sprinkler: 80%. Overhead: 70%.
                  System efficiency affects how much water to apply.
                </p>
              </div>

              {/* Rate, cost, area */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="irrigRate">Application Rate (mm/hr)</Label>
                  <Input
                    id="irrigRate"
                    type="number"
                    step="0.5"
                    value={irrigRate}
                    onChange={(e) => setIrrigRate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="waterCost">Water Cost ($/m&sup3;)</Label>
                  <Input
                    id="waterCost"
                    type="number"
                    step="0.01"
                    value={waterCost}
                    onChange={(e) => setWaterCost(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="blockArea">Block Area (ha)</Label>
                  <Input
                    id="blockArea"
                    type="number"
                    step="0.1"
                    value={blockArea}
                    onChange={(e) => setBlockArea(e.target.value)}
                  />
                </div>
              </div>

              {/* System summary */}
              <div className="rounded-lg bg-secondary/50 px-4 py-3">
                <p className="text-[12px] text-bark-400">
                  System efficiency:{" "}
                  <span className="font-data font-medium text-bark-600">
                    {Math.round(efficiency * 100)}%
                  </span>
                  {" "}&middot;{" "}
                  To refill {triggerMm}mm depleted:{" "}
                  <span className="font-data font-medium text-bark-600">
                    {Math.round((triggerMm / efficiency) * 10) / 10} mm
                  </span>
                  {" "}gross
                  {parseFloat(irrigRate) > 0 && (
                    <>
                      {" "}&middot;{" "}
                      <span className="font-data font-medium text-bark-600">
                        ~{Math.round((triggerMm / efficiency / parseFloat(irrigRate)) * 10) / 10} hrs
                      </span>
                      {" "}run time
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="alertEmail">Email</Label>
              <Input
                id="alertEmail"
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alertPhone">Phone</Label>
              <Input
                id="alertPhone"
                type="tel"
                value={alertPhone}
                onChange={(e) => setAlertPhone(e.target.value)}
                placeholder="+1 555-123-4567"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-body font-medium">Fire Blight Alerts</p>
                <p className="text-caption text-muted-foreground">
                  Notify when fire blight risk reaches high or extreme
                </p>
              </div>
              <Switch
                checked={fireBlightAlerts}
                onCheckedChange={(val) => setFireBlightAlerts(val as boolean)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-body font-medium">Frost Alerts</p>
                <p className="text-caption text-muted-foreground">
                  Notify when frost risk is high or critical
                </p>
              </div>
              <Switch
                checked={frostAlerts}
                onCheckedChange={(val) => setFrostAlerts(val as boolean)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-body font-medium">Spray Reminders</p>
                <p className="text-caption text-muted-foreground">
                  Notify when PHI or REI windows are approaching
                </p>
              </div>
              <Switch
                checked={sprayReminders}
                onCheckedChange={(val) => setSprayReminders(val as boolean)}
              />
            </div>
          </div>

          <p className="text-caption text-muted-foreground italic">
            Alert delivery is not yet implemented. Configuration is saved for
            future use.
          </p>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-body ${
            feedback.type === "success"
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* ── Save Button — sticky on mobile ── */}
      <div className="sticky bottom-4 z-10 sm:static sm:bottom-auto">
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
  )
}
