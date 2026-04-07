// ---------------------------------------------------------------------------
// OrchardGuard Settings Page — Server Component
// ---------------------------------------------------------------------------

import { getOrchard, getIrrigationConfig, getAlertPrefs, getOrchardBlocks } from "@/lib/db"
import { SettingsForm } from "./settings-form"
import { ExternalLink, BookOpen } from "lucide-react"

const ontarioResources = [
  {
    label: "OMAFRA Pub 360 — Crop Protection Guide",
    url: "http://www.omafra.gov.on.ca/english/crops/pub360/pub360A.htm",
  },
  {
    label: "ONfruit.ca — Ontario fruit crop updates",
    url: "https://onfruit.ca/",
  },
  {
    label: "U of Guelph Pest Diagnostic Clinic",
    url: "https://www.uoguelph.ca/pdp/",
  },
  {
    label: "Environment Canada Weather",
    url: "https://weather.gc.ca/city/pages/on-143_metric_e.html",
  },
]

export default async function SettingsPage() {
  const orchard = getOrchard()

  const initialData = orchard
    ? {
        id: orchard.id,
        name: orchard.name,
        latitude: orchard.latitude,
        longitude: orchard.longitude,
        elevation_m: orchard.elevation_m,
        primary_varieties: JSON.parse(orchard.primary_varieties) as string[],
        rootstock: orchard.rootstock ?? "",
        fire_blight_history: orchard.fire_blight_history,
        bloom_stage: orchard.bloom_stage,
        petal_fall_date: orchard.petal_fall_date ?? "",
        codling_moth_biofix_date: orchard.codling_moth_biofix_date ?? "",
      }
    : null

  const orchardBlocks = orchard ? getOrchardBlocks(orchard.id) : []

  const irrigConfig = orchard ? getIrrigationConfig(orchard.id) : null
  const irrigationData = irrigConfig
    ? {
        enabled: irrigConfig.enabled === 1,
        soil_type: irrigConfig.soil_type,
        root_depth_cm: irrigConfig.root_depth_cm,
        management_allowable_depletion: irrigConfig.management_allowable_depletion,
        irrigation_type: irrigConfig.irrigation_type,
        irrigation_rate_mm_per_hour: irrigConfig.irrigation_rate_mm_per_hour,
        irrigation_system_specs: irrigConfig.irrigation_system_specs,
        water_cost_per_m3: irrigConfig.water_cost_per_m3,
        block_area_ha: irrigConfig.block_area_ha,
        available_water_mm: irrigConfig.available_water_mm,
      }
    : null

  const alertPrefs = orchard ? getAlertPrefs(orchard.id) : undefined
  const alertData = alertPrefs
    ? {
        email: alertPrefs.email ?? "",
        phone: alertPrefs.phone ?? "",
        channel: (alertPrefs.channel ?? "email") as string,
        urgentEnabled: alertPrefs.urgent_enabled === 1,
        warningEnabled: alertPrefs.warning_enabled === 1,
        preparationEnabled: alertPrefs.preparation_enabled === 1,
        quietStart: alertPrefs.quiet_start ?? 22,
        quietEnd: alertPrefs.quiet_end ?? 5,
      }
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>Orchard Settings</h1>
        <p className="text-[14px] text-bark-400 mt-1">
          Configure your orchard location, varieties, and alert preferences.
          Keep your bloom stage current &mdash; most disease and pest models depend on it.
        </p>
      </div>

      {initialData ? (
        <SettingsForm
          initialData={initialData}
          irrigationData={irrigationData}
          alertData={alertData}
          initialBlocks={orchardBlocks}
        />
      ) : (
        <p className="text-body text-muted-foreground">
          No orchard found. The database may not be initialized.
        </p>
      )}

      {/* Ontario Resources */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Ontario Resources</h2>
        </div>
        <ul className="space-y-3">
          {ontarioResources.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-body text-primary underline-offset-4 hover:underline transition-colors"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
