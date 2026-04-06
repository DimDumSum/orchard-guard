import { Bug, Egg, Cherry, TreeDeciduous, Worm, Rat, Shrub, Snail } from "lucide-react";
import { getOrchard, getDailyWeather, getWeatherRange } from "@/lib/db";
import { evaluateCodlingMoth } from "@/lib/models/codling-moth";
import { evaluatePlumCurculio } from "@/lib/models/plum-curculio";
import { evaluateAppleMaggot } from "@/lib/models/apple-maggot";
import { evaluateOrientalFruitMoth } from "@/lib/models/oriental-fruit-moth";
import { evaluateLeafroller } from "@/lib/models/leafroller";
import { evaluateEuropeanRedMite } from "@/lib/models/european-red-mite";
import { evaluateTentiformLeafminer } from "@/lib/models/tentiform-leafminer";
import { evaluateLesserAppleworm } from "@/lib/models/lesser-appleworm";
import { evaluateEyespottedBudMoth } from "@/lib/models/eyespotted-bud-moth";
import { evaluateWinterMoth } from "@/lib/models/winter-moth";
import { evaluateClearwingMoth } from "@/lib/models/clearwing-moth";
import { evaluateDogwoodBorer } from "@/lib/models/dogwood-borer";
import { evaluateRosyAppleAphid } from "@/lib/models/rosy-apple-aphid";
import { evaluateGreenAppleAphid } from "@/lib/models/green-apple-aphid";
import { evaluateWoollyAppleAphid } from "@/lib/models/woolly-apple-aphid";
import { evaluateTarnishedPlantBug } from "@/lib/models/tarnished-plant-bug";
import { evaluateAppleBrownBug } from "@/lib/models/apple-brown-bug";
import { evaluateMulleinBug } from "@/lib/models/mullein-bug";
import { evaluateSanJoseScale } from "@/lib/models/san-jose-scale";
import { evaluateEuropeanFruitScale } from "@/lib/models/european-fruit-scale";
import { evaluateAppleFleaWeevil } from "@/lib/models/apple-flea-weevil";
import { evaluateJapaneseBeetle } from "@/lib/models/japanese-beetle";
import { evaluateTwoSpottedSpiderMite } from "@/lib/models/two-spotted-spider-mite";
import { evaluateAppleRustMite } from "@/lib/models/apple-rust-mite";
import { evaluateAppleLeafMidge } from "@/lib/models/apple-leaf-midge";
import { evaluateEuropeanAppleSawfly } from "@/lib/models/european-apple-sawfly";
import { evaluatePearPsylla } from "@/lib/models/pear-psylla";
import { evaluateBMSB } from "@/lib/models/brown-marmorated-stink-bug";
import { evaluateSWD } from "@/lib/models/spotted-wing-drosophila";
import { evaluateVoles } from "@/lib/models/voles";
import { evaluateDeer } from "@/lib/models/deer";
import { evaluateDaggerNematode } from "@/lib/models/dagger-nematode";
import { RiskCard } from "@/components/dashboard/risk-card";

export const metadata = {
  title: "Pest Risk Overview | OrchardGuard",
  description: "Monitor all pest risk models for your orchard.",
};

export const dynamic = "force-dynamic";

interface PestEntry {
  title: string;
  riskLevel: string;
  riskScore: number;
  details: string;
  recommendation?: string;
  icon: React.ReactNode;
  href?: string;
}

interface PestCategory {
  label: string;
  pests: PestEntry[];
}

