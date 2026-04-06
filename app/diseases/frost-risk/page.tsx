import { Snowflake, ShieldAlert, Thermometer } from "lucide-react";
import { getOrchard, getWeatherRange } from "@/lib/db";
import { evaluateFrostRisk } from "@/lib/models/frost-risk";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
} from "@/components/models/model-detail-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Frost Risk Detail | OrchardGuard",
  description:
    "Frost damage risk assessment using Michigan State bud stage kill thresholds.",
};

export const dynamic = "force-dynamic";

const BUD_STAGE_THRESHOLDS: Record<
  string,
  { kill10: number; kill90: number; label: string }
> = {
  dormant: { kill10: -17, kill90: -25, label: "Dormant" },
  "silver-tip": { kill10: -12, kill90: -17, label: "Silver Tip" },
  "green-tip": { kill10: -8, kill90: -12, label: "Green Tip" },
  "tight-cluster": { kill10: -5, kill90: -8, label: "Tight Cluster" },
  pink: { kill10: -3, kill90: -5, label: "Pink" },
  bloom: { kill10: -2, kill90: -3, label: "Bloom" },
  "petal-fall": { kill10: -1, kill90: -2, label: "Petal Fall" },
  "fruit-set": { kill10: -1, kill90: -2, label: "Fruit Set" },
};

