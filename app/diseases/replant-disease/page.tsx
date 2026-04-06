import { TreePine, AlertTriangle, ClipboardList } from "lucide-react";
import { getOrchard } from "@/lib/db";
import { evaluateReplantDisease } from "@/lib/models/replant-disease";
import {
  DetailHeader,
  RiskScoreCard,
  AboutCard,
  StatBox,
  SectionCard,
  ConditionDot,
} from "@/components/models/model-detail-layout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScoutingGuideSection } from "@/components/models/scouting-guide-section"
import { ProductEfficacyTable } from "@/components/models/product-efficacy-table"
import { CoincidenceAlerts } from "@/components/models/coincidence-alerts"
import { ScoutingObservationButton } from "@/components/models/scouting-observation-button"
import { ImageGallery } from "@/components/models/image-gallery"

export const metadata = {
  title: "Replant Disease Detail | OrchardGuard",
  description:
    "Apple replant disease advisory with management recommendations for replant sites.",
};

export const dynamic = "force-dynamic";

export default function ReplantDiseasePage() {
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

  const result = evaluateReplantDisease(false);

  const accentColor =
    result.riskLevel === "high"
      ? "red"
      : result.riskLevel === "moderate"
        ? "amber"
        : "green";

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader
        icon={<TreePine className="h-8 w-8 text-grove-700 dark:text-grove-400" />}
        title="Apple Replant Disease"
        riskLevel={result.riskLevel}
        subtitle={`Replant disease advisory — ${orchard.name}`}
      />

      {/* About Replant Disease */}
      <AboutCard title="Apple Replant Disease">
        <p>
          Apple replant disease (ARD) is a complex syndrome that suppresses growth
          and yield when new apple trees are planted into soil previously occupied
          by apple or closely related species (pear, cherry, quince). The disease
          is not caused by a single pathogen but by a consortium of soil organisms
          including <em>Cylindrocarpon</em>, <em>Rhizoctonia</em>,{" "}
          <em>Pythium</em>, <em>Phytophthora</em>, and plant-parasitic nematodes
          (<em>Pratylenchus penetrans</em>).
        </p>
        <p>
          <strong>Symptoms are subtle but devastating.</strong> Newly planted trees
          in replant soil show stunted growth, shortened internodes, small pale
          leaves, and poor root development. Trees may survive but never reach
          productive capacity, leading to years of lost revenue. The effect is most
          severe in the first 2&ndash;3 years after planting.
        </p>
        <p>
          <strong>Soil fumigation</strong> with products like chloropicrin or
          metam sodium before planting remains the most effective treatment,
          typically doubling tree growth in the first years. Biofumigation using
          Brassica cover crops (mustard, rapeseed) incorporated as green manure
          offers a partial organic alternative. Some growers have success with
          pre-plant compost applications to shift soil microbiome balance.
        </p>
        <p>
          <strong>Rootstock strategy</strong> is increasingly important. Geneva
          rootstocks (G.41, G.935, G.210) show better tolerance to replant soils
          than M.9 or M.26. Combining tolerant rootstocks with soil treatment
          provides the best outcomes. Soil testing for pathogen load before
          planting helps quantify risk and justify treatment costs.
        </p>
      </AboutCard>

      {/* Risk Score */}
      <RiskScoreCard
        score={result.riskScore}
        riskLevel={result.riskLevel}
        recommendation={result.recommendation}
        accentColor={accentColor}
      />

      {/* Replant Site Status */}
      <SectionCard
        title="Replant Site Status"
        icon={<TreePine className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatBox
            label="Replant Site"
            value={result.isReplantSite ? "Yes" : "No"}
            sub={
              result.isReplantSite
                ? "Previously in apple/stone fruit"
                : "Not flagged as replant"
            }
          />
          <StatBox
            label="Risk Level"
            value={result.riskLevel}
            sub="Based on site classification"
          />
        </div>
      </SectionCard>

      {/* Condition Status */}
      <SectionCard title="Site Assessment">
        <div className="space-y-3">
          <ConditionDot
            met={result.isReplantSite}
            label="Site previously in apple or related species"
          />
          <ConditionDot
            met={false}
            label="Pre-plant soil fumigation completed"
          />
          <ConditionDot
            met={false}
            label="Tolerant rootstock selected (G.41, G.935, G.210)"
          />
        </div>
      </SectionCard>

      {/* Management Recommendations */}
      <SectionCard
        title="Management Recommendations"
        icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-bark-900 dark:text-bark-100">
              Pre-Plant Soil Treatment
            </p>
            <p className="mt-1 text-sm text-bark-600">
              Fumigate with chloropicrin or metam sodium at least 4&ndash;6 weeks
              before planting. Alternatively, grow a Brassica cover crop
              (mustard, rapeseed) and incorporate as green manure for
              biofumigation.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-bark-900 dark:text-bark-100">
              Rootstock Selection
            </p>
            <p className="mt-1 text-sm text-bark-600">
              Choose Geneva rootstocks (G.41, G.935, G.210) for replant sites.
              Avoid M.9 and M.26 where replant disease history is known. Combine
              tolerant rootstocks with soil treatment for best results.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-bark-900 dark:text-bark-100">
              Establishment Support
            </p>
            <p className="mt-1 text-sm text-bark-600">
              Apply mycorrhizal inoculants at planting to support root
              colonization. Use fertigation in the first year to supplement
              nutrient uptake. Monitor tree growth closely and compare to
              non-replant blocks.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Current Assessment">
        <p className="text-sm text-bark-600">{result.details}</p>
      </SectionCard>

      <ImageGallery slug="replant-disease" />
      <ScoutingGuideSection slug="replant-disease" />
      <ProductEfficacyTable slug="replant-disease" />
      <CoincidenceAlerts slug="replant-disease" riskLevel={result.riskLevel} />
      <ScoutingObservationButton slug="replant-disease" />
    </div>
  );
}