export default function PestsPage() {
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

  // Daily data from January 1 of the current year
  const dailyStart = `${currentYear}-01-01`;
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);

  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  // Hourly data for models that need it (e.g. Two-Spotted Spider Mite)
  const hourlyData = getWeatherRange("default", dailyStart, dailyEnd);
  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  // ── Lepidoptera (moths) ──────────────────────────────────────────────
  const codlingMoth = evaluateCodlingMoth(
    dailyMapped,
    orchard.codling_moth_biofix_date
  );
  const orientalFruitMoth = evaluateOrientalFruitMoth(
    dailyMapped,
    orchard.codling_moth_biofix_date
  );
  const leafroller = evaluateLeafroller(dailyMapped);
  const tentiformLeafminer = evaluateTentiformLeafminer(dailyMapped);
  const lesserAppleworm = evaluateLesserAppleworm(
    dailyMapped,
    orchard.codling_moth_biofix_date
  );
  const eyespottedBudMoth = evaluateEyespottedBudMoth(dailyMapped);
  const winterMoth = evaluateWinterMoth(dailyMapped);
  const clearwingMoth = evaluateClearwingMoth(dailyMapped);
  const dogwoodBorer = evaluateDogwoodBorer(dailyMapped);

  // ── Hemiptera & True Bugs ────────────────────────────────────────────
  const rosyAppleAphid = evaluateRosyAppleAphid(
    dailyMapped,
    orchard.bloom_stage
  );
  const greenAppleAphid = evaluateGreenAppleAphid(dailyMapped);
  const woollyAppleAphid = evaluateWoollyAppleAphid(dailyMapped);
  const tarnishedPlantBug = evaluateTarnishedPlantBug(
    dailyMapped,
    orchard.bloom_stage,
    orchard.petal_fall_date
  );
  const appleBrownBug = evaluateAppleBrownBug(dailyMapped);
  const mulleinBug = evaluateMulleinBug(dailyMapped);
  const sanJoseScale = evaluateSanJoseScale(dailyMapped);
  const europeanFruitScale = evaluateEuropeanFruitScale(dailyMapped);
  const bmsb = evaluateBMSB(dailyMapped);
  const pearPsylla = evaluatePearPsylla();

  // ── Coleoptera (beetles) ─────────────────────────────────────────────
  const plumCurculio = evaluatePlumCurculio(
    dailyMapped,
    orchard.petal_fall_date
  );
  const appleFleaWeevil = evaluateAppleFleaWeevil(dailyMapped);
  const japaneseBeetle = evaluateJapaneseBeetle(dailyMapped);

  // ── Mites (Acari) ───────────────────────────────────────────────────
  const europeanRedMite = evaluateEuropeanRedMite(dailyMapped);
  const twoSpottedSpiderMite = evaluateTwoSpottedSpiderMite(hourlyMapped);
  const appleRustMite = evaluateAppleRustMite();

  // ── Flies (Diptera / Hymenoptera) ────────────────────────────────────
  const appleMaggot = evaluateAppleMaggot(dailyMapped);
  const appleLeafMidge = evaluateAppleLeafMidge(dailyMapped);
  const europeanAppleSawfly = evaluateEuropeanAppleSawfly(
    dailyMapped,
    orchard.bloom_stage
  );
  const swd = evaluateSWD();

  // ── Vertebrates & Other ──────────────────────────────────────────────
  const voles = evaluateVoles();
  const deer = evaluateDeer();
  const daggerNematode = evaluateDaggerNematode(false);

  const categories: PestCategory[] = [
    {
      label: "Lepidoptera (Moths)",
      pests: [
        {
          title: "Codling Moth",
          ...codlingMoth,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/codling-moth",
        },
        {
          title: "Oriental Fruit Moth",
          ...orientalFruitMoth,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/oriental-fruit-moth",
        },
        {
          title: "Leafroller (OBLR)",
          ...leafroller,
          icon: <TreeDeciduous className="h-5 w-5" />,
          href: "/pests/leafroller",
        },
        {
          title: "Tentiform Leafminer",
          ...tentiformLeafminer,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/tentiform-leafminer",
        },
        {
          title: "Lesser Appleworm",
          ...lesserAppleworm,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/lesser-appleworm",
        },
        {
          title: "Eyespotted Bud Moth",
          ...eyespottedBudMoth,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/eyespot-bud-moth",
        },
        {
          title: "Winter Moth",
          ...winterMoth,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/winter-moth",
        },
        {
          title: "Clearwing Moth",
          ...clearwingMoth,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/clearwing-moth",
        },
        {
          title: "Dogwood Borer",
          ...dogwoodBorer,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/dogwood-borer",
        },
      ],
    },
    {
      label: "Hemiptera & True Bugs",
      pests: [
        {
          title: "Rosy Apple Aphid",
          ...rosyAppleAphid,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/rosy-apple-aphid",
        },
        {
          title: "Green Apple Aphid",
          ...greenAppleAphid,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/green-apple-aphid",
        },
        {
          title: "Woolly Apple Aphid",
          ...woollyAppleAphid,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/woolly-apple-aphid",
        },
        {
          title: "Tarnished Plant Bug",
          ...tarnishedPlantBug,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/tarnished-plant-bug",
        },
        {
          title: "Apple Brown Bug",
          ...appleBrownBug,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/apple-brown-bug",
        },
        {
          title: "Mullein Bug",
          ...mulleinBug,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/mullein-bug",
        },
        {
          title: "San Jose Scale",
          ...sanJoseScale,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/san-jose-scale",
        },
        {
          title: "European Fruit Scale",
          ...europeanFruitScale,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/european-fruit-scale",
        },
        {
          title: "Brown Marmorated Stink Bug",
          ...bmsb,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/brown-marmorated-stink-bug",
        },
        {
          title: "Pear Psylla",
          ...pearPsylla,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/pear-psylla",
        },
      ],
    },
    {
      label: "Coleoptera (Beetles)",
      pests: [
        {
          title: "Plum Curculio",
          ...plumCurculio,
          icon: <Worm className="h-5 w-5" />,
          href: "/pests/plum-curculio",
        },
        {
          title: "Apple Flea Weevil",
          ...appleFleaWeevil,
          icon: <Worm className="h-5 w-5" />,
          href: "/pests/apple-flea-weevil",
        },
        {
          title: "Japanese Beetle",
          ...japaneseBeetle,
          icon: <Worm className="h-5 w-5" />,
          href: "/pests/japanese-beetle",
        },
      ],
    },
    {
      label: "Mites (Acari)",
      pests: [
        {
          title: "European Red Mite",
          ...europeanRedMite,
          icon: <Egg className="h-5 w-5" />,
          href: "/pests/european-red-mite",
        },
        {
          title: "Two-Spotted Spider Mite",
          ...twoSpottedSpiderMite,
          icon: <Egg className="h-5 w-5" />,
          href: "/pests/two-spotted-spider-mite",
        },
        {
          title: "Apple Rust Mite",
          ...appleRustMite,
          icon: <Egg className="h-5 w-5" />,
          href: "/pests/apple-rust-mite",
        },
      ],
    },
    {
      label: "Flies (Diptera / Hymenoptera)",
      pests: [
        {
          title: "Apple Maggot",
          ...appleMaggot,
          icon: <Cherry className="h-5 w-5" />,
          href: "/pests/apple-maggot",
        },
        {
          title: "Apple Leaf Midge",
          ...appleLeafMidge,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/apple-leaf-midge",
        },
        {
          title: "European Apple Sawfly",
          ...europeanAppleSawfly,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/european-apple-sawfly",
        },
        {
          title: "Spotted Wing Drosophila",
          ...swd,
          icon: <Bug className="h-5 w-5" />,
          href: "/pests/spotted-wing-drosophila",
        },
      ],
    },
    {
      label: "Vertebrates & Other",
      pests: [
        {
          title: "Voles",
          ...voles,
          icon: <Rat className="h-5 w-5" />,
          href: "/pests/voles",
        },
        {
          title: "Deer Damage",
          ...deer,
          icon: <Shrub className="h-5 w-5" />,
          href: "/pests/deer",
        },
        {
          title: "Dagger Nematode",
          ...daggerNematode,
          icon: <Snail className="h-5 w-5" />,
          href: "/pests/dagger-nematode",
        },
      ],
    },
  ];

  // Count total pests
  const totalPests = categories.reduce((sum, cat) => sum + cat.pests.length, 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>
          Pest Risk Overview
        </h1>
        <p className="mt-1 text-[14px] text-bark-400">
          {orchard.name} &mdash; Bloom stage:{" "}
          <span className="font-medium capitalize">
            {orchard.bloom_stage.replace(/-/g, " ")}
          </span>
        </p>
        <p className="mt-3 text-[14px] leading-[1.7] text-bark-600 max-w-3xl">
          OrchardGuard tracks {totalPests} insect and animal pests using degree-day models
          and scouting thresholds. Degree days measure accumulated warmth &mdash; pests develop
          at predictable rates based on temperature, so we can forecast when they&apos;ll emerge
          and when to spray.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.label} className="mb-10">
          <h2 className="text-[16px] font-bold text-bark-900 mb-3">
            {category.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {category.pests.map((pest) => (
              <RiskCard
                key={pest.title}
                title={pest.title}
                riskLevel={pest.riskLevel}
                riskScore={pest.riskScore}
                details={pest.details}
                recommendation={pest.recommendation}
                icon={pest.icon}
                href={pest.href}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
