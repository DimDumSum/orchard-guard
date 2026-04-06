// ---------------------------------------------------------------------------
// Model Index — Runs all disease and pest models and returns combined results.
// ---------------------------------------------------------------------------

// Disease models
import { evaluateFireBlight, mapLegacyHistory, type FireBlightResult } from "./fire-blight"
import { evaluateAppleScab, type AppleScabResult } from "./apple-scab"
import { evaluateFrostRisk, type FrostRiskResult } from "./frost-risk"
import { evaluatePowderyMildew, type PowderyMildewResult } from "./powdery-mildew"
import { evaluateCedarRust, type CedarRustResult } from "./cedar-rust"
import { evaluateSootyBlotch, type SootyBlotchResult } from "./sooty-blotch"
import { evaluateBlackRot, type BlackRotResult } from "./black-rot"
import { evaluateBitterRot, type BitterRotResult } from "./bitter-rot"
import { evaluateWhiteRot, type WhiteRotResult } from "./white-rot"
import { evaluateBrooksSpot, type BrooksSpotResult } from "./brooks-spot"
import { evaluateAlternaria, type AlternariaResult } from "./alternaria"
import { evaluateNectriaCanker, type NectriaCancerResult } from "./nectria-canker"
import { evaluatePhytophthora, type PhytophthoraResult } from "./phytophthora"
import { evaluateReplantDisease, type ReplantDiseaseResult } from "./replant-disease"
import { evaluateBullsEyeRot, type BullsEyeRotResult } from "./bulls-eye-rot"
import { evaluatePostHarvest, type PostHarvestResult } from "./post-harvest"

// Abiotic / physiological models
import { evaluateBitterPit, type BitterPitResult } from "./bitter-pit"
import { evaluateSunscald, type SunscaldResult } from "./sunscald"
import { evaluateFrostRing, type FrostRingResult } from "./frost-ring"
import { evaluateWaterCore, type WaterCoreResult } from "./water-core"
import { evaluateSunburn, type SunburnResult } from "./sunburn"
import { evaluateAppleMosaic, type AppleMosaicResult } from "./apple-mosaic"
import { evaluateAppleProliferation, type AppleProliferationResult } from "./apple-proliferation"

// Pest models — Lepidoptera
import { evaluateCodlingMoth, type CodlingMothResult } from "./codling-moth"
import { evaluateOrientalFruitMoth, type OrientalFruitMothResult } from "./oriental-fruit-moth"
import { evaluateLeafroller, type LeafrollerResult } from "./leafroller"
import { evaluateTentiformLeafminer, type TentiformLeafminerResult } from "./tentiform-leafminer"
import { evaluateLesserAppleworm, type LesserApplewormResult } from "./lesser-appleworm"
import { evaluateEyespottedBudMoth, type EyespottedBudMothResult } from "./eyespotted-bud-moth"
import { evaluateWinterMoth, type WinterMothResult } from "./winter-moth"
import { evaluateClearwingMoth, type ClearwingMothResult } from "./clearwing-moth"
import { evaluateDogwoodBorer, type DogwoodBorerResult } from "./dogwood-borer"

// Pest models — Hemiptera / Coleoptera
import { evaluatePlumCurculio, type PlumCurculioResult } from "./plum-curculio"
import { evaluateAppleMaggot, type AppleMaggotResult } from "./apple-maggot"
import { evaluateEuropeanRedMite, type EuropeanRedMiteResult } from "./european-red-mite"
import { evaluateRosyAppleAphid, type RosyAppleAphidResult } from "./rosy-apple-aphid"
import { evaluateGreenAppleAphid, type GreenAppleAphidResult } from "./green-apple-aphid"
import { evaluateWoollyAppleAphid, type WoollyAppleAphidResult } from "./woolly-apple-aphid"
import { evaluateTarnishedPlantBug, type TarnishedPlantBugResult } from "./tarnished-plant-bug"
import { evaluateAppleBrownBug, type AppleBrownBugResult } from "./apple-brown-bug"
import { evaluateMulleinBug, type MulleinBugResult } from "./mullein-bug"
import { evaluateSanJoseScale, type SanJoseScaleResult } from "./san-jose-scale"
import { evaluateEuropeanFruitScale, type EuropeanFruitScaleResult } from "./european-fruit-scale"
import { evaluateAppleFleaWeevil, type AppleFleaWeevilResult } from "./apple-flea-weevil"
import { evaluateJapaneseBeetle, type JapaneseBeetleResult } from "./japanese-beetle"

