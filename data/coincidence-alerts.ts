// ---------------------------------------------------------------------------
// Coincidence Alerts — Cross-disease/pest connections displayed when multiple
// risks are elevated simultaneously. Helps growers optimize spray timing by
// combining targets into fewer applications.
// ---------------------------------------------------------------------------

export interface CoincidenceRule {
  triggers: { slug: string; minLevel: "moderate" | "high" }[]
  title: string
  body: string
  smartSpray: string
}

export const COINCIDENCE_RULES: CoincidenceRule[] = [
  // ── 1. Apple Scab + Rain forecast ──
  {
    triggers: [{ slug: "apple-scab", minLevel: "moderate" }],
    title: "Scab Rain Event \u2014 Multi-Target Opportunity",
    body: "Same rain event could also trigger cedar apple rust infection (if spores available), black rot infection (if temps >15\u00B0C), and powdery mildew suppression (rain inhibits mildew).",
    smartSpray:
      "Merivon before rain covers scab + mildew + sooty blotch in one application. Add Captan if you want to save Merivon uses for later.",
  },

  // ── 2. Fire Blight + Bloom stage ──
  {
    triggers: [{ slug: "fire-blight", minLevel: "moderate" }],
    title: "Fire Blight Active During Bloom",
    body: "Fire blight risk is elevated with open flowers. Pollinator protection is critical \u2014 no insecticides during bloom. Frost risk at bloom stage has lowest damage thresholds.",
    smartSpray:
      "Have streptomycin and Blossom Protect ready. Plan spray timing around bee activity (spray evening/early AM).",
  },

  // ── 3. Codling Moth + Apple Maggot ──
  {
    triggers: [
      { slug: "codling-moth", minLevel: "moderate" },
      { slug: "apple-maggot", minLevel: "moderate" },
    ],
    title: "Codling Moth + Apple Maggot \u2014 Shared Control",
    body: "Both pests controlled by same insecticides (Imidan, Assail). Time first cover spray to coincide with codling moth egg hatch and you'll also get early apple maggot control.",
    smartSpray:
      "One well-timed spray at 100 DD from CM biofix covers both pests.",
  },

  // ── 4. European Red Mite + Two-Spotted Spider Mite ──
  {
    triggers: [
      { slug: "european-red-mite", minLevel: "moderate" },
      { slug: "two-spotted-spider-mite", minLevel: "moderate" },
    ],
    title: "Dual Mite Pressure",
    body: "Both mite species are building. Check predatory mite populations before spraying \u2014 broad-spectrum miticides will kill predators and cause rebound outbreaks.",
    smartSpray:
      "If predator:prey ratio >1:10, hold off and reassess in 5 days. If spraying, use selective miticides (Envidor, Acramite) that spare predators.",
  },

  // ── 5. Apple Scab + Powdery Mildew ──
  {
    triggers: [
      { slug: "apple-scab", minLevel: "moderate" },
      { slug: "powdery-mildew", minLevel: "moderate" },
    ],
    title: "Scab + Mildew \u2014 Dual Fungicide Coverage",
    body: "Both diseases active. Many SI fungicides (FRAC 3, 3+9) and strobilurins (FRAC 11, 7+11) cover both targets. Plan applications for dual coverage to reduce total sprays.",
    smartSpray:
      "Inspire Super or Merivon provides excellent dual coverage. Tank-mix with Captan for additional scab protection and resistance management.",
  },

  // ── 6. Plum Curculio + European Apple Sawfly ──
  {
    triggers: [
      { slug: "plum-curculio", minLevel: "moderate" },
      { slug: "european-apple-sawfly", minLevel: "moderate" },
    ],
    title: "PC + Sawfly \u2014 Petal Fall Double Target",
    body: "Both pests are active around petal fall. A well-timed petal-fall insecticide application can control both.",
    smartSpray:
      "Imidan or Assail at petal fall covers both PC and sawfly. Focus on border rows for maximum PC impact.",
  },

  // ── 7. Rosy Apple Aphid + Tarnished Plant Bug ──
  {
    triggers: [
      { slug: "rosy-apple-aphid", minLevel: "moderate" },
      { slug: "tarnished-plant-bug", minLevel: "moderate" },
    ],
    title: "Aphid + Plant Bug \u2014 Pre-Bloom Pressure",
    body: "Both pests can cause fruit deformation during the pink-bloom window. Assail provides dual coverage.",
    smartSpray:
      "Assail at pink covers both targets. Avoid broad-spectrum OPs that disrupt predators.",
  },

  // ── 8. San Jose Scale + European Fruit Scale ──
  {
    triggers: [
      { slug: "san-jose-scale", minLevel: "moderate" },
      { slug: "european-fruit-scale", minLevel: "moderate" },
    ],
    title: "Dual Scale Pressure",
    body: "Both scale insects respond to dormant oil applications. Crawler emergence timing differs \u2014 monitor with tape wraps.",
    smartSpray:
      "Dormant oil at green tip is the foundation. Follow up with Movento at crawler emergence if populations warrant.",
  },

  // ── 9. Black Rot + Bitter Rot (Summer Rot Complex) ──
  {
    triggers: [
      { slug: "black-rot", minLevel: "moderate" },
      { slug: "bitter-rot", minLevel: "moderate" },
    ],
    title: "Summer Rot Complex",
    body: "Multiple rot pathogens are active. Captan provides broad protection against all three. Remove mummified fruit and prune dead wood to reduce inoculum.",
    smartSpray:
      "Captan in every summer cover spray. Add Merivon or Pristine for heavy pressure orchards.",
  },

  // ── 10. Frost Risk — Secondary Infection Risk ──
  {
    triggers: [{ slug: "frost-risk", minLevel: "moderate" }],
    title: "Frost Damage \u2014 Secondary Infection Risk",
    body: "Frost-damaged tissue is highly susceptible to secondary infections, especially fire blight and Nectria canker. Damaged blossoms and shoots provide entry points for bacteria and fungi.",
    smartSpray:
      "Apply copper or Blossom Protect after a frost event to prevent secondary infection of damaged tissue.",
  },

  // ── 11. Leafroller + Tentiform Leafminer ──
  {
    triggers: [
      { slug: "leafroller", minLevel: "moderate" },
      { slug: "tentiform-leafminer", minLevel: "moderate" },
    ],
    title: "Leafroller + Leafminer \u2014 Shared Lep Timing",
    body: "Both Lepidoptera pests overlap in the early cover period. Delegate and Altacor provide excellent dual control with minimal impact on beneficial insects.",
    smartSpray:
      "Delegate at first cover targets both leafroller larvae and leafminer tissue-feeding stage. Avoid broad-spectrum pyrethroids that flare mites.",
  },

  // ── 12. Woolly Apple Aphid + Dogwood Borer ──
  {
    triggers: [
      { slug: "woolly-apple-aphid", minLevel: "moderate" },
      { slug: "dogwood-borer", minLevel: "moderate" },
    ],
    title: "WAA + Dogwood Borer \u2014 Rootstock Stress",
    body: "Woolly apple aphid infestations on rootstock burr knots create wounds that attract dogwood borer. Managing WAA reduces borer pressure. M.9 and M.26 rootstocks are especially vulnerable.",
    smartSpray:
      "Movento drench for WAA also reduces borer entry points. Diazinon trunk spray at dogwood borer flight covers both. Monitor with pheromone traps.",
  },

  // ── 13. Sooty Blotch + Flyspeck Season ──
  {
    triggers: [{ slug: "sooty-blotch", minLevel: "moderate" }],
    title: "Sooty Blotch + Flyspeck \u2014 Cosmetic Damage Window",
    body: "Both fungi share similar environmental triggers (high humidity, prolonged wetness). Approaching the 270 cumulative RH-hour threshold. Once established, these blemishes cannot be removed.",
    smartSpray:
      "Captan or Topsin-M before the next rain event. If >250 RH-hours accumulated, spray immediately \u2014 don't wait for the rain.",
  },

  // ── 14. Voles + Deer \u2014 Winter Preparation ──
  {
    triggers: [
      { slug: "voles", minLevel: "moderate" },
      { slug: "deer", minLevel: "moderate" },
    ],
    title: "Vole + Deer \u2014 Winter Trunk Damage Risk",
    body: "Both pests cause bark damage to trunks and lower scaffolds during winter. Voles girdle under snow cover while deer browse above. Young trees are most vulnerable.",
    smartSpray:
      "Install tree guards before snowfall. Mow orchard floor tight to reduce vole habitat. Apply repellents (Plantskydd) to deter deer. Consider rodenticide bait stations along tree rows.",
  },

  // ── 15. BMSB + Late-Season Codling Moth ──
  {
    triggers: [
      { slug: "brown-marmorated-stink-bug", minLevel: "moderate" },
      { slug: "codling-moth", minLevel: "moderate" },
    ],
    title: "BMSB + Late-Season Moth Pressure",
    body: "Brown marmorated stink bug moves into orchards from surrounding habitat in late summer, coinciding with second-generation codling moth. Both cause internal fruit damage that shows at harvest.",
    smartSpray:
      "Assail or Belay covers both targets in late-season sprays. Focus on orchard borders adjacent to woods or buildings where BMSB aggregates.",
  },

  // ── 16. Cedar Rust + Quince Rust ──
  {
    triggers: [
      { slug: "cedar-rust", minLevel: "moderate" },
      { slug: "alternaria", minLevel: "moderate" },
    ],
    title: "Cedar Rust + Alternaria \u2014 Foliar Fungicide Overlap",
    body: "Cedar apple rust and Alternaria leaf blotch both respond to FRAC 3 and FRAC 11 fungicides during the same spring window. Dual infection weakens trees and reduces fruit quality.",
    smartSpray:
      "Inspire Super (FRAC 3+9) covers both targets. Apply at pink through second cover. Tank-mix with Captan for broader protection.",
  },

  // ── 17. Alternaria + Bitter Pit ──
  {
    triggers: [
      { slug: "alternaria", minLevel: "moderate" },
      { slug: "bitter-pit", minLevel: "moderate" },
    ],
    title: "Alternaria + Bitter Pit \u2014 Fruit Quality Double Threat",
    body: "Alternaria core rot and bitter pit both cause internal/surface defects that reduce packout. Bitter pit is a calcium disorder exacerbated by light crop load and hot summers. Both are worse on Honeycrisp.",
    smartSpray:
      "Calcium chloride sprays (4\u20136 applications from June onward) address bitter pit. Time fungicide covers to also protect against Alternaria core rot. Thin aggressively on susceptible varieties.",
  },

  // ── 18. Fire Blight + Frost Risk at Bloom ──
  {
    triggers: [
      { slug: "fire-blight", minLevel: "moderate" },
      { slug: "frost-risk", minLevel: "moderate" },
    ],
    title: "Fire Blight + Frost \u2014 Bloom-Stage Emergency",
    body: "Fire blight risk and frost risk are both elevated during bloom. Frost-damaged blossoms are extremely susceptible to fire blight infection. This is the highest-risk scenario for catastrophic losses.",
    smartSpray:
      "Prioritize streptomycin application after any frost event during bloom. Copper is NOT safe on open flowers. Prune any fire blight strikes immediately once visible.",
  },
]
