import { Snowflake, Eye } from "lucide-react";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateFrostRing } from "@/lib/models/frost-ring";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Frost Ring Detail | OrchardGuard",
  description:
    "Post-bloom frost ring risk assessment tracking frost events during the critical fruit development window.",
};

export const dynamic = "force-dynamic";

export default function FrostRingPage() {
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
  // Fetch daily data spanning the post-bloom window (60 days back to cover bloom period)
  const dailyStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateFrostRing(dailyMapped, orchard.petal_fall_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Snowflake className="h-8 w-8 text-sky-500" />}
        title="Frost Ring"
        riskLevel={result.riskLevel}
        subtitle={`Post-bloom frost damage tracking \u2014 ${orchard.name}${orchard.petal_fall_date ? `, petal fall: ${orchard.petal_fall_date}` : ""}`}
      />

      {/* About */}
      <AboutCard title="Frost Ring">
        <p>
          Frost ring is a <strong>cosmetic fruit defect</strong> &mdash; not a
          disease &mdash; caused by frost events that occur after bloom when
          young fruitlets are developing. Unlike spring frost kill which destroys
          blossoms entirely, frost ring damages the developing fruit surface
          without killing it, leaving a characteristic russeted band or ring
          around the fruit at harvest.
        </p>
        <p>
          <strong>How it forms:</strong> When temperatures drop below 0&deg;C
          during the first 30 days after bloom, ice crystals form in the outer
          cells of developing fruitlets. The damaged cells die but the fruit
          continues to grow. As the fruit expands, the dead tissue forms a
          corky, russeted band &mdash; the &ldquo;frost ring.&rdquo; More severe
          frosts (below &minus;2&deg;C) can also cause misshapen or lopsided
          fruit.
        </p>
        <p>
          <strong>Distinct from frost kill:</strong> Frost kill occurs during
          bloom and kills the blossom or fruitlet entirely (it drops off the
          tree). Frost ring occurs <em>after</em> bloom on fruit that survives
          the frost but carries cosmetic damage. Both are tracked by OrchardGuard
          but have different risk windows and thresholds.
        </p>
        <p>
          In Ontario, the most common frost ring events occur during late May
          when overnight temperatures can still dip below freezing after petal
          fall. There is no treatment for frost ring once it occurs. The fruit is
          safe to eat but is typically downgraded to processing grade.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={
          result.riskLevel === "high"
            ? "red"
            : result.riskLevel === "moderate"
              ? "amber"
              : "green"
        }
      />

      {/* Post-Bloom Frost Events */}
      <SectionCard
        title="Post-Bloom Frost Events"
        icon={<Snowflake className="h-5 w-5 text-muted-foreground" />}
        badge={
          orchard.petal_fall_date ? (
            <Badge
              variant="outline"
              className={
                result.postBloomFrostEvents > 0
                  ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
                  : "border-muted-foreground/30 text-muted-foreground"
              }
            >
              {result.postBloomFrostEvents > 0
                ? `${result.postBloomFrostEvents} event(s)`
                : "None detected"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Petal fall date not set
            </Badge>
          )
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatBox
              label="Post-Bloom Frost Events"
              value={result.postBloomFrostEvents}
              sub="Days with min temp < 0\u00b0C after bloom"
            />
            <StatBox
              label="Worst Frost Temperature"
              value={
                result.worstFrostTemp !== null
                  ? `${result.worstFrostTemp.toFixed(1)}\u00b0C`
                  : "\u2014"
              }
              sub={
                result.worstFrostTemp !== null
                  ? result.worstFrostTemp < -2
                    ? "Severe \u2014 may cause misshapen fruit"
                    : "Mild \u2014 may cause russeting"
                  : "No frost events recorded"
              }
            />
          </div>
          {!orchard.petal_fall_date && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Petal Fall Date Required
              </p>
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                Set the petal fall date in orchard settings to enable frost ring
                risk tracking. The model monitors the 30-day window after bloom
                start (estimated as petal fall minus 7 days).
              </p>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <p>
              The critical window for frost ring development is the first 30 days
              after bloom start. Frost events during this period damage the
              surface cells of developing fruitlets, causing russeted bands
              visible at harvest.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* What to Watch For */}
      <SectionCard
        title="What to Watch For"
        icon={<Eye className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3 text-sm text-bark-600">
          {result.postBloomFrostEvents > 0 ? (
            <>
              <p>
                With {result.postBloomFrostEvents} post-bloom frost event(s)
                recorded this season, monitor developing fruit for these
                symptoms as they size:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="font-semibold text-foreground text-[13px]">
                    Russeted Ring
                  </p>
                  <p className="mt-0.5 text-[12px]">
                    A brown, corky band encircling the fruit, usually most
                    visible at the calyx end. Caused by surface cell death during
                    mild frost (&minus;1 to 0&deg;C).
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-semibold text-foreground text-[13px]">
                    Misshapen Fruit
                  </p>
                  <p className="mt-0.5 text-[12px]">
                    Lopsided or flattened fruit caused by uneven cell death
                    during more severe frost (below &minus;2&deg;C). One side of
                    the fruitlet freezes while the other survives.
                  </p>
                </div>
              </div>
              <p>
                Consider thinning damaged fruit early to redirect the tree&rsquo;s
                energy to undamaged fruit. Frost ring fruit is safe to eat but
                is typically downgraded to processing grade.
              </p>
            </>
          ) : (
            <p>
              No post-bloom frost events detected this season. Continue
              monitoring forecasts during the first 30 days after bloom, as late
              frost can still cause cosmetic fruit damage.
            </p>
          )}
        </div>
      </SectionCard>

      <ImageGallery slug="frost-ring" />
      <ScoutingGuideSection slug="frost-ring" />
      <ProductEfficacyTable slug="frost-ring" />
      <CoincidenceAlerts slug="frost-ring" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="frost-ring" />
    </div>
  );
}
