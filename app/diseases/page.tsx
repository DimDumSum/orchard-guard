import {
  Bug,
  Flame,
  Leaf,
  Snowflake,
  Wind,
  TreePine,
  CloudRain,
  CircleDot,
  Droplets,
  Apple,
  Sun,
  Thermometer,
  Shrub,
  FlaskConical,
  Warehouse,
  Dna,
  GitBranch,
  ShieldAlert,
} from "lucide-react";
import { getOrchard, getWeatherRange, getDailyWeather } from "@/lib/db";
import { evaluateFireBlight, mapLegacyHistory } from "@/lib/models/fire-blight";
import { evaluateAppleScab } from "@/lib/models/apple-scab";
import { evaluateFrostRisk } from "@/lib/models/frost-risk";
import { evaluatePowderyMildew } from "@/lib/models/powdery-mildew";
import { evaluateCedarRust } from "@/lib/models/cedar-rust";
import { evaluateSootyBlotch } from "@/lib/models/sooty-blotch";
import { evaluateBlackRot } from "@/lib/models/black-rot";
import { evaluateBitterRot } from "@/lib/models/bitter-rot";
import { evaluateWhiteRot } from "@/lib/models/white-rot";
import { evaluateBrooksSpot } from "@/lib/models/brooks-spot";
import { evaluateAlternaria } from "@/lib/models/alternaria";
import { evaluateNectriaCanker } from "@/lib/models/nectria-canker";
import { evaluatePhytophthora } from "@/lib/models/phytophthora";
import { evaluateReplantDisease } from "@/lib/models/replant-disease";
import { evaluateBullsEyeRot } from "@/lib/models/bulls-eye-rot";
import { evaluatePostHarvest } from "@/lib/models/post-harvest";
import { evaluateAppleMosaic } from "@/lib/models/apple-mosaic";
import { evaluateAppleProliferation } from "@/lib/models/apple-proliferation";
import { evaluateBitterPit } from "@/lib/models/bitter-pit";
import { evaluateSunscald } from "@/lib/models/sunscald";
import { evaluateFrostRing } from "@/lib/models/frost-ring";
import { evaluateWaterCore } from "@/lib/models/water-core";
import { evaluateSunburn } from "@/lib/models/sunburn";
import { RiskCard } from "@/components/dashboard/risk-card";

export const metadata = {
  title: "Disease Risk Overview | OrchardGuard",
  description: "Monitor all disease risk models for your orchard.",
};

export const dynamic = "force-dynamic";

