// ---------------------------------------------------------------------------
// Alert Evaluator — 4-tier predictive alerts for all weather-driven models
//
// Each disease/pest model follows the same alert pattern:
//   PREPARATION  (3-5 days ahead): "Heads up — check inventory"
//   WARNING      (1-2 days ahead): "Spray tomorrow — apply X before Y"
//   URGENT       (during event):   "Event in progress — do X now"
//   FOLLOW-UP    (after event):    "Event occurred Xh ago — remaining window"
//
// Models covered: Apple Scab, Fire Blight, Powdery Mildew, Cedar Apple Rust,
//   Black Rot, Bitter Rot, Sooty Blotch/Flyspeck
// Also: Frost (urgent only), Codling Moth (warning), Spray Coverage
// ---------------------------------------------------------------------------

import type { PendingAlert, AlertEvaluation } from "./types"
import type { AllModelResults } from "@/lib/models"
import type { WeekAheadData, ForecastDaySummary } from "@/lib/forecast/types"
import { getStageFromDD, getModelStageRelevance, PHENOLOGY_STAGES } from "@/lib/phenology"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOOM_STAGES = new Set(["bloom", "petal-fall"])
const PRE_GREENTIP = new Set(["dormant", "silver-tip"])
const FB_ACTIVE_STAGES = new Set(["pink", "bloom", "petal-fall"])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Estimate wet hours from daily precipitation total (matches engine.ts). */
function estimateWetHours(precipMm: number): number {
  if (precipMm <= 0.5) return 0
  if (precipMm <= 5) return 7
  if (precipMm <= 15) return 11
  return 18
}

/** Hours from now until noon of the given forecast day. */
function hoursUntil(day: ForecastDaySummary, nowMs: number): number {
  return (new Date(day.date + "T12:00:00").getTime() - nowMs) / 3600000
}

/** "today" or "tomorrow" label for spray timing. */
function sprayTimeLabel(hoursAhead: number): string {
  return hoursAhead < 36 ? "today" : "tomorrow"
}

/** Simple degree-day estimate from daily high/low (average method). */
function dailyDD(highTemp: number, lowTemp: number, baseTemp: number): number {
  return Math.max(0, (highTemp + lowTemp) / 2 - baseTemp)
}

/**
 * Project how many days until a DD threshold is reached, using 7-day forecast
 * weather. Returns null if DD won't accumulate (too cold) or the model has no
 * remaining threshold.
 */
function projectDaysToDD(
  currentDD: number,
  targetDD: number,
  days: ForecastDaySummary[],
  baseTemp: number,
): number | null {
  if (currentDD >= targetDD) return 0
  let accum = currentDD
  for (let i = 0; i < days.length; i++) {
    accum += dailyDD(days[i].highTemp, days[i].lowTemp, baseTemp)
    if (accum >= targetDD) return i + 1
  }
  // Extrapolate beyond 7-day forecast using the average daily rate
  if (days.length === 0) return null
  const totalAccum = accum - currentDD
  const avgDaily = totalAccum / days.length
  if (avgDaily <= 0) return null
  return Math.round(days.length + (targetDD - accum) / avgDaily)
}

// ---------------------------------------------------------------------------
// Main evaluator
// ---------------------------------------------------------------------------