// Pest models — Mites / Flies / Other
import { evaluateTwoSpottedSpiderMite, type TwoSpottedSpiderMiteResult } from "./two-spotted-spider-mite"
import { evaluateAppleRustMite, type AppleRustMiteResult } from "./apple-rust-mite"
import { evaluateAppleLeafMidge, type AppleLeafMidgeResult } from "./apple-leaf-midge"
import { evaluateEuropeanAppleSawfly, type EuropeanAppleSawflyResult } from "./european-apple-sawfly"
import { evaluatePearPsylla, type PearPsyllaResult } from "./pear-psylla"
import { evaluateBMSB, type BMSBResult } from "./brown-marmorated-stink-bug"
import { evaluateSWD, type SWDResult } from "./spotted-wing-drosophila"
import { evaluateVoles, type VoleResult } from "./voles"
import { evaluateDeer, type DeerResult } from "./deer"
import { evaluateDaggerNematode, type DaggerNematodeResult } from "./dagger-nematode"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AllModelResults {
  // Disease
  fireBlight: FireBlightResult
  appleScab: AppleScabResult
  frostRisk: FrostRiskResult
  powderyMildew: PowderyMildewResult
  cedarRust: CedarRustResult
  sootyBlotch: SootyBlotchResult
  blackRot: BlackRotResult
  bitterRot: BitterRotResult
  whiteRot: WhiteRotResult
  brooksSpot: BrooksSpotResult
  alternaria: AlternariaResult
  nectriaCanker: NectriaCancerResult
  phytophthora: PhytophthoraResult
  replantDisease: ReplantDiseaseResult
  bullsEyeRot: BullsEyeRotResult
  postHarvest: PostHarvestResult
  // Abiotic
  bitterPit: BitterPitResult
  sunscald: SunscaldResult
  frostRing: FrostRingResult
  waterCore: WaterCoreResult
  sunburn: SunburnResult
  appleMosaic: AppleMosaicResult
  appleProliferation: AppleProliferationResult
  // Lepidoptera
  codlingMoth: CodlingMothResult
  orientalFruitMoth: OrientalFruitMothResult
  leafroller: LeafrollerResult
  tentiformLeafminer: TentiformLeafminerResult
  lesserAppleworm: LesserApplewormResult
  eyespottedBudMoth: EyespottedBudMothResult
  winterMoth: WinterMothResult
  clearwingMoth: ClearwingMothResult
  dogwoodBorer: DogwoodBorerResult
  // Hemiptera / Coleoptera
  plumCurculio: PlumCurculioResult
  appleMaggot: AppleMaggotResult
  europeanRedMite: EuropeanRedMiteResult
  rosyAppleAphid: RosyAppleAphidResult
  greenAppleAphid: GreenAppleAphidResult
  woollyAppleAphid: WoollyAppleAphidResult
  tarnishedPlantBug: TarnishedPlantBugResult
  appleBrownBug: AppleBrownBugResult
  mulleinBug: MulleinBugResult
  sanJoseScale: SanJoseScaleResult
  europeanFruitScale: EuropeanFruitScaleResult
  appleFleaWeevil: AppleFleaWeevilResult
  japaneseBeetle: JapaneseBeetleResult
  // Mites / Flies / Other
  twoSpottedSpiderMite: TwoSpottedSpiderMiteResult
  appleRustMite: AppleRustMiteResult
  appleLeafMidge: AppleLeafMidgeResult
  europeanAppleSawfly: EuropeanAppleSawflyResult
  pearPsylla: PearPsyllaResult
  bmsb: BMSBResult
  swd: SWDResult
  voles: VoleResult
  deer: DeerResult
  daggerNematode: DaggerNematodeResult
}

interface HourlyRecord {
  timestamp: string
  temp_c: number
  humidity_pct: number
  precip_mm: number
}

interface DailyRecord {
  date: string
  max_temp: number
  min_temp: number
}

