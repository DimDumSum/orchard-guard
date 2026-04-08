import { describe, it, expect } from "vitest";
import { evaluateFrostRisk } from "@/lib/models/frost-risk";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeForecastData(
  hours: number,
  baseDate: string,
  tempC: number,
) {
  const records: Array<{ timestamp: string; temp_c: number }> = [];
  const start = new Date(baseDate + "T00:00:00Z");
  for (let i = 0; i < hours; i++) {
    const ts = new Date(start.getTime() + i * 3600_000);
    records.push({
      timestamp: ts.toISOString(),
      temp_c: tempC,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("evaluateFrostRisk", () => {
  it("returns high risk with sub-zero forecast during bloom", () => {
    // Bloom kill10 = -2C, kill90 = -3C
    // Forecast of -2.5C is at or below kill10 (-2) → high risk
    const forecast = makeForecastData(48, "2026-04-20", -2.5);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(result.riskLevel).toBe("high");
    expect(result.forecastLow).toBeCloseTo(-2.5, 1);
    expect(result.hoursBelow).toBe(48); // All hours below kill10 (-2)
  });

  it("returns critical risk when forecast is at or below 90% kill threshold", () => {
    // Bloom kill90 = -3C, forecast of -4C → critical
    const forecast = makeForecastData(48, "2026-04-20", -4);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(result.riskLevel).toBe("critical");
    expect(result.riskScore).toBeGreaterThan(80);
  });

  it("returns low or none risk with warm forecast", () => {
    // 15C is well above any kill threshold for bloom stage
    const forecast = makeForecastData(48, "2026-04-20", 15);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(["none", "low"]).toContain(result.riskLevel);
    expect(result.hoursBelow).toBe(0);
  });

  it("uses correct thresholds for dormant stage", () => {
    // Dormant kill10 = -17C → forecast of -10C should be none/low
    const forecast = makeForecastData(48, "2026-01-15", -10);
    const result = evaluateFrostRisk(forecast, "dormant");

    // -10C is 7C above -17C kill10 → none (> 5C margin)
    expect(result.riskLevel).toBe("none");
    expect(result.killThreshold10).toBe(-17);
    expect(result.killThreshold90).toBe(-25);
  });

  it("reports correct margin from kill threshold", () => {
    // Bloom kill10 = -2C, forecast of 1C → margin = 1 - (-2) = 3
    const forecast = makeForecastData(48, "2026-04-20", 1);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(result.marginC).toBeCloseTo(3, 1);
  });

  it("returns a risk score between 0 and 100", () => {
    const forecast = makeForecastData(48, "2026-04-20", -2.5);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("provides a recommendation string", () => {
    const forecast = makeForecastData(48, "2026-04-20", -2.5);
    const result = evaluateFrostRisk(forecast, "bloom");

    expect(result.recommendation).toBeTruthy();
    expect(typeof result.recommendation).toBe("string");
  });

  it("handles empty forecast data", () => {
    const result = evaluateFrostRisk([], "bloom");

    expect(result.forecastLow).toBe(0);
    expect(result.hoursBelow).toBe(0);
  });
});