export function evaluateAlerts(
  modelResults: AllModelResults,
  weekAhead: WeekAheadData,
  bloomStage: string,
  seasonDD?: number,
): AlertEvaluation {
  const urgent: PendingAlert[] = []
  const warning: PendingAlert[] = []
  const preparation: PendingAlert[] = []
  const now = new Date().toISOString()
  const nowMs = Date.now()

  // Track model+day combos that already have a specific alert so the generic
  // 48h loop doesn't duplicate them
  const handledWarnings = new Set<string>()

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLE SCAB
  // ═══════════════════════════════════════════════════════════════════════════

  const scab = modelResults.appleScab

  // ── URGENT: active wet period (infection in progress) ──
  if ((scab.riskLevel === "severe" || scab.riskLevel === "moderate") &&
    scab.currentWetPeriod?.infectionOccurred) {
    const wp = scab.currentWetPeriod!
    const hoursSoFar = wp.durationHours ?? 0
    urgent.push({
      level: "urgent",
      model: "appleScab",
      title: "Apple Scab: INFECTION IN PROGRESS",
      message: `Wet period active — ${hoursSoFar}h so far at ${wp.meanTemp?.toFixed(1)}°C.${wp.severity && wp.severity !== "none" ? ` ${wp.severity} infection conditions met.` : ""} If no protectant was applied before this rain, you have ~72h from wet period start for kickback fungicide (Inspire Super, Nova, or Syllit).`,
      action: "Apply curative (kickback) fungicide as soon as rain stops and leaves are dry enough to spray.",
      detectedAt: now,
    })
  }

  // ── FOLLOW-UP: past infection with kickback window ──
  else if ((scab.riskLevel === "severe" || scab.riskLevel === "moderate") &&
    scab.recentInfections?.length > 0) {
    const infection = scab.recentInfections[0]
    const hoursSince = infection.startTime
      ? Math.round((nowMs - new Date(infection.startTime).getTime()) / 3600000) : 0
    const kickbackLeft = Math.max(0, 96 - hoursSince)

    urgent.push({
      level: "urgent",
      model: "appleScab",
      title: kickbackLeft > 0
        ? `Apple Scab: ${infection.severity} infection — ${kickbackLeft}h kickback remaining`
        : `Apple Scab: ${infection.severity} infection — kickback window closed`,
      message: `A ${infection.severity} scab infection occurred ~${hoursSince}h ago (${infection.durationHours}h wet period at ${infection.meanTemp?.toFixed(1)}°C). ${kickbackLeft > 0 ? `You have approximately ${kickbackLeft} hours remaining for curative fungicide.` : "The kickback window has closed — apply protectant before the next rain."}`,
      action: kickbackLeft > 0
        ? "Apply curative fungicide (Inspire Super, Nova, or Syllit) immediately."
        : "Apply protectant fungicide (Captan, mancozeb) before the next rain event.",
      detectedAt: now,
    })
  }

  // ── PREDICTIVE: scan forecast for scab infection conditions ──
  if (!PRE_GREENTIP.has(bloomStage)) {
    let addedHeadsUp = false
    let addedSprayNow = false

    for (const day of weekAhead.days) {
      const risk = day.risks.find(
        (r) => r.model === "appleScab" &&
          (r.riskLevel === "high" || r.riskLevel === "critical" || r.riskLevel === "moderate"),
      )
      if (!risk) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "appleScab",
          title: `Heads up — scab infection conditions likely ${day.dayName}`,
          message: `${risk.summary} Check protectant fungicide (Captan, mancozeb) inventory and confirm sprayer is calibrated.`,
          action: "Check fungicide inventory. Test sprayer calibration. Plan spray timing.",
          detectedAt: now,
        })
        addedHeadsUp = true
      } else if (ha >= 12 && ha < 60 && !addedSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "appleScab",
          title: `Spray ${when} — rain ${day.dayName} will cause scab infection`,
          message: `${risk.summary} Apply protectant fungicide (Captan or mancozeb) ${when} afternoon before rain starts. Spray must dry 2+ hours before rain.`,
          action: risk.action ?? `Apply protectant fungicide ${when}. Ensure 2+ hour rainfast window.`,
          detectedAt: now,
        })
        handledWarnings.add(`appleScab:${day.date}`)
        addedSprayNow = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FIRE BLIGHT
  // ═══════════════════════════════════════════════════════════════════════════

  const fb = modelResults.fireBlight
  const fbRisk = fb.combinedRisk ?? fb.cougarBlight?.adjustedRisk ?? "low"
  const isFireBlightSeason = FB_ACTIVE_STAGES.has(bloomStage)

  if (isFireBlightSeason) {
    const dh = fb.cougarBlight?.degreeHours4Day ?? 0

    // ── URGENT: MaryBlyt infection event — all 4 conditions met ──
    if (fb.maryBlyt?.infectionEvent) {
      urgent.push({
        level: "urgent",
        model: "fireBlight",
        title: "Fire Blight: INFECTION EVENT IN PROGRESS",
        message: `All 4 MaryBlyt conditions met — open blossoms, ${Math.round(dh)} degree hours, wetting event, warm temps. Bacteria are entering blossoms NOW.`,
        action: "Apply streptomycin IMMEDIATELY if not already applied. There is NO kickback for fire blight — must be on blossoms before bacteria arrive.",
        detectedAt: now,
      })
    }
    // ── URGENT: extreme/high risk during bloom ──
    else if (fbRisk === "extreme" || fbRisk === "high") {
      urgent.push({
        level: "urgent",
        model: "fireBlight",
        title: `Fire Blight: ${fbRisk.toUpperCase()} risk during ${bloomStage}`,
        message: `${Math.round(dh)} degree hours accumulated. Bacterial populations building rapidly on open blossoms.${fb.maryBlyt?.eip > 100 ? ` EIP: ${Math.round(fb.maryBlyt.eip)} — high bacterial load.` : ""}`,
        action: "Apply streptomycin BEFORE any rain or heavy dew. Do not delay.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: infection event occurred, watch for symptoms ──
    if (!fb.maryBlyt?.infectionEvent && fb.maryBlyt?.expectedSymptomDate) {
      const symptomDate = fb.maryBlyt.expectedSymptomDate
      const daysTo = Math.round(
        (new Date(symptomDate + "T00:00:00").getTime() - nowMs) / 86400000,
      )
      if (daysTo > 0 && daysTo <= 21) {
        warning.push({
          level: "warning",
          model: "fireBlight",
          title: `Fire Blight: infection occurred — symptoms expected in ~${daysTo} days`,
          message: `A fire blight infection event was detected. Bacterial ooze and shoot wilting expected around ${symptomDate}. Scout blossoms and shoots daily.`,
          action: "Scout daily. Remove symptomatic strikes — cut 12+ inches below visible symptoms. Sterilize tools between cuts.",
          detectedAt: now,
        })
      }
    }

    // ── PREDICTIVE: scan forecast for fire blight risk building ──
    let addedFbHeadsUp = false
    let addedFbSprayNow = false

    for (const day of weekAhead.days) {
      const risk = day.risks.find(
        (r) => r.model === "fireBlight" &&
          (r.riskLevel === "high" || r.riskLevel === "critical" || r.riskLevel === "moderate"),
      )
      if (!risk) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedFbHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "fireBlight",
          title: `Heads up — fire blight conditions building toward ${day.dayName}`,
          message: `${risk.summary} Have streptomycin or Kasumin ready. If using Blossom Protect, apply 2-3 days before the event for colonization.`,
          action: "Check streptomycin inventory. Confirm Blossom Protect schedule if using biologicals.",
          detectedAt: now,
        })
        addedFbHeadsUp = true
      } else if (ha >= 12 && ha < 60 && !addedFbSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "fireBlight",
          title: `Spray ${when} — fire blight conditions ${day.dayName}`,
          message: `${risk.summary} Apply streptomycin ${when} evening or ${day.dayName} morning BEFORE rain. There is no kickback — must be on blossoms before bacteria arrive.`,
          action: risk.action ?? `Apply streptomycin ${when}. Must be applied BEFORE wetting event.`,
          detectedAt: now,
        })
        handledWarnings.add(`fireBlight:${day.date}`)
        addedFbSprayNow = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FROST RISK
  // ═══════════════════════════════════════════════════════════════════════════

  const frost = modelResults.frostRisk
  const frostVulnerable = !["dormant", "silver-tip"].includes(bloomStage)

  if (frostVulnerable) {
    // ── URGENT: high/critical — frost imminent or in progress ──
    if (frost.riskLevel === "critical" || frost.riskLevel === "high") {
      urgent.push({
        level: "urgent",
        model: "frostRisk",
        title: `FROST ${frost.riskLevel === "critical" ? "IN PROGRESS" : "TONIGHT"} — ${frost.forecastLow.toFixed(1)}°C forecast`,
        message: `Forecast low ${frost.forecastLow.toFixed(1)}°C. Your ${bloomStage} buds have 10% kill at ${frost.killThreshold10.toFixed(0)}°C, 90% kill at ${frost.killThreshold90.toFixed(0)}°C. ${frost.riskLevel === "critical" ? "Damage may be occurring." : `Only ${frost.marginC.toFixed(1)}°C of margin.`}`,
        action: "Deploy frost protection NOW — wind machines, overhead irrigation, or orchard heaters.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: moderate = close call, scout for damage ──
    else if (frost.riskLevel === "moderate") {
      warning.push({
        level: "warning",
        model: "frostRisk",
        title: `Frost advisory — overnight low reached ${frost.forecastLow.toFixed(1)}°C near ${bloomStage} damage threshold`,
        message: `Overnight low of ${frost.forecastLow.toFixed(1)}°C was within ${frost.marginC.toFixed(1)}°C of the ${frost.killThreshold10.toFixed(0)}°C 10% kill threshold for ${bloomStage}. Marginal damage possible.`,
        action: "Scout for browning in blossom centers and fruitlet damage. Check most frost-prone areas first.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: scan forecast for frost risk days ahead ──
    let addedFrostPrep = false
    let addedFrostWarn = false

    for (const day of weekAhead.days) {
      if (day.isToday) continue // today handled by model result above
      // Check if low is near or below kill threshold for current stage
      if (day.lowTemp > frost.killThreshold10 + 5) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedFrostPrep) {
        preparation.push({
          level: "preparation",
          model: "frostRisk",
          title: `Frost advisory — overnight low of ${day.lowTemp.toFixed(0)}°C forecast ${day.dayName}`,
          message: `Your ${bloomStage} buds have 10% kill at ${frost.killThreshold10.toFixed(0)}°C. Forecast low of ${day.lowTemp.toFixed(0)}°C is ${day.lowTemp <= frost.killThreshold10 ? "below" : `within ${(day.lowTemp - frost.killThreshold10).toFixed(0)}°C of`} damage threshold.`,
          action: "Check frost protection equipment — wind machines, irrigation, heaters. Have them ready to deploy.",
          detectedAt: now,
        })
        addedFrostPrep = true
      } else if (ha >= 12 && ha < 60 && !addedFrostWarn) {
        warning.push({
          level: "warning",
          model: "frostRisk",
          title: `Frost ${day.dayName} — low of ${day.lowTemp.toFixed(0)}°C, ${bloomStage} buds kill at ${frost.killThreshold10.toFixed(0)}°C`,
          message: `Forecast low of ${day.lowTemp.toFixed(0)}°C ${day.lowTemp <= frost.killThreshold10 ? "is below your" : "is near your"} ${bloomStage} 10% kill threshold (${frost.killThreshold10.toFixed(0)}°C). Protect with irrigation or wind machines if available.`,
          action: "Deploy frost protection before sunset. Wind machines should run from 2 AM; irrigation must run continuously through thaw.",
          detectedAt: now,
        })
        handledWarnings.add(`frostRisk:${day.date}`)
        addedFrostWarn = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POWDERY MILDEW
  // ═══════════════════════════════════════════════════════════════════════════

  const pm = modelResults.powderyMildew
  const pmActive = pm.primaryInfectionWindow || pm.secondaryInfectionWindow

  if (pmActive) {
    // ── URGENT: extended favorable period — infection likely occurred ──
    if (pm.riskLevel === "high" && pm.consecutiveFavorableHours >= 72) {
      urgent.push({
        level: "urgent",
        model: "powderyMildew",
        title: "Powdery Mildew: infection conditions met",
        message: `${pm.consecutiveFavorableHours}h of consecutive favorable conditions (10-25°C, >70% humidity, dry). Infection has likely already occurred on susceptible tissue.`,
        action: "Apply curative fungicide (Nova, Flint, or Merivon) now. Sulfur is protectant-only and will not stop established infections.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: moderate risk with significant favorable hours ──
    else if (pm.riskLevel === "moderate" && pm.consecutiveFavorableHours >= 48) {
      warning.push({
        level: "warning",
        model: "powderyMildew",
        title: `Powdery Mildew: ${pm.consecutiveFavorableHours}h favorable conditions — approaching infection threshold`,
        message: `${pm.consecutiveFavorableHours} consecutive hours of mildew-favorable conditions. Infection threshold is 72h. Apply protectant before conditions extend further.`,
        action: "Apply protectant fungicide (sulfur, Flint, or Merivon) before conditions continue.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: scan forecast for warm, humid, dry stretches ──
    let addedPmHeadsUp = false
    let addedPmSprayNow = false

    // Count consecutive mildew-favorable forecast days
    let consecutiveFavorable = 0
    let firstFavorableDay: ForecastDaySummary | null = null

    for (const day of weekAhead.days) {
      const meanT = (day.highTemp + day.lowTemp) / 2
      const isFavorable = meanT >= 10 && meanT <= 25 && day.avgHumidity > 70 && day.precipMm < 0.5

      if (isFavorable) {
        consecutiveFavorable++
        if (!firstFavorableDay) firstFavorableDay = day
      } else {
        // Check accumulated stretch before resetting
        if (consecutiveFavorable >= 2 && firstFavorableDay) {
          const ha = hoursUntil(firstFavorableDay, nowMs)

          if (ha >= 60 && ha <= 120 && !addedPmHeadsUp) {
            preparation.push({
              level: "preparation",
              model: "powderyMildew",
              title: `Heads up — ${consecutiveFavorable} warm humid days forecast starting ${firstFavorableDay.dayName}`,
              message: `Extended warm (10-25°C), humid (>70%), dry conditions forecast. Ideal for powdery mildew development. Check Nova, Flint, or sulfur inventory.`,
              action: "Check mildew fungicide inventory. Plan application before favorable stretch begins.",
              detectedAt: now,
            })
            addedPmHeadsUp = true
          } else if (ha >= 12 && ha < 60 && !addedPmSprayNow) {
            const when = sprayTimeLabel(ha)
            warning.push({
              level: "warning",
              model: "powderyMildew",
              title: `Spray ${when} — ${consecutiveFavorable}-day mildew-favorable stretch starting ${firstFavorableDay.dayName}`,
              message: `Warm, humid, dry conditions forecast for ${consecutiveFavorable} days. Apply mildew protectant ${when} before conditions develop.`,
              action: `Apply sulfur, Flint, or Merivon ${when}. Must be applied before mildew establishes.`,
              detectedAt: now,
            })
            addedPmSprayNow = true
          }
        }
        consecutiveFavorable = 0
        firstFavorableDay = null
      }
    }

    // Check final accumulated stretch (if favorable days extend to end of forecast)
    if (consecutiveFavorable >= 2 && firstFavorableDay) {
      const ha = hoursUntil(firstFavorableDay, nowMs)
      if (ha >= 60 && ha <= 120 && !addedPmHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "powderyMildew",
          title: `Heads up — ${consecutiveFavorable} warm humid days forecast starting ${firstFavorableDay.dayName}`,
          message: `Extended warm, humid, dry conditions forecast. Ideal for powdery mildew. Check fungicide inventory.`,
          action: "Check mildew fungicide inventory. Plan application before favorable stretch begins.",
          detectedAt: now,
        })
      } else if (ha >= 12 && ha < 60 && !addedPmSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "powderyMildew",
          title: `Spray ${when} — mildew-favorable stretch starting ${firstFavorableDay.dayName}`,
          message: `Warm, humid, dry conditions forecast for ${consecutiveFavorable} days. Apply mildew protectant before conditions develop.`,
          action: `Apply sulfur, Flint, or Merivon ${when}.`,
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CEDAR APPLE RUST
  // ═══════════════════════════════════════════════════════════════════════════

  const cr = modelResults.cedarRust

  if (cr.inSusceptibleWindow || cr.infectionWindowStatus === "approaching") {
    // ── URGENT: active sporulation — spores being released now ──
    if (cr.riskLevel === "high" && cr.sporulationEvents > 0) {
      urgent.push({
        level: "urgent",
        model: "cedarRust",
        title: "Cedar Apple Rust: spore release event in progress",
        message: `${cr.sporulationEvents} telial horn wetting event(s) detected — rain >2.5mm at >10°C. Rust spores actively dispersing from juniper to apple foliage.`,
        action: "Apply fungicide (mancozeb, myclobutanil/Nova, or Flint) immediately if not already protected.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: recent rain events during susceptible window ──
    else if (cr.riskLevel === "moderate" && cr.recentRainEvents > 0) {
      warning.push({
        level: "warning",
        model: "cedarRust",
        title: `Cedar Apple Rust: ${cr.recentRainEvents} rain event(s) during susceptible window`,
        message: `Rain at warm temps during the rust-susceptible window. Spores may have been deposited on apple tissue. Apply protectant before next rain if unprotected.`,
        action: "Apply mancozeb or Nova before the next rain event. Inspect leaves for yellow-orange lesions.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: scan forecast for rain >2.5mm at >10°C ──
    let addedCrHeadsUp = false
    let addedCrSprayNow = false

    for (const day of weekAhead.days) {
      const meanT = (day.highTemp + day.lowTemp) / 2
      if (day.precipMm <= 2.5 || meanT <= 10) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedCrHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "cedarRust",
          title: `Heads up — rust sporulation likely ${day.dayName}`,
          message: `Rain (${day.precipMm.toFixed(0)}mm) at ${meanT.toFixed(0)}°C forecast. Will trigger telial horn swelling and spore release from junipers. Check mancozeb or Nova inventory.`,
          action: "Check fungicide inventory. Plan spray before rain arrives.",
          detectedAt: now,
        })
        addedCrHeadsUp = true
      } else if (ha >= 12 && ha < 60 && !addedCrSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "cedarRust",
          title: `Spray ${when} — rain ${day.dayName} will trigger rust spore release`,
          message: `Rain (${day.precipMm.toFixed(0)}mm) at ${meanT.toFixed(0)}°C will cause telial horns to swell and release spores. Apply protectant ${when} before rain.`,
          action: `Apply mancozeb or Nova ${when}. Must dry before rain starts.`,
          detectedAt: now,
        })
        addedCrSprayNow = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLACK ROT
  // ═══════════════════════════════════════════════════════════════════════════

  const br = modelResults.blackRot

  if (!PRE_GREENTIP.has(bloomStage)) {
    // ── URGENT: multiple active infection periods ──
    if (br.riskLevel === "high" && br.infectionPeriods >= 3) {
      urgent.push({
        level: "urgent",
        model: "blackRot",
        title: `Black Rot: ${br.infectionPeriods} infection periods detected — HIGH risk`,
        message: `${br.infectionPeriods} qualifying wet periods (>9h at 15-30°C) in the last 7 days. Multiple infection events create compounding disease pressure.`,
        action: "Apply Captan or mancozeb immediately. Remove mummified fruit and dead wood to reduce inoculum.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: infection period(s) detected ──
    else if (br.infectionPeriods > 0) {
      warning.push({
        level: "warning",
        model: "blackRot",
        title: `Black Rot: ${br.infectionPeriods} infection period(s) detected`,
        message: `${br.infectionPeriods} wet period(s) exceeding 9h at 15-30°C in the last 7 days. Infections likely occurred on unprotected tissue.`,
        action: "Apply protectant fungicide (Captan or mancozeb) before the next rain. Scout for frog-eye leaf spots and fruit lesions.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: scan forecast for heavy rain at 15-30°C ──
    let addedBrHeadsUp = false
    let addedBrSprayNow = false

    for (const day of weekAhead.days) {
      const meanT = (day.highTemp + day.lowTemp) / 2
      const wetHrs = estimateWetHours(day.precipMm)
      if (wetHrs < 9 || meanT < 15 || meanT > 30) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedBrHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "blackRot",
          title: `Heads up — black rot infection conditions likely ${day.dayName}`,
          message: `Heavy rain (${day.precipMm.toFixed(0)}mm, ~${wetHrs}h wet) at ${meanT.toFixed(0)}°C forecast. Exceeds 9h/15-30°C infection threshold. Check Captan inventory.`,
          action: "Check Captan or mancozeb inventory. Remove mummified fruit from canopy if not yet done.",
          detectedAt: now,
        })
        addedBrHeadsUp = true
      } else if (ha >= 12 && ha < 60 && !addedBrSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "blackRot",
          title: `Spray ${when} — rain ${day.dayName} will create black rot infection conditions`,
          message: `Heavy rain (${day.precipMm.toFixed(0)}mm) at ${meanT.toFixed(0)}°C will exceed the 9h wet period threshold for black rot infection. Apply protectant ${when}.`,
          action: `Apply Captan or mancozeb ${when} before rain starts.`,
          detectedAt: now,
        })
        addedBrSprayNow = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BITTER ROT
  // ═══════════════════════════════════════════════════════════════════════════

  const btr = modelResults.bitterRot

  // Bitter rot is relevant post petal-fall with warm temps; model tracks via DD
  if (btr.cumulativeDD15 > 0 || btr.warmWetEvents > 0) {
    // ── URGENT: high/extreme risk with active warm wet events ──
    if ((btr.riskLevel === "extreme" || btr.riskLevel === "high") && btr.warmWetEvents > 0) {
      urgent.push({
        level: "urgent",
        model: "bitterRot",
        title: `Bitter Rot: ${btr.riskLevel.toUpperCase()} — ${btr.latentInfections} latent infection(s)`,
        message: `${btr.warmWetEvents} hot wet event(s) (>5h at >21°C). ${Math.round(btr.cumulativeDD15)} DD accumulated (base 15°C). ${btr.latentInfections} estimated latent infections building toward harvest.`,
        action: "Apply Captan, Pristine, or Merivon immediately. Maintain tight cover spray intervals through harvest.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: warm wet events occurred, moderate risk ──
    else if (btr.warmWetEvents > 0 && btr.riskLevel === "moderate") {
      warning.push({
        level: "warning",
        model: "bitterRot",
        title: `Bitter Rot: ${btr.warmWetEvents} hot wet event(s) — latent infections possible`,
        message: `${btr.warmWetEvents} warm wet event(s) detected (>5h at >21°C). Latent infections may develop symptoms closer to harvest. Maintain cover spray program.`,
        action: "Maintain Captan or Pristine cover spray. Scout fruit for small tan lesions with pink spore masses.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: scan forecast for hot (>21°C) + wet days ──
    let addedBtrHeadsUp = false
    let addedBtrSprayNow = false

    for (const day of weekAhead.days) {
      if (day.highTemp <= 21 || day.precipMm <= 2) continue

      const ha = hoursUntil(day, nowMs)

      if (ha >= 60 && ha <= 120 && !addedBtrHeadsUp) {
        preparation.push({
          level: "preparation",
          model: "bitterRot",
          title: `Heads up — hot wet conditions forecast ${day.dayName}`,
          message: `Rain (${day.precipMm.toFixed(0)}mm) at ${day.highTemp.toFixed(0)}°C forecast. Exceeds 21°C threshold for bitter rot infection. Check Captan or Pristine inventory.`,
          action: "Check cover spray inventory (Captan, Pristine, Merivon). Ensure coverage is current.",
          detectedAt: now,
        })
        addedBtrHeadsUp = true
      } else if (ha >= 12 && ha < 60 && !addedBtrSprayNow) {
        const when = sprayTimeLabel(ha)
        warning.push({
          level: "warning",
          model: "bitterRot",
          title: `Spray ${when} — hot rain ${day.dayName} will trigger bitter rot infections`,
          message: `Rain (${day.precipMm.toFixed(0)}mm) at ${day.highTemp.toFixed(0)}°C — ideal conditions for Colletotrichum infection on fruit. Apply cover spray ${when}.`,
          action: `Apply Captan, Pristine, or Merivon ${when} before rain.`,
          detectedAt: now,
        })
        addedBtrSprayNow = true
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOOTY BLOTCH / FLYSPECK
  // ═══════════════════════════════════════════════════════════════════════════

  const sb = modelResults.sootyBlotch

  // Active after petal fall (daysSincePetalFall > 0 or threshold tracking has begun)
  if (sb.daysSincePetalFall > 0) {
    // ── URGENT: humidity threshold crossed ──
    if (sb.percentToThreshold >= 100) {
      urgent.push({
        level: "urgent",
        model: "sootyBlotch",
        title: "Sooty Blotch/Flyspeck: humidity threshold CROSSED",
        message: `${Math.round(sb.cumulativeHumidHours)} humid hours accumulated — exceeds ${sb.threshold}h ${sb.microclimate} threshold. SBFS symptoms will appear on unprotected fruit within days.`,
        action: "Apply Captan + Flint (or Merivon) immediately. This is the last window before visible cosmetic damage.",
        detectedAt: now,
      })
    }

    // ── WARNING: approaching threshold (≥85%) ──
    else if (sb.percentToThreshold >= 85) {
      warning.push({
        level: "warning",
        model: "sootyBlotch",
        title: `Sooty Blotch/Flyspeck: ${Math.round(sb.percentToThreshold)}% to threshold — spray soon`,
        message: `${Math.round(sb.cumulativeHumidHours)} of ${sb.threshold} humid hours accumulated (${Math.round(sb.percentToThreshold)}%). ${sb.trendDirection === "increasing" ? "Trend is increasing — threshold will be reached soon." : ""} Apply fungicide before threshold is crossed.`,
        action: "Apply Captan or Flint within the next few days. Once threshold is crossed, cosmetic damage begins.",
        detectedAt: now,
      })
    }

    // ── PREDICTIVE: humid forecast pushing accumulation toward threshold ──
    else if (sb.percentToThreshold >= 60 && sb.trendDirection === "increasing") {
      // Count forecast days with high humidity
      const humidForecastDays = weekAhead.days.filter((d) => d.avgHumidity > 85).length

      if (humidForecastDays >= 3) {
        preparation.push({
          level: "preparation",
          model: "sootyBlotch",
          title: `Heads up — SBFS at ${Math.round(sb.percentToThreshold)}%, humid forecast will push toward threshold`,
          message: `Currently at ${Math.round(sb.cumulativeHumidHours)} of ${sb.threshold} humid hours (${Math.round(sb.percentToThreshold)}%). ${humidForecastDays} humid days in the 7-day forecast will accelerate accumulation. Check Captan or Flint inventory.`,
          action: "Check fungicide inventory. Plan SBFS spray before threshold is reached.",
          detectedAt: now,
        })
      }
    }

    // ── PREDICTIVE: even at lower %, warn if forecast is very humid ──
    if (sb.percentToThreshold >= 40 && sb.percentToThreshold < 85) {
      const veryHumidDays = weekAhead.days.filter((d) => d.avgHumidity > 90).length
      if (veryHumidDays >= 4) {
        const alreadyHasPrep = preparation.some((p) => p.model === "sootyBlotch")
        if (!alreadyHasPrep) {
          preparation.push({
            level: "preparation",
            model: "sootyBlotch",
            title: `Heads up — extended humidity forecast accelerating SBFS accumulation`,
            message: `${veryHumidDays} very humid days (>90%) in the forecast. At ${Math.round(sb.percentToThreshold)}% of threshold, this will significantly advance the accumulation. Monitor closely.`,
            action: "Monitor SBFS accumulation. Have Captan or Flint ready for when threshold approaches 85%.",
            detectedAt: now,
          })
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC CATCH-ALL WARNINGS (48h high/critical from forecast)
  // ═══════════════════════════════════════════════════════════════════════════

  const next48hDays = weekAhead.days.filter((d) => {
    const dayDate = new Date(d.date + "T00:00:00")
    return (dayDate.getTime() - nowMs) / 3600000 > 0 &&
      (dayDate.getTime() - nowMs) / 3600000 <= 48
  })

  for (const day of next48hDays) {
    for (const risk of day.risks) {
      if (risk.riskLevel === "high" || risk.riskLevel === "critical") {
        // Skip if we already created a specific predictive alert for this model+day
        if (handledWarnings.has(`${risk.model}:${day.date}`)) continue

        warning.push({
          level: "warning",
          model: risk.model,
          title: `${risk.modelTitle}: ${risk.riskLevel} risk ${day.dayName}`,
          message: risk.summary,
          action: risk.action,
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CODLING MOTH
  // ═══════════════════════════════════════════════════════════════════════════

  const cm = modelResults.codlingMoth
  const cmTarget = cm.nextThreshold
  const cmDaysTo = cmTarget
    ? projectDaysToDD(cm.cumulativeDD, cmTarget.dd, weekAhead.days, 10)
    : null

  {
    // ── URGENT: threshold crossed — hatch in progress ──
    if (cm.riskLevel === "critical" || cm.riskLevel === "high") {
      const label = cm.currentThreshold || "egg hatch"
      urgent.push({
        level: "urgent",
        model: "codlingMoth",
        title: `Codling Moth: ${Math.round(cm.cumulativeDD)} DD — ${label}`,
        message: `${cm.details} Gen ${cm.generation} activity in progress. Apply cover spray immediately.`,
        action: cm.recommendation ?? "Apply Altacor, Assail, or Imidan NOW. Ensure full coverage.",
        detectedAt: now,
      })
    }

    // ── WARNING: threshold 1-3 days away ──
    else if (cmTarget && cmDaysTo !== null && cmDaysTo >= 1 && cmDaysTo <= 3) {
      warning.push({
        level: "warning",
        model: "codlingMoth",
        title: `Codling Moth: ${cmTarget.label} expected in ${cmDaysTo} day(s)`,
        message: `${Math.round(cm.cumulativeDD)} of ${cmTarget.dd} DD accumulated. ${cmTarget.label} expected in ~${cmDaysTo} days. Plan first cover spray.`,
        action: `Have Altacor or Assail ready. Plan spray for the best weather window in the next ${cmDaysTo} day(s).`,
        detectedAt: now,
      })
    }

    // ── PREPARATION: threshold 4-14 days away ──
    else if (cmTarget && cmDaysTo !== null && cmDaysTo >= 4 && cmDaysTo <= 14) {
      preparation.push({
        level: "preparation",
        model: "codlingMoth",
        title: `Codling Moth: ${cmTarget.label} in ~${cmDaysTo} days (${Math.round(cm.cumulativeDD)} of ${cmTarget.dd} DD)`,
        message: `${cm.ddToNextThreshold.toFixed(0)} DD remaining to ${cmTarget.label}. Order Altacor or Assail if needed.`,
        action: "Check insecticide inventory. Confirm sprayer calibration.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: past one threshold, approaching next ──
    else if (cm.riskLevel === "moderate" && cmTarget && cm.cumulativeDD > 100) {
      warning.push({
        level: "warning",
        model: "codlingMoth",
        title: `Codling Moth: maintain coverage — ${cmTarget.label} at ${cmTarget.dd} DD`,
        message: `${cm.details} ${cmDaysTo !== null ? `Next event (${cmTarget.label}) in ~${cmDaysTo} days.` : ""} Maintain spray coverage — re-apply in 14 days.`,
        action: cm.recommendation ?? "Maintain cover spray program. Re-apply at 14-day intervals.",
        detectedAt: now,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLUM CURCULIO
  // ═══════════════════════════════════════════════════════════════════════════

  const pc = modelResults.plumCurculio
  const pcDaysToEmergence = pc.emerged
    ? null
    : projectDaysToDD(pc.cumulativeDD, 120, weekAhead.days, 5)

  {
    // ── URGENT: emerged + warm nights — actively laying eggs ──
    if (pc.riskLevel === "high" || (pc.emerged && pc.nightTempsWarm)) {
      urgent.push({
        level: "urgent",
        model: "plumCurculio",
        title: "Plum Curculio: emerged + warm nights — actively laying eggs",
        message: `${Math.round(pc.cumulativeDD)} DD (base 5°C) from petal fall — adults emerged.${pc.nightTempsWarm ? " Warm nights (>16°C) = high activity." : ""} Egg-laying damage occurs on fruitlets.`,
        action: "Apply Imidan or Assail to perimeter/border rows immediately. Focus on edges near woods or hedgerows.",
        detectedAt: now,
      })
    }

    // ── WARNING: warm night forecast with emergence near ──
    else if (pc.emerged || (pcDaysToEmergence !== null && pcDaysToEmergence <= 3)) {
      // Check forecast for warm nights
      const warmNight = weekAhead.days.find((d) => d.lowTemp >= 16)
      if (warmNight) {
        warning.push({
          level: "warning",
          model: "plumCurculio",
          title: `Warm night forecast (${warmNight.lowTemp.toFixed(0)}°C) — high curculio activity expected`,
          message: `${pc.emerged ? "Adults have emerged. " : `Emergence at 120 DD — currently ${Math.round(pc.cumulativeDD)} DD. `}Warm night ${warmNight.dayName} (${warmNight.lowTemp.toFixed(0)}°C low) will trigger peak activity.`,
          action: "Spray border rows with Imidan or Assail before the warm night. Focus on perimeter adjacent to wooded areas.",
          detectedAt: now,
        })
      }
    }

    // ── PREPARATION: emergence 4-14 days away ──
    else if (pcDaysToEmergence !== null && pcDaysToEmergence >= 4 && pcDaysToEmergence <= 14) {
      preparation.push({
        level: "preparation",
        model: "plumCurculio",
        title: `Plum curculio emergence in ~${pcDaysToEmergence} days (${Math.round(pc.cumulativeDD)} of 120 DD)`,
        message: `${(120 - pc.cumulativeDD).toFixed(0)} DD remaining to emergence. Have Imidan or Assail ready.`,
        action: "Check Imidan inventory. Identify border rows adjacent to woods for priority spraying.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: emerged, scouting needed ──
    if (pc.emerged && pc.riskLevel === "moderate") {
      const hasPcUrgent = urgent.some((a) => a.model === "plumCurculio")
      if (!hasPcUrgent) {
        warning.push({
          level: "warning",
          model: "plumCurculio",
          title: "Plum Curculio: check fruitlets for crescent scars",
          message: `Adults emerged (${Math.round(pc.cumulativeDD)} DD). Check 100 fruitlets on border rows for crescent-shaped egg-laying scars this week.`,
          action: "Scout border rows. Threshold: re-spray if >1% of fruitlets have crescent scars.",
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLE MAGGOT
  // ═══════════════════════════════════════════════════════════════════════════

  const am = modelResults.appleMaggot
  const amDaysToEmergence = am.emerged
    ? null
    : projectDaysToDD(am.cumulativeDD, 900, weekAhead.days, 5)

  {
    // ── URGENT: first flies / 900 DD reached ──
    if (am.riskLevel === "high" || am.emerged) {
      urgent.push({
        level: "urgent",
        model: "appleMaggot",
        title: `Apple Maggot: ${Math.round(am.cumulativeDD)} DD — ${am.peakActivity ? "PEAK activity" : "flies emerging"}`,
        message: `${am.details} ${am.peakActivity ? "Peak oviposition period — maximum fruit damage risk." : "First generation emergence. Treat perimeter rows."}`,
        action: "Apply Imidan or Assail to perimeter rows. Hang red sphere traps if not deployed. Threshold: 1 fly per trap.",
        detectedAt: now,
      })
    }

    // ── WARNING: emergence within days ──
    else if (amDaysToEmergence !== null && amDaysToEmergence <= 3) {
      warning.push({
        level: "warning",
        model: "appleMaggot",
        title: `Apple Maggot: 900 DD approaching — first flies expected within ${amDaysToEmergence} day(s)`,
        message: `${Math.round(am.cumulativeDD)} of 900 DD. First adult flies expected within ${amDaysToEmergence} day(s). Check traps daily.`,
        action: "Check red sphere traps daily. Have Imidan or Assail ready for perimeter rows.",
        detectedAt: now,
      })
    }

    // ── PREPARATION: emergence in 1-3 weeks ──
    else if (amDaysToEmergence !== null && amDaysToEmergence >= 4 && amDaysToEmergence <= 21) {
      preparation.push({
        level: "preparation",
        model: "appleMaggot",
        title: `Apple maggot emergence in ~${amDaysToEmergence} days (${Math.round(am.cumulativeDD)} of 900 DD)`,
        message: `${(900 - am.cumulativeDD).toFixed(0)} DD remaining. Set traps on perimeter rows if not yet deployed.`,
        action: "Deploy red sphere traps on perimeter rows (1 per ~100m). Order Imidan if needed.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: past emergence, approaching peak ──
    if (am.emerged && !am.peakActivity && am.riskLevel === "moderate") {
      const daysToPeak = projectDaysToDD(am.cumulativeDD, 1200, weekAhead.days, 5)
      warning.push({
        level: "warning",
        model: "appleMaggot",
        title: `Apple Maggot: maintain coverage — peak activity at 1200 DD${daysToPeak ? ` in ~${daysToPeak} days` : ""}`,
        message: `Flies active at ${Math.round(am.cumulativeDD)} DD. Peak oviposition at 1200-1700 DD. Maintain perimeter coverage and re-trap weekly.`,
        action: "Maintain Imidan coverage on perimeter. Check traps weekly. Re-apply at 14-day intervals.",
        detectedAt: now,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROSY APPLE APHID
  // ═══════════════════════════════════════════════════════════════════════════

  const raa = modelResults.rosyAppleAphid

  {
    // ── URGENT: colonies found at pink — spray before bloom ──
    if (raa.riskLevel === "critical" || raa.riskLevel === "high") {
      urgent.push({
        level: "urgent",
        model: "rosyAppleAphid",
        title: "Rosy Apple Aphid: SPRAY NOW before bloom",
        message: `${raa.details} Post-bloom control will not prevent fruit damage from curling and distortion.`,
        action: "Apply Closer, Movento, or Assail immediately. Must be applied before bloom — post-bloom sprays won't prevent damage.",
        detectedAt: now,
      })
    }

    // ── WARNING: hatch expected, critical window ──
    else if (raa.hatchExpected && raa.criticalWindow) {
      warning.push({
        level: "warning",
        model: "rosyAppleAphid",
        title: `Rosy Apple Aphid: ${bloomStage} — scout now, threshold 1-2% infested clusters`,
        message: `Egg hatch underway (${Math.round(raa.cumulativeDD)} DD base 5°C). ${bloomStage} is the critical window. Scout 100 bud clusters for stem mothers.`,
        action: raa.recommendation ?? "Scout 100 clusters. Threshold: 1-2% infested. Spray Closer or Assail if threshold met.",
        detectedAt: now,
      })
    }

    // ── PREPARATION: hatch approaching ──
    else if (!raa.hatchExpected && raa.cumulativeDD >= 50) {
      const daysToHatch = projectDaysToDD(raa.cumulativeDD, 80, weekAhead.days, 5)
      if (daysToHatch !== null && daysToHatch <= 14) {
        preparation.push({
          level: "preparation",
          model: "rosyAppleAphid",
          title: `Aphid egg hatch approaching in ~${daysToHatch} days (${Math.round(raa.cumulativeDD)} of 80 DD)`,
          message: `Rosy apple aphid eggs hatching at green-tip to tight-cluster. Scout bud clusters for stem mothers.`,
          action: "Plan to scout 100 bud clusters at green-tip. Have Closer or Assail ready if threshold (1-2%) is met.",
          detectedAt: now,
        })
      }
    }

    // ── FOLLOW-UP: past hatch, check for damage ──
    if (raa.riskLevel === "moderate" && raa.hatchExpected && !raa.criticalWindow) {
      warning.push({
        level: "warning",
        model: "rosyAppleAphid",
        title: "Rosy Apple Aphid: check for curled leaves and misshapen fruitlets",
        message: `Aphid hatch occurred. Scout for curled leaves, honeydew, and small misshapen fruitlets. Post-bloom control is less effective but Movento can reduce populations.`,
        action: "Scout for damage. If colonies persist, apply Movento (translaminar activity reaches hidden aphids).",
        detectedAt: now,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EUROPEAN RED MITE
  // ═══════════════════════════════════════════════════════════════════════════

  const erm = modelResults.europeanRedMite
  const ermDaysToHatch = erm.eggHatch
    ? null
    : projectDaysToDD(erm.cumulativeDD, 185, weekAhead.days, 5)

  {
    // ── URGENT: 185 DD reached — eggs hatching ──
    if (erm.riskLevel === "high" || erm.eggHatch) {
      urgent.push({
        level: "urgent",
        model: "europeanRedMite",
        title: `European Red Mite: ${Math.round(erm.cumulativeDD)} DD — eggs hatching`,
        message: `${erm.details} If no dormant oil was applied, scout for mites on spur leaves at petal fall.`,
        action: erm.recommendation ?? "If no oil applied, scout 50 leaves at petal fall. Threshold: >5 mites/leaf with <1 predator/leaf. Apply Acramite or Envidor if needed.",
        detectedAt: now,
      })
    }

    // ── WARNING: oil deadline approaching ──
    else if (ermDaysToHatch !== null && ermDaysToHatch <= 5 && PRE_GREENTIP.has(bloomStage)) {
      warning.push({
        level: "warning",
        model: "europeanRedMite",
        title: `Dormant oil deadline — green-tip in ~${ermDaysToHatch} days. Apply oil NOW`,
        message: `${Math.round(erm.cumulativeDD)} of 185 DD. Dormant oil must be applied before green-tip. After green-tip, oil can cause phytotoxicity.`,
        action: "Apply superior oil (2% concentration) before green-tip. Do not apply within 2 weeks of captan or sulfur.",
        detectedAt: now,
      })
    }

    // ── PREPARATION: hatch in 1-3 weeks ──
    else if (ermDaysToHatch !== null && ermDaysToHatch >= 6 && ermDaysToHatch <= 21) {
      preparation.push({
        level: "preparation",
        model: "europeanRedMite",
        title: `Mite egg hatch in ~${ermDaysToHatch} days (${Math.round(erm.cumulativeDD)} of 185 DD)`,
        message: `Plan dormant oil application before green-tip if not yet applied.`,
        action: "Check oil inventory. Plan application for a day above 5°C with no rain for 24h.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: post-hatch scouting ──
    if (erm.eggHatch && erm.riskLevel === "moderate") {
      const hasErmUrgent = urgent.some((a) => a.model === "europeanRedMite")
      if (!hasErmUrgent) {
        warning.push({
          level: "warning",
          model: "europeanRedMite",
          title: "European Red Mite: scout — count mites per leaf",
          message: `Egg hatch complete (${Math.round(erm.cumulativeDD)} DD). Count mites on 50 spur leaves from 10 trees. Economic threshold: >5 mites/leaf with <1 predator mite/leaf.`,
          action: "Scout 50 leaves. If above threshold, apply Acramite, Envidor, or Nexter. Preserve predatory mites.",
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORIENTAL FRUIT MOTH
  // ═══════════════════════════════════════════════════════════════════════════

  const ofm = modelResults.orientalFruitMoth
  // Generation thresholds: 170, 680, 1400 DD (base 7.2°C)
  const ofmGenThresholds = [
    { dd: 170, label: "1st gen larval activity", gen: 1 },
    { dd: 680, label: "2nd gen — targets fruit", gen: 2 },
    { dd: 1400, label: "3rd gen activity", gen: 3 },
  ]
  const ofmNextGen = ofmGenThresholds.find((t) => t.dd > ofm.cumulativeDD)
  const ofmDaysToNext = ofmNextGen
    ? projectDaysToDD(ofm.cumulativeDD, ofmNextGen.dd, weekAhead.days, 7.2)
    : null

  {
    // ── URGENT: active generation ──
    if (ofm.riskLevel === "high") {
      urgent.push({
        level: "urgent",
        model: "orientalFruitMoth",
        title: `Oriental Fruit Moth: Gen ${ofm.generation} active — ${Math.round(ofm.cumulativeDD)} DD`,
        message: `${ofm.details} ${ofm.generation >= 2 ? "Larvae now targeting fruit. " : "Scout shoot tips for flagging. "}Apply Altacor if >2% of shoots flagging.`,
        action: ofm.recommendation ?? "Apply Altacor or Assail. Scout shoot tips for wilting (flagging).",
        detectedAt: now,
      })
    }

    // ── WARNING: next generation 1-3 days away ──
    else if (ofmNextGen && ofmDaysToNext !== null && ofmDaysToNext >= 1 && ofmDaysToNext <= 3) {
      warning.push({
        level: "warning",
        model: "orientalFruitMoth",
        title: `OFM: ${ofmNextGen.label} expected in ${ofmDaysToNext} day(s)`,
        message: `${Math.round(ofm.cumulativeDD)} of ${ofmNextGen.dd} DD. Have Altacor ready.${ofmNextGen.gen >= 2 ? " Gen 2+ targets fruit directly." : ""}`,
        action: `Check traps. Have Altacor ready. ${ofmNextGen.gen >= 2 ? "Fruit entries begin — maintain tight coverage." : "Scout shoot tips for flagging."}`,
        detectedAt: now,
      })
    }

    // ── PREPARATION: next generation in 1-3 weeks ──
    else if (ofmNextGen && ofmDaysToNext !== null && ofmDaysToNext >= 4 && ofmDaysToNext <= 21) {
      preparation.push({
        level: "preparation",
        model: "orientalFruitMoth",
        title: `OFM ${ofmNextGen.label} in ~${ofmDaysToNext} days (${Math.round(ofm.cumulativeDD)} of ${ofmNextGen.dd} DD)`,
        message: `Check pheromone traps. ${ofmNextGen.gen >= 2 ? "Gen 2 targets fruit — plan coverage." : "Have Altacor ready if shoot flagging exceeds 2%."}`,
        action: "Check traps weekly. Have Altacor or Assail ready.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: between generations ──
    if (ofm.riskLevel === "moderate" && ofm.generation >= 1 && ofmNextGen) {
      const hasOfmUrgent = urgent.some((a) => a.model === "orientalFruitMoth")
      if (!hasOfmUrgent) {
        warning.push({
          level: "warning",
          model: "orientalFruitMoth",
          title: `OFM: Gen ${ofm.generation} subsiding — Gen ${ofmNextGen.gen} at ${ofmNextGen.dd} DD${ofmDaysToNext ? ` in ~${ofmDaysToNext} days` : ""}`,
          message: `${ofm.details} ${ofmNextGen.gen >= 2 ? "Next generation targets fruit. Maintain coverage." : "Continue monitoring traps and shoot tips."}`,
          action: "Check traps weekly. Maintain spray coverage if trap counts are above threshold.",
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAFROLLER (OBLR)
  // ═══════════════════════════════════════════════════════════════════════════

  const lr = modelResults.leafroller
  const lrDaysToEmergence = lr.emerged
    ? null
    : projectDaysToDD(lr.cumulativeDD, 700, weekAhead.days, 6)

  {
    // ── URGENT: larvae active, above threshold ──
    if (lr.riskLevel === "high" || lr.emerged) {
      urgent.push({
        level: "urgent",
        model: "leafroller",
        title: `Leafroller: ${Math.round(lr.cumulativeDD)} DD — larvae active`,
        message: `${lr.details} Scout for larvae in rolled leaves and webbed fruit clusters. Spray if >3% fruit clusters infested.`,
        action: lr.recommendation ?? "Apply Altacor, Delegate, or B.t. (Dipel) if >3% fruit clusters infested.",
        detectedAt: now,
      })
    }

    // ── WARNING: emergence 1-3 days away ──
    else if (lrDaysToEmergence !== null && lrDaysToEmergence >= 1 && lrDaysToEmergence <= 3) {
      warning.push({
        level: "warning",
        model: "leafroller",
        title: `Leafroller: 700 DD approaching — scout for larvae in leaf rolls`,
        message: `${Math.round(lr.cumulativeDD)} of 700 DD (base 6°C). Summer generation emergence expected in ${lrDaysToEmergence} day(s). Scout rolled leaves.`,
        action: "Scout for larvae in rolled leaves. Have Altacor or Delegate ready if >3% clusters infested.",
        detectedAt: now,
      })
    }

    // ── PREPARATION: emergence in 1-3 weeks ──
    else if (lrDaysToEmergence !== null && lrDaysToEmergence >= 4 && lrDaysToEmergence <= 21) {
      preparation.push({
        level: "preparation",
        model: "leafroller",
        title: `Summer leafroller emergence in ~${lrDaysToEmergence} days (${Math.round(lr.cumulativeDD)} of 700 DD)`,
        message: `Summer generation OBLR emergence at 700 DD. Plan scouting program for rolled leaves.`,
        action: "Have Altacor or Delegate ready. Plan to scout 50 fruit clusters for feeding damage.",
        detectedAt: now,
      })
    }

    // ── FOLLOW-UP: emerged, scouting needed ──
    if (lr.emerged && lr.riskLevel === "moderate") {
      const hasLrUrgent = urgent.some((a) => a.model === "leafroller")
      if (!hasLrUrgent) {
        warning.push({
          level: "warning",
          model: "leafroller",
          title: "Leafroller: check fruit for feeding damage and webbing",
          message: `Summer generation active (${Math.round(lr.cumulativeDD)} DD). Scout 50 fruit clusters for feeding damage, rolled leaves, and webbing. Threshold: 3% infested.`,
          action: "Scout 50 clusters. If >3%, apply Altacor or Delegate. B.t. (Dipel) effective on small larvae.",
          detectedAt: now,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMAINING GENERIC WARNINGS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Spray coverage expiring ──
  for (const cov of weekAhead.sprayCoverage) {
    if (cov.status === "expiring") {
      warning.push({
        level: "warning",
        model: "sprayCoverage",
        title: `${cov.target}: spray coverage expiring`,
        message: cov.message,
        action: cov.nextAction,
        detectedAt: now,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC PREPARATION (action cards + unprotected targets)
  // ═══════════════════════════════════════════════════════════════════════════

  for (const card of weekAhead.actionCards) {
    if (card.type === "preparation") {
      preparation.push({
        level: "preparation",
        model: card.model,
        title: `${card.modelTitle}: get ready`,
        message: card.forecast ?? "",
        action: card.preparationChecklist.length > 0
          ? card.preparationChecklist.join(" | ")
          : null,
        detectedAt: now,
      })
    }
    if (card.type === "pre-infection") {
      preparation.push({
        level: "preparation",
        model: card.model,
        title: `${card.modelTitle}: infection risk ahead`,
        message: card.forecast ?? "",
        action: card.bestSprayDay
          ? `Best spray day: ${card.bestSprayDay}`
          : "Apply protectant before rain.",
        detectedAt: now,
      })
    }
  }

  for (const cov of weekAhead.sprayCoverage) {
    if (cov.status === "unprotected") {
      preparation.push({
        level: "preparation",
        model: "sprayCoverage",
        title: `${cov.target}: no active protection`,
        message: cov.message,
        action: cov.nextAction,
        detectedAt: now,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE-RELEVANCE FILTER
  //
  // Only keep alerts for models that are "active" or "upcoming" for the
  // current phenological stage.  Models whose season is complete should not
  // generate new alerts (spray coverage alerts are always kept).
  // ═══════════════════════════════════════════════════════════════════════════

  const currentPhenoStage = getStageFromDD(seasonDD ?? 0)
  const stageIdx = PHENOLOGY_STAGES.indexOf(currentPhenoStage)

  function isRelevantAlert(alert: PendingAlert): boolean {
    if (alert.model === "sprayCoverage") return true // always relevant
    const relevance = getModelStageRelevance(alert.model, stageIdx >= 0 ? stageIdx : 0)
    return relevance === "active" || relevance === "upcoming"
  }

  return {
    urgent: urgent.filter(isRelevantAlert),
    warning: warning.filter(isRelevantAlert),
    preparation: preparation.filter(isRelevantAlert),
  }
}