export default function DiseasesPage() {
  const orchard = getOrchard();

  if (!orchard) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">
          No orchard configured. Add an orchard to get started.
        </p>
      </div>
    );
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // Hourly data for the last 7 days
  const hourlyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = now.toISOString().slice(0, 10);
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);

  // Daily data from January 1 of the current year
  const dailyStart = `${currentYear}-01-01`;
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

  // Map hourly data to the shape expected by models
  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    humidity_pct: h.humidity_pct ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  // Map daily data to the shape expected by models
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  // Run all disease models
  const fireBlight = evaluateFireBlight(
    hourlyMapped,
    orchard.bloom_stage,
    mapLegacyHistory(orchard.fire_blight_history)
  );

  const appleScab = evaluateAppleScab(
    hourlyMapped,
    dailyMapped,
    orchard.petal_fall_date,
    orchard.bloom_stage,
  );

  const frostRisk = evaluateFrostRisk(hourlyMapped, orchard.bloom_stage);

  const powderyMildew = evaluatePowderyMildew(
    hourlyMapped,
    orchard.bloom_stage
  );

  const cedarRust = evaluateCedarRust(
    hourlyMapped,
    orchard.bloom_stage,
    orchard.petal_fall_date
  );

  const sootyBlotch = evaluateSootyBlotch(
    hourlyMapped,
    orchard.petal_fall_date
  );

  const blackRot = evaluateBlackRot(hourlyMapped);

  // Expanded disease models
  const bitterRot = evaluateBitterRot(hourlyMapped, dailyMapped, orchard.petal_fall_date);
  const whiteRot = evaluateWhiteRot(hourlyMapped);
  const brooksSpot = evaluateBrooksSpot(hourlyMapped, orchard.petal_fall_date);
  const alternaria = evaluateAlternaria(hourlyMapped, orchard.bloom_stage);
  const nectriaCanker = evaluateNectriaCanker(hourlyMapped);
  const phytophthora = evaluatePhytophthora(dailyMapped);
  const replantDisease = evaluateReplantDisease(false);
  const bullsEyeRot = evaluateBullsEyeRot(hourlyMapped);
  const postHarvest = evaluatePostHarvest(0, false);
  const appleMosaic = evaluateAppleMosaic();
  const appleProliferation = evaluateAppleProliferation();

  // Abiotic / physiological models
  const bitterPit = evaluateBitterPit(hourlyMapped);
  const sunscald = evaluateSunscald(dailyMapped);
  const frostRing = evaluateFrostRing(dailyMapped, orchard.petal_fall_date);
  const waterCore = evaluateWaterCore(dailyMapped);
  const sunburn = evaluateSunburn(dailyMapped);

  const diseases = [
    {
      title: "Fire Blight",
      riskLevel: fireBlight.combinedRisk,
      riskScore: fireBlight.riskScore,
      details: fireBlight.details,
      recommendation: fireBlight.sprayRecommendation,
      icon: <Flame className="h-5 w-5" />,
      href: "/diseases/fire-blight",
    },
    {
      title: "Apple Scab",
      riskLevel: appleScab.riskLevel,
      riskScore: appleScab.riskScore,
      details: appleScab.details,
      recommendation: appleScab.sprayWindow ?? undefined,
      icon: <Leaf className="h-5 w-5" />,
      href: "/diseases/apple-scab",
    },
    {
      title: "Frost Risk",
      riskLevel: frostRisk.riskLevel,
      riskScore: frostRisk.riskScore,
      details: frostRisk.details,
      recommendation: frostRisk.recommendation,
      icon: <Snowflake className="h-5 w-5" />,
      href: "/diseases/frost-risk",
    },
    {
      title: "Powdery Mildew",
      riskLevel: powderyMildew.riskLevel,
      riskScore: powderyMildew.riskScore,
      details: powderyMildew.details,
      recommendation: powderyMildew.recommendation,
      icon: <Wind className="h-5 w-5" />,
      href: "/diseases/powdery-mildew",
    },
    {
      title: "Cedar Apple Rust",
      riskLevel: cedarRust.riskLevel,
      riskScore: cedarRust.riskScore,
      details: cedarRust.details,
      recommendation: cedarRust.recommendation,
      icon: <TreePine className="h-5 w-5" />,
      href: "/diseases/cedar-rust",
    },
    {
      title: "Sooty Blotch & Flyspeck",
      riskLevel: sootyBlotch.riskLevel,
      riskScore: sootyBlotch.riskScore,
      details: sootyBlotch.details,
      recommendation: sootyBlotch.recommendation,
      icon: <CloudRain className="h-5 w-5" />,
      href: "/diseases/sooty-blotch",
    },
    {
      title: "Black Rot",
      riskLevel: blackRot.riskLevel,
      riskScore: blackRot.riskScore,
      details: blackRot.details,
      recommendation: blackRot.recommendation,
      icon: <CircleDot className="h-5 w-5" />,
      href: "/diseases/black-rot",
    },
    {
      title: "Bitter Rot",
      riskLevel: bitterRot.riskLevel,
      riskScore: bitterRot.riskScore,
      details: bitterRot.details,
      recommendation: bitterRot.recommendation,
      icon: <Droplets className="h-5 w-5" />,
      href: "/diseases/bitter-rot",
    },
    {
      title: "White Rot",
      riskLevel: whiteRot.riskLevel,
      riskScore: whiteRot.riskScore,
      details: whiteRot.details,
      recommendation: whiteRot.recommendation,
      icon: <FlaskConical className="h-5 w-5" />,
      href: "/diseases/white-rot",
    },
    {
      title: "Brooks Spot",
      riskLevel: brooksSpot.riskLevel,
      riskScore: brooksSpot.riskScore,
      details: brooksSpot.details,
      recommendation: brooksSpot.recommendation,
      icon: <CircleDot className="h-5 w-5" />,
      href: "/diseases/brooks-spot",
    },
    {
      title: "Alternaria Leaf Blotch",
      riskLevel: alternaria.riskLevel,
      riskScore: alternaria.riskScore,
      details: alternaria.details,
      recommendation: alternaria.recommendation,
      icon: <Leaf className="h-5 w-5" />,
      href: "/diseases/alternaria",
    },
    {
      title: "Nectria Canker",
      riskLevel: nectriaCanker.riskLevel,
      riskScore: nectriaCanker.riskScore,
      details: nectriaCanker.details,
      recommendation: nectriaCanker.recommendation,
      icon: <GitBranch className="h-5 w-5" />,
      href: "/diseases/nectria-canker",
    },
    {
      title: "Phytophthora Crown Rot",
      riskLevel: phytophthora.riskLevel,
      riskScore: phytophthora.riskScore,
      details: phytophthora.details,
      recommendation: phytophthora.recommendation,
      icon: <Shrub className="h-5 w-5" />,
      href: "/diseases/phytophthora",
    },
    {
      title: "Replant Disease",
      riskLevel: replantDisease.riskLevel,
      riskScore: replantDisease.riskScore,
      details: replantDisease.details,
      recommendation: replantDisease.recommendation,
      icon: <TreePine className="h-5 w-5" />,
      href: "/diseases/replant-disease",
    },
    {
      title: "Bull\u2019s Eye Rot",
      riskLevel: bullsEyeRot.riskLevel,
      riskScore: bullsEyeRot.riskScore,
      details: bullsEyeRot.details,
      recommendation: bullsEyeRot.recommendation,
      icon: <ShieldAlert className="h-5 w-5" />,
      href: "/diseases/bulls-eye-rot",
    },
    {
      title: "Post-Harvest Diseases",
      riskLevel: postHarvest.riskLevel,
      riskScore: postHarvest.riskScore,
      details: postHarvest.details,
      recommendation: postHarvest.recommendation,
      icon: <Warehouse className="h-5 w-5" />,
      href: "/diseases/post-harvest",
    },
    {
      title: "Apple Mosaic Virus",
      riskLevel: appleMosaic.riskLevel,
      riskScore: appleMosaic.riskScore,
      details: appleMosaic.details,
      recommendation: appleMosaic.recommendation,
      icon: <Dna className="h-5 w-5" />,
      href: "/diseases/apple-mosaic",
    },
    {
      title: "Apple Proliferation",
      riskLevel: appleProliferation.riskLevel,
      riskScore: appleProliferation.riskScore,
      details: appleProliferation.details,
      recommendation: appleProliferation.recommendation,
      icon: <Bug className="h-5 w-5" />,
      href: "/diseases/apple-proliferation",
    },
  ];

  const abioticConditions = [
    {
      title: "Bitter Pit",
      riskLevel: bitterPit.riskLevel,
      riskScore: bitterPit.riskScore,
      details: bitterPit.details,
      recommendation: bitterPit.recommendation,
      icon: <Apple className="h-5 w-5" />,
      href: "/diseases/bitter-pit",
    },
    {
      title: "Sunscald",
      riskLevel: sunscald.riskLevel,
      riskScore: sunscald.riskScore,
      details: sunscald.details,
      recommendation: sunscald.recommendation,
      icon: <Sun className="h-5 w-5" />,
      href: "/diseases/sunscald",
    },
    {
      title: "Frost Ring",
      riskLevel: frostRing.riskLevel,
      riskScore: frostRing.riskScore,
      details: frostRing.details,
      recommendation: frostRing.recommendation,
      icon: <Snowflake className="h-5 w-5" />,
      href: "/diseases/frost-ring",
    },
    {
      title: "Water Core",
      riskLevel: waterCore.riskLevel,
      riskScore: waterCore.riskScore,
      details: waterCore.details,
      recommendation: waterCore.recommendation,
      icon: <Droplets className="h-5 w-5" />,
      href: "/diseases/water-core",
    },
    {
      title: "Sunburn",
      riskLevel: sunburn.riskLevel,
      riskScore: sunburn.riskScore,
      details: sunburn.details,
      recommendation: sunburn.recommendation,
      icon: <Thermometer className="h-5 w-5" />,
      href: "/diseases/sunburn",
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>
          Disease Risk Overview
        </h1>
        <p className="mt-1 text-[14px] text-bark-400">
          {orchard.name} &mdash; Bloom stage:{" "}
          <span className="font-medium capitalize">
            {orchard.bloom_stage.replace(/-/g, " ")}
          </span>
        </p>
        <p className="mt-3 text-[14px] leading-[1.7] text-bark-600 max-w-3xl">
          OrchardGuard monitors {diseases.length} diseases and {abioticConditions.length} abiotic
          conditions using weather data, your orchard history, and published prediction models.
          {orchard.bloom_stage === "dormant" && (
            <> During dormant season, most fungal disease models are inactive because
            there&apos;s no green tissue to infect. They&apos;ll activate as your trees progress
            through green tip, bloom, and into the growing season.</>
          )}
        </p>
      </div>

      <section>
        <h2 className="text-[16px] font-bold text-bark-900 mb-3">
          Disease Models
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {diseases.map((disease) => (
            <RiskCard
              key={disease.title}
              title={disease.title}
              riskLevel={disease.riskLevel}
              riskScore={disease.riskScore}
              details={disease.details}
              recommendation={disease.recommendation}
              icon={disease.icon}
              href={disease.href}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[16px] font-bold text-bark-900 mb-3">
          Abiotic &amp; Physiological Conditions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {abioticConditions.map((condition) => (
            <RiskCard
              key={condition.title}
              title={condition.title}
              riskLevel={condition.riskLevel}
              riskScore={condition.riskScore}
              details={condition.details}
              recommendation={condition.recommendation}
              icon={condition.icon}
              href={condition.href}
            />
          ))}
        </div>
      </section>
    </>
  );
}
