// ---------------------------------------------------------------------------
// Environment Canada weather data fallback
//
// Uses the Environment Canada Datamart CSV endpoint to fetch recent hourly
// climate observations from the nearest station. This serves as a backup
// data source when Open-Meteo is unavailable.
//
// API: https://climate.weather.gc.ca/climate_data/bulk_data_e.html
//
// Note: The schema already supports source: "env-canada" in weather_hourly.
// ---------------------------------------------------------------------------

import { upsertWeatherHourly, type WeatherHourlyRow } from "@/lib/db"
import { estimateLeafWetness } from "@/lib/degree-days"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnvCanadaHourlyRecord {
  timestamp: string
  source: "env-canada"
  temp_c: number | null
  humidity_pct: number | null
  precip_mm: number | null
  wind_kph: number | null
  dew_point_c: number | null
  leaf_wetness_hours: number | null
}

export interface EnvCanadaResult {
  hourly: EnvCanadaHourlyRecord[]
  stationName: string | null
}

// ---------------------------------------------------------------------------
// Ontario climate station mapping — nearest station for common apple regions
//
// Station IDs from Environment Canada. These are climate station IDs used
// in the bulk data download endpoint.
// ---------------------------------------------------------------------------

interface ClimateStation {
  id: number
  name: string
  lat: number
  lon: number
}

const ONTARIO_STATIONS: ClimateStation[] = [
  { id: 51459, name: "Toronto Pearson", lat: 43.68, lon: -79.63 },
  { id: 45638, name: "Hamilton RBG", lat: 43.28, lon: -79.88 },
  { id: 48549, name: "Simcoe", lat: 42.84, lon: -80.30 },
  { id: 50089, name: "Vineland", lat: 43.15, lon: -79.40 },
  { id: 51459, name: "Trenton", lat: 44.12, lon: -77.53 },
  { id: 50310, name: "Belleville", lat: 44.15, lon: -77.40 },
  { id: 48568, name: "Collingwood", lat: 44.50, lon: -80.22 },
  { id: 48569, name: "Barrie", lat: 44.38, lon: -79.70 },
  { id: 27174, name: "Ottawa CDA", lat: 45.38, lon: -75.72 },
  { id: 50089, name: "St. Catharines", lat: 43.17, lon: -79.24 },
]

/**
 * Find the nearest Environment Canada climate station to the given coordinates.
 */
