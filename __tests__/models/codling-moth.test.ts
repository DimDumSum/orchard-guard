import { describe, it, expect } from "vitest";
import { evaluateCodlingMoth, detectBiofix } from "@/lib/models/codling-moth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

describe("evaluateCodlingMoth", () => {
  it("accumulates degree-days with warm daily temps from biofix", () => {
    // 30 days of max 25C / min 15C from biofix date
    // Avg temp = 20C, base 10C, so each day ~10 DD
    // Over 30 days = ~300 DD
    const daily = makeDailyData(30, "2026-05-15", 25, 15);
    const result = evaluateCodlingMoth(daily, "2026-05-15");

    expect(result.cumulativeDD).toBeGreaterThan(0);
    // Should be around 300 DD
    expect(result.cumulativeDD).toBeGreaterThan(200);
    expect(result.cumulativeDD).toBeLessThan(400);
  });

  it("returns low risk and default state when biofix is null", () => {
    const daily = makeDailyData(30, "2026-05-15", 25, 15);
    const result = evaluateCodlingMoth(daily, null);

    expect(result.riskLevel).toBe("low");
    expect(result.riskScore).toBe(5);
    expect(result.cumulativeDD).toBe(0);
    expect(result.currentThreshold).toBe("Biofix not set");
  });

  it("identifies the correct generation based on degree-days", () => {
    // Few warm days — should be generation 1
    const daily = makeDailyData(20, "2026-05-15", 25, 15);
    const result = evaluateCodlingMoth(daily, "2026-05-15");

    expect(result.generation).toBe(1);
  });

  it("reaches generation 2 with enough degree-days (>= 1050)", () => {
    // Need ~1050 DD base 10. At 10 DD/day, need ~105 days.
    const daily = makeDailyData(110, "2026-05-01", 25, 15);
    const result = evaluateCodlingMoth(daily, "2026-05-01");

    expect(result.cumulativeDD).toBeGreaterThanOrEqual(1050);
    expect(result.generation).toBe(2);
  });

  it("provides scouting protocol and economic threshold", () => {
    const daily = makeDailyData(30, "2026-05-15", 25, 15);
    const result = evaluateCodlingMoth(daily, "2026-05-15");

    expect(result.scoutingProtocol).toBeTruthy();
    expect(result.economicThreshold).toBeTruthy();
  });

  it("provides both conventional and organic product lists", () => {
    const daily = makeDailyData(30, "2026-05-15", 25, 15);
    const result = evaluateCodlingMoth(daily, "2026-05-15");

    expect(result.conventionalProducts.length).toBeGreaterThan(0);
    expect(result.organicProducts.length).toBeGreaterThan(0);
  });

  it("identifies the next upcoming threshold", () => {
    // Low DD should have next threshold = first one (100 DD)
    const daily = makeDailyData(5, "2026-05-15", 20, 12);
    const result = evaluateCodlingMoth(daily, "2026-05-15");

    expect(result.nextThreshold).not.toBeNull();
    expect(result.nextThreshold!.dd).toBe(100);
  });
});

describe("detectBiofix", () => {
  it("detects biofix from consecutive weeks with 2+ moths", () => {
    const trapEntries = [
      { date: "2026-05-01", count: 0 },
      { date: "2026-05-08", count: 1 },
      { date: "2026-05-15", count: 3 },
      { date: "2026-05-22", count: 4 },
    ];

    const biofix = detectBiofix(trapEntries);
    // First pair of consecutive weeks with >= 2: May 15 and May 22
    expect(biofix).toBe("2026-05-15");
  });

  it("returns null when no consecutive weeks have 2+ moths", () => {
    const trapEntries = [
      { date: "2026-05-01", count: 0 },
      { date: "2026-05-08", count: 3 },
      { date: "2026-05-15", count: 1 },
      { date: "2026-05-22", count: 0 },
    ];

    const biofix = detectBiofix(trapEntries);
    expect(biofix).toBeNull();
  });

  it("returns null with fewer than 2 trap entries", () => {
    expect(detectBiofix([])).toBeNull();
    expect(detectBiofix([{ date: "2026-05-01", count: 5 }])).toBeNull();
  });
});