interface OrchardConfig {
  bloom_stage: string
  fire_blight_history: string
  petal_fall_date: string | null
  codling_moth_biofix_date: string | null
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export function runAllModels(
  hourlyData: HourlyRecord[],
  dailyData: DailyRecord[],
  forecastData: HourlyRecord[],
  orchard: OrchardConfig,
): AllModelResults {
  // ── Disease models ──
  const fireBlight = evaluateFireBlight(
    hourlyData,
    orchard.bloom_stage as "dormant" | "silver-tip" | "green-tip" | "tight-cluster" | "pink" | "bloom" | "petal-fall" | "fruit-set",
    mapLegacyHistory(orchard.fire_blight_history),
  )
  const appleScab = evaluateAppleScab(hourlyData, dailyData, orchard.petal_fall_date, orchard.bloom_stage)
  const frostRisk = evaluateFrostRisk(forecastData.slice(0, 48), orchard.bloom_stage)
  const powderyMildew = evaluatePowderyMildew(hourlyData, orchard.bloom_stage)
  const cedarRust = evaluateCedarRust(hourlyData, orchard.bloom_stage, orchard.petal_fall_date)
  const sootyBlotch = evaluateSootyBlotch(hourlyData, orchard.petal_fall_date)
  const blackRot = evaluateBlackRot(hourlyData)
  const bitterRot = evaluateBitterRot(hourlyData, dailyData, orchard.petal_fall_date)
  const whiteRot = evaluateWhiteRot(hourlyData)
  const brooksSpot = evaluateBrooksSpot(hourlyData, orchard.petal_fall_date)
  const alternaria = evaluateAlternaria(hourlyData, orchard.bloom_stage)
  const nectriaCanker = evaluateNectriaCanker(hourlyData)
  const phytophthora = evaluatePhytophthora(dailyData)
  const replantDisease = evaluateReplantDisease(false)
  const bullsEyeRot = evaluateBullsEyeRot(hourlyData)
  const postHarvest = evaluatePostHarvest(0, false)

  // ── Abiotic / physiological models ──
  const bitterPit = evaluateBitterPit(hourlyData)
  const sunscald = evaluateSunscald(dailyData)
  const frostRing = evaluateFrostRing(dailyData, orchard.petal_fall_date)
  const waterCore = evaluateWaterCore(dailyData)
  const sunburn = evaluateSunburn(dailyData)
  const appleMosaic = evaluateAppleMosaic()
  const appleProliferation = evaluateAppleProliferation()

  // ── Lepidoptera ──
  const codlingMoth = evaluateCodlingMoth(dailyData, orchard.codling_moth_biofix_date)
  const orientalFruitMoth = evaluateOrientalFruitMoth(dailyData, null)
  const leafroller = evaluateLeafroller(dailyData)
  const tentiformLeafminer = evaluateTentiformLeafminer(dailyData)
  const lesserAppleworm = evaluateLesserAppleworm(dailyData, orchard.codling_moth_biofix_date)
  const eyespottedBudMoth = evaluateEyespottedBudMoth(dailyData)
  const winterMoth = evaluateWinterMoth(dailyData)
  const clearwingMoth = evaluateClearwingMoth(dailyData)
  const dogwoodBorer = evaluateDogwoodBorer(dailyData)

  // ── Hemiptera / Coleoptera ──
  const plumCurculio = evaluatePlumCurculio(dailyData, orchard.petal_fall_date)
  const appleMaggot = evaluateAppleMaggot(dailyData)
  const europeanRedMite = evaluateEuropeanRedMite(dailyData)
  const rosyAppleAphid = evaluateRosyAppleAphid(dailyData, orchard.bloom_stage)
  const greenAppleAphid = evaluateGreenAppleAphid(dailyData)
  const woollyAppleAphid = evaluateWoollyAppleAphid(dailyData)
  const tarnishedPlantBug = evaluateTarnishedPlantBug(dailyData, orchard.bloom_stage, orchard.petal_fall_date)
  const appleBrownBug = evaluateAppleBrownBug(dailyData)
  const mulleinBug = evaluateMulleinBug(dailyData)
  const sanJoseScale = evaluateSanJoseScale(dailyData)
  const europeanFruitScale = evaluateEuropeanFruitScale(dailyData)
  const appleFleaWeevil = evaluateAppleFleaWeevil(dailyData)
  const japaneseBeetle = evaluateJapaneseBeetle(dailyData)

  // ── Mites / Flies / Other ──
  const twoSpottedSpiderMite = evaluateTwoSpottedSpiderMite(hourlyData)
  const appleRustMite = evaluateAppleRustMite()
  const appleLeafMidge = evaluateAppleLeafMidge(dailyData)
  const europeanAppleSawfly = evaluateEuropeanAppleSawfly(dailyData, orchard.bloom_stage)
  const pearPsylla = evaluatePearPsylla()
  const bmsb = evaluateBMSB(dailyData)
  const swd = evaluateSWD()
  const voles = evaluateVoles()
  const deer = evaluateDeer()
  const daggerNematode = evaluateDaggerNematode(false)

  return {
    fireBlight, appleScab, frostRisk, powderyMildew, cedarRust, sootyBlotch, blackRot,
    bitterRot, whiteRot, brooksSpot, alternaria, nectriaCanker, phytophthora,
    replantDisease, bullsEyeRot, postHarvest,
    bitterPit, sunscald, frostRing, waterCore, sunburn, appleMosaic, appleProliferation,
    codlingMoth, orientalFruitMoth, leafroller, tentiformLeafminer, lesserAppleworm,
    eyespottedBudMoth, winterMoth, clearwingMoth, dogwoodBorer,
    plumCurculio, appleMaggot, europeanRedMite, rosyAppleAphid, greenAppleAphid,
    woollyAppleAphid, tarnishedPlantBug, appleBrownBug, mulleinBug,
    sanJoseScale, europeanFruitScale, appleFleaWeevil, japaneseBeetle,
    twoSpottedSpiderMite, appleRustMite, appleLeafMidge, europeanAppleSawfly,
    pearPsylla, bmsb, swd, voles, deer, daggerNematode,
  }
}

// Re-export all evaluate functions
export {
  evaluateFireBlight, mapLegacyHistory, evaluateAppleScab, evaluateFrostRisk,
  evaluatePowderyMildew, evaluateCedarRust, evaluateSootyBlotch, evaluateBlackRot,
  evaluateBitterRot, evaluateWhiteRot, evaluateBrooksSpot, evaluateAlternaria,
  evaluateNectriaCanker, evaluatePhytophthora, evaluateReplantDisease,
  evaluateBullsEyeRot, evaluatePostHarvest,
  evaluateBitterPit, evaluateSunscald, evaluateFrostRing, evaluateWaterCore,
  evaluateSunburn, evaluateAppleMosaic, evaluateAppleProliferation,
  evaluateCodlingMoth, evaluateOrientalFruitMoth, evaluateLeafroller,
  evaluateTentiformLeafminer, evaluateLesserAppleworm, evaluateEyespottedBudMoth,
  evaluateWinterMoth, evaluateClearwingMoth, evaluateDogwoodBorer,
  evaluatePlumCurculio, evaluateAppleMaggot, evaluateEuropeanRedMite,
  evaluateRosyAppleAphid, evaluateGreenAppleAphid, evaluateWoollyAppleAphid,
  evaluateTarnishedPlantBug, evaluateAppleBrownBug, evaluateMulleinBug,
  evaluateSanJoseScale, evaluateEuropeanFruitScale, evaluateAppleFleaWeevil,
  evaluateJapaneseBeetle, evaluateTwoSpottedSpiderMite, evaluateAppleRustMite,
  evaluateAppleLeafMidge, evaluateEuropeanAppleSawfly, evaluatePearPsylla,
  evaluateBMSB, evaluateSWD, evaluateVoles, evaluateDeer, evaluateDaggerNematode,
}

export type {
  FireBlightResult, AppleScabResult, FrostRiskResult, PowderyMildewResult,
  CedarRustResult, SootyBlotchResult, BlackRotResult, BitterRotResult,
  WhiteRotResult, BrooksSpotResult, AlternariaResult, NectriaCancerResult,
  PhytophthoraResult, ReplantDiseaseResult, BullsEyeRotResult, PostHarvestResult,
  BitterPitResult, SunscaldResult, FrostRingResult, WaterCoreResult,
  SunburnResult, AppleMosaicResult, AppleProliferationResult,
  CodlingMothResult, OrientalFruitMothResult, LeafrollerResult,
  TentiformLeafminerResult, LesserApplewormResult, EyespottedBudMothResult,
  WinterMothResult, ClearwingMothResult, DogwoodBorerResult,
  PlumCurculioResult, AppleMaggotResult, EuropeanRedMiteResult,
  RosyAppleAphidResult, GreenAppleAphidResult, WoollyAppleAphidResult,
  TarnishedPlantBugResult, AppleBrownBugResult, MulleinBugResult,
  SanJoseScaleResult, EuropeanFruitScaleResult, AppleFleaWeevilResult,
  JapaneseBeetleResult, TwoSpottedSpiderMiteResult, AppleRustMiteResult,
  AppleLeafMidgeResult, EuropeanAppleSawflyResult, PearPsyllaResult,
  BMSBResult, SWDResult, VoleResult, DeerResult, DaggerNematodeResult,
}