export default function FrostRiskPage() {
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
  const hourlyStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hourlyData = getWeatherRange("default", hourlyStart, hourlyEnd);
  const hourlyMapped = hourlyData.map((h) => ({
    timestamp: h.timestamp,
    temp_c: h.temp_c ?? 0,
    humidity_pct: h.humidity_pct ?? 0,
    precip_mm: h.precip_mm ?? 0,
  }));

  const result = evaluateFrostRisk(hourlyMapped, orchard.bloom_stage);

  const currentStageInfo = BUD_STAGE_THRESHOLDS[orchard.bloom_stage] ?? BUD_STAGE_THRESHOLDS.dormant;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Snowflake className="h-8 w-8 text-blue-500" />}
        title="Frost Risk"
        riskLevel={result.riskLevel}
        subtitle={`Michigan State bud stage threshold analysis \u2014 ${orchard.name}, stage: ${orchard.bloom_stage}`}
      />

      {/* About */}
      <AboutCard title="Frost Risk">
        <p>
          Frost injury is one of the most damaging abiotic threats to Ontario
          apple orchards. As buds advance through their phenological stages from
          dormant through fruit-set, their cold hardiness decreases dramatically.
          A dormant bud can survive temperatures below &minus;17&deg;C, but an
          open blossom can be killed at just &minus;2&deg;C.
        </p>
        <p>
          <strong>Why bloom stage matters:</strong> The kill temperature
          thresholds are determined entirely by the current bud stage. As tissue
          develops and cells become more hydrated, ice crystal formation causes
          more severe damage. This is why a late spring frost during bloom can
          devastate a crop that survived much colder temperatures in January.
        </p>
        <p>
          <strong>The 10% and 90% kill thresholds</strong> represent the
          temperatures at which 10% and 90% of buds are killed, respectively,
          based on Michigan State University controlled-freeze research. The 10%
          threshold is the early-warning mark &mdash; at this temperature, you
          begin to lose fruit buds. By the 90% threshold, the crop is
          essentially destroyed.
        </p>
        <p>
          In Ontario&rsquo;s climate, the most dangerous frost events typically
          occur during late April and May when buds have advanced to tight-cluster
          or pink but temperatures can still plunge below &minus;5&deg;C on clear,
          calm radiation frost nights. Wind machines, overhead irrigation, and
          heaters can all raise orchard temperatures by 1&ndash;3&deg;C, which is
          often the margin between a full crop and a total loss.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={
          result.riskLevel === "critical" || result.riskLevel === "high"
            ? "red"
            : result.riskLevel === "moderate"
              ? "amber"
              : "green"
        }
      />

      {/* Current Stage Thresholds */}
      <SectionCard
        title="Current Stage Thresholds"
        icon={<Thermometer className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge variant="outline" className="capitalize">
            {orchard.bloom_stage.replace("-", " ")}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatBox
              label="Forecast Low"
              value={`${result.forecastLow.toFixed(1)}\u00b0C`}
              sub="Next 48 hours"
            />
            <StatBox
              label="10% Kill Threshold"
              value={`${result.killThreshold10}\u00b0C`}
              sub="First bud damage begins"
            />
            <StatBox
              label="Safety Margin"
              value={`${result.marginC.toFixed(1)}\u00b0C`}
              sub={result.marginC > 0 ? "Above damage threshold" : "BELOW threshold"}
            />
            <StatBox
              label="Hours Below Threshold"
              value={result.hoursBelow}
              sub={`Hours \u2264 ${result.killThreshold10}\u00b0C`}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              At {currentStageInfo.label.toLowerCase()} stage, 10% bud kill
              occurs at {currentStageInfo.kill10}&deg;C and 90% bud kill at{" "}
              {currentStageInfo.kill90}&deg;C. Your forecast low is{" "}
              {result.forecastLow.toFixed(1)}&deg;C, giving a safety margin
              of {result.marginC.toFixed(1)}&deg;C.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Bud Stage Kill Threshold Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <Snowflake className="h-5 w-5 text-muted-foreground" />
            Bud Stage Kill Threshold Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 text-left font-medium">Bud Stage</th>
                  <th className="py-2 text-right font-medium">
                    10% Kill (&deg;C)
                  </th>
                  <th className="py-2 text-right font-medium">
                    90% Kill (&deg;C)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(BUD_STAGE_THRESHOLDS).map(([stage, info]) => (
                  <tr
                    key={stage}
                    className={cn(
                      "border-b last:border-0",
                      stage === orchard.bloom_stage &&
                        "bg-blue-50 dark:bg-blue-950/30 font-medium"
                    )}
                  >
                    <td className="py-2 text-[13px]">
                      {info.label}
                      {stage === orchard.bloom_stage && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] px-1.5 py-0">
                          Current
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-right font-data text-[13px]">
                      {info.kill10}&deg;C
                    </td>
                    <td className="py-2 text-right font-data text-[13px]">
                      {info.kill90}&deg;C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Source: Michigan State University controlled-freeze studies. Thresholds
            represent approximate temperatures for apple bud kill at each
            phenological stage.
          </p>
        </CardContent>
      </Card>

      {/* Protection Options */}
      <SectionCard
        title="Frost Protection Options"
        icon={<ShieldAlert className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4 text-sm text-bark-600">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="font-semibold text-foreground">
                Overhead Irrigation
              </p>
              <p className="mt-1 text-[13px]">
                Sprinklers release latent heat as water freezes on buds, keeping
                tissue temperature near 0&deg;C. Most effective protection method
                but requires sustained application through the entire frost
                event. Typically provides 2&ndash;3&deg;C of protection.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-semibold text-foreground">Wind Machines</p>
              <p className="mt-1 text-[13px]">
                Mix warm air from the temperature inversion layer above the
                orchard down to bud height. Effective during radiation frosts
                (clear, calm nights) but not during advective frosts (cold air
                mass). Provides 1&ndash;2&deg;C of protection.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-semibold text-foreground">
                Smudge Pots / Heaters
              </p>
              <p className="mt-1 text-[13px]">
                Direct heat sources placed throughout the orchard. Less common
                in modern orchards due to cost and air quality concerns, but
                effective as supplemental protection. Can provide 1&ndash;2&deg;C
                of warming.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <ImageGallery slug="frost-risk" />
      <ScoutingGuideSection slug="frost-risk" />
      <ProductEfficacyTable slug="frost-risk" />
      <CoincidenceAlerts slug="frost-risk" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="frost-risk" />
    </div>
  );
}
