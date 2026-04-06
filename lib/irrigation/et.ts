// ---------------------------------------------------------------------------
// Evapotranspiration (ET₀) Calculation
//
// Uses the Hargreaves method when only temperature data is available.
// This works well with Open-Meteo daily max/min temperatures.
// ---------------------------------------------------------------------------

/**
 * Extraterrestrial radiation (Ra) in mm/day equivalent.
 * Calculated from latitude and day of year using solar geometry.
 *
 * @param latDeg  Latitude in decimal degrees
 * @param dayOfYear  Julian day (1-366)
 * @returns Ra in mm/day (water equivalent, using 1 MJ/m² ≈ 0.408 mm/day)
 */
export function calcExtraterrestrialRadiation(
  latDeg: number,
  dayOfYear: number,
): number {
  const latRad = (latDeg * Math.PI) / 180

  // Solar declination
  const decl = 0.4093 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.405)

  // Relative distance Earth-Sun
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365)

  // Sunset hour angle
  const ws = Math.acos(-Math.tan(latRad) * Math.tan(decl))

  // Extraterrestrial radiation (MJ/m²/day)
  const Gsc = 0.0820 // Solar constant (MJ/m²/min)
  const Ra =
    ((24 * 60) / Math.PI) *
    Gsc *
    dr *
    (ws * Math.sin(latRad) * Math.sin(decl) +
      Math.cos(latRad) * Math.cos(decl) * Math.sin(ws))

  // Convert MJ/m²/day to mm/day (latent heat of vaporization ≈ 2.45 MJ/kg)
  return Ra * 0.408
}

/**
 * Hargreaves method for reference evapotranspiration (ET₀).
 *
 * ET₀ = 0.0023 × (T_mean + 17.8) × (T_max - T_min)^0.5 × Ra
 *
 * @param maxTemp  Daily maximum temperature (°C)
 * @param minTemp  Daily minimum temperature (°C)
 * @param latDeg   Latitude in decimal degrees
 * @param dayOfYear  Julian day of year (1-366)
 * @returns ET₀ in mm/day
 */
export function calcET0Hargreaves(
  maxTemp: number,
  minTemp: number,
  latDeg: number,
  dayOfYear: number,
): number {
  const meanTemp = (maxTemp + minTemp) / 2
  const tempRange = Math.max(maxTemp - minTemp, 0)
  const Ra = calcExtraterrestrialRadiation(latDeg, dayOfYear)

  const et0 = 0.0023 * (meanTemp + 17.8) * Math.sqrt(tempRange) * Ra

  // ET₀ can't be negative
  return Math.max(et0, 0)
}

/**
 * Get the day of year (1-366) from a date string.
 */
export function getDayOfYear(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00")
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
