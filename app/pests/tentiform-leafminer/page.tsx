import { Bug, Target, Search } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateTentiformLeafminer } from "@/lib/models/tentiform-leafminer";
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
  title: "Tentiform Leafminer Detail | OrchardGuard",
  description:
    "Detailed spotted tentiform leafminer risk assessment using degree-day phenology.",
};

export const dynamic = "force-dynamic";

const STAGE_THRESHOLDS = [
  { dd: 200, label: "1st generation adults", gen: 1 },
  { dd: 350, label: "1st generation sap-feeding larvae", gen: 1 },
  { dd: 650, label: "2nd generation adults", gen: 2 },
  { dd: 850, label: "2nd generation sap-feeding larvae", gen: 2 },
  { dd: 1150, label: "3rd generation adults", gen: 3 },
];

export default function TentiformLeafminerPage() {
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

  const result = evaluateTentiformLeafminer(dailyMapped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Bug className="h-8 w-8 text-amber-600" />}
        title="Spotted Tentiform Leafminer"
        riskLevel={result.riskLevel}
        subtitle={`Degree-day phenology tracking — ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Spotted Tentiform Leafminer">
        <p>
          The spotted tentiform leafminer (<em>Phyllonorycter blancardella</em>)
          creates blister-like mines on the underside of apple leaves. It
          completes three generations per season, tracked using{" "}
          <TermTooltip term="Degree Days">degree days</TermTooltip> (base
          6.1&deg;C) from March 1.
        </p>
        <p>
          <strong>Sap-feeding larvae</strong> of the second generation (~850 DD)
          cause the most economic damage. Their feeding reduces leaf
          photosynthesis and can weaken trees when mine counts are high.
        </p>
        <p>
          <strong>Natural control:</strong> Tiny parasitoid wasps are among the
          most effective natural enemies of tentiform leafminer. These wasps can
          parasitize a high percentage of mines, often keeping populations below
          damaging levels. Avoid broad-spectrum insecticide applications early in
          the season &mdash; these kill the parasitoids and can cause leafminer
          populations to flare.
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
              sub="base 6.1°C from March 1"
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
              label="Current Stage"
              value={result.currentStage}
            />
          </div>

          <Separator />

          {/* Threshold timeline */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Generation Timeline</p>
            {STAGE_THRESHOLDS.map((t) => {
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

      {/* Mine Counting Guide & Scouting */}
      <SectionCard
        title="Scouting Protocol"
        icon={<Search className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Mine Counting Guide</p>
            <p className="mt-1 text-muted-foreground">
              {result.scoutingProtocol} Flip leaves over to see the underside
              where blister-like mines form. Count the number of sap-feeding
              mines (puffy, tentiform-shaped) per leaf.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Economic Threshold</p>
            <p className="mt-1 text-muted-foreground">
              {result.economicThreshold}
            </p>
          </div>
          <Separator />
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-800 dark:text-green-200">
              Parasitoid Assessment
            </p>
            <p className="mt-1 text-green-700 dark:text-green-300">
              Before spraying, check for parasitoid activity by looking for
              emergence holes in old mines. If &gt;50% of mines show parasitoid
              exit holes, natural control may be keeping populations below
              threshold &mdash; avoid spraying to preserve these beneficial
              insects.
            </p>
          </div>
          <ProductList products={result.productSuggestions} />
        </div>
      </SectionCard>

      <ImageGallery slug="tentiform-leafminer" />
      <ScoutingGuideSection slug="tentiform-leafminer" />
      <ProductEfficacyTable slug="tentiform-leafminer" />
      <CoincidenceAlerts slug="tentiform-leafminer" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="tentiform-leafminer" />
    </div>
  );
}
