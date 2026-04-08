import { describe, it, expect } from "vitest";
import { evaluateAppleScab, findWetPeriods, calcAscosporeMaturity } from "@/lib/models/apple-scab";

// ---------------------------------------------------------------------------
// Helpers
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

function makeDailyData(
  days: number,
  baseDate: string,
  maxTemp: number,
  minTemp: number,
) {
  const records: Array<{ date: string; max_temp: number; min_temp: number }> = [];
  const start = new Date(baseDate + "T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    records.push({
      date: d.toISOString().slice(0, 10),
      max_temp: maxTemp,
      min_temp: minTemp,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("evaluateAppleScab", () => {
  it("detects wet periods with warm wet weather (15C, 90% humidity, precip)", () => {
    // 24 hours of 15C, 90% humidity, with rain — should detect a wet period
    const hourly = makeHourlyData(48, "2026-04-20", 15, 92, 0.5);
    const daily = makeDailyData(90, "2026-01-01", 15, 5);

    const result = evaluateAppleScab(hourly, daily, null, "bloom");

    // findWetPeriods should find at least one wet period
    expect(result.currentWetPeriod).not.toBeNull();
    // With 48 hours of wetness at 15C, we should have an infection
    // (Mills table: 15C needs 15h for light infection)
    expect(result.recentInfections.length).toBeGreaterThan(0);
  });

  it("returns riskLevel none with dry weather", () => {
    // Dry conditions: low humidity, no precipitation
    const hourly = makeHourlyData(48, "2026-04-20", 15, 40, 0);
    const daily = makeDailyData(90, "2026-01-01", 15, 5);

    const result = evaluateAppleScab(hourly, daily, null, "bloom");

    expect(result.riskLevel).toBe("none");
    expect(result.recentInfections).toHaveLength(0);
  });

  it("accumulates ascospore maturity with warm daily temps", () => {
    // Daily data from Jan 1 with warm temps should accumulate degree-days
    // and push ascospore maturity above 0
    const daily = makeDailyData(120, "2026-01-01", 12, 4);
    const hourly = makeHourlyData(24, "2026-04-30", 15, 50, 0);

    const result = evaluateAppleScab(hourly, daily, null, "bloom");

    // With 120 days of avg ~8C, cumulative DD base 0 should be substantial
    expect(result.cumulativeDegreeDays).toBeGreaterThan(0);
    expect(result.ascosporeMaturity).toBeGreaterThan(0);
  });

  it("returns no risk for dormant stage (pre-green-tip)", () => {
    const hourly = makeHourlyData(48, "2026-03-01", 15, 95, 1.0);
    const daily = makeDailyData(60, "2026-01-01", 10, 0);

    const result = evaluateAppleScab(hourly, daily, null, "dormant");

    expect(result.riskLevel).toBe("none");
    expect(result.primaryScabSeason).toBe(false);
  });

  it("returns a risk score between 0 and 100", () => {
    const hourly = makeHourlyData(48, "2026-04-20", 15, 92, 0.5);
    const daily = makeDailyData(90, "2026-01-01", 15, 5);

    const result = evaluateAppleScab(hourly, daily, null, "bloom");

    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});

describe("findWetPeriods", () => {
  it("detects a continuous wet period from high humidity data", () => {
    const hourly = makeHourlyData(20, "2026-04-20", 15, 95, 0);
    const periods = findWetPeriods(hourly);

    expect(periods.length).toBeGreaterThan(0);
    expect(periods[0].durationHours).toBeGreaterThanOrEqual(20);
  });

  it("returns empty array for dry data", () => {
    const hourly = makeHourlyData(20, "2026-04-20", 15, 40, 0);
    const periods = findWetPeriods(hourly);

    expect(periods).toHaveLength(0);
  });
});

describe("calcAscosporeMaturity", () => {
  it("returns 0 for 0 degree days", () => {
    expect(calcAscosporeMaturity(0)).toBe(0);
  });

  it("returns ~50% at 390 degree days (midpoint of logistic curve)", () => {
    const maturity = calcAscosporeMaturity(390);
    expect(maturity).toBeGreaterThan(45);
    expect(maturity).toBeLessThan(55);
  });

  it("approaches 100% at high degree days", () => {
    const maturity = calcAscosporeMaturity(800);
    expect(maturity).toBeGreaterThan(95);
  });
});
