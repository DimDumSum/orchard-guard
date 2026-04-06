export interface ProductEntry {
  name: string
  frac_irac: string
  efficacy: 1 | 2 | 3 | 4 | 5
  kickback: string
  notes: string
}

export interface ProductCategory {
  label: string
  products: ProductEntry[]
}

export interface ProductEfficacyData {
  categories: ProductCategory[]
  resistanceNotes: string[]
}

export const PRODUCT_EFFICACY: Record<string, ProductEfficacyData> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // DISEASES
  // ═══════════════════════════════════════════════════════════════════════════

  "apple-scab": {
    categories: [
      {
        label: "Protectants",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 4, kickback: "none", notes: "No resistance risk. Workhorse protectant." },
          { name: "Mancozeb/Dithane", frac_irac: "FRAC M3", efficacy: 4, kickback: "none", notes: "Budget option. Long PHI limits late use." },
          { name: "Merivon", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Premium. Also covers mildew and SBFS." },
          { name: "Flint/Trifloxystrobin", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Strobilurin. Resistance risk HIGH. Max 4/yr." },
        ],
      },
      {
        label: "Curatives",
        products: [
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 5, kickback: "96h", notes: "Best kickback. Max 4 per season." },
          { name: "Myclobutanil/Nova", frac_irac: "FRAC 3", efficacy: 4, kickback: "72h", notes: "Good kickback. Resistance risk if overused." },
          { name: "Dodine/Syllit", frac_irac: "FRAC U12", efficacy: 3, kickback: "48h", notes: "Shorter kickback. Budget curative." },
          { name: "Flint/Trifloxystrobin", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Strobilurin. Resistance risk HIGH. Max 4/yr." },
        ],
      },
      {
        label: "Biologicals",
        products: [
          { name: "Serenade OPTI", frac_irac: "biological", efficacy: 2, kickback: "none", notes: "Organic option. Supplement, not standalone." },
        ],
      },
    ],
    resistanceNotes: [
      "Alternate FRAC groups — never apply same group consecutively",
      "Multi-site protectants (M3, M4) have no resistance risk",
      "Single-site fungicides (3, 7, 9, 11) — max 3-4 uses per season",
    ],
  },

  "fire-blight": {
    categories: [
      {
        label: "Antibiotics",
        products: [
          { name: "Streptomycin", frac_irac: "antibiotic", efficacy: 5, kickback: "none", notes: "Gold standard during bloom. Max 3/season. Rotate with Kasumin." },
          { name: "Kasumin 2L", frac_irac: "antibiotic", efficacy: 4, kickback: "none", notes: "Alternate with streptomycin. Max 4/season." },
        ],
      },
      {
        label: "Biologicals",
        products: [
          { name: "Blossom Protect", frac_irac: "biological", efficacy: 4, kickback: "none", notes: "Apply 2-3 days BEFORE risk event. Organic. Not compatible with copper." },
          { name: "Serenade OPTI", frac_irac: "biological", efficacy: 3, kickback: "none", notes: "Supplement to antibiotics or for organic programs." },
          { name: "Double Nickel", frac_irac: "biological", efficacy: 3, kickback: "none", notes: "Organic option. Apply preventatively." },
        ],
      },
      {
        label: "Copper",
        products: [
          { name: "Copper 53W", frac_irac: "FRAC M1", efficacy: 3, kickback: "none", notes: "Pre-bloom only. Can cause fruit russeting." },
        ],
      },
      {
        label: "Growth Regulators",
        products: [
          { name: "Apogee/Kudos", frac_irac: "growth regulator", efficacy: 4, kickback: "none", notes: "Reduces shoot growth and fire blight spread. Apply at bloom/petal fall." },
        ],
      },
    ],
    resistanceNotes: [
      "Streptomycin resistance has been documented — rotate products",
      "Biologicals work preventatively — apply BEFORE infection events",
      "No curative products exist for fire blight",
    ],
  },

  "powdery-mildew": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Nova 40W", frac_irac: "FRAC 3", efficacy: 4, kickback: "72h", notes: "Good efficacy. Moderate resistance risk." },
          { name: "Flint", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Strobilurin. HIGH resistance risk." },
          { name: "Merivon", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Premium. Also covers scab and SBFS." },
          { name: "Sulfur", frac_irac: "FRAC M2", efficacy: 3, kickback: "none", notes: "Organic option. Do not apply within 14 days of oil." },
          { name: "Rally 40W", frac_irac: "FRAC 3", efficacy: 4, kickback: "72h", notes: "Good efficacy, moderate resistance risk." },
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 5, kickback: "96h", notes: "Premium. Also covers scab." },
        ],
      },
    ],
    resistanceNotes: [
      "Alternate FRAC groups",
      "Sulfur has no resistance risk but is less effective than synthetics",
    ],
  },

  "cedar-rust": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Nova 40W", frac_irac: "FRAC 3", efficacy: 4, kickback: "72h", notes: "Good efficacy during infection window." },
          { name: "Flint", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Also covers scab." },
          { name: "Merivon", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Premium multi-target." },
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 5, kickback: "96h", notes: "Best kickback for post-infection use." },
        ],
      },
    ],
    resistanceNotes: [
      "Same SI fungicides cover both scab and rust — plan dual coverage",
      "Protectant timing is critical — once symptoms appear, infection is done",
    ],
  },

  "sooty-blotch": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 4, kickback: "none", notes: "Workhorse. No resistance risk." },
          { name: "Merivon", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Premium. Covers scab + mildew too." },
          { name: "Flint", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Also covers scab." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Broad spectrum premium." },
          { name: "Phosphorous acid", frac_irac: "FRAC 33", efficacy: 3, kickback: "none", notes: "Late-season option. Low resistance risk." },
        ],
      },
    ],
    resistanceNotes: [
      "Late-season disease — apply when cumulative leaf wetness hours exceed 250",
      "Captan alone provides reliable protection if applied consistently",
    ],
  },

  "black-rot": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 4, kickback: "none", notes: "Reliable protectant. No resistance risk." },
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 4, kickback: "72h", notes: "Good curative activity. Also covers scab." },
          { name: "Flint", frac_irac: "FRAC 11", efficacy: 4, kickback: "72h", notes: "Also covers scab. Max 4/yr." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 4, kickback: "48h", notes: "Broad spectrum. Premium option." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Mummy removal", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Remove mummified fruit and cankers during dormant pruning. Primary inoculum source." },
        ],
      },
    ],
    resistanceNotes: [
      "Sanitation is critical — remove mummified fruit and cankers",
      "Most scab fungicide programs provide incidental black rot control",
    ],
  },

  "bitter-rot": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 3, kickback: "none", notes: "Moderate efficacy. Apply from mid-summer onward." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Best option for bitter rot control." },
          { name: "Merivon", frac_irac: "FRAC 7+11", efficacy: 5, kickback: "48h", notes: "Premium. Multi-target coverage." },
          { name: "Topsin M", frac_irac: "FRAC 1", efficacy: 3, kickback: "48h", notes: "Moderate efficacy. Resistance risk." },
        ],
      },
    ],
    resistanceNotes: [
      "Hot, humid summers increase risk — maintain spray schedule in July-August",
      "Tank-mix Captan with FRAC 7+11 for best results",
    ],
  },

  "white-rot": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 3, kickback: "none", notes: "Moderate efficacy as protectant." },
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 4, kickback: "72h", notes: "Better than Captan alone for white rot." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 4, kickback: "48h", notes: "Good control. Also covers bitter rot." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Canker removal", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Remove infected bark and cankers. Burn or bury debris." },
        ],
      },
    ],
    resistanceNotes: [
      "Warm, wet weather drives white rot — similar conditions to bitter rot",
      "Soil-borne fungus can persist in orchard floor debris",
    ],
  },

  "brooks-spot": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 4, kickback: "none", notes: "Primary protectant for Brooks spot." },
          { name: "Topsin M", frac_irac: "FRAC 1", efficacy: 3, kickback: "48h", notes: "Supplemental option. Resistance risk." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 4, kickback: "48h", notes: "Good control as part of summer spray program." },
        ],
      },
    ],
    resistanceNotes: [
      "Often controlled incidentally by summer Captan applications",
      "Most common on susceptible cultivars in warm, humid regions",
    ],
  },

  "bulls-eye-rot": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 4, kickback: "48h", notes: "Best pre-harvest option for bull's eye rot." },
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 3, kickback: "none", notes: "Moderate efficacy. Apply late season." },
          { name: "Scholar/Fludioxonil", frac_irac: "FRAC 12", efficacy: 4, kickback: "none", notes: "Post-harvest drench or spray." },
        ],
      },
      {
        label: "Post-Harvest",
        products: [
          { name: "Cold storage management", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Rapid cooling after harvest reduces disease development." },
        ],
      },
    ],
    resistanceNotes: [
      "Infection often occurs in late summer — pre-harvest sprays are critical",
      "Post-harvest cooling and storage conditions greatly affect expression",
    ],
  },

  "alternaria": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Captan 80 WDG", frac_irac: "FRAC M4", efficacy: 3, kickback: "none", notes: "Moderate protectant activity." },
          { name: "Inspire Super", frac_irac: "FRAC 3+9", efficacy: 4, kickback: "72h", notes: "Good efficacy against Alternaria." },
          { name: "Pristine", frac_irac: "FRAC 7+11", efficacy: 4, kickback: "48h", notes: "Broad spectrum. Also covers summer rots." },
        ],
      },
    ],
    resistanceNotes: [
      "Typically a secondary disease — vigorous trees are less susceptible",
      "Often associated with weakened or stressed trees",
    ],
  },

  "nectria-canker": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Copper 53W", frac_irac: "FRAC M1", efficacy: 3, kickback: "none", notes: "Dormant application to protect pruning wounds." },
          { name: "Topsin M", frac_irac: "FRAC 1", efficacy: 3, kickback: "48h", notes: "Apply to wounds during growing season." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Pruning wound management", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Prune during dry weather. Seal large wounds with wound dressing." },
          { name: "Canker excision", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Remove infected branches well below visible canker margin." },
        ],
      },
    ],
    resistanceNotes: [
      "Infection occurs through wounds — avoid pruning in wet weather",
      "Vigorous trees with good nutrition are more resistant",
    ],
  },

  "post-harvest": {
    categories: [
      {
        label: "Post-Harvest Treatments",
        products: [
          { name: "Scholar/Fludioxonil", frac_irac: "FRAC 12", efficacy: 5, kickback: "none", notes: "Industry standard post-harvest fungicide drench." },
          { name: "Penbotec/Pyrimethanil", frac_irac: "FRAC 9", efficacy: 4, kickback: "none", notes: "Alternative post-harvest drench. Rotate with Scholar." },
          { name: "1-MCP/SmartFresh", frac_irac: "growth regulator", efficacy: 4, kickback: "none", notes: "Delays senescence and reduces disease susceptibility in storage." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Rapid cooling", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Cool fruit within 24 hours of harvest to reduce decay." },
          { name: "Controlled atmosphere", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Low O2, high CO2 storage slows pathogen growth." },
        ],
      },
    ],
    resistanceNotes: [
      "Rotate post-harvest fungicide groups to prevent resistance",
      "Field infections (bitter rot, bull's eye rot) manifest in storage — preharvest sprays matter",
    ],
  },

  "apple-mosaic": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Certified virus-free nursery stock", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Only reliable method. Purchase certified trees." },
          { name: "Infected tree removal", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Remove symptomatic trees to prevent spread via root grafts." },
        ],
      },
    ],
    resistanceNotes: [
      "No chemical control exists for viral diseases",
      "Virus spreads through grafting and root contact — not insect-vectored",
    ],
  },

  "apple-proliferation": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Certified phytoplasma-free stock", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Use certified nursery trees. Primary prevention method." },
          { name: "Psyllid vector control", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Control Cacopsylla picta and C. melanoneura to reduce spread." },
          { name: "Infected tree removal", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Remove symptomatic trees promptly to reduce inoculum." },
        ],
      },
    ],
    resistanceNotes: [
      "No curative treatment exists for phytoplasma infections",
      "Psyllid vector control can reduce new infections in the block",
    ],
  },

  "frost-risk": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Overhead irrigation", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Latent heat of fusion protects buds. Must run continuously below 0\u00b0C." },
          { name: "Wind machines", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Mix warm inversion layer air. Effective for radiation frosts only." },
          { name: "Delayed dormant oil", frac_irac: "cultural", efficacy: 2, kickback: "none", notes: "May delay bloom 3-5 days. Minimal frost protection." },
          { name: "Site selection", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Sloped sites with air drainage are best. Avoid frost pockets." },
        ],
      },
    ],
    resistanceNotes: [
      "Bud hardiness decreases as phenology advances — tight cluster to bloom is most vulnerable",
      "Radiation frosts (clear, calm nights) are most common and most preventable",
    ],
  },

  "bitter-pit": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Calcium chloride sprays", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "4-8 cover sprays starting mid-June. Most effective practice." },
          { name: "Balanced nitrogen", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Excess N increases bitter pit risk. Maintain moderate vigor." },
          { name: "Proper harvest timing", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Delayed harvest increases bitter pit. Pick on time." },
          { name: "Crop load management", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Light crop loads increase risk. Thin to moderate crop." },
        ],
      },
    ],
    resistanceNotes: [
      "Calcium deficiency in fruit — not a pathogen issue",
      "Large fruit from lightly cropped trees are most susceptible",
    ],
  },

  "phytophthora": {
    categories: [
      {
        label: "Fungicides",
        products: [
          { name: "Ridomil Gold/Mefenoxam", frac_irac: "FRAC 4", efficacy: 5, kickback: "none", notes: "Soil drench or banded application. Best efficacy." },
          { name: "Aliette/Fosetyl-Al", frac_irac: "FRAC 33", efficacy: 4, kickback: "none", notes: "Systemic. Foliar or soil application." },
          { name: "Phosphorous acid", frac_irac: "FRAC 33", efficacy: 4, kickback: "none", notes: "Trunk paint or foliar spray. Low resistance risk." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Resistant rootstocks", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "G.935, G.210, G.41 have moderate Phytophthora tolerance." },
          { name: "Drainage improvement", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Raise planting beds. Improve soil drainage. Avoid waterlogging." },
        ],
      },
    ],
    resistanceNotes: [
      "Wet, poorly drained soils greatly increase Phytophthora risk",
      "Rootstock selection is the most important long-term strategy",
    ],
  },

  "replant-disease": {
    categories: [
      {
        label: "Management",
        products: [
          { name: "Soil fumigation", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Pre-plant fumigation with Vapam or Telone. Most aggressive option." },
          { name: "Biocontrol inoculants", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Mycorrhizal and Trichoderma inoculants at planting." },
          { name: "Rootstock selection", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Geneva rootstocks (G.210, G.41) show better replant tolerance." },
          { name: "Crop rotation", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "2-3 years of non-Rosaceae crop before replanting." },
        ],
      },
    ],
    resistanceNotes: [
      "Replant disease is a complex of fungi, bacteria, and nematodes",
      "No single treatment is fully effective — combine multiple strategies",
    ],
  },

  "sunscald": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "White trunk paint", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Reflects sunlight. Apply to southwest-facing trunks." },
          { name: "Tree guards/wraps", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "White plastic or paper guards on young trees." },
          { name: "Proper pruning", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Avoid exposing large scaffold branches suddenly." },
        ],
      },
    ],
    resistanceNotes: [
      "Most common on southwest-facing trunk and scaffold surfaces",
      "Winter sunscald (southwest injury) occurs from freeze-thaw cycles",
    ],
  },

  "frost-ring": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Frost protection (see frost-risk)", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Same prevention methods as frost-risk. Damage occurs at bloom." },
          { name: "Affected fruit thinning", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Remove frost-ring affected fruitlets at thinning to improve pack-out." },
        ],
      },
    ],
    resistanceNotes: [
      "Frost ring is cosmetic damage — fruit is safe to eat but unmarketable",
      "Damage occurs during bloom period frost events",
    ],
  },

  "water-core": {
    categories: [
      {
        label: "Management",
        products: [
          { name: "Timely harvest", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Harvest at proper maturity. Delayed harvest increases water core risk." },
          { name: "Post-harvest conditioning", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Mild water core may dissipate in storage. Severe cases cause breakdown." },
          { name: "Crop load management", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Light crops increase risk on susceptible cultivars." },
        ],
      },
    ],
    resistanceNotes: [
      "Physiological disorder — not a disease. Cultivar-dependent (Fuji, Delicious susceptible)",
      "Severe water core causes internal browning in storage",
    ],
  },

  "sunburn": {
    categories: [
      {
        label: "Prevention",
        products: [
          { name: "Surround/Kaolin clay", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Reflective particle film. Apply before heat events." },
          { name: "Evaporative cooling", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Overhead misting during extreme heat (>35\u00b0C). Short pulses." },
          { name: "Shade netting", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "20-30% shade cloth. Permanent infrastructure investment." },
        ],
      },
    ],
    resistanceNotes: [
      "Fruit surface temperature, not air temperature, causes sunburn",
      "Most damage occurs on southwest-exposed fruit during sudden heat waves",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PESTS
  // ═══════════════════════════════════════════════════════════════════════════

  "codling-moth": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 5, kickback: "none", notes: "Premium. Low impact on beneficials. Max 4/yr." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Also covers aphids, plum curculio, apple maggot." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Standard summer insecticide. Covers PC + AM." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 5, kickback: "none", notes: "Premium. Low impact on beneficials." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Entrust", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Organic spinosad. Short residual — reapply after rain." },
          { name: "Cyd-X", frac_irac: "virus", efficacy: 3, kickback: "none", notes: "Codling moth granulosis virus. Highly specific. Must be ingested by larva." },
        ],
      },
      {
        label: "Other",
        products: [
          { name: "Mating disruption", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Dispensers or puffers. Best for area-wide programs. Reduces but doesn't eliminate need for sprays." },
        ],
      },
    ],
    resistanceNotes: [
      "Rotate IRAC groups to prevent resistance",
      "Time first spray to 100 DD after biofix for egg hatch",
      "Mating disruption works best in large contiguous blocks",
    ],
  },

  "plum-curculio": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Standard for PC. Apply at petal fall." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Shorter REI than Imidan." },
          { name: "Avaunt", frac_irac: "IRAC 22", efficacy: 4, kickback: "none", notes: "Good residual activity." },
          { name: "Actara", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Systemic activity helpful for PC." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Surround", frac_irac: "kaolin clay", efficacy: 3, kickback: "none", notes: "Physical barrier. Must maintain coverage. Organic approved." },
        ],
      },
    ],
    resistanceNotes: [
      "Apply at petal fall — most critical timing",
      "Border rows are highest priority",
      "Re-apply after rain during critical 3-4 week window",
    ],
  },

  "european-red-mite": {
    categories: [
      {
        label: "Miticides",
        products: [
          { name: "Dormant oil", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Apply at dormant to green tip. Suffocates overwintering eggs." },
          { name: "Apollo", frac_irac: "IRAC 10A", efficacy: 4, kickback: "none", notes: "Ovicide + larvicide. Apply early." },
          { name: "Envidor", frac_irac: "IRAC 23", efficacy: 5, kickback: "none", notes: "All stages. Premium." },
          { name: "Acramite", frac_irac: "IRAC 20D", efficacy: 5, kickback: "none", notes: "Fast knockdown. One application per season." },
          { name: "Nexter", frac_irac: "IRAC 21A", efficacy: 4, kickback: "none", notes: "Good knockdown. Avoid in hot weather." },
        ],
      },
      {
        label: "Biological",
        products: [
          { name: "Predatory mite conservation", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Best long-term strategy. Avoid broad-spectrum insecticides." },
        ],
      },
    ],
    resistanceNotes: [
      "Rotate miticide groups — mites develop resistance quickly",
      "Conserving predatory mites is the most sustainable strategy",
      "Some insecticides (pyrethroids, OPs) cause mite flares by killing predators",
    ],
  },

  "apple-maggot": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Standard. Also covers CM + PC." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Shorter REI. Also covers CM + aphids." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Surround", frac_irac: "kaolin clay", efficacy: 3, kickback: "none", notes: "Physical barrier. Must maintain coverage." },
          { name: "GF-120", frac_irac: "spinosad bait", efficacy: 3, kickback: "none", notes: "Organic bait spray. Apply to border rows." },
        ],
      },
    ],
    resistanceNotes: [
      "Border row strategy is most effective — AM enters from surrounding wild hosts",
      "Trap monitoring (red sticky spheres) determines timing",
      "Action threshold is 1 fly per trap — zero tolerance in fresh market",
    ],
  },

  "oriental-fruit-moth": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 5, kickback: "none", notes: "Premium. Excellent OFM control." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 5, kickback: "none", notes: "Premium. Low impact on beneficials." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Standard OP. Broad spectrum." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Neonicotinoid. Shorter REI." },
        ],
      },
      {
        label: "Other",
        products: [
          { name: "Mating disruption", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Effective in OFM management. Combine with monitoring." },
        ],
      },
    ],
    resistanceNotes: [
      "Rotate IRAC groups — resistance documented in some populations",
      "Monitor with pheromone traps — biofix determines spray timing",
    ],
  },

  "leafroller": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 5, kickback: "none", notes: "Excellent against OBLR and other leafrollers." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 5, kickback: "none", notes: "Premium spinosyn. Low beneficials impact." },
          { name: "Intrepid", frac_irac: "IRAC 18", efficacy: 4, kickback: "none", notes: "Insect growth regulator. Must target larvae." },
          { name: "Confirm", frac_irac: "IRAC 18", efficacy: 4, kickback: "none", notes: "IGR. Apply to early instars." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Entrust", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Organic spinosad. Short residual." },
          { name: "Bt (Dipel)", frac_irac: "IRAC 11A", efficacy: 3, kickback: "none", notes: "Organic. Must be ingested by young larvae." },
        ],
      },
    ],
    resistanceNotes: [
      "Target young larvae before they roll leaves for best efficacy",
      "Pheromone traps help determine flight timing and generation overlap",
    ],
  },

  "tentiform-leafminer": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Effective at petal fall timing." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Good leafminer activity." },
          { name: "Rimon", frac_irac: "IRAC 15", efficacy: 4, kickback: "none", notes: "IGR. Targets eggs and early larvae." },
        ],
      },
    ],
    resistanceNotes: [
      "Parasitoids provide excellent natural control — avoid broad-spectrum sprays",
      "Treatment threshold is typically 1-2 mines per leaf",
    ],
  },

  "lesser-appleworm": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 4, kickback: "none", notes: "Good control when targeting codling moth." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Broad spectrum OP covers LAW incidentally." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Effective. Low beneficials impact." },
        ],
      },
    ],
    resistanceNotes: [
      "Usually controlled by codling moth spray program",
      "Monitor with pheromone traps if suspected as primary pest",
    ],
  },

  "eyespot-bud-moth": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 4, kickback: "none", notes: "Effective at pink/bloom timing." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Good activity on lepidopteran larvae." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 3, kickback: "none", notes: "Standard OP. Moderate efficacy." },
        ],
      },
    ],
    resistanceNotes: [
      "Typically controlled by leafroller/codling moth programs",
      "Rarely a primary pest — monitor before treating specifically",
    ],
  },

  "winter-moth": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Apply at green tip when larvae are actively feeding." },
          { name: "Altacor", frac_irac: "IRAC 28", efficacy: 4, kickback: "none", notes: "Good activity on young larvae." },
          { name: "Bt (Dipel)", frac_irac: "IRAC 11A", efficacy: 3, kickback: "none", notes: "Organic option. Effective on young instars." },
        ],
      },
    ],
    resistanceNotes: [
      "Larvae emerge at bud break — timing is critical",
      "Biological control agent Cyzenis albicans is established in some areas",
    ],
  },

  "clearwing-moth": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Lorsban/Chlorpyrifos", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Trunk spray. Check registration status — restricted in many jurisdictions." },
          { name: "Entrust", frac_irac: "IRAC 5", efficacy: 3, kickback: "none", notes: "Organic option for trunk application." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Trunk inspection and wire removal", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Remove frass and probe burrows with wire. Keep trunk bases clean." },
          { name: "Mating disruption", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Available for some clearwing species." },
        ],
      },
    ],
    resistanceNotes: [
      "Larvae bore inside trunks — insecticides have limited reach",
      "Prevention and early detection are more effective than curative sprays",
    ],
  },

  "dogwood-borer": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Lorsban/Chlorpyrifos", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Trunk spray targeting adults. Check local registration." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Trunk application. Target egg-laying period." },
        ],
      },
      {
        label: "Cultural Practices",
        products: [
          { name: "Burr knot management", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Bury graft union. Burr knots attract borers — keep trunk clean." },
          { name: "Trunk guards", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Physical barriers prevent adult egg-laying on trunk." },
        ],
      },
    ],
    resistanceNotes: [
      "Major pest on dwarfing rootstocks with burr knots",
      "Burying graft union and maintaining clean trunk are key prevention strategies",
    ],
  },

  "rosy-apple-aphid": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 5, kickback: "none", notes: "Systemic. Best timing at pink/petal fall." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Good contact activity. Shorter REI." },
          { name: "Closer", frac_irac: "IRAC 4C", efficacy: 4, kickback: "none", notes: "Good aphid activity with low mite flare risk." },
          { name: "Beleaf", frac_irac: "IRAC 9C", efficacy: 4, kickback: "none", notes: "Low impact on beneficials. Stops feeding quickly." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "M-Pede (insecticidal soap)", frac_irac: "cultural", efficacy: 2, kickback: "none", notes: "Contact only. Must reach aphids inside curled leaves." },
        ],
      },
    ],
    resistanceNotes: [
      "Treat at pink stage before leaves curl — once curled, sprays cannot reach aphids",
      "Causes severe fruit distortion (monkey-faced fruit) when untreated",
    ],
  },

  "green-apple-aphid": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Good contact + systemic activity." },
          { name: "Closer", frac_irac: "IRAC 4C", efficacy: 4, kickback: "none", notes: "Selective. Low impact on beneficials." },
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 4, kickback: "none", notes: "Systemic. Good for heavy infestations." },
        ],
      },
    ],
    resistanceNotes: [
      "Often controlled by natural enemies — avoid unnecessary sprays",
      "High populations cause honeydew and sooty mold on fruit",
    ],
  },

  "woolly-apple-aphid": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 5, kickback: "none", notes: "Best option. Systemic — reaches root colonies." },
          { name: "Diazinon", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Trunk and scaffold spray. Check local registration." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Contact only. Moderate efficacy on WAA." },
        ],
      },
      {
        label: "Biological",
        products: [
          { name: "Aphelinus mali", frac_irac: "biological", efficacy: 4, kickback: "none", notes: "Parasitic wasp. Excellent natural control when not disrupted." },
        ],
      },
    ],
    resistanceNotes: [
      "Resistant rootstocks (G.202, G.935) significantly reduce root colony establishment",
      "Conserve Aphelinus mali parasitoid — avoid broad-spectrum insecticides",
    ],
  },

  "tarnished-plant-bug": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Avaunt", frac_irac: "IRAC 22", efficacy: 4, kickback: "none", notes: "Good residual. Apply at pink stage." },
          { name: "Actara", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Systemic. Good early-season activity." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Moderate efficacy on plant bugs." },
        ],
      },
    ],
    resistanceNotes: [
      "Most damage occurs pre-bloom to petal fall on developing fruitlets",
      "Weed management around orchard edges reduces TPB habitat",
    ],
  },

  "apple-brown-bug": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Apply at delayed dormant to green tip." },
          { name: "Actara", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Early season application for nymph control." },
        ],
      },
    ],
    resistanceNotes: [
      "Feeds early in season — damage appears as dimpled fruit at harvest",
      "Usually a minor pest — treat only when monitoring confirms presence",
    ],
  },

  "mullein-bug": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Apply when nymphs are active." },
          { name: "Actara", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Moderate activity on mullein bug." },
        ],
      },
    ],
    resistanceNotes: [
      "Also a beneficial predator of mites and aphids — weigh treatment decisions carefully",
      "Damage is cosmetic dimpling on fruit — mostly a fresh market concern",
    ],
  },

  "san-jose-scale": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Dormant oil", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Apply at dormant to delayed dormant. Suffocates crawlers." },
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 5, kickback: "none", notes: "Systemic. Apply at petal fall for crawler emergence." },
          { name: "Centaur", frac_irac: "IRAC 16", efficacy: 4, kickback: "none", notes: "IGR. Targets crawlers. Low impact on beneficials." },
          { name: "Diazinon", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Dormant or crawler spray. Check local registration." },
        ],
      },
    ],
    resistanceNotes: [
      "Dormant oil is essential — foundation of SJS management",
      "Monitor with pheromone traps to time crawler sprays accurately",
    ],
  },

  "european-fruit-scale": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Dormant oil", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Primary control method. Thorough coverage required." },
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 4, kickback: "none", notes: "Systemic. Target crawler stage." },
          { name: "Centaur", frac_irac: "IRAC 16", efficacy: 3, kickback: "none", notes: "IGR for crawler control." },
        ],
      },
    ],
    resistanceNotes: [
      "Dormant oil applied thoroughly is usually sufficient",
      "One generation per year — crawler timing is critical",
    ],
  },

  "brown-marmorated-stink-bug": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Actara", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Best available option. Systemic activity." },
          { name: "Danitol/Fenpropathrin", frac_irac: "IRAC 3A", efficacy: 4, kickback: "none", notes: "Good knockdown but flares mites. Use cautiously." },
          { name: "Bifenthrin", frac_irac: "IRAC 3A", efficacy: 3, kickback: "none", notes: "Pyrethroid. Moderate efficacy. Mite flare risk." },
        ],
      },
      {
        label: "Other",
        products: [
          { name: "Border row management", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "BMSB enters from wooded borders. Focus sprays on perimeter rows." },
        ],
      },
    ],
    resistanceNotes: [
      "Invasive pest — populations highly variable year to year",
      "Border row spraying is more effective than whole-orchard treatment",
    ],
  },

  "pear-psylla": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Dormant oil", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Apply at dormant. Smothers overwintering adults." },
          { name: "Movento", frac_irac: "IRAC 23", efficacy: 4, kickback: "none", notes: "Systemic. Targets nymphs." },
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 3, kickback: "none", notes: "Moderate activity on psylla." },
          { name: "Agri-Mek", frac_irac: "IRAC 6", efficacy: 4, kickback: "none", notes: "Translaminar. Effective on nymphs." },
        ],
      },
    ],
    resistanceNotes: [
      "Primarily a pear pest — minor concern in apple orchards",
      "Resistance to many insecticide classes is widespread in psylla",
    ],
  },

  "apple-flea-weevil": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Apply when adults active in early spring." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 3, kickback: "none", notes: "Broad spectrum OP. Moderate efficacy." },
        ],
      },
    ],
    resistanceNotes: [
      "Minor pest — usually controlled incidentally by early-season sprays",
      "Adults feed on leaves creating small holes; larvae mine inside leaves",
    ],
  },

  "japanese-beetle": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Good activity. Also covers other pests." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Standard OP. Effective on adults." },
          { name: "Sevin/Carbaryl", frac_irac: "IRAC 1A", efficacy: 4, kickback: "none", notes: "Effective but broad spectrum. Can cause mite flares." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Surround", frac_irac: "kaolin clay", efficacy: 3, kickback: "none", notes: "Deters adult feeding. Must maintain coverage." },
        ],
      },
    ],
    resistanceNotes: [
      "Adults skeletonize leaves — primarily a mid-summer pest",
      "Grub control in surrounding turf can reduce local populations",
    ],
  },

  "two-spotted-spider-mite": {
    categories: [
      {
        label: "Miticides",
        products: [
          { name: "Envidor", frac_irac: "IRAC 23", efficacy: 5, kickback: "none", notes: "All stages. Premium miticide." },
          { name: "Acramite", frac_irac: "IRAC 20D", efficacy: 5, kickback: "none", notes: "Fast knockdown. One application per season." },
          { name: "Nexter", frac_irac: "IRAC 21A", efficacy: 4, kickback: "none", notes: "Good knockdown. Avoid in hot weather." },
          { name: "Agri-Mek", frac_irac: "IRAC 6", efficacy: 4, kickback: "none", notes: "Translaminar. Apply with oil adjuvant." },
        ],
      },
      {
        label: "Biological",
        products: [
          { name: "Predatory mite conservation", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Phytoseiid mites provide natural suppression." },
        ],
      },
    ],
    resistanceNotes: [
      "Rotate miticide groups — rapid resistance development in spider mites",
      "Hot, dry conditions favor outbreaks — monitor closely in summer",
    ],
  },

  "apple-rust-mite": {
    categories: [
      {
        label: "Miticides",
        products: [
          { name: "Dormant oil", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Delayed dormant timing. Moderate control." },
          { name: "Envidor", frac_irac: "IRAC 23", efficacy: 4, kickback: "none", notes: "Effective on eriophyid mites." },
          { name: "Agri-Mek", frac_irac: "IRAC 6", efficacy: 4, kickback: "none", notes: "Good activity on rust mites." },
        ],
      },
    ],
    resistanceNotes: [
      "Low populations are beneficial — they sustain predatory mite populations",
      "Treat only when populations are high enough to cause leaf bronzing",
    ],
  },

  "apple-leaf-midge": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 3, kickback: "none", notes: "Apply when adults are flying (petal fall)." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Moderate efficacy. Target adult emergence." },
        ],
      },
    ],
    resistanceNotes: [
      "Larvae cause leaf margin rolling on shoot tips",
      "Usually a minor pest — treat only in nurseries or young plantings",
    ],
  },

  "european-apple-sawfly": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 4, kickback: "none", notes: "Apply at petal fall. Standard timing." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Good activity at petal fall." },
          { name: "Calypso", frac_irac: "IRAC 4A", efficacy: 4, kickback: "none", notes: "Effective at petal fall for sawfly larvae." },
        ],
      },
    ],
    resistanceNotes: [
      "Petal fall spray timing is critical — larvae bore into fruitlets immediately",
      "White sticky traps at bloom help monitor adult flight",
    ],
  },

  "spotted-wing-drosophila": {
    categories: [
      {
        label: "Insecticides",
        products: [
          { name: "Delegate", frac_irac: "IRAC 5", efficacy: 4, kickback: "none", notes: "Good activity. Short PHI." },
          { name: "Assail 70WP", frac_irac: "IRAC 4A", efficacy: 3, kickback: "none", notes: "Moderate activity on SWD." },
          { name: "Imidan 70WP", frac_irac: "IRAC 1B", efficacy: 3, kickback: "none", notes: "Standard OP. Some SWD activity." },
        ],
      },
      {
        label: "Organic",
        products: [
          { name: "Entrust", frac_irac: "IRAC 5", efficacy: 3, kickback: "none", notes: "Organic spinosad. Short residual — reapply frequently." },
        ],
      },
    ],
    resistanceNotes: [
      "Primarily a soft fruit pest — apples are at risk only when damaged or overripe",
      "Timely harvest and sanitation are the best prevention in apples",
    ],
  },

  "voles": {
    categories: [
      {
        label: "Management",
        products: [
          { name: "Trunk guards/hardware cloth", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "Wire mesh cylinders around trunk base. Best physical barrier." },
          { name: "Habitat reduction", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Mow orchard floor closely in fall. Remove mulch from trunk contact." },
          { name: "Zinc phosphide bait", frac_irac: "rodenticide", efficacy: 4, kickback: "none", notes: "Apply in fall before snow cover. Follow label for bait station placement." },
          { name: "Raptor perches", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "T-perches encourage owl and hawk activity. Long-term biological control." },
        ],
      },
    ],
    resistanceNotes: [
      "Fall and late winter are highest risk — voles girdle trunks under snow cover",
      "Keep vegetation mowed low within 60 cm of trunk base",
    ],
  },

  "deer": {
    categories: [
      {
        label: "Management",
        products: [
          { name: "Deer fencing (8 ft)", frac_irac: "cultural", efficacy: 5, kickback: "none", notes: "8-foot woven wire or high-tensile electric. Most reliable method." },
          { name: "Electric fence (baited)", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Peanut butter on aluminum foil on electrified wire. Training fence." },
          { name: "Repellents (Bobbex, Plantskydd)", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Apply to terminal growth. Reapply after rain. Variable efficacy." },
          { name: "Tree shelters", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Individual tree tubes for young plantings. Protects from browse." },
        ],
      },
    ],
    resistanceNotes: [
      "Fencing is the only reliable long-term solution",
      "Young orchards are most vulnerable — protect immediately after planting",
    ],
  },

  "dagger-nematode": {
    categories: [
      {
        label: "Management",
        products: [
          { name: "Pre-plant soil fumigation", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Telone or Vapam before planting. Does not eliminate but reduces populations." },
          { name: "Resistant rootstocks", frac_irac: "cultural", efficacy: 3, kickback: "none", notes: "Some Geneva rootstocks show partial tolerance." },
          { name: "Soil sampling and avoidance", frac_irac: "cultural", efficacy: 4, kickback: "none", notes: "Pre-plant soil assay. Avoid heavily infested sites." },
        ],
      },
    ],
    resistanceNotes: [
      "Xiphinema vectors tomato ringspot virus — nematode + virus complex causes apple union necrosis",
      "No in-season chemical control available for established orchards",
    ],
  },
}
