// ---------------------------------------------------------------------------
// Shared degree-day / degree-hour calculation utilities
// ---------------------------------------------------------------------------

/**
 * Sum of hourly degree-hours above `baseTemp`.
 *
 * For each hourly temperature reading, the contribution is
 * max(temp - baseTemp, 0).  This is the most accurate method when
 * true hourly data is available.
 */
export function calcDegreeHoursFromHourly(
  temps: number[],
  baseTemp: number,
): number {
  let total = 0;
  for (const t of temps) {
    const excess = t - baseTemp;
    if (excess > 0) total += excess;
  }
  return total;
}

/**
 * Single-sine method for estimating degree-days from daily max/min
 * temperatures.
 *
 * Reference: Baskerville & Emin (1969) — widely used in IPM models.
 *
 * Returns the estimated degree-days (DD) for one day.
 */
export function calcDegreeDaysSine(
  maxTemp: number,
  minTemp: number,
  baseTemp: number,
): number {
  // Case 1: entire day above base — simple average minus base
  if (minTemp >= baseTemp) {
    return (maxTemp + minTemp) / 2 - baseTemp;
  }

  // Case 2: entire day below base — no accumulation
  if (maxTemp <= baseTemp) {
    return 0;
  }

  // Case 3: base falls between min and max — sine-curve approximation
  const mean = (maxTemp + minTemp) / 2;
  const amplitude = (maxTemp - minTemp) / 2;
  const theta = Math.asin((baseTemp - mean) / amplitude);

  return (
    (1 / (2 * Math.PI)) *
    ((mean - baseTemp) * (Math.PI / 2 - theta) + amplitude * Math.cos(theta))
  );
}

/**
 * Cumulative degree-days across an array of daily max/min records, using
 * the single-sine method.
 */
export function calcCumulativeDegreeDays(
  dailyData: { max_temp: number; min_temp: number }[],
  baseTemp: number,
): number {
  let total = 0;
  for (const day of dailyData) {
    total += calcDegreeDaysSine(day.max_temp, day.min_temp, baseTemp);
  }
  return total;
}

/**
 * Dew-point approximation using the Magnus formula.
 *
 * @param tempC        Air temperature in °C
 * @param humidityPct  Relative humidity (0-100)
 * @returns            Estimated dew-point temperature in °C
 */
export function calcDewPoint(tempC: number, humidityPct: number): number {
  // Magnus coefficients (valid for 0-60 °C range)
  const a = 17.27;
  const b = 237.7; // °C

  const alpha =
    (a * tempC) / (b + tempC) + Math.log(humidityPct / 100);

  return (b * alpha) / (a - alpha);
}

/**
 * Estimate whether a given hour is "wet" (leaf-wetness = 1) or "dry" (0).
 *
 * A simple heuristic used when no physical leaf-wetness sensor is available.
 *
 * Wet conditions:
 *   - Measurable precipitation (>0.1 mm), OR
 *   - Relative humidity >= 90 %, OR
 *   - Dew point is within 2 °C of air temperature AND humidity > 80 %
 *
 * @returns 0 or 1
 */
export function estimateLeafWetness(
  humidityPct: number,
  precipMm: number,
  tempC: number,
): number {
  // Direct rain → wet
  if (precipMm > 0.1) return 1;

  // Very high humidity → wet
  if (humidityPct >= 90) return 1;

  // Dew formation likely
  if (humidityPct > 80) {
    const dewPoint = calcDewPoint(tempC, humidityPct);
    if (Math.abs(tempC - dewPoint) <= 2) return 1;
  }

  return 0;
}
