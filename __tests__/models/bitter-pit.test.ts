import { describe, it, expect } from "vitest";
import { evaluateBitterPit } from "@/lib/models/bitter-pit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHourlyData(
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

/**
 * Create hourly data that spans June-July with temperatures above 30C
 * to trigger heat stress accumulation.
 */
function makeJuneJulyHeatData(heatHours: number) {
  const records: Array<{ timestamp: string; temp_c: number }> = [];
  const start = new Date("2026-06-01T00:00:00Z");
  for (let i = 0; i < heatHours; i++) {
    const ts = new Date(start.getTime() + i * 3600_000);
    records.push({
      timestamp: ts.toISOString(),
      temp_c: 32, // Above 30C threshold
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("evaluateBitterPit", () => {
  it("assigns higher risk to honeycrisp than mcintosh with identical conditions", () => {
    const hourly = makeJuneJulyHeatData(40);

    const honeycrisp = evaluateBitterPit(hourly, "honeycrisp", "light", 0);
    const mcintosh = evaluateBitterPit(hourly, "mcintosh", "light", 0);

    // Honeycrisp susceptibility = 4, mcintosh = 1
    expect(honeycrisp.riskScore).toBeGreaterThan(mcintosh.riskScore);
    expect(honeycrisp.varietyRisk).toBe("very_high");
    expect(mcintosh.varietyRisk).toBe("low");
  });

  it("assigns higher risk with zero calcium sprays than with many sprays", () => {
    const hourly = makeJuneJulyHeatData(40);

    const noSprays = evaluateBitterPit(hourly, "honeycrisp", "moderate", 0);
    const manySprays = evaluateBitterPit(hourly, "honeycrisp", "moderate", 12);

    // 0 sprays = maximum calcium deficit, 12 sprays = no deficit
    expect(noSprays.riskScore).toBeGreaterThan(manySprays.riskScore);
  });

  it("assigns higher risk with light crop load than heavy", () => {
    const hourly = makeJuneJulyHeatData(40);

    const lightLoad = evaluateBitterPit(hourly, "honeycrisp", "light", 2);
    const heavyLoad = evaluateBitterPit(hourly, "honeycrisp", "heavy", 2);

    // Light crop load factor = 3, heavy = 1
    expect(lightLoad.riskScore).toBeGreaterThan(heavyLoad.riskScore);
  });

  it("returns product suggestions", () => {
    const hourly = makeHourlyData(48, "2026-06-15", 25);
    const result = evaluateBitterPit(hourly, "honeycrisp");

    expect(Array.isArray(result.productSuggestions)).toBe(true);
    expect(result.productSuggestions.length).toBeGreaterThan(0);
  });

  it("counts heat stress hours only in June and July", () => {
    // Data in May — should contribute 0 heat stress hours
    const mayData = makeHourlyData(48, "2026-05-01", 35);
    const result = evaluateBitterPit(mayData, "honeycrisp");

    expect(result.heatStressHours).toBe(0);
  });

  it("correctly tracks calcium spray schedule", () => {
    const hourly = makeHourlyData(24, "2026-06-15", 25);
    const result = evaluateBitterPit(hourly, "honeycrisp", "moderate", 5);

    expect(result.calciumSpraysCompleted).toBe(5);
    expect(result.calciumSpraysRecommended).toBe(12);
    expect(result.nextCalciumSprayDue).toBeTruthy();
  });

  it("returns null for nextCalciumSprayDue when all sprays completed", () => {
    const hourly = makeHourlyData(24, "2026-06-15", 25);
    const result = evaluateBitterPit(hourly, "honeycrisp", "moderate", 12);

    expect(result.nextCalciumSprayDue).toBeNull();
  });
});
