// ---------------------------------------------------------------------------
// Multi-Target Products — Products that cover multiple diseases or pests in a
// single application. Used by the smart-spray advisor and tank-mix planner.
// ---------------------------------------------------------------------------

export interface MultiTargetProduct {
  name: string
  group: string
  covers: string[]
  note: string
}

export const MULTI_TARGET_PRODUCTS: MultiTargetProduct[] = [
  // ── Fungicides ──
  {
    name: "Merivon",
    group: "FRAC 7+11",
    covers: [
      "apple-scab",
      "powdery-mildew",
      "sooty-blotch",
      "bitter-rot",
      "black-rot",
    ],
    note: "Premium broad-spectrum. Max 4/season. Resistance risk \u2014 alternate with multi-site protectants.",
  },
  {
    name: "Inspire Super",
    group: "FRAC 3+9",
    covers: ["apple-scab", "powdery-mildew", "cedar-rust", "black-rot"],
    note: "Best kickback for post-infection scab. Max 4/season.",
  },
  {
    name: "Captan 80 WDG",
    group: "FRAC M4",
    covers: [
      "apple-scab",
      "black-rot",
      "brooks-spot",
      "bitter-rot",
      "sooty-blotch",
    ],
    note: "No resistance risk \u2014 can use all season. Workhorse protectant.",
  },
  {
    name: "Copper 53W",
    group: "FRAC M1",
    covers: ["fire-blight", "apple-scab"],
    note: "Pre-bloom only. Can cause fruit russeting.",
  },

  // ── Insecticides ──
  {
    name: "Imidan 70WP",
    group: "IRAC 1B",
    covers: [
      "codling-moth",
      "plum-curculio",
      "apple-maggot",
      "european-apple-sawfly",
    ],
    note: "Standard summer insecticide. 24h REI.",
  },
  {
    name: "Assail 70WP",
    group: "IRAC 4A",
    covers: [
      "codling-moth",
      "plum-curculio",
      "rosy-apple-aphid",
      "green-apple-aphid",
      "tentiform-leafminer",
      "apple-maggot",
    ],
    note: "Shorter REI than Imidan. Broad-spectrum neonic.",
  },
  {
    name: "Altacor",
    group: "IRAC 28",
    covers: ["codling-moth", "leafroller", "oriental-fruit-moth"],
    note: "Premium. Low impact on beneficials.",
  },
  {
    name: "Delegate",
    group: "IRAC 5",
    covers: [
      "codling-moth",
      "leafroller",
      "oriental-fruit-moth",
      "tentiform-leafminer",
    ],
    note: "Premium. Low impact on beneficials.",
  },

  // ── Cultural / Physical ──
  {
    name: "Dormant Oil",
    group: "cultural",
    covers: [
      "european-red-mite",
      "san-jose-scale",
      "european-fruit-scale",
      "rosy-apple-aphid",
    ],
    note: "Apply dormant to green tip. Suffocates overwintering eggs and scale.",
  },
  {
    name: "Surround / Kaolin Clay",
    group: "cultural",
    covers: ["plum-curculio", "apple-maggot", "japanese-beetle"],
    note: "Organic physical barrier. Must maintain coverage after rain.",
  },
]

// ---------------------------------------------------------------------------
// Seasonal Timing Chart — Which products are appropriate at each phenology
// stage. Used by the spray calendar and recommendation engine.
// ---------------------------------------------------------------------------

export type PhenologyStage =
  | "dormant"
  | "green-tip"
  | "tight-cluster"
  | "pink"
  | "bloom"
  | "petal-fall"
  | "cover"
  | "pre-harvest"

export interface SeasonalTiming {
  product: string
  timings: Record<PhenologyStage, boolean>
}

export const SEASONAL_TIMING: SeasonalTiming[] = [
  {
    product: "Copper",
    timings: {
      dormant: true,
      "green-tip": true,
      "tight-cluster": true,
      pink: false,
      bloom: false,
      "petal-fall": false,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Dormant Oil",
    timings: {
      dormant: true,
      "green-tip": true,
      "tight-cluster": false,
      pink: false,
      bloom: false,
      "petal-fall": false,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Captan",
    timings: {
      dormant: false,
      "green-tip": true,
      "tight-cluster": true,
      pink: true,
      bloom: true,
      "petal-fall": true,
      cover: true,
      "pre-harvest": false,
    },
  },
  {
    product: "Mancozeb",
    timings: {
      dormant: false,
      "green-tip": true,
      "tight-cluster": true,
      pink: true,
      bloom: true,
      "petal-fall": true,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Nova / Myclobutanil",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": true,
      pink: true,
      bloom: true,
      "petal-fall": true,
      cover: true,
      "pre-harvest": false,
    },
  },
  {
    product: "Merivon",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": true,
      pink: true,
      bloom: true,
      "petal-fall": true,
      cover: true,
      "pre-harvest": false,
    },
  },
  {
    product: "Streptomycin",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: false,
      bloom: true,
      "petal-fall": false,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Blossom Protect",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: true,
      bloom: true,
      "petal-fall": false,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Apogee",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: true,
      bloom: true,
      "petal-fall": true,
      cover: false,
      "pre-harvest": false,
    },
  },
  {
    product: "Imidan",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: false,
      bloom: false,
      "petal-fall": true,
      cover: true,
      "pre-harvest": false,
    },
  },
  {
    product: "Assail",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: true,
      bloom: false,
      "petal-fall": true,
      cover: true,
      "pre-harvest": true,
    },
  },
  {
    product: "Altacor",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: false,
      bloom: false,
      "petal-fall": true,
      cover: true,
      "pre-harvest": true,
    },
  },
  {
    product: "Surround",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: false,
      bloom: false,
      "petal-fall": true,
      cover: true,
      "pre-harvest": false,
    },
  },
  {
    product: "Calcium",
    timings: {
      dormant: false,
      "green-tip": false,
      "tight-cluster": false,
      pink: false,
      bloom: false,
      "petal-fall": true,
      cover: true,
      "pre-harvest": true,
    },
  },
]
