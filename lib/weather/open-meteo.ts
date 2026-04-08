// ---------------------------------------------------------------------------
// Open-Meteo weather data fetching
//
// Open-Meteo is the primary weather source — free, no API key required.
// Docs: https://open-meteo.com/en/docs
// ---------------------------------------------------------------------------

import { upsertWeatherHourly, type WeatherHourlyRow } from "@/lib/db";
import { estimateLeafWetness } from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single hourly record parsed from the Open-Meteo response. */
export interface OpenMeteoHourlyRecord {
  timestamp: string;
  source: "open-meteo";
  temp_c: number | null;
  humidity_pct: number | null;
  precip_mm: number | null;
  wind_kph: number | null;
  dew_point_c: number | null;
  leaf_wetness_hours: number | null;
}

/** A single daily summary parsed from the Open-Meteo response. */
export interface OpenMeteoDailyRecord {
  date: string;
  max_temp: number | null;
  min_temp: number | null;
  precip_sum: number | null;
}

/** Combined return type for fetchOpenMeteoData. */
export interface OpenMeteoResult {
  hourly: OpenMeteoHourlyRecord[];
  daily: OpenMeteoDailyRecord[];
}

// ---------------------------------------------------------------------------
// Raw API response shapes (only the fields we use)
// ---------------------------------------------------------------------------

interface OpenMeteoHourlyResponse {
  time: string[];
  temperature_2m: (number | null)[];
  relative_humidity_2m: (number | null)[];
  precipitation: (number | null)[];
  dew_point_2m: (number | null)[];
  wind_speed_10m: (number | null)[];
}

interface OpenMeteoDailyResponse {
  time: string[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_sum: (number | null)[];
}

interface OpenMeteoApiResponse {
  hourly?: OpenMeteoHourlyResponse;
  daily?: OpenMeteoDailyResponse;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch weather data from the Open-Meteo API and return parsed hourly +
 * daily arrays.
 *
 * On any network or parsing error the function logs to the console and
 * returns empty arrays so callers can degrade gracefully.
 *
 * @param lat           Latitude of the orchard
 * @param lon           Longitude of the orchard
 * @param pastDays      Number of historical days to fetch (default 7)
 * @param forecastDays  Number of forecast days to fetch (default 7)
 */
export async function fetchOpenMeteoData(
  lat: number,
  lon: number,
  pastDays: number = 7,
  forecastDays: number = 7,
): Promise<OpenMeteoResult> {
  const empty: OpenMeteoResult = { hourly: [], daily: [] };

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "dew_point_2m",
        "wind_speed_10m",
      ].join(","),
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
      ].join(","),
      timezone: "America/Toronto",
      past_days: String(pastDays),
      forecast_days: String(forecastDays),
      // Use the Canadian GEM model from Environment Canada for better
      // accuracy in Ontario. Falls back to the default endpoint below
      // if GEM is unavailable.
      models: "gem_seamless",
      cell_selection: "nearest",
    });

    // Try the Canadian GEM model first, fall back to the generic endpoint
    let url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    let response = await fetch(url, { signal: AbortSignal.timeout(15_000) });

    // If GEM model fails, retry with the default (global best_match) endpoint
    if (!response.ok) {
      console.warn(`[open-meteo] GEM model returned ${response.status}, falling back to default model`);
      params.delete("models");
      url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    }

    if (!response.ok) {
      console.error(
        `[open-meteo] HTTP ${response.status}: ${response.statusText}`,
      );
      return empty;
    }

    const data: OpenMeteoApiResponse = await response.json();

    // ------- Parse hourly data -------
    const hourly: OpenMeteoHourlyRecord[] = [];

    if (data.hourly) {
      const h = data.hourly;
      for (let i = 0; i < h.time.length; i++) {
        const temp = h.temperature_2m[i];
        const humidity = h.relative_humidity_2m[i];
        const precip = h.precipitation[i];
        const dewPoint = h.dew_point_2m[i];
        const wind = h.wind_speed_10m[i];

        // Estimate leaf wetness from available humidity / precip / temp
        let leafWetness: number | null = null;
        if (temp != null && humidity != null && precip != null) {
          leafWetness = estimateLeafWetness(humidity, precip, temp);
        }

        hourly.push({
          timestamp: h.time[i],
          source: "open-meteo",
          temp_c: temp ?? null,
          humidity_pct: humidity ?? null,
          precip_mm: precip ?? null,
          wind_kph: wind ?? null,
          dew_point_c: dewPoint ?? null,
          leaf_wetness_hours: leafWetness,
        });
      }
    }

    // ------- Parse daily data -------
    const daily: OpenMeteoDailyRecord[] = [];

    if (data.daily) {
      const d = data.daily;
      for (let i = 0; i < d.time.length; i++) {
        daily.push({
          date: d.time[i],
          max_temp: d.temperature_2m_max[i] ?? null,
          min_temp: d.temperature_2m_min[i] ?? null,
          precip_sum: d.precipitation_sum[i] ?? null,
        });
      }
    }

    return { hourly, daily };
  } catch (err) {
    console.error("[open-meteo] Failed to fetch weather data:", err);
    return empty;
  }
}

/**
 * Fetch weather from Open-Meteo and persist hourly records into the SQLite
 * database via `upsertWeatherHourly`.
 *
 * Intended to be called on a schedule (e.g. hourly via node-cron) or on
 * demand from the dashboard.
 *
 * @param lat  Latitude of the orchard
 * @param lon  Longitude of the orchard
 */
export async function fetchAndStoreWeather(
  lat: number,
  lon: number,
): Promise<OpenMeteoResult> {
  const result = await fetchOpenMeteoData(lat, lon);

  if (result.hourly.length === 0) {
    console.warn("[open-meteo] No hourly data returned — nothing to store.");
    return result;
  }

  // Map to WeatherHourlyRow for the DB upsert
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
  }));

  try {
    upsertWeatherHourly(rows);
    console.log(
      `[open-meteo] Upserted ${rows.length} hourly weather records.`,
    );
  } catch (err) {
    console.error("[open-meteo] Failed to store weather data:", err);
  }

  return result;
}
