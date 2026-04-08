import { describe, it, expect } from "vitest";
import { evaluateFireBlight } from "@/lib/models/fire-blight";

// ---------------------------------------------------------------------------
// Helpers to generate realistic hourly weather data
// ---------------------------------------------------------------------------

function makeHourlyData(
  hours: number,
  baseDate: string,
  tempC: number,
  humidityPct: number,
  precipMm: number,
) {
  const records: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }> = [];

  const start = new Date(baseDate + "T00:00:00Z");
  for (let i = 0; i < hours; i++) {
    const ts = new Date(start.getTime() + i * 3600_000);
    records.push({
      timestamp: ts.toISOString(),
      temp_c: tempC,
      humidity_pct: humidityPct,
      precip_mm: precipMm,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("evaluateFireBlight", () => {
  it("produces non-zero degree hours with bloom stage and temps above 15.5C", () => {
    // 96 hours of 20C weather during bloom, high inoculum
    const hourly = makeHourlyData(96, "2026-05-10", 20, 70, 0);
    const result = evaluateFireBlight(hourly, "bloom", "high");

    // Each hour contributes (20 - 15.5) = 4.5 DH, times 96 hours = 432 DH
    expect(result.cougarBlight.degreeHours4Day).toBeGreaterThan(0);
    expect(result.cougarBlight.degreeHours4Day).toBeCloseTo(432, 0);
  });

  it("returns low risk when bloom stage is dormant", () => {
    // Cold dormant conditions: 5C, well below 15.5C base
    const hourly = makeHourlyData(96, "2026-01-15", 5, 60, 0);
    const result = evaluateFireBlight(hourly, "dormant", "low");

    expect(result.combinedRisk).toBe("low");
    expect(result.cougarBlight.degreeHours4Day).toBe(0);
  });

  it("detects infection event when all MaryBlyt conditions are met", () => {
    // All 4 MaryBlyt conditions:
    // 1. bloom stage = "bloom"
    // 2. cumulative DH base 18.3C >= 198 — need enough warm hours
    // 3. wetting event (precip > 0.25 or humidity > 90) in last 24h
    // 4. mean temp of last 24h >= 15.6C
    //
    // Use 20C temp with humidity > 90 and precip for wetting event.
    // DH base 18.3: each hour at 20C = 1.7 DH, need >= 198 → ~117 hours.
    // Use 120 hours at 20C with rain and high humidity.
    const hourly = makeHourlyData(120, "2026-05-10", 20, 95, 0.5);
    const result = evaluateFireBlight(hourly, "bloom", "high");

    expect(result.maryBlyt.openBlossoms).toBe(true);
    expect(result.maryBlyt.cumulativeDH183).toBeGreaterThanOrEqual(198);
    expect(result.maryBlyt.degreehoursMet).toBe(true);
    expect(result.maryBlyt.wettingEvent).toBe(true);
    expect(result.maryBlyt.tempMet).toBe(true);
    expect(result.maryBlyt.conditionsMet).toBe(4);
    expect(result.maryBlyt.infectionEvent).toBe(true);
  });

  it("includes product suggestions and spray recommendation", () => {
    const hourly = makeHourlyData(120, "2026-05-10", 20, 95, 0.5);
    const result = evaluateFireBlight(hourly, "bloom", "high");

    expect(result.sprayRecommendation).toBeTruthy();
    expect(typeof result.sprayRecommendation).toBe("string");
    expect(Array.isArray(result.productSuggestions)).toBe(true);
  });

  it("returns a risk score between 0 and 100", () => {
    const hourly = makeHourlyData(96, "2026-05-10", 20, 70, 0);
    const result = evaluateFireBlight(hourly, "bloom", "moderate");

    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("handles empty forecast data gracefully", () => {
    const hourly = makeHourlyData(96, "2026-05-10", 15, 60, 0);
    const result = evaluateFireBlight(hourly, "bloom", "low", []);

    expect(result.cougarBlight.forecast).toHaveLength(0);
  });

  it("produces day breakdown entries", () => {
    const hourly = makeHourlyData(96, "2026-05-10", 20, 70, 0);
    const result = evaluateFireBlight(hourly, "bloom", "moderate");

    expect(result.cougarBlight.dayBreakdown.length).toBeGreaterThan(0);
    for (const day of result.cougarBlight.dayBreakdown) {
      expect(day.date).toBeTruthy();
      expect(typeof day.degreeHours).toBe("number");
      expect(typeof day.hadWetting).toBe("boolean");
    }
  });
});
