import { describe, it, expect } from "vitest";
import { runAllModels } from "@/lib/models/index";

// ---------------------------------------------------------------------------
// Helpers — minimal valid data for all 55 models
// ---------------------------------------------------------------------------

function makeHourlyData(hours: number, baseDate: string) {
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
      temp_c: 15,
      humidity_pct: 60,
      precip_mm: 0,
    });
  }
  return records;
}

function makeDailyData(days: number, baseDate: string) {
  const records: Array<{ date: string; max_temp: number; min_temp: number }> = [];
  const start = new Date(baseDate + "T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    records.push({
      date: d.toISOString().slice(0, 10),
      max_temp: 18,
      min_temp: 8,
    });
  }
  return records;
}

const EXPECTED_KEYS = [
  // Disease
  "fireBlight", "appleScab", "frostRisk", "powderyMildew", "cedarRust",
  "sootyBlotch", "blackRot", "bitterRot", "whiteRot", "brooksSpot",
  "alternaria", "nectriaCanker", "phytophthora", "replantDisease",
  "bullsEyeRot", "postHarvest",
  // Abiotic
  "bitterPit", "sunscald", "frostRing", "waterCore", "sunburn",
  "appleMosaic", "appleProliferation",
  // Lepidoptera
  "codlingMoth", "orientalFruitMoth", "leafroller", "tentiformLeafminer",
  "lesserAppleworm", "eyespottedBudMoth", "winterMoth", "clearwingMoth",
  "dogwoodBorer",
  // Hemiptera / Coleoptera
  "plumCurculio", "appleMaggot", "europeanRedMite", "rosyAppleAphid",
  "greenAppleAphid", "woollyAppleAphid", "tarnishedPlantBug",
  "appleBrownBug", "mulleinBug", "sanJoseScale", "europeanFruitScale",
  "appleFleaWeevil", "japaneseBeetle",
  // Mites / Flies / Other
  "twoSpottedSpiderMite", "appleRustMite", "appleLeafMidge",
  "europeanAppleSawfly", "pearPsylla", "bmsb", "swd", "voles", "deer",
  "daggerNematode",
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("runAllModels", () => {
  it("returns all 55 model result keys", () => {
    const hourly = makeHourlyData(96, "2026-04-15");
    const daily = makeDailyData(120, "2026-01-01");
    const forecast = makeHourlyData(48, "2026-04-19");

    const orchard = {
      bloom_stage: "bloom",
      fire_blight_history: "none",
      petal_fall_date: null,
      codling_moth_biofix_date: null,
    };

    const results = runAllModels(hourly, daily, forecast, orchard);
    const resultKeys = Object.keys(results);

    expect(resultKeys).toHaveLength(55);
    for (const key of EXPECTED_KEYS) {
      expect(resultKeys).toContain(key);
    }
  });

  it("runs without error with minimal valid input", () => {
    const hourly = makeHourlyData(96, "2026-04-15");
    const daily = makeDailyData(120, "2026-01-01");
    const forecast = makeHourlyData(48, "2026-04-19");

    const orchard = {
      bloom_stage: "bloom",
      fire_blight_history: "none",
      petal_fall_date: null,
      codling_moth_biofix_date: null,
    };

    // Should not throw
    expect(() => runAllModels(hourly, daily, forecast, orchard)).not.toThrow();
  });

  it("each model result is a non-null object", () => {
    const hourly = makeHourlyData(96, "2026-04-15");
    const daily = makeDailyData(120, "2026-01-01");
    const forecast = makeHourlyData(48, "2026-04-19");

    const orchard = {
      bloom_stage: "bloom",
      fire_blight_history: "none",
      petal_fall_date: null,
      codling_moth_biofix_date: null,
    };

    const results = runAllModels(hourly, daily, forecast, orchard);

    for (const key of EXPECTED_KEYS) {
      const value = results[key as keyof typeof results];
      expect(value).not.toBeNull();
      expect(value).not.toBeUndefined();
      expect(typeof value).toBe("object");
    }
  });
});
