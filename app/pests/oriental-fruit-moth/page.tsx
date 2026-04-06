import { Bug, Target, Search, AlertTriangle } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateOrientalFruitMoth } from "@/lib/models/oriental-fruit-moth";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
} from "@/components/models/model-detail-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Oriental Fruit Moth Detail | OrchardGuard",
  description:
    "Detailed oriental fruit moth risk assessment using degree-day phenology.",
};

export const dynamic = "force-dynamic";

const GENERATION_THRESHOLDS = [
  { dd: 170, label: "1st gen larval activity begins", gen: 1 },
  { dd: 350, label: "1st gen larval activity ends", gen: 1 },
  { dd: 680, label: "2nd gen larval activity begins", gen: 2 },
  { dd: 850, label: "2nd gen larval activity ends", gen: 2 },
  { dd: 1400, label: "3rd generation activity begins", gen: 3 },
];

export default function OrientalFruitMothPage() {
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
  const dailyStart = `${now.getFullYear()}-01-01`;
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateOrientalFruitMoth(
    dailyMapped,
    orchard.codling_moth_biofix_date,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Bug className="h-8 w-8 text-amber-600" />}
        title="Oriental Fruit Moth"
        riskLevel={result.riskLevel}
        subtitle={`Degree-day phenology tracking — ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Oriental Fruit Moth">
        <p>
          Oriental fruit moth (<em>Grapholita molesta</em>) is a key pest of
          apples and stone fruit in Ontario. It completes three generations per
          season, tracked using{" "}
          <TermTooltip term="Degree Days">degree days</TermTooltip> (base
          7.2&deg;C) from the{" "}
          <TermTooltip term="Biofix">biofix</TermTooltip> date.
        </p>
        <p>
          <strong>First generation</strong> larvae attack terminal shoot tips,
          causing a distinctive wilting called &ldquo;flagging&rdquo; that is
          easily confused with fire blight. The key difference: OFM flagging
          shows a clean entry hole with frass at the shoot base, while fire
          blight shows bacterial ooze and darkened, water-soaked tissue.
        </p>
        <p>
          <strong>Second and third generation</strong> larvae shift from shoots
          to developing fruit, boring in near the stem end. Damage from later
          generations causes direct fruit loss. Management should focus on the
          first generation to reduce population pressure for later generations.
        </p>
        <p>
          <strong>Biofix:</strong>{" "}
          {orchard.codling_moth_biofix_date
            ? `Set to ${orchard.codling_moth_biofix_date}. Degree-day tracking uses the codling moth biofix date.`
            : "Not set yet. Set the codling moth biofix date in Settings to enable degree-day tracking."}
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
      />

      {/* DD Accumulation */}
      <SectionCard
        title="Degree Day Accumulation"
        icon={<Target className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox
              label="Cumulative DD"
              value={result.cumulativeDD}
              sub="base 7.2°C"
            />
            <StatBox
              label="Generation"
              value={result.generation}
              sub={
                result.generation === 1
                  ? "First generation"
                  : result.generation === 2
                    ? "Second generation"
                    : "Third generation"
              }
            />
            <StatBox
              label="Status"
              value={
                result.riskLevel === "high"
                  ? "Active"
                  : result.riskLevel === "moderate"
                    ? "Approaching"
                    : "Between windows"
              }
            />
          </div>

          <Separator />

          {/* Threshold timeline */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Generation Threshold Timeline</p>
            {GENERATION_THRESHOLDS.map((t) => {
              const reached = result.cumulativeDD >= t.dd;
              return (
                <div
                  key={`${t.dd}-${t.label}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                    reached
                      ? "bg-green-50 dark:bg-green-950/20"
                      : "bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        reached
                          ? "bg-green-500"
                          : "bg-muted-foreground/30",
                      )}
                    />
                    <span
                      className={cn(
                        reached
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Gen {t.gen}
                    </Badge>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    {t.dd} DD
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Shoot Flagging vs Fire Blight */}
      <SectionCard
        title="Shoot Flagging vs Fire Blight"
        icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className="text-xs text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700"
          >
            Identification Guide
          </Badge>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            First-generation OFM larvae cause shoot tip wilting that closely
            mimics fire blight strikes. Use these diagnostic differences:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                OFM Flagging
              </p>
              <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                <li>&bull; Clean entry hole at shoot base</li>
                <li>&bull; Frass (sawdust-like debris) visible</li>
                <li>&bull; Wilt is sudden, tip curls over</li>
                <li>&bull; No bacterial ooze present</li>
              </ul>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <p className="font-medium text-red-800 dark:text-red-200">
                Fire Blight Strike
              </p>
              <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                <li>&bull; No entry hole &mdash; infection is internal</li>
                <li>&bull; Bacterial ooze droplets on bark</li>
                <li>&bull; Darkened, water-soaked tissue</li>
                <li>&bull; &ldquo;Shepherd&rsquo;s crook&rdquo; bend at tip</li>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Scouting & Economic Threshold */}
      <SectionCard
        title="Scouting Protocol"
        icon={<Search className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">What to Look For</p>
            <p className="mt-1 text-muted-foreground">
              {result.scoutingProtocol}
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Economic Threshold</p>
            <p className="mt-1 text-muted-foreground">
              {result.economicThreshold}
            </p>
          </div>
          <ProductList products={result.productSuggestions} />
        </div>
      </SectionCard>

      <ImageGallery slug="oriental-fruit-moth" />
      <ScoutingGuideSection slug="oriental-fruit-moth" />
      <ProductEfficacyTable slug="oriental-fruit-moth" />
      <CoincidenceAlerts slug="oriental-fruit-moth" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="oriental-fruit-moth" />
    </div>
  );
}