function findNearestStation(lat: number, lon: number): ClimateStation {
  let nearest = ONTARIO_STATIONS[0]
  let minDist = Infinity

  for (const station of ONTARIO_STATIONS) {
    const dLat = station.lat - lat
    const dLon = station.lon - lon
    const dist = dLat * dLat + dLon * dLon
    if (dist < minDist) {
      minDist = dist
      nearest = station
    }
  }

  return nearest
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

/**
 * Parse Environment Canada hourly CSV data into typed records.
 *
 * Expected columns (may vary by station — we locate by header name):
 *   "Date/Time (LST)", "Temp (°C)", "Dew Point Temp (°C)",
 *   "Rel Hum (%)", "Precip. Amount (mm)", "Wind Spd (km/h)"
 */
function parseHourlyCSV(csvText: string): EnvCanadaHourlyRecord[] {
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])

  // Find column indices (case-insensitive partial match)
  const findCol = (partial: string): number =>
    headers.findIndex((h) => h.toLowerCase().includes(partial.toLowerCase()))

  const dateIdx = findCol("Date/Time")
  const tempIdx = findCol("Temp (")
  const dewIdx = findCol("Dew Point")
  const humIdx = findCol("Rel Hum")
  const precipIdx = findCol("Precip")
  const windIdx = findCol("Wind Spd")

  if (dateIdx === -1 || tempIdx === -1) return []

  const records: EnvCanadaHourlyRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    if (fields.length <= dateIdx) continue

    const dateStr = fields[dateIdx]
    if (!dateStr) continue

    // Parse date — EC format is typically "2026-04-08 14:00"
    const timestamp = dateStr.replace(" ", "T") + ":00"

    const temp = tempIdx >= 0 ? parseFloat(fields[tempIdx]) : NaN
    const dew = dewIdx >= 0 ? parseFloat(fields[dewIdx]) : NaN
    const hum = humIdx >= 0 ? parseFloat(fields[humIdx]) : NaN
    const precip = precipIdx >= 0 ? parseFloat(fields[precipIdx]) : NaN
    const wind = windIdx >= 0 ? parseFloat(fields[windIdx]) : NaN

    const tempC = isNaN(temp) ? null : temp
    const humPct = isNaN(hum) ? null : hum
    const precipMm = isNaN(precip) ? null : precip

    let leafWetness: number | null = null
    if (tempC != null && humPct != null && precipMm != null) {
      leafWetness = estimateLeafWetness(humPct, precipMm, tempC)
    }

    records.push({
      timestamp,
      source: "env-canada",
      temp_c: tempC,
      humidity_pct: humPct,
      precip_mm: precipMm,
      wind_kph: isNaN(wind) ? null : wind,
      dew_point_c: isNaN(dew) ? null : dew,
      leaf_wetness_hours: leafWetness,
    })
  }

  return records
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch hourly weather data from Environment Canada for a given location.
 *
 * Uses the bulk data CSV endpoint for the nearest Ontario climate station.
 * Returns parsed hourly records or an empty array on failure.
 *
 * @param lat  Latitude of the orchard
 * @param lon  Longitude of the orchard
 * @param year  Year to fetch (defaults to current year)
 * @param month  Month to fetch (defaults to current month)
 */
export async function fetchEnvCanadaData(
  lat: number,
  lon: number,
  year?: number,
  month?: number,
): Promise<EnvCanadaResult> {
  const empty: EnvCanadaResult = { hourly: [], stationName: null }
  const station = findNearestStation(lat, lon)

  const now = new Date()
  const y = year ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1

  try {
    const params = new URLSearchParams({
      format: "csv",
      stationID: String(station.id),
      Year: String(y),
      Month: String(m),
      timeframe: "1", // 1 = hourly
      submit: "Download Data",
    })

    const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?${params.toString()}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      console.error(
        `[env-canada] HTTP ${response.status}: ${response.statusText}`,
      )
      return empty
    }

    const csvText = await response.text()
    const hourly = parseHourlyCSV(csvText)

    console.log(
      `[env-canada] Fetched ${hourly.length} hourly records from ${station.name} (ID ${station.id})`,
    )

    return { hourly, stationName: station.name }
  } catch (err) {
    console.error("[env-canada] Failed to fetch weather data:", err)
    return empty
  }
}

/**
 * Fetch weather from Environment Canada and persist hourly records into the
 * SQLite database. Intended as a fallback when Open-Meteo fails.
 *
 * @param lat  Latitude of the orchard
 * @param lon  Longitude of the orchard
 */
export async function fetchAndStoreEnvCanada(
  lat: number,
  lon: number,
): Promise<EnvCanadaResult> {
  const result = await fetchEnvCanadaData(lat, lon)

  if (result.hourly.length === 0) {
    console.warn("[env-canada] No hourly data returned — nothing to store.")
    return result
  }

  const rows: WeatherHourlyRow[] = result.hourly.map((h) => ({
    station_id: "default",
    timestamp: h.timestamp,
    source: h.source,
    temp_c: h.temp_c,
    humidity_pct: h.humidity_pct,
    precip_mm: h.precip_mm,
    wind_kph: h.wind_kph,
    leaf_wetness_hours: h.leaf_wetness_hours,
    dew_point_c: h.dew_point_c,
  }))

  try {
    upsertWeatherHourly(rows)
    console.log(
      `[env-canada] Upserted ${rows.length} hourly weather records from ${result.stationName}.`,
    )
  } catch (err) {
    console.error("[env-canada] Failed to store weather data:", err)
  }

  return result
}
