import { Bug, Target, Search } from "lucide-react";
import { TermTooltip } from "@/components/term-tooltip";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateLeafroller } from "@/lib/models/leafroller";
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
  title: "Leafroller Detail | OrchardGuard",
  description:
    "Detailed oblique-banded leafroller risk assessment using degree-day phenology.",
};

export const dynamic = "force-dynamic";

const EMERGENCE_DD = 700;

const THRESHOLDS = [
  { dd: 200, label: "Overwintering larvae feeding" },
  { dd: 400, label: "Pupation begins" },
  { dd: 600, label: "Approaching summer emergence" },
  { dd: 700, label: "Summer generation adults emerge" },
];

export default function LeafrollerPage() {
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

  const result = evaluateLeafroller(dailyMapped);

  const progressToEmergence =
    result.cumulativeDD > 0
      ? Math.min((result.cumulativeDD / EMERGENCE_DD) * 100, 100)
      : 0;
  const ddRemaining = result.emerged
    ? 0
    : Math.round(EMERGENCE_DD - result.cumulativeDD);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Bug className="h-8 w-8 text-amber-600" />}
        title="Leafroller"
        riskLevel={result.riskLevel}
        subtitle={`Degree-day phenology tracking — ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Oblique-banded Leafroller">
        <p>
          The oblique-banded leafroller (OBLR, <em>Choristoneura rosaceana</em>)
          is a significant pest of apple in Ontario. Larvae roll and web leaves
          together to create shelters, feeding on leaves and fruit surfaces
          inside.
        </p>
        <p>
          <strong>Life cycle:</strong> Overwintering larvae resume feeding in
          spring, pupate, and summer generation adults emerge around 700{" "}
          <TermTooltip term="Degree Days">degree days</TermTooltip> (base
          6&deg;C) from March 1. The summer generation is the primary concern
          because larvae feed on developing fruit, causing surface scarring that
          makes fruit unmarketable.
        </p>
        <p>
          <strong>Timing:</strong> Scout for leaf-rolling damage and egg masses
          once summer adults emerge. Young larvae are most vulnerable to
          insecticide applications &mdash; once inside rolled leaves, they are
          protected from contact sprays.
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
              sub="base 6°C from March 1"
            />
            <StatBox
              label="Emergence"
              value={result.emerged ? "Yes" : "No"}
              sub={
                result.emerged
                  ? "Summer adults emerged"
                  : `${ddRemaining} DD remaining`
              }
            />
            <StatBox
              label="Emergence Target"
              value={`${EMERGENCE_DD}`}
              sub="DD for summer adults"
            />
          </div>

          {/* Progress to emergence */}
          {!result.emerged && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Progress toward emergence ({EMERGENCE_DD} DD)
                </span>
                <span className="text-sm font-bold font-data tabular-nums">
                  {ddRemaining} DD away
                </span>
              </div>
              <Progress
                value={progressToEmergence}
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

      <ImageGallery slug="leafroller" />
      <ScoutingGuideSection slug="leafroller" />
      <ProductEfficacyTable slug="leafroller" />
      <CoincidenceAlerts slug="leafroller" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="leafroller" />
    </div>
  );
}
