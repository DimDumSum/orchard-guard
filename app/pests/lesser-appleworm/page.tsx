import { Bug, Target, Search } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateLesserAppleworm } from "@/lib/models/lesser-appleworm";
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
  title: "Lesser Appleworm Detail | OrchardGuard",
  description:
    "Detailed lesser appleworm risk assessment using degree-day phenology.",
};

export const dynamic = "force-dynamic";

const FIRST_GEN_DD = 80;

const THRESHOLDS = [
  { dd: 80, label: "1st generation egg hatch begins" },
  { dd: 200, label: "1st generation larval feeding" },
  { dd: 400, label: "Pupation / between generations" },
];

export default function LesserApplewormPage() {
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

  const result = evaluateLesserAppleworm(
    dailyMapped,
    orchard.codling_moth_biofix_date,
  );

  const progressToFirstGen =
    result.cumulativeDD > 0
      ? Math.min((result.cumulativeDD / FIRST_GEN_DD) * 100, 100)
      : 0;
  const ddRemaining =
    result.cumulativeDD >= FIRST_GEN_DD
      ? 0
      : Math.round(FIRST_GEN_DD - result.cumulativeDD);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Bug className="h-8 w-8 text-amber-600" />}
        title="Lesser Appleworm"
        riskLevel={result.riskLevel}
        subtitle={`Degree-day phenology tracking — ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Lesser Appleworm">
        <p>
          The lesser appleworm (<em>Grapholita prunivora</em>) is a minor pest
          of apple in Ontario. Larvae make shallow tunnels in fruit, causing
          cosmetic damage but rarely deep entry wounds like codling moth.
        </p>
        <p>
          <strong>Relationship to codling moth:</strong> Lesser appleworm first
          generation emerges roughly two weeks ahead of codling moth. The good
          news is that the codling moth spray program &mdash; which uses the same{" "}
          <TermTooltip term="Degree Days">degree day</TermTooltip> (base
          10&deg;C) tracking from{" "}
          <TermTooltip term="Biofix">biofix</TermTooltip> &mdash; typically
          provides adequate control of lesser appleworm as well. If your codling
          moth spray coverage is in place, lesser appleworm rarely causes
          significant economic damage.
        </p>
        <p>
          <strong>Biofix:</strong>{" "}
          {orchard.codling_moth_biofix_date
            ? `Set to ${orchard.codling_moth_biofix_date}. Uses the codling moth biofix date for tracking.`
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
              sub="base 10°C from biofix"
            />
            <StatBox
              label="1st Gen Active"
              value={result.cumulativeDD >= FIRST_GEN_DD ? "Yes" : "No"}
              sub={
                result.cumulativeDD >= FIRST_GEN_DD
                  ? "Egg hatch has begun"
                  : `${ddRemaining} DD remaining`
              }
            />
            <StatBox
              label="1st Gen Threshold"
              value={`${FIRST_GEN_DD}`}
              sub="DD for egg hatch"
            />
          </div>

          {/* Progress to first gen */}
          {result.cumulativeDD < FIRST_GEN_DD && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Progress toward 1st generation ({FIRST_GEN_DD} DD)
                </span>
                <span className="text-sm font-bold font-data tabular-nums">
                  {ddRemaining} DD away
                </span>
              </div>
              <Progress
                value={progressToFirstGen}
                className="[&_[data-slot=progress-indicator]]:bg-blue-500"
              />
            </div>
          )}

          <Separator />

          {/* Threshold timeline */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Development Timeline</p>
            {THRESHOLDS.map((t) => {
              const reached = result.cumulativeDD >= t.dd;
              return (
                <div
                  key={t.dd}
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

      {/* Codling Moth Relationship */}
      <SectionCard
        title="Codling Moth Program Coverage"
        icon={<Bug className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className="text-xs text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-700"
          >
            Management Note
          </Badge>
        }
      >
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="font-medium text-blue-800 dark:text-blue-200">
            Usually controlled by your codling moth spray program
          </p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            If you are applying insecticides for codling moth at the correct
            degree-day timings, lesser appleworm is typically controlled as a
            bonus. Verify that your first codling moth spray goes on around 250
            DD (peak egg hatch), and lesser appleworm should not be an issue. No
            separate spray program is usually needed.
          </p>
        </div>
      </SectionCard>

      {/* Scouting */}
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
          <ProductList products={result.productSuggestions} />
        </div>
      </SectionCard>

      <ImageGallery slug="lesser-appleworm" />
      <ScoutingGuideSection slug="lesser-appleworm" />
      <ProductEfficacyTable slug="lesser-appleworm" />
      <CoincidenceAlerts slug="lesser-appleworm" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="lesser-appleworm" />
    </div>
  );
}
