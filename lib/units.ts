// ---------------------------------------------------------------------------
// OrchardGuard — Dual-unit conversion utilities
// Canonical storage is always metric. Display always shows both units.
// ---------------------------------------------------------------------------

export type UnitType =
  | "temperature"
  | "rainfall"
  | "area"
  | "length"
  | "lengthSmall"
  | "elevation"
  | "windSpeed"
  | "sprayRateVolume"
  | "sprayRateWeight"
  | "weight"
  | "volume"
  | "waterFlow"
  | "waterFlowHourly"
  | "pressure"
  | "speed"
  | "irrigationRate"

interface UnitDef {
  metric: { unit: string; abbr: string[] }
  imperial: { unit: string; abbr: string[]; factor: number; offset?: number }
  precision: number
  hint: string
}

const UNIT_DEFS: Record<UnitType, UnitDef> = {
  temperature: {
    metric: { unit: "\u00B0C", abbr: ["c", "\u00B0c", "celsius", "deg c"] },
    imperial: { unit: "\u00B0F", abbr: ["f", "\u00B0f", "fahrenheit", "deg f"], factor: 9 / 5, offset: 32 },
    precision: 1,
    hint: "\u00B0C or \u00B0F",
  },
  rainfall: {
    metric: { unit: "mm", abbr: ["mm", "millimeter", "millimeters", "millimetre", "millimetres"] },
    imperial: { unit: "in", abbr: ["in", "inch", "inches"], factor: 1 / 25.4 },
    precision: 1,
    hint: "mm or in",
  },
  area: {
    metric: { unit: "ha", abbr: ["ha", "hectare", "hectares"] },
    imperial: { unit: "ac", abbr: ["ac", "acre", "acres"], factor: 2.47105 },
    precision: 2,
    hint: "ha or acres",
  },
  length: {
    metric: { unit: "m", abbr: ["m", "meter", "meters", "metre", "metres"] },
    imperial: { unit: "ft", abbr: ["ft", "foot", "feet"], factor: 3.28084 },
    precision: 2,
    hint: "m or ft",
  },
  lengthSmall: {
    metric: { unit: "cm", abbr: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"] },
    imperial: { unit: "in", abbr: ["in", "inch", "inches"], factor: 1 / 2.54 },
    precision: 1,
    hint: "cm or in",
  },
  elevation: {
    metric: { unit: "m", abbr: ["m", "meter", "meters", "metre", "metres"] },
    imperial: { unit: "ft", abbr: ["ft", "foot", "feet"], factor: 3.28084 },
    precision: 0,
    hint: "m or ft",
  },
  windSpeed: {
    metric: { unit: "km/h", abbr: ["km/h", "kph", "kmh", "km/hr", "kmph"] },
    imperial: { unit: "mph", abbr: ["mph", "mi/h", "mi/hr"], factor: 0.621371 },
    precision: 1,
    hint: "km/h or mph",
  },
  sprayRateVolume: {
    metric: { unit: "L/ha", abbr: ["l/ha", "liters/ha", "litres/ha", "liter/ha", "litre/ha"] },
    imperial: { unit: "gal/ac", abbr: ["gal/ac", "gal/acre", "gallons/acre", "gallons/ac"], factor: 0.106907 },
    precision: 1,
    hint: "L/ha or gal/ac",
  },
  sprayRateWeight: {
    metric: { unit: "kg/ha", abbr: ["kg/ha", "kilograms/ha", "kilogram/ha"] },
    imperial: { unit: "lb/ac", abbr: ["lb/ac", "lb/acre", "lbs/ac", "lbs/acre", "pounds/acre", "pounds/ac"], factor: 0.892179 },
    precision: 1,
    hint: "kg/ha or lb/ac",
  },
  weight: {
    metric: { unit: "kg", abbr: ["kg", "kilogram", "kilograms", "kilo", "kilos"] },
    imperial: { unit: "lb", abbr: ["lb", "lbs", "pound", "pounds"], factor: 2.20462 },
    precision: 1,
    hint: "kg or lb",
  },
  volume: {
    metric: { unit: "L", abbr: ["l", "liter", "liters", "litre", "litres"] },
    imperial: { unit: "gal", abbr: ["gal", "gallon", "gallons"], factor: 0.264172 },
    precision: 1,
    hint: "L or gal",
  },
  waterFlow: {
    metric: { unit: "L/min", abbr: ["l/min", "liters/min", "litres/min", "lpm"] },
    imperial: { unit: "gpm", abbr: ["gpm", "gal/min", "gallons/min"], factor: 0.264172 },
    precision: 1,
    hint: "L/min or gpm",
  },
  waterFlowHourly: {
    metric: { unit: "L/hr", abbr: ["l/hr", "l/h", "liters/hr", "litres/hr", "lph"] },
    imperial: { unit: "gph", abbr: ["gph", "gal/hr", "gal/h", "gallons/hr"], factor: 0.264172 },
    precision: 1,
    hint: "L/hr or gph",
  },
  pressure: {
    metric: { unit: "kPa", abbr: ["kpa", "kilopascal", "kilopascals"] },
    imperial: { unit: "psi", abbr: ["psi"], factor: 0.145038 },
    precision: 1,
    hint: "kPa or psi",
  },
  speed: {
    metric: { unit: "m/hr", abbr: ["m/hr", "m/h", "meters/hr", "metres/hr"] },
    imperial: { unit: "ft/hr", abbr: ["ft/hr", "ft/h", "feet/hr"], factor: 3.28084 },
    precision: 1,
    hint: "m/hr or ft/hr",
  },
  irrigationRate: {
    metric: { unit: "mm/hr", abbr: ["mm/hr", "mm/h", "mm/hour"] },
    imperial: { unit: "in/hr", abbr: ["in/hr", "in/h", "in/hour", "inches/hr", "inches/h"], factor: 1 / 25.4 },
    precision: 2,
    hint: "mm/hr or in/hr",
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round(value: number, precision: number): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

export function getUnitDef(unitType: UnitType) {
  return UNIT_DEFS[unitType]
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/** Convert a metric value to imperial */
export function toImperial(metricValue: number, unitType: UnitType): number {
  const def = UNIT_DEFS[unitType]
  if (def.imperial.offset != null) {
    return metricValue * def.imperial.factor + def.imperial.offset
  }
  return metricValue * def.imperial.factor
}

/** Convert an imperial value to metric */
export function toMetric(imperialValue: number, unitType: UnitType): number {
  const def = UNIT_DEFS[unitType]
  if (def.imperial.offset != null) {
    return (imperialValue - def.imperial.offset) / def.imperial.factor
  }
  return imperialValue / def.imperial.factor
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Format a metric value as both metric and imperial strings */
export function formatDual(
  metricValue: number,
  unitType: UnitType,
): { primary: string; secondary: string } {
  const def = UNIT_DEFS[unitType]
  const imperialValue = toImperial(metricValue, unitType)
  const noSpace = unitType === "temperature"

  const primary = `${round(metricValue, def.precision)}${noSpace ? "" : "\u00A0"}${def.metric.unit}`
  const secondary = `${round(imperialValue, def.precision)}${noSpace ? "" : "\u00A0"}${def.imperial.unit}`

  return { primary, secondary }
}

/** Compact inline string: "12°C (54°F)" */
export function formatDualInline(metricValue: number, unitType: UnitType): string {
  const { primary, secondary } = formatDual(metricValue, unitType)
  return `${primary} (${secondary})`
}

/** Slash-separated for tables: "12°C / 54°F" */
export function formatDualSlash(metricValue: number, unitType: UnitType): string {
  const { primary, secondary } = formatDual(metricValue, unitType)
  return `${primary} / ${secondary}`
}

/** Just the metric string */
export function formatMetric(metricValue: number, unitType: UnitType): string {
  const def = UNIT_DEFS[unitType]
  const noSpace = unitType === "temperature"
  return `${round(metricValue, def.precision)}${noSpace ? "" : "\u00A0"}${def.metric.unit}`
}

/** Just the imperial string */
export function formatImperial(metricValue: number, unitType: UnitType): string {
  const def = UNIT_DEFS[unitType]
  const imperialValue = toImperial(metricValue, unitType)
  const noSpace = unitType === "temperature"
  return `${round(imperialValue, def.precision)}${noSpace ? "" : "\u00A0"}${def.imperial.unit}`
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a user input string that may include a unit suffix.
 * Returns the canonical metric value and the original unit detected.
 * A bare number (no unit) is treated as metric.
 */
export function parseInput(
  text: string,
  unitType: UnitType,
): { value: number; originalUnit: string } {
  const trimmed = text.trim()
  if (!trimmed) return { value: NaN, originalUnit: "" }

  // Match: optional negative sign, digits with optional decimal, then optional unit text
  const match = trimmed.match(/^(-?\d*\.?\d+)\s*(.*)$/)
  if (!match) return { value: NaN, originalUnit: "" }

  const num = parseFloat(match[1])
  const unitStr = match[2].toLowerCase().trim()

  if (isNaN(num)) return { value: NaN, originalUnit: "" }

  const def = UNIT_DEFS[unitType]

  // No unit specified — default to metric
  if (!unitStr) return { value: num, originalUnit: def.metric.unit }

  // Check metric abbreviations
  if (
    def.metric.abbr.includes(unitStr) ||
    unitStr === def.metric.unit.toLowerCase()
  ) {
    return { value: num, originalUnit: def.metric.unit }
  }

  // Check imperial abbreviations
  if (
    def.imperial.abbr.includes(unitStr) ||
    unitStr === def.imperial.unit.toLowerCase()
  ) {
    const metricValue = toMetric(num, unitType)
    return { value: round(metricValue, def.precision + 2), originalUnit: def.imperial.unit }
  }

  // Unrecognized unit — treat as metric
  return { value: num, originalUnit: unitStr }
}

/** Get the hint text showing accepted units */
export function getUnitHint(unitType: UnitType): string {
  return UNIT_DEFS[unitType].hint
}
