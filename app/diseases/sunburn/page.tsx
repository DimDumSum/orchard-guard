import { Thermometer, Sun, Scissors } from "lucide-react";
import { getOrchard, getDailyWeather } from "@/lib/db";
import { evaluateSunburn } from "@/lib/models/sunburn";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ProductList,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Sunburn Detail | OrchardGuard",
  description:
    "Fruit sunburn risk assessment tracking high temperature exposure and thinning timing.",
};

export const dynamic = "force-dynamic";

export default function SunburnPage() {
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
  // Fetch daily data covering June through October season window
  const dailyStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dailyEnd = now.toISOString().slice(0, 10);
  const dailyData = getDailyWeather("default", dailyStart, dailyEnd);
  const dailyMapped = dailyData.map((d) => ({
    date: d.date,
    max_temp: d.max_temp ?? 0,
    min_temp: d.min_temp ?? 0,
  }));

  const result = evaluateSunburn(dailyMapped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<Thermometer className="h-8 w-8 text-orange-500" />}
        title="Sunburn"
        riskLevel={result.riskLevel}
        subtitle={`Fruit sunburn risk from high temperature exposure \u2014 ${orchard.name}`}
      />

      {/* About */}
      <AboutCard title="Fruit Sunburn">
        <p>
          Fruit sunburn is a heat-related disorder that damages the skin and
          flesh of apples exposed to intense solar radiation. It occurs primarily
          from June through October when air temperatures exceed 32&deg;C and
          fruit surface temperatures can reach 45&ndash;52&deg;C on sun-exposed
          sides. There are three distinct types of sunburn, each with a different
          mechanism:
        </p>
        <p>
          <strong>Sunburn necrosis</strong> occurs when fruit surface temperature
          exceeds approximately 52&deg;C for 10 minutes or more. At this
          temperature, cell membranes collapse and the tissue dies, producing a
          dark brown or black scald on the exposed side. This is the most severe
          form and cannot be reversed.
        </p>
        <p>
          <strong>Sunburn browning</strong> is the most common type. It occurs at
          fruit surface temperatures of 46&ndash;49&deg;C and produces a yellow
          or bronze discoloration on the sun-exposed side. Unlike necrosis, the
          cells remain alive but are damaged. The browning is caused by
          degradation of the waxy cuticle and underlying pigments.
        </p>
        <p>
          <strong>Photooxidative sunburn</strong> occurs when shaded fruit is
          suddenly exposed to direct sunlight &mdash; typically after thinning or
          pruning. Even at moderate temperatures (30&ndash;35&deg;C), the abrupt
          increase in UV radiation overwhelms the fruit&rsquo;s photoprotective
          systems, causing bleaching and discoloration. This is why thinning
          timing is critical: thinning during or just before a heat wave creates
          the highest sunburn risk.
        </p>
        <p>
          In Ontario, sunburn is most common in July and August heat events.
          Kaolin clay (Surround WP) is the primary protectant &mdash; the white
          particle film reflects sunlight, reducing fruit surface temperature by
          5&ndash;8&deg;C.
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

      {/* High Temperature Tracking */}
      <SectionCard
        title="High Temperature Exposure"
        icon={<Sun className="h-5 w-5 text-muted-foreground" />}
        badge={
          <Badge
            variant="outline"
            className={
              result.daysAbove32 > 5
                ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
                : result.daysAbove32 >= 2
                  ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300"
                  : "border-muted-foreground/30 text-muted-foreground"
            }
          >
            {result.daysAbove32 > 5
              ? "Significant exposure"
              : result.daysAbove32 >= 2
                ? "Moderate exposure"
                : "Minimal"}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
            <StatBox
              label="Days Above 32\u00b0C"
              value={result.daysAbove32}
              sub="June through October season total"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Fruit sunburn risk increases significantly after 2 days above
              32&deg;C and becomes high after 5 or more days. Fruit surface
              temperatures can be 15&ndash;20&deg;C above ambient air
              temperature on sun-exposed sides, meaning a 32&deg;C day can
              produce fruit skin temperatures near 50&deg;C.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Thinning Timing Advisory */}
      <SectionCard
        title="Thinning Timing Advisory"
        icon={<Scissors className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-3 text-sm text-bark-600">
          <p>
            Thinning and summer pruning are the most common triggers for
            photooxidative sunburn. When previously shaded fruit is suddenly
            exposed to direct sunlight, even moderate temperatures can cause
            bleaching and discoloration within 4&ndash;5 days.
          </p>
          {result.daysAbove32 >= 2 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <p className="font-medium text-red-800 dark:text-red-200">
                Elevated Sunburn Risk After Thinning
              </p>
              <p className="mt-1 text-red-700 dark:text-red-300">
                With {result.daysAbove32} hot days already this season, avoid
                thinning or pruning during mid-day heat. If thinning is needed,
                do it on cloudy days or apply kaolin clay (Surround WP) to newly
                exposed fruit immediately after thinning. Wait at least 5 days
                after thinning before a forecasted heat event.
              </p>
            </div>
          ) : (
            <p>
              Low heat exposure so far. Standard thinning timing is appropriate,
              but always check the 5&ndash;7 day forecast before thinning to
              avoid exposing fruit just before a heat event.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                Best Practices
              </p>
              <ul className="mt-1 space-y-1 text-[12px] list-disc list-inside">
                <li>Thin on cloudy or cool days when possible</li>
                <li>
                  Check the 5-day forecast before thinning &mdash; avoid
                  thinning before heat events
                </li>
                <li>
                  Apply kaolin clay to recently thinned blocks before the next
                  hot day
                </li>
                <li>Avoid mid-day pruning during summer heat</li>
              </ul>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold text-foreground text-[13px]">
                Kaolin Clay (Surround WP)
              </p>
              <p className="mt-1 text-[12px]">
                White particle film that reflects sunlight, reducing fruit
                surface temperature by 5&ndash;8&deg;C. Apply before heat events
                and reapply after rain. Safe for organic production. Most
                effective when applied to the south and southwest sides of the
                canopy.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Product Suggestions */}
      {result.productSuggestions.length > 0 && (
        <SectionCard title="Product Suggestions">
          <ProductList products={result.productSuggestions} />
        </SectionCard>
      )}

      <ImageGallery slug="sunburn" />
      <ScoutingGuideSection slug="sunburn" />
      <ProductEfficacyTable slug="sunburn" />
      <CoincidenceAlerts slug="sunburn" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="sunburn" />
    </div>
  );
}
