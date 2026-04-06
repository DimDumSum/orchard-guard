export interface ScoutingGuide {
  when: string
  where: string
  how: string[]
  whatToLookFor: {
    category: string
    signs: string[]
  }[]
  lookAlikes?: {
    name: string
    distinction: string
  }[]
  threshold: string[]
  record: string
}

export const SCOUTING_GUIDES: Record<string, ScoutingGuide> = {
  // ============================================================
  // 7 DETAILED GUIDES (from spec — copied faithfully)
  // ============================================================

  "apple-scab": {
    when: "Every 5-7 days from green tip through June. After every rain event during primary scab season.",
    where: "Check interior canopy first — scab starts where leaves stay wet longest. Focus on: Lower canopy leaves (last to dry), Cluster leaves around fruit, Water sprouts in canopy interior",
    how: [
      "Select 10 trees spread across the block.",
      "On each tree, examine 20 leaves (10 cluster leaves + 10 shoot leaves).",
      "Check both top and bottom of leaves.",
      "Also check developing fruit after petal fall.",
    ],
    whatToLookFor: [
      {
        category: "On Leaves",
        signs: [
          "Olive-green to dark brown velvety spots",
          "Usually on upper leaf surface first",
          "Spots may be small (2-3mm) early or large (10mm+) later",
          "Severely infected leaves curl and drop",
          "Young lesions look \"oily\" and darken with age",
        ],
      },
      {
        category: "On Fruit",
        signs: [
          "Dark, scabby, rough-textured spots",
          "Early infections cause misshapen fruit",
          "Late infections cause small cosmetic spots (\"pin-point scab\")",
          "Cracking may occur at scab lesions",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Sooty blotch",
        distinction: "Smudgy, wipes off with thumb (scab doesn't)",
      },
      {
        name: "Bitter pit",
        distinction: "Sunken brown spots, usually at calyx end",
      },
      {
        name: "Spray burn",
        distinction: "Uniform bronzing, follows spray pattern",
      },
    ],
    threshold: [
      "Primary season: ANY new lesions on unsprayed leaves = confirm infection, adjust spray program",
      "1-2% of leaves with lesions = light infection",
      "5-10% = moderate — tighten spray intervals",
      ">10% = severe — scab management has failed, increase frequency and switch products",
    ],
    record:
      "Date, block, % leaves infected, % fruit infected, lesion size, which varieties affected",
  },

  "fire-blight": {
    when: "Daily during bloom if conditions are favorable. Weekly from petal fall through July. After any hail or severe wind storm.",
    where: "Start with: Most susceptible varieties (Gala, Honeycrisp, Fuji), Young vigorous trees (most susceptible), Trees near last year's infections, Perimeter rows near wild hosts (crabapples, hawthorn)",
    how: [
      "Walk every row, scanning tree tops for wilting.",
      "Look for \"shepherd's crook\" — drooping shoot tips.",
      "Check blossom clusters for blackened, water-soaked flowers.",
      "Look for bacterial ooze (amber droplets) on infected tissue.",
      "Check trunk and scaffold limbs for cankers.",
    ],
    whatToLookFor: [
      {
        category: "Blossom Blight",
        signs: [
          "Water-soaked, then brown/black blossom clusters",
          "Blossoms stay attached (don't fall off cleanly)",
          "Amber ooze droplets on infected spurs",
          "Usually appears 1-3 weeks after infection event",
        ],
      },
      {
        category: "Shoot Blight",
        signs: [
          "Young shoot tips wilt and curve into \"shepherd's crook\"",
          "Leaves turn brown/black but stay attached",
          "Rapidly progresses down the shoot — can move 15-30cm/day",
          "Dark discoloration visible under bark if you scrape",
        ],
      },
      {
        category: "Canker Blight",
        signs: [
          "Sunken, darkened areas on bark of branches/trunk",
          "Cracked bark at canker margins",
          "Amber ooze on canker surface in spring",
          "Branch dieback beyond the canker",
        ],
      },
      {
        category: "Rootstock Blight (Critical)",
        signs: [
          "Wilting of entire tree or large section",
          "Dark discoloration at graft union",
          "On M.9 and M.26 — can kill tree in one season",
          "CHECK graft unions on all dwarfing rootstocks",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Oriental fruit moth",
        distinction:
          "Shoot wilting but NO blackening, frass visible at entry point",
      },
      {
        name: "Pseudomonas",
        distinction:
          "Brown blossom clusters but lacks ooze and doesn't progress into wood as aggressively",
      },
      {
        name: "Winter injury",
        distinction: "Dead shoot tips but no shepherd's crook",
      },
    ],
    threshold: [
      "ANY active blight = take action immediately",
      "Even a single infected blossom cluster means the bacteria are active in your orchard",
      "Zero tolerance during bloom — every strike matters",
    ],
    record:
      "Date, block, type (blossom/shoot/canker/rootstock), number of strikes, tree location (tag trees), variety and rootstock affected",
  },

  "powdery-mildew": {
    when: "Weekly from tight cluster through mid-summer. Focus at pink through 3 weeks post-bloom (critical window).",
    where: "Flag shoots (white-tipped shoots from infected buds) — check these FIRST at green tip, they're primary inoculum; Susceptible varieties: Cortland, McIntosh, Idared, Jonagold; Interior canopy where air circulation is poor",
    how: [
      "At green tip: walk rows looking for flag shoots (silvery-white shoot tips emerging).",
      "Count flag shoots per 100 trees.",
      "Later: examine 20 terminal shoots per tree on 10 trees.",
      "Check top and bottom of youngest 5 leaves per shoot.",
    ],
    whatToLookFor: [
      {
        category: "Flag Shoots",
        signs: [
          "Stunted, silvery-white shoots emerging at green tip",
          "Leaves are narrow, stiff, and covered in white powder",
          "These are the PRIMARY inoculum source for the whole block",
        ],
      },
      {
        category: "Leaf Infection",
        signs: [
          "White powdery patches on leaf surface (usually underside first)",
          "Young leaves curl upward at edges",
          "Severely infected leaves become brittle and stunted",
          "Net-like russeting pattern visible on older infections",
        ],
      },
      {
        category: "Fruit Infection",
        signs: [
          "Russet netting pattern on fruit skin",
          "Rarely causes rot but significantly downgrades fruit appearance",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Spray residue",
        distinction: "Washes off, mildew doesn't",
      },
      {
        name: "Natural pubescence on young leaves",
        distinction: "Disappears as leaf matures",
      },
    ],
    threshold: [
      ">3 flag shoots per 100 trees = significant primary inoculum",
      ">10% of terminal leaves with active mildew = treat",
      "During pink-bloom: any active mildew on susceptible varieties warrants treatment",
    ],
    record:
      "Date, flag shoot count, % terminals affected, variety, severity (trace/light/moderate/severe)",
  },

  "cedar-rust": {
    when: "Weekly from green tip through 4 weeks after bloom. Check junipers in March-April for telial horns.",
    where: "Susceptible varieties: most non-resistant cultivars; Trees closest to cedar/juniper (within 3-5 km); Also check nearby ornamental crabapples",
    how: [
      "Early spring: inspect nearby junipers for orange gelatinous telial horns (look like orange tentacles on brown galls).",
      "In orchard: check upper leaf surface for yellow-orange spots.",
      "Later: check leaf undersides for cluster cups (tube-like structures).",
      "Check fruit for similar lesions.",
    ],
    whatToLookFor: [
      {
        category: "On Junipers (March-April)",
        signs: [
          "Brown woody galls (1-5cm) on branches",
          "After rain: bright orange gelatinous \"horns\" emerge from galls",
          "These release basidiospores that infect apples",
        ],
      },
      {
        category: "On Apple Leaves",
        signs: [
          "Bright yellow-orange spots on upper surface (1-2 weeks after infection)",
          "Spots enlarge and develop red border",
          "Underside: raised cluster cups (aecia) with fringed edges",
          "Tubes release spores that re-infect junipers",
        ],
      },
      {
        category: "On Apple Fruit (Quince Rust)",
        signs: [
          "Green to dark green bumpy lesions near calyx end",
          "Fruit distortion and drop possible",
          "More damaging than leaf infection",
        ],
      },
    ],
    threshold: [
      ">5% of leaves with lesions on susceptible varieties = significant, improve protection next season",
      "Rust is largely a protectant-managed disease — once you see symptoms, that infection cannot be cured",
      "Focus on prevention during infection window",
    ],
    record:
      "Date, % leaves affected, fruit symptoms, juniper gall activity observed (yes/no)",
  },

  "european-red-mite": {
    when: "Every 7-10 days from petal fall through August. Weekly during hot dry periods (populations explode).",
    where: "Interior canopy leaves; Both sides of leaves (mites feed on undersides); Check across all varieties — some more susceptible",
    how: [
      "Select 10 trees per block, scattered throughout.",
      "Pick 5 leaves per tree from mid-canopy interior.",
      "Use a hand lens (10x) to count mites per leaf.",
      "Count BOTH pest mites AND predatory mites separately.",
      "Record average per leaf.",
    ],
    whatToLookFor: [
      {
        category: "European Red Mite",
        signs: [
          "Tiny dark red mites (barely visible to naked eye)",
          "Round red eggs on bark and leaf undersides",
          "Feed on leaf cells — causes bronzing/stippling",
          "Bronzed leaves look dull, grayish-brown",
          "Severe: premature leaf drop, small pale fruit",
        ],
      },
      {
        category: "Predatory Mites (Beneficial)",
        signs: [
          "Typhlodromus pyri — slightly larger, pear-shaped, fast-moving",
          "Amblyseius fallacis — translucent to amber colored",
          "Move faster than pest mites",
          "If predators present at >1 per leaf, biological control is likely working — AVOID spraying",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Two-spotted spider mite",
        distinction:
          "Yellowish with two dark spots, makes webbing (ERM doesn't web)",
      },
      {
        name: "Apple rust mite",
        distinction:
          "Microscopic, torpedo-shaped, usually BENEFICIAL (food for predatory mites)",
      },
    ],
    threshold: [
      "Through July: >5 mites per leaf with <1 predator per leaf",
      "August: >10 mites per leaf (tolerance higher later season)",
      "If predator:pest ratio is >1:10, hold off and reassess in 5-7 days — predators may bring it under control",
      ">500 cumulative mite-days per leaf = economic damage",
    ],
    record:
      "Date, pest mites per leaf (avg of 50 leaves), predator mites per leaf, bronzing severity, recent spray history (some sprays cause mite flares)",
  },

  "codling-moth": {
    when: "Weekly trap checks from pink through September. Fruit inspections at 2-week intervals from June on.",
    where: "Pheromone traps: place at eye level in upper-third of canopy, 2-3 traps per block; Fruit checks: all varieties, focus on king fruit and upper canopy",
    how: [
      "Set pheromone traps at pink stage (before first flight).",
      "Check weekly — count and remove moths.",
      "Replace lure every 4-6 weeks.",
      "Record counts to establish biofix (first sustained catch).",
      "Check 50-100 fruit per block at 2-week intervals.",
      "Look at calyx end and sides of fruit.",
      "Cut open suspect fruit to confirm larvae.",
      "Count \"stings\" (shallow entries) and \"deep entries\" separately.",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Gray-brown moth, ~10mm, copper band at wing tip",
          "Attracted to pheromone trap — count weekly",
          "Biofix: first consistent catch (2+ moths in successive weeks)",
        ],
      },
      {
        category: "Eggs",
        signs: [
          "Tiny (1mm), flat, translucent disc on leaf or fruit surface",
          "Laid singly, usually on leaves near fruit clusters",
          "Nearly impossible to see without hand lens",
        ],
      },
      {
        category: "Larvae",
        signs: [
          "White to pinkish caterpillar with brown head",
          "Up to 15-20mm long when mature",
          "Found inside fruit, feeding toward core",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "STING: small brown spot with no frass — larva entered but didn't survive (may indicate spray is working)",
          "ENTRY: round hole with reddish-brown frass (sawdust) pushed out — active larva inside",
          "CALYX ENTRY: frass visible in calyx cavity",
          "Cut fruit open: tunnel toward core with frass-filled gallery",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Lesser appleworm",
        distinction: "Shallower, smaller tunnels, rarely reaches core",
      },
      {
        name: "Oriental fruit moth",
        distinction:
          "Similar but usually enters through shoot first (check for shoot flagging)",
      },
      {
        name: "European apple sawfly",
        distinction: "Ribbon-like scar on fruit surface",
      },
    ],
    threshold: [
      "Conventional: 5+ moths per trap per week = spray",
      "Mating disruption: 1-2 moths per trap = investigate",
      "Fruit: >0.5% entry damage = program needs adjustment",
      "ZERO tolerance for premium/direct-market fruit",
    ],
    record:
      "Weekly trap counts, biofix date, fruit entry %, sting %, products applied, DD accumulation",
  },

  "plum-curculio": {
    when: "Daily checks for 3-4 weeks starting at petal fall. Especially after warm humid evenings (>16°C nights).",
    where: "BORDER ROWS FIRST — curculio enters from woodland edges; Perimeter trees closest to hedgerows, woods, or stone walls; Drops from trees when disturbed — check early morning",
    how: [
      "At petal fall: place a white sheet under border-row trees.",
      "Sharply strike limbs with a padded stick (limb jarring).",
      "Count adults that fall onto the sheet.",
      "Check 5 trees per border row, 3-4 rows per block.",
      "Also: inspect 100 fruitlets for egg-laying scars.",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Small (4-6mm) dark brown snout beetle",
          "Rough/bumpy wing covers",
          "Plays dead when disturbed (drops and curls up)",
          "Most active on warm, calm, humid evenings",
        ],
      },
      {
        category: "Egg-Laying Scars",
        signs: [
          "Distinctive crescent or D-shaped cut in fruit skin",
          "Female cuts a flap, lays egg underneath, pushes flap back",
          "THIS IS THE KEY DIAGNOSTIC SIGN",
          "Fresh scars have clean edges; old scars have brown, corky healed edges",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Scarred, dimpled, misshapen fruit",
          "Internal feeding damage from larvae",
          "Damaged fruit often drops prematurely (June drop)",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Hail damage",
        distinction: "Random bruising, no crescent shape",
      },
      {
        name: "Tarnished plant bug",
        distinction: "Dimpling but no crescent scar",
      },
      {
        name: "Mechanical damage",
        distinction: "Bruising pattern follows limb contact",
      },
    ],
    threshold: [
      "1 adult per tapped tree on border rows = spray border rows",
      "1-2% of fruitlets with crescent scars = spray full block",
      "After 3-4 weeks post petal fall with no new scars, curculio management can cease for the season",
    ],
    record:
      "Date, adults per tree (tap method), % fruit with crescent scars, which rows/blocks, night temperature",
  },

  // ============================================================
  // REMAINING DISEASE GUIDES (14)
  // ============================================================

  "black-rot": {
    when: "Weekly from petal fall through harvest. Inspect after prolonged wet periods.",
    where: "Check mummified fruit left in tree from last season (primary inoculum source). Look at canopy interior where humidity is highest.",
    how: [
      "Remove and destroy mummified fruit from trees during dormant season.",
      "Examine leaves and fruit on 10 trees per block, focusing on mid-canopy.",
      "Check for cankers on limbs and trunk.",
    ],
    whatToLookFor: [
      {
        category: "On Leaves",
        signs: [
          "\"Frog-eye\" leaf spots — tan center with concentric rings and dark brown border",
          "Spots enlarge in warm wet weather, may coalesce",
        ],
      },
      {
        category: "On Fruit",
        signs: [
          "Brown to black rot starting at calyx end or wound site",
          "Concentric rings of dark pycnidia (tiny black dots) on rotted surface",
          "Fruit mummifies and remains attached to tree",
        ],
      },
      {
        category: "Cankers",
        signs: [
          "Reddish-brown sunken bark areas on limbs",
          "Canker margins may crack; inner bark is orange-brown",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Bitter rot",
        distinction: "V-shaped rot in cross-section; acervuli arranged in concentric rings but lighter brown",
      },
      {
        name: "White rot",
        distinction: "Rot is lighter tan, often starts at lenticel; fruit skin slips off easily",
      },
    ],
    threshold: [
      ">2% of fruit with rot symptoms = evaluate fungicide program",
      "Presence of mummies in canopy = high inoculum risk, remove immediately",
    ],
    record: "Date, block, % fruit affected, mummy count, canker locations",
  },

  "bitter-rot": {
    when: "Every 7-10 days from mid-June through harvest, especially during hot humid weather (>27°C).",
    where: "Upper canopy and sun-exposed fruit. Varieties with thin skin (Honeycrisp, Gala). Blocks with history of bitter rot.",
    how: [
      "Inspect 50 fruit per block, focusing on upper and outer canopy.",
      "Look at sun-exposed sides of fruit where temperature is highest.",
      "Check for old cankers on limbs that harbor inoculum.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Small, light-brown circular spots that expand rapidly in hot weather",
          "Sunken lesions with concentric rings of tan to pink spore masses",
          "V-shaped rot visible in cross-section (distinguishes from black rot)",
          "May produce cream to salmon-colored ooze in humid conditions",
        ],
      },
      {
        category: "On Branches",
        signs: [
          "Dead bark cankers on limbs serve as inoculum source",
          "Fire-blighted wood can harbor bitter rot fungi",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Black rot",
        distinction: "Black rot lesions are darker, pycnidia are black, rot is not V-shaped",
      },
      {
        name: "White rot",
        distinction: "Starts at lenticels, bleaches the skin, and tissue is soft and watery",
      },
    ],
    threshold: [
      "ANY fruit rot in hot weather = tighten captan/fungicide interval to 10-14 days",
      ">1% fruit rot = add Merivon or Pristine to program",
    ],
    record: "Date, block, % fruit affected, temperature conditions, variety",
  },

  "white-rot": {
    when: "Every 7-10 days from June through harvest. Risk peaks in hot weather (>27°C).",
    where: "Lower canopy fruit near soil. Fruit near cankers on scaffold limbs. Trees under drought stress.",
    how: [
      "Inspect fruit in lower canopy and near scaffold branch cankers.",
      "Examine bark on lower scaffold limbs for sunken cankers.",
      "Check 50 fruit per block across all canopy positions.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Light tan to cream-colored rot, often starting at a lenticel",
          "Skin over lesion becomes bleached and may slip off easily",
          "Soft, watery internal decay",
          "Fruit eventually shrivels to dark brown mummy",
        ],
      },
      {
        category: "On Branches",
        signs: [
          "Sunken bark cankers, often at base of dead shoots or pruning stubs",
          "Orange-brown inner bark under canker",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Bitter rot",
        distinction: "Bitter rot has V-shaped internal rot and produces concentric spore rings",
      },
    ],
    threshold: [
      ">2% fruit rot = improve canker sanitation and tighten fungicide program",
      "Presence of bark cankers = prune out and destroy infected wood",
    ],
    record: "Date, block, % fruit affected, canker count, pruning actions taken",
  },

  "sooty-blotch": {
    when: "Every 10-14 days from 3 weeks after petal fall through harvest. Risk highest in humid, poorly ventilated blocks.",
    where: "Interior and lower canopy where humidity stays high. Blocks near woods or hedgerows that restrict air movement.",
    how: [
      "Inspect 50 fruit per block, focusing on shaded interior fruit.",
      "Look at fruit surface under bright light or hand lens.",
      "Check both sooty blotch and flyspeck simultaneously — they share conditions.",
    ],
    whatToLookFor: [
      {
        category: "Sooty Blotch",
        signs: [
          "Dark olive-green to black smudgy patches on fruit surface",
          "Superficial — wipes off with thumb or cloth (does NOT penetrate skin)",
          "Colonies are interconnected, giving a sooty appearance",
        ],
      },
      {
        category: "Flyspeck (Often Co-occurring)",
        signs: [
          "Clusters of 5-50+ shiny black dots on fruit surface",
          "Also superficial — purely cosmetic",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Apple scab",
        distinction: "Scab is rough-textured and cannot be wiped off; penetrates fruit skin",
      },
    ],
    threshold: [
      "Any sooty blotch/flyspeck on fruit = cosmetic downgrade",
      ">200 hours of cumulative leaf wetness since last effective fungicide = apply protectant",
    ],
    record: "Date, block, % fruit with symptoms, hours since last captan spray",
  },

  "brooks-spot": {
    when: "Inspect fruit from 3-4 weeks after petal fall through harvest.",
    where: "Varieties most susceptible: Golden Delicious, Fuji. Blocks with heavy inoculum from prior seasons.",
    how: [
      "Examine developing fruit for subtle sunken spots starting mid-June.",
      "Check 50 fruit per block at 2-week intervals.",
      "Cut suspect fruit open to confirm internal discoloration.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Small (5-10mm) dark green, slightly sunken spots on fruit surface",
          "Spots become more obvious as fruit matures — purple-brown with green halo",
          "Brown, spongy tissue beneath the spot when cut open",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Bitter pit",
        distinction: "Bitter pit is a physiological disorder appearing near calyx, not fungal",
      },
      {
        name: "Black rot",
        distinction: "Black rot develops concentric pycnidia rings and grows larger",
      },
    ],
    threshold: [
      ">1% of fruit with symptoms = review captan program timing",
      "Early-season captan coverage is key — infections occur near petal fall",
    ],
    record: "Date, block, % fruit affected, variety",
  },

  "bulls-eye-rot": {
    when: "Pre-harvest inspections in September-October. Also monitor in cold storage — symptoms often appear post-harvest.",
    where: "Fruit from blocks near hedgerows or with poor air circulation. Late-harvest varieties (Fuji, Granny Smith, Pink Lady).",
    how: [
      "Inspect fruit at harvest for any suspicious spots around lenticels.",
      "Monitor stored fruit weekly for expanding lesions.",
      "Check for cankers on dead wood and pruning stubs that harbor inoculum.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Flat to slightly sunken, light brown to tan circular lesions",
          "Concentric rings create a \"bull's-eye\" pattern",
          "Lesions centered on lenticels",
          "Firm rot — flesh is brown but not soft or watery",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Bitter rot",
        distinction: "Bitter rot is softer, V-shaped in cross-section, and develops faster in warm weather",
      },
    ],
    threshold: [
      ">1% of stored fruit developing bull's-eye rot = review pre-harvest fungicide timing",
      "Ensure last captan application is within 14 days of harvest",
    ],
    record: "Date, block, % fruit affected, days in storage, variety",
  },

  "alternaria": {
    when: "Inspect from mid-summer through post-harvest. Monitor stored fruit for developing lesions.",
    where: "Fruit with open calyx (Gala, Red Delicious). Bruised or damaged fruit in storage. Trees under stress.",
    how: [
      "Check calyx cavity of susceptible varieties at harvest.",
      "Inspect stored fruit for expanding dark lesions, especially around wounds.",
      "Examine 50 fruit per block pre-harvest.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Dark brown to black dry rot, often starting at calyx end or stem bowl",
          "Develops a moldy core — dark fungal growth visible inside calyx cavity",
          "In storage, lesions expand as firm, dark, dry rot",
        ],
      },
      {
        category: "On Leaves",
        signs: [
          "Small brown leaf spots, usually on older leaves",
          "Less common than fruit infection in apples",
        ],
      },
    ],
    threshold: [
      ">2% moldy core at harvest = evaluate captan program and calyx sprays",
      "Avoid harvesting fruit with visible calyx-end symptoms",
    ],
    record: "Date, block, % fruit with moldy core, variety, storage conditions",
  },

  "nectria-canker": {
    when: "Scout during dormant season (late fall through early spring) and after leaf drop.",
    where: "Pruning wounds, branch stubs, and sites of previous freeze injury. Young trees are especially vulnerable.",
    how: [
      "Walk rows during dormant pruning, inspecting all pruning wounds and branch crotches.",
      "Look for cankers on scaffold limbs and trunk.",
      "Flag infected trees for follow-up pruning.",
    ],
    whatToLookFor: [
      {
        category: "Cankers",
        signs: [
          "Sunken, target-shaped cankers with concentric rings of callus tissue",
          "Bright red-orange fruiting bodies (sporodochia) on canker surface in spring",
          "Dark, cracked bark at canker center",
          "Branch dieback and girdling beyond the canker",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Fire blight canker",
        distinction: "Fire blight cankers are darker, may ooze amber, and progress more rapidly in growing season",
      },
    ],
    threshold: [
      "Any canker found = prune at least 15cm below canker margin during dry weather",
      "Multiple cankers on young trees = high risk, evaluate block sanitation",
    ],
    record: "Date, block, tree location, canker size, pruning action taken",
  },

  "post-harvest": {
    when: "Monitor stored fruit weekly. Inspect at packing for developing rots.",
    where: "All varieties in cold storage. Priority on bins with known field infections. Bruised or mechanically damaged fruit.",
    how: [
      "Inspect a sample of 100 fruit per lot at packing.",
      "Check for developing rots around wounds, calyx, and lenticels.",
      "Monitor storage temperature and atmosphere conditions.",
    ],
    whatToLookFor: [
      {
        category: "Common Post-Harvest Rots",
        signs: [
          "Blue mold (Penicillium) — soft, light brown rot with blue-green spore mass at center",
          "Gray mold (Botrytis) — soft brown rot with gray fuzzy spore mass",
          "Bull's-eye rot — firm, concentric-ring lesions on lenticels",
          "Mucor rot — rapid soft rot, often at wounds, with whisker-like mold",
        ],
      },
    ],
    threshold: [
      ">2% rot in stored lots = investigate source (field infection vs. handling damage)",
      "Maintain storage at 0-1°C with proper atmosphere to slow rot development",
    ],
    record: "Date, lot/bin ID, rot type, % affected, storage temperature, days in storage",
  },

  "apple-mosaic": {
    when: "Scout in spring when leaves are expanding (May-June). Symptoms are most visible on young growth.",
    where: "Check all newly planted trees. Look across all varieties — virus is systemic and spread by propagation material.",
    how: [
      "Walk rows examining expanding shoot leaves for color patterns.",
      "Tag symptomatic trees for monitoring or removal.",
    ],
    whatToLookFor: [
      {
        category: "On Leaves",
        signs: [
          "Irregular cream to bright yellow patches or bands on leaves",
          "Symptoms strongest in spring, may fade by mid-summer",
          "Infected trees may show reduced vigor over years",
        ],
      },
    ],
    threshold: [
      "No chemical treatment available — virus is systemic",
      "Remove severely affected trees if vigor is significantly reduced",
      "Use certified virus-free nursery stock for new plantings",
    ],
    record: "Date, block, tree locations, severity of leaf symptoms, tree vigor rating",
  },

  "apple-proliferation": {
    when: "Scout from June through September. Watch for abnormal growth in mid-summer.",
    where: "All varieties. Check trees near hedgerows where leafhopper vectors (Cacopsylla) are present.",
    how: [
      "Walk rows looking for witches' brooms and abnormal shoot proliferation.",
      "Check fruit size and color at harvest — infected trees produce small, poorly colored fruit.",
    ],
    whatToLookFor: [
      {
        category: "Growth Abnormalities",
        signs: [
          "Witches' brooms — dense clusters of thin upright shoots",
          "Enlarged stipules on leaves",
          "Premature fall reddening of foliage",
          "Undersized, poorly colored fruit that ripens early",
        ],
      },
    ],
    threshold: [
      "No chemical cure — phytoplasma is systemic",
      "Remove confirmed infected trees to reduce spread",
      "Manage leafhopper vectors to slow transmission",
    ],
    record: "Date, block, tree locations, symptoms observed, leafhopper presence",
  },

  "frost-risk": {
    when: "Monitor daily from silver tip through fruit set when frost is forecast. Critical at bloom stage.",
    where: "Low-lying areas and frost pockets in the orchard. Blocks on north-facing slopes. Areas without wind machines or overhead irrigation.",
    how: [
      "Check weather forecast daily for overnight lows during bloom.",
      "Place minimum-reading thermometers at bud height in vulnerable blocks.",
      "After a frost event, cut open buds/flowers to check for browning of pistil (king bloom is most sensitive).",
    ],
    whatToLookFor: [
      {
        category: "Frost Damage on Flowers/Fruitlets",
        signs: [
          "Browning or blackening of pistil (center of flower) — indicates kill",
          "Water-soaked, then brown petals and receptacle",
          "Fruitlets with russeted bands or misshapen growth from partial freeze",
          "King bloom loss is most damaging economically",
        ],
      },
    ],
    threshold: [
      "Critical temperatures vary by stage: tight cluster -3.9°C, pink -2.8°C, bloom -2.2°C, post-bloom -1.7°C",
      "Any forecast at or below critical temp = activate frost protection",
    ],
    record: "Date, minimum temperature, stage, % blossoms with browning, frost protection method used",
  },

  "bitter-pit": {
    when: "Inspect fruit from mid-July through harvest and in storage. Symptoms can appear post-harvest.",
    where: "Large fruit on lightly cropped trees. Young vigorous trees. Varieties prone: Honeycrisp, Spy, Cortland, Mutsu.",
    how: [
      "Check 50 fruit per block starting 6-8 weeks before harvest.",
      "Focus on large fruit, especially on lightly cropped limbs.",
      "Cut suspect fruit to check for sub-surface browning.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Small (2-4mm) sunken, dark brown spots — usually concentrated at calyx end",
          "Brown, dry, corky tissue just under the skin when cut open",
          "Often develops or worsens in storage",
          "Caused by calcium deficiency in fruit tissue, not a pathogen",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Apple scab",
        distinction: "Scab lesions are rough/velvety and not sunken; occur anywhere on fruit",
      },
      {
        name: "Brooks spot",
        distinction: "Brooks spot has green halo, is fungal, and is distributed randomly on fruit",
      },
    ],
    threshold: [
      ">5% of fruit with bitter pit at harvest = increase calcium spray program next season",
      "Begin foliar calcium at petal fall, 4-6 applications through summer",
      "Manage crop load — thin aggressively to reduce oversized fruit",
    ],
    record: "Date, block, % fruit affected, fruit size, crop load, calcium spray history",
  },

  "phytophthora": {
    when: "Scout in spring after snowmelt and after prolonged wet periods. Check during growing season if trees show sudden decline.",
    where: "Low-lying wet areas with poor drainage. Trees on susceptible rootstocks (MM.106, M.26). Replant sites.",
    how: [
      "Check crown and root collar area for dark, water-soaked bark.",
      "Scrape bark at soil line — healthy tissue is white/green, infected is reddish-brown.",
      "Look for trees showing sudden wilting or collapse in wet areas.",
    ],
    whatToLookFor: [
      {
        category: "Crown and Root Symptoms",
        signs: [
          "Dark, water-soaked bark at crown/soil line",
          "Reddish-brown discoloration of inner bark when scraped",
          "Girdling at crown causes sudden wilting of entire tree",
          "Canopy symptoms: small pale leaves, poor shoot growth, early fall color",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Fire blight rootstock infection",
        distinction: "Fire blight moves down from above-ground strikes; phytophthora moves up from soil",
      },
    ],
    threshold: [
      "Any crown rot = treat with phosphorous acid (Aliette, Phostrol) as drench",
      "Improve drainage in affected areas; avoid over-irrigation",
    ],
    record: "Date, block, tree locations, rootstock, drainage conditions, treatment applied",
  },

  "replant-disease": {
    when: "Monitor newly planted trees in their first 2-3 growing seasons at a replant site.",
    where: "Any block where old apple trees were removed and new trees planted in the same soil. Most severe in sandy soils.",
    how: [
      "Compare growth of new plantings in replant soil vs. fumigated or virgin soil if available.",
      "Measure shoot growth and trunk diameter on 20 trees per block.",
      "Dig up a sacrificial tree to inspect root health if decline is severe.",
    ],
    whatToLookFor: [
      {
        category: "Tree Growth Symptoms",
        signs: [
          "Stunted shoot growth compared to trees on non-replant soil",
          "Small, pale leaves and thin canopy development",
          "Root system is poorly developed with few feeder roots",
          "Roots may show dark, discolored cortex (fungal complex)",
        ],
      },
    ],
    threshold: [
      ">30% reduction in shoot growth vs. control trees = significant replant disease",
      "Pre-plant fumigation or soil amendment is the primary management tool",
    ],
    record: "Date, block, avg shoot growth (cm), trunk diameter, root health rating, soil treatment history",
  },

  "sunscald": {
    when: "Inspect trunks in late winter (February-March) and fruit in August-September during hot sunny periods.",
    where: "Young trees with thin bark on southwest-facing trunk sides. Fruit on sun-exposed upper canopy.",
    how: [
      "Check southwest side of trunks on young trees for bark cracking or discoloration.",
      "Inspect sun-exposed fruit for bleached or soft spots during heat waves.",
    ],
    whatToLookFor: [
      {
        category: "On Trunk (Winter Sunscald)",
        signs: [
          "Vertical cracks or sunken bark on southwest side of trunk",
          "Bark splitting and peeling, exposing inner wood",
          "Caused by freeze-thaw cycles: bark warms in winter sun, then freezes rapidly at night",
        ],
      },
      {
        category: "On Fruit (Summer Sunscald)",
        signs: [
          "Bleached, white to yellow patches on sun-exposed side of fruit",
          "Tissue may become soft and brown (necrotic sunburn)",
        ],
      },
    ],
    threshold: [
      "Paint trunks of young trees white (diluted latex paint) to prevent winter sunscald",
      "Consider overhead evaporative cooling if fruit sunburn exceeds 5%",
    ],
    record: "Date, block, affected trees/fruit count, trunk protection in place (yes/no)",
  },

  "frost-ring": {
    when: "Inspect fruitlets 2-4 weeks after a frost event near bloom or petal fall.",
    where: "Blocks that experienced frost during bloom or early fruit set. Low-lying frost-prone areas.",
    how: [
      "Examine developing fruitlets for russeted bands or surface cracking.",
      "Compare fruit from frost-damaged blocks vs. unaffected blocks.",
    ],
    whatToLookFor: [
      {
        category: "On Fruit",
        signs: [
          "Russeted band or ring around the fruit — indicates tissue damage at time of frost",
          "Misshapen or lopsided fruit from uneven cell damage",
          "Surface cracking at the russeted zone as fruit expands",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Herbicide drift (growth regulator type)",
        distinction: "Herbicide causes uniform russeting or lobing, not banded patterns",
      },
    ],
    threshold: [
      "Frost rings are cosmetic — assess severity to determine if thinning affected fruit is worthwhile",
      ">20% of fruit with severe frost ring = consider aggressive thinning to improve pack-out",
    ],
    record: "Date of frost event, date inspected, % fruit affected, severity, block",
  },

  "water-core": {
    when: "Monitor from 4-6 weeks before harvest through harvest. Check at packing.",
    where: "Fuji, Delicious, and Jonathan are most susceptible. Fruit on heavily cropped trees or with delayed harvest.",
    how: [
      "Cut open 10-20 fruit per block starting 4 weeks pre-harvest.",
      "Hold cut fruit up to light — water-core tissue appears glassy and translucent.",
    ],
    whatToLookFor: [
      {
        category: "Internal Symptoms",
        signs: [
          "Glassy, translucent, water-soaked tissue around the core and vascular bundles",
          "In severe cases, extends to outer cortex — visible externally as glassy patches",
          "Affected tissue breaks down in storage, leading to internal browning",
        ],
      },
    ],
    threshold: [
      "Mild water-core often dissipates in storage — harvest on time",
      "Severe water-core = harvest immediately and sell quickly (do not store long-term)",
      ">10% of fruit with severe water-core = adjust harvest timing for that variety",
    ],
    record: "Date, block, % fruit affected, severity (mild/moderate/severe), variety, harvest date relative to maturity",
  },

  "sunburn": {
    when: "Monitor fruit weekly during July-August heat waves. Inspect when air temperature exceeds 32°C.",
    where: "Sun-exposed fruit on southwest side of tree. Upper and outer canopy. Light-skinned varieties (Golden Delicious, Gala).",
    how: [
      "Walk rows on south/west sides during or after heat events.",
      "Check fruit surface temperature with IR thermometer if available.",
      "Inspect 50 fruit per block on exposed canopy positions.",
    ],
    whatToLookFor: [
      {
        category: "Sunburn Types",
        signs: [
          "Sunburn browning — yellow or brown discoloration on exposed side (most common)",
          "Sunburn necrosis — dark brown to black dead patch (fruit surface >52°C)",
          "Photo-oxidative sunburn — white bleaching when shaded fruit is suddenly exposed (e.g., after summer pruning)",
        ],
      },
    ],
    threshold: [
      ">5% fruit with sunburn = consider evaporative cooling or kaolin clay (Surround)",
      "Avoid summer pruning that suddenly exposes shaded fruit to direct sun",
    ],
    record: "Date, block, % fruit affected, max air temperature, variety, sunburn type",
  },

  // ============================================================
  // REMAINING PEST GUIDES (26 + voles, deer, dagger-nematode)
  // ============================================================

  "oriental-fruit-moth": {
    when: "Weekly trap checks from bloom through September. Inspect shoot tips from petal fall on.",
    where: "Pheromone traps in upper canopy, 2 per block. Check terminal shoots for flagging, especially on young trees.",
    how: [
      "Set pheromone traps at bloom — check and record weekly.",
      "Inspect 20 terminal shoots per tree on 10 trees for wilting/flagging.",
      "Later in season, check fruit for entry holes (similar to codling moth).",
    ],
    whatToLookFor: [
      {
        category: "Shoot Damage (Early Generations)",
        signs: [
          "Wilting terminal shoots — tip dies and may show frass at entry point",
          "Larva tunnels down inside shoot, causing flagging",
          "No blackening of tissue (distinguishes from fire blight)",
        ],
      },
      {
        category: "Fruit Damage (Later Generations)",
        signs: [
          "Entry holes on fruit, similar to codling moth but larvae usually stay near surface",
          "Shallow, irregular tunnels with frass — rarely reaches core",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Codling moth",
        distinction: "Codling moth larvae tunnel deep to core; OFM larvae stay shallow and tunnel irregularly",
      },
      {
        name: "Fire blight shoot blight",
        distinction: "Fire blight blackens tissue and produces ooze; OFM shows frass at entry",
      },
    ],
    threshold: [
      "10+ moths per trap per week = apply insecticide targeting egg hatch",
      ">3% shoot flagging = treat",
    ],
    record: "Weekly trap counts, biofix date, % shoot flagging, fruit entry %, DD accumulation",
  },

  "leafroller": {
    when: "Scout at pink/bloom for overwintering larvae, then weekly through summer for subsequent generations.",
    where: "Check rolled or webbed leaves in terminal shoots and fruit clusters. All varieties.",
    how: [
      "At pink: unroll webbed leaf clusters on 10 trees and look for small green larvae.",
      "In summer, inspect fruit touching rolled leaves — larvae feed on fruit surface.",
      "Use pheromone traps for obliquebanded leafroller (OBLR) starting late June.",
    ],
    whatToLookFor: [
      {
        category: "Larval Damage",
        signs: [
          "Leaves rolled or tied together with silk webbing",
          "Small (10-20mm) green caterpillars that wriggle backward vigorously when disturbed",
          "Surface feeding on fruit where it contacts a rolled leaf — shallow irregular scars",
        ],
      },
      {
        category: "Adult Moths",
        signs: [
          "OBLR: tan/brown moths with darker band across wings, ~12mm",
          "Attracted to pheromone traps in late June (first summer flight)",
        ],
      },
    ],
    threshold: [
      "Spring (overwintering): >3% of fruit clusters with live larvae = spray at pink-petal fall",
      "Summer (OBLR): 10+ moths/trap/week or >5% of fruit with feeding damage = treat",
    ],
    record: "Date, % clusters infested (spring), trap counts (summer), % fruit damaged, products applied",
  },

  "tentiform-leafminer": {
    when: "Set traps at tight cluster. Scout leaf mines from petal fall through August.",
    where: "Lower and interior canopy leaves. All varieties. Blocks with history of leafminer pressure.",
    how: [
      "Use pheromone traps at tight cluster to monitor first flight.",
      "After petal fall, examine undersides of 100 leaves per block for mines.",
      "Distinguish sap-feeding mines (early instars) from tissue-feeding mines (late instars).",
    ],
    whatToLookFor: [
      {
        category: "Leaf Mines",
        signs: [
          "Tiny serpentine tracks on leaf underside (early sap-feeding stage)",
          "Round, tent-like blister mines on underside (tissue-feeding stage)",
          "Hold leaf to light — larva visible inside as dark speck",
          "Heavily mined leaves reduce photosynthesis and fruit size",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Apple leaf midge",
        distinction: "Midge causes leaf rolling/curling, not blister-type mines",
      },
    ],
    threshold: [
      ">1 tissue-feeding mine per leaf (average) = consider treatment",
      "Healthy trees tolerate moderate mining; avoid sprays that kill parasitoid wasps",
    ],
    record: "Date, mines per leaf (sap-feeding vs. tissue-feeding), trap counts, parasitism rate if observed",
  },

  "lesser-appleworm": {
    when: "Set traps at pink. Scout fruit from July through harvest.",
    where: "Pheromone traps in upper canopy. Inspect fruit especially near calyx end.",
    how: [
      "Place pheromone traps at pink and check weekly.",
      "Examine 50-100 fruit per block for entry holes near calyx.",
      "Cut suspect fruit — lesser appleworm tunnels stay shallow.",
    ],
    whatToLookFor: [
      {
        category: "Fruit Damage",
        signs: [
          "Small entry holes, usually at calyx end",
          "Shallow, meandering tunnels in outer flesh — rarely reaches core",
          "Frass is fine and reddish-brown",
          "Smaller larva than codling moth (max ~10mm)",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Codling moth",
        distinction: "Codling moth tunnels straight to core; lesser appleworm stays shallow",
      },
    ],
    threshold: [
      "5+ moths per trap per week = monitor fruit closely",
      ">1% fruit damage = adjust spray timing — usually controlled by codling moth program",
    ],
    record: "Weekly trap counts, % fruit with entry holes, depth of tunneling",
  },

  "eyespot-bud-moth": {
    when: "Scout from tight cluster through bloom for overwintering larvae. Trap adults in June-July.",
    where: "Check bud clusters and developing leaves on terminal shoots. More common in untreated or organic blocks.",
    how: [
      "At tight cluster, examine 100 bud clusters for small larvae in rolled leaves.",
      "Check for characteristic feeding holes in expanding leaves.",
    ],
    whatToLookFor: [
      {
        category: "Larval Feeding",
        signs: [
          "Small brown larvae in rolled or webbed bud clusters",
          "Characteristic round holes chewed in expanding leaves",
          "Damaged buds may fail to develop properly",
        ],
      },
      {
        category: "Adults",
        signs: [
          "Small gray-brown moth (~8mm) with pale eyespot on each forewing",
          "Active in June-July evenings",
        ],
      },
    ],
    threshold: [
      ">5% of bud clusters with live larvae at tight cluster = treat",
      "Usually controlled by standard petal-fall insecticide program",
    ],
    record: "Date, % clusters infested, larval counts, stage of crop",
  },

  "winter-moth": {
    when: "Scout from bud swell through bloom (March-May). Trap males in November-December.",
    where: "Check buds and blossom clusters for small green inchworm larvae. Blocks near deciduous woodlands.",
    how: [
      "Set sticky-band traps on trunks in November to catch wingless females climbing to lay eggs.",
      "At bud swell, tap branches over a beating tray and count larvae.",
      "Inspect 50 bud clusters for feeding damage and frass.",
    ],
    whatToLookFor: [
      {
        category: "Larvae",
        signs: [
          "Small (10-15mm) pale green inchworm caterpillars with white lateral stripes",
          "Feed inside buds before they open, then on blossoms and leaves",
          "Heavy feeding can destroy entire blossom clusters",
        ],
      },
      {
        category: "Adults",
        signs: [
          "Males: pale tan moths flying in late fall (November-December)",
          "Females: wingless, climb tree trunks to lay eggs",
        ],
      },
    ],
    threshold: [
      ">2-3 larvae per bud cluster at tight cluster = treat with B.t. before bloom",
      "Sticky trunk bands in November can significantly reduce egg laying",
    ],
    record: "Date, larvae per cluster, % clusters damaged, band catch counts (November)",
  },

  "clearwing-moth": {
    when: "Set pheromone traps in late May. Scout for larval damage from June through August.",
    where: "Check graft unions, burr knots, and pruning wounds on trunks and scaffold limbs. Young trees on dwarfing rootstock.",
    how: [
      "Set pheromone traps in late May to detect adult flight.",
      "Inspect trunk and graft union area for frass and sawdust-like excrement.",
      "Probe burr knots with a wire to check for larval tunneling.",
    ],
    whatToLookFor: [
      {
        category: "Larval Damage",
        signs: [
          "Reddish-brown frass at graft union, burr knots, or wound sites",
          "Bark swelling or cracking around entry points",
          "Weakened trees may lean or break at damaged graft union",
        ],
      },
      {
        category: "Adults",
        signs: [
          "Wasp-like moth with clear wings and dark body, ~15-20mm",
          "Day-flying — can be seen hovering near trunk",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Dogwood borer",
        distinction: "Very similar damage — often co-occurs; dogwood borer is slightly smaller",
      },
    ],
    threshold: [
      "Any frass at graft union or burr knots on dwarfing rootstock = investigate and treat",
      "Apply trunk sprays at peak flight (typically June-July based on trap catches)",
    ],
    record: "Date, trap counts, trees with frass, rootstock type, trunk spray applied",
  },

  "dogwood-borer": {
    when: "Scout from May through August. Set pheromone traps in late May.",
    where: "Graft unions and burr knots — especially on M.9, M.26, and other dwarfing rootstocks. Young plantings.",
    how: [
      "Inspect graft unions and burr knots on 20+ trees per block for frass.",
      "Set pheromone traps in late May — check weekly.",
      "Probe frass sites to confirm active larvae.",
    ],
    whatToLookFor: [
      {
        category: "Larval Damage",
        signs: [
          "Sawdust-like frass pushed out from burr knots or graft union",
          "Bark cracking and swelling at entry sites",
          "Girdling damage can kill young trees on dwarfing rootstock",
          "White larvae (~15mm) with brown head found under bark",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Clearwing moth (apple clearwing or lesser peachtree borer)",
        distinction: "Very similar damage pattern — management is the same; confirmed by pheromone trap species",
      },
    ],
    threshold: [
      "Any active boring at graft union = treat immediately to prevent girdling",
      "Maintain weed-free strip under trees — grass and weeds attract egg-laying females",
    ],
    record: "Date, trap counts, trees with frass, rootstock, damage severity",
  },

  "rosy-apple-aphid": {
    when: "Scout weekly from green tip through petal fall (critical period). Check again in late June if colonies persist.",
    where: "Check leaf undersides on cluster leaves and water sprouts. All varieties but especially susceptible: Cortland, Idared, Rome.",
    how: [
      "At green tip, examine 100 bud clusters per block for early aphid colonies.",
      "Flip leaves over — aphids cluster on undersides.",
      "Look for curled, distorted leaves as indicator of infestation.",
    ],
    whatToLookFor: [
      {
        category: "Aphids and Damage",
        signs: [
          "Pink-purple to rosy-gray aphids clustered on leaf undersides",
          "Severe leaf curling and distortion — leaves fold tightly over colonies",
          "Honeydew (sticky residue) on leaves below colonies",
          "Fruit clusters on infested spurs produce stunted, misshapen, \"rosy-apple\" fruit",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Green apple aphid",
        distinction: "Green aphids cause less leaf curling and do not deform fruit",
      },
    ],
    threshold: [
      ">10% of clusters infested at pink = treat before bloom (once leaves curl, sprays can't reach aphids)",
      "After petal fall, curled leaves protect aphids from contact sprays — systemic products needed",
    ],
    record: "Date, % clusters infested, % fruit deformed, product applied, beneficial insects observed",
  },

  "green-apple-aphid": {
    when: "Scout from green tip through August. Peak populations in mid-summer.",
    where: "Terminal shoot tips and water sprouts. Young vigorous trees. Undersides of leaves.",
    how: [
      "Examine 20 terminal shoots per tree on 10 trees.",
      "Check for aphid colonies on youngest expanding leaves.",
      "Note presence of natural enemies (lady beetles, syrphid fly larvae, lacewings).",
    ],
    whatToLookFor: [
      {
        category: "Aphids and Damage",
        signs: [
          "Small bright green aphids on shoot tips and young leaf undersides",
          "Leaves may curl slightly but less severe than rosy apple aphid",
          "Heavy honeydew deposits attract sooty mold growth on fruit",
          "Large populations coat fruit with honeydew, downgrading pack-out",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Rosy apple aphid",
        distinction: "Rosy aphid is pinkish-gray and causes much more severe leaf curling and fruit deformity",
      },
    ],
    threshold: [
      ">50 aphids per terminal shoot with few predators = consider treatment",
      "If natural enemies are abundant (lady beetles, syrphids), allow biological control to work",
    ],
    record: "Date, aphids per terminal, predators per terminal, honeydew on fruit (%), product applied",
  },

  "woolly-apple-aphid": {
    when: "Scout from petal fall through fall. Colonies most visible mid-summer.",
    where: "Pruning wounds, root suckers, and aerial burr knots on trunk and scaffold limbs. Also check roots if trees decline.",
    how: [
      "Walk rows looking for white cottony/waxy masses on bark, pruning wounds, and branch axils.",
      "Check root collar and exposed roots for waxy colonies.",
      "Probe colonies to confirm live aphids beneath the wax.",
    ],
    whatToLookFor: [
      {
        category: "Aerial Colonies",
        signs: [
          "White, cotton-like waxy masses on bark at wounds, pruning cuts, or branch crotches",
          "Purple-brown aphids beneath the waxy covering",
          "Gall-like swellings develop on twigs at feeding sites",
        ],
      },
      {
        category: "Root Colonies",
        signs: [
          "White waxy masses on roots and root collar",
          "Knotty galls on roots reduce water and nutrient uptake",
          "Declining tree vigor if root infestation is severe",
        ],
      },
    ],
    threshold: [
      ">10% of trees with active aerial colonies = treat with systemic insecticide",
      "Parasitoid wasp (Aphelinus mali) is an effective biological control — check for parasitized (black, swollen) aphids before spraying",
    ],
    record: "Date, % trees with colonies, colony locations (aerial/root), parasitism observed",
  },

  "tarnished-plant-bug": {
    when: "Scout from tight cluster through 3 weeks after petal fall. Most damaging during bloom.",
    where: "Border rows near alfalfa, clover, or weedy areas. Check blossom clusters and developing fruitlets.",
    how: [
      "At bloom: tap blossom clusters over a white tray and count adults.",
      "After petal fall: inspect 100 fruitlets for dimpling damage.",
      "Monitor adjacent fields — mowing of alfalfa or clover drives adults into orchard.",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Flattened, oval, 5-6mm bug; mottled brown, green, and yellow",
          "Fast-moving — drops or flies when disturbed",
          "Feeds by inserting piercing-sucking mouthpart into flowers and fruitlets",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Dimpled, cat-faced fruit at harvest from early feeding injury",
          "Sunken, corky dimples where cells were killed by feeding",
          "Damage at bloom causes worst deformity",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Plum curculio",
        distinction: "Curculio leaves crescent-shaped egg-laying scars; TPB causes broader dimpling",
      },
    ],
    threshold: [
      ">4 adults per 25 tapped clusters = treat",
      "Avoid mowing adjacent weedy areas during bloom — delays migration into orchard",
    ],
    record: "Date, adults per tapped cluster, % fruit dimpled, proximity to weedy/alfalfa areas",
  },

  "apple-brown-bug": {
    when: "Scout at pink through petal fall. Active only in early spring.",
    where: "Check developing bud clusters and expanding leaves. More common in blocks near grassy or weedy areas.",
    how: [
      "At pink, examine bud clusters for small brown nymphs feeding on expanding leaves and flowers.",
      "Tap branches over a white tray to count bugs.",
    ],
    whatToLookFor: [
      {
        category: "Nymphs and Damage",
        signs: [
          "Small (3-4mm) flattened brown bugs in bud clusters",
          "Feeding causes tiny brown spots on expanding leaves and fruitlets",
          "Fruit damage appears as russeted dimples at harvest",
        ],
      },
    ],
    threshold: [
      ">5 nymphs per cluster at pink-bloom = consider treatment",
      "Often controlled by standard pre-bloom insecticide program",
    ],
    record: "Date, nymphs per cluster, % clusters infested, product applied",
  },

  "mullein-bug": {
    when: "Scout at tight cluster through bloom for nymphs. Adults present in June-July.",
    where: "Check blossom clusters and developing fruitlets. Also look on mullein plants near orchard (overwintering host).",
    how: [
      "At tight cluster, examine blossom clusters for small green nymphs.",
      "After petal fall, inspect fruitlets for feeding punctures.",
      "Note: mullein bug is also a predator of aphids and mites — assess net impact before treating.",
    ],
    whatToLookFor: [
      {
        category: "Nymphs and Adults",
        signs: [
          "Nymphs: small (3-5mm), pale green, in bud clusters",
          "Adults: 5-6mm, green to brownish, active fliers",
          "Feeds on both pests (aphids, mites) and plant tissue",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Small, dark feeding punctures on developing fruitlets",
          "At harvest, these appear as raised corky bumps or dimples",
        ],
      },
    ],
    threshold: [
      ">2 nymphs per cluster at tight cluster to bloom = treat if fruit damage history is significant",
      "Balance: mullein bug is also beneficial — it eats pest mites and aphids",
    ],
    record: "Date, nymphs per cluster, fruit damage at harvest (%), aphid/mite populations",
  },

  "san-jose-scale": {
    when: "Scout during dormant season for overwintering scales. Check crawler emergence in late May-June.",
    where: "Bark of trunk and scaffold limbs, especially on south-facing sides. Check fruit at harvest for scale spots.",
    how: [
      "During dormant pruning, examine bark for gray, circular, crusty scale covers (2mm).",
      "In June, wrap branches with double-sided tape to detect crawler emergence.",
      "At harvest, check fruit for red-haloed spots indicating scale feeding.",
    ],
    whatToLookFor: [
      {
        category: "On Bark",
        signs: [
          "Tiny (1-2mm) circular gray scale covers, often in clusters",
          "Heavy infestations create a crusty, rough bark texture",
          "Red-purple discoloration of bark beneath scales",
        ],
      },
      {
        category: "On Fruit",
        signs: [
          "Small red-purple halos (\"measles spots\") on fruit where crawlers settled and fed",
          "Multiple spots downgrade fruit significantly",
        ],
      },
    ],
    threshold: [
      "Any live scale on fruit = treat at crawler emergence (typically late May to June)",
      "Apply dormant oil at silver tip to suppress overwintering population",
    ],
    record: "Date, scale density on wood (light/moderate/heavy), crawler emergence date, % fruit with spots",
  },

  "european-fruit-scale": {
    when: "Scout during dormant season and at crawler emergence in June.",
    where: "Bark of twigs and small branches. Can also infest fruit. Check shaded interior canopy.",
    how: [
      "Examine twigs during dormant pruning for elongated (2-3mm) brown scale covers.",
      "Check for crawler activity in June — tiny yellow crawlers visible with hand lens.",
    ],
    whatToLookFor: [
      {
        category: "On Bark",
        signs: [
          "Elongated (mussel-shaped), brown scale covers on twigs and small branches",
          "Heavy infestations reduce twig vigor and can cause branch dieback",
        ],
      },
      {
        category: "On Fruit",
        signs: [
          "Red spots around scale feeding sites on fruit",
          "Less common than San Jose scale fruit damage",
        ],
      },
    ],
    threshold: [
      "Heavy twig infestations with dieback = apply dormant oil",
      "Usually a secondary pest — managed by San Jose scale program",
    ],
    record: "Date, scale density on twigs, crawler emergence observed, dormant oil applied (yes/no)",
  },

  "brown-marmorated-stink-bug": {
    when: "Scout from July through harvest. Monitor traps from June on. Watch for mass entry from woods in late summer.",
    where: "Border rows near woods, buildings, or hedgerows (BMSB overwinters in structures). All fruit in exposed positions.",
    how: [
      "Deploy pyramid or pheromone traps near woods edge in June.",
      "Walk border rows weekly from July, checking fruit for feeding damage.",
      "Inspect 50 fruit per border row for corky, dimpled spots.",
    ],
    whatToLookFor: [
      {
        category: "Adults and Nymphs",
        signs: [
          "Shield-shaped brown bug, ~17mm, with alternating light/dark bands on antennae and abdomen edge",
          "Nymphs are smaller with red and black coloring in early instars",
          "Strong odor when disturbed",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Sunken, corky, cat-faced dimples on fruit surface from feeding",
          "Brown spongy tissue beneath dimple when cut open",
          "Can damage fruit at any time from June through harvest",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Native brown stink bug",
        distinction: "Native species lacks the alternating light/dark bands on antenna segments",
      },
    ],
    threshold: [
      "Any feeding damage on fruit in border rows = apply perimeter sprays",
      "BMSB is highly mobile — border sprays may need to be repeated every 5-7 days during peak migration",
    ],
    record: "Date, trap counts, % fruit damaged, block location (border vs. interior), products applied",
  },

  "pear-psylla": {
    when: "Scout from dormant season (egg-laying on bark) through summer. Weekly checks from petal fall.",
    where: "Primarily a pear pest but can affect apple blocks adjacent to pear orchards. Check leaf undersides and fruit.",
    how: [
      "Examine pear tree bark in early spring for tiny orange eggs.",
      "In summer, check leaf undersides for nymphs surrounded by honeydew droplets.",
      "Monitor apple fruit near pear blocks for honeydew and sooty mold contamination.",
    ],
    whatToLookFor: [
      {
        category: "Nymphs and Adults",
        signs: [
          "Adults: small (2-3mm) winged insects, dark brown to green, resembling tiny cicadas",
          "Nymphs: flat, yellow-green, produce copious honeydew",
          "Heavy honeydew causes sooty mold on leaves and fruit",
        ],
      },
    ],
    threshold: [
      "Primarily managed in pear orchards — treat pear blocks to protect adjacent apple",
      ">50% of pear leaves with nymphs and honeydew = treat to reduce spillover",
    ],
    record: "Date, nymphs per leaf (pear), honeydew on apple fruit (%), products applied",
  },

  "apple-flea-weevil": {
    when: "Scout from green tip through petal fall. Adults are active in early spring.",
    where: "Check expanding leaves for small round feeding holes. More common in blocks with grassy or weedy borders.",
    how: [
      "Examine expanding leaves for tiny round holes (shot-hole feeding pattern).",
      "Look for small (2-3mm) dark metallic-green weevils on leaves in early morning.",
    ],
    whatToLookFor: [
      {
        category: "Feeding Damage",
        signs: [
          "Numerous tiny round holes in expanding leaves (shot-hole pattern)",
          "Larvae mine inside leaves, creating blotch-type mines",
          "Adults jump when disturbed (flea behavior)",
        ],
      },
    ],
    threshold: [
      ">25% of leaves with shot-hole damage on young trees = consider treatment",
      "Mature trees tolerate moderate damage — rarely requires treatment",
    ],
    record: "Date, % leaves with shot-hole damage, adults observed, tree age/vigor",
  },

  "japanese-beetle": {
    when: "Scout from late June through August. Peak activity is typically July.",
    where: "Upper canopy leaves. Trees near turf or grassy areas (larvae develop in soil). All varieties.",
    how: [
      "Walk rows weekly during July-August looking for skeletonized leaves in upper canopy.",
      "Check for metallic green-bronze beetles feeding on leaves.",
      "Assess defoliation level per tree.",
    ],
    whatToLookFor: [
      {
        category: "Adults and Damage",
        signs: [
          "Metallic green and bronze beetle, ~12mm, with tufts of white hair along abdomen",
          "Skeletonize leaves — eat tissue between veins, leaving lace-like appearance",
          "Aggregation pheromone — beetles cluster, attracting more beetles",
          "May also feed directly on ripening fruit",
        ],
      },
    ],
    threshold: [
      ">15% defoliation on young trees = treat",
      "Mature bearing trees tolerate moderate defoliation — treat if feeding on fruit",
      "Avoid Japanese beetle traps in orchard — they attract more beetles than they catch",
    ],
    record: "Date, beetles per tree, % defoliation, fruit feeding observed, products applied",
  },

  "two-spotted-spider-mite": {
    when: "Scout every 7-10 days from June through August, especially during hot dry weather.",
    where: "Undersides of leaves, starting in lower canopy. Blocks near dusty roads or where broad-spectrum sprays disrupted predators.",
    how: [
      "Pick 5 leaves per tree from 10 trees and examine undersides with hand lens.",
      "Count pest mites and predatory mites separately.",
      "Look for webbing — TSSM produces fine silk webbing on leaf undersides.",
    ],
    whatToLookFor: [
      {
        category: "Two-Spotted Spider Mite",
        signs: [
          "Yellowish-green mites with two dark spots on body (visible with 10x lens)",
          "Fine silk webbing on leaf undersides (distinguishes from ERM)",
          "Stippled, bronzed leaves; severe infestations cause premature leaf drop",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "European red mite",
        distinction: "ERM is dark red, rounder, and does not produce webbing",
      },
    ],
    threshold: [
      ">5 mites per leaf with webbing and <1 predator per leaf = treat",
      "Avoid broad-spectrum insecticides that flare mite populations by killing predators",
    ],
    record: "Date, mites per leaf, predators per leaf, webbing severity, recent spray history",
  },

  "apple-rust-mite": {
    when: "Scout from petal fall through summer. Check if populations are building to damaging levels.",
    where: "Undersides of leaves and on fruit surface. All varieties.",
    how: [
      "Examine leaves with a hand lens (15-20x magnification required — these mites are microscopic).",
      "Check 5 leaves per tree on 10 trees.",
      "Note: low-moderate populations are BENEFICIAL — they feed predatory mites.",
    ],
    whatToLookFor: [
      {
        category: "Apple Rust Mite",
        signs: [
          "Microscopic (~0.15mm), torpedo-shaped, pale yellow to tan",
          "Visible only with strong hand lens or microscope",
          "At damaging levels: leaf surface appears bronzed, russeted fruit surface",
          "Low populations = BENEFICIAL (sustain predatory mites that control ERM and TSSM)",
        ],
      },
    ],
    threshold: [
      ">200 mites per leaf with visible leaf bronzing = consider treatment",
      "If predatory mites are present, do NOT treat — rust mites sustain predator populations",
      "Fruit russeting from rust mites = cosmetic issue on sensitive varieties",
    ],
    record: "Date, estimated mites per leaf, leaf bronzing (none/trace/moderate/severe), predatory mite count",
  },

  "apple-maggot": {
    when: "Deploy traps by late June. Scout from July through harvest.",
    where: "Yellow sticky-board traps or red sphere traps on border rows near woods or feral apple trees. All varieties.",
    how: [
      "Hang red sphere traps (sticky) at eye level on border row trees by late June — 1 per border tree at minimum.",
      "Check traps weekly — count and remove flies.",
      "Inspect fruit from August on for egg-laying punctures (tiny dimples).",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Small (5-6mm) black fly with distinctive dark W-shaped wing bands",
          "Caught on red sphere traps — count weekly",
          "Most active July through September",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Tiny egg-laying punctures on fruit surface (dimples)",
          "Brown winding trails through fruit flesh from larval tunneling",
          "Fruit may drop prematurely; flesh becomes soft and brown internally",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Walnut husk fly",
        distinction: "Walnut husk fly does not attack apples — only similar in appearance",
      },
    ],
    threshold: [
      "1 fly per trap on unbaited red sphere = spray within 7-10 days",
      "With bait: 5 flies per baited trap = treat",
      "Perimeter sprays are often sufficient — apple maggot enters from edges",
    ],
    record: "Date, flies per trap, trap location, % fruit with tunneling, products applied",
  },

  "apple-leaf-midge": {
    when: "Scout from tight cluster through mid-summer. Multiple overlapping generations.",
    where: "Developing terminal leaves — check expanding shoot tips. Nursery trees and young plantings most affected.",
    how: [
      "Examine the youngest 2-3 leaves on terminal shoots for curling.",
      "Uncurl affected leaves to find tiny orange larvae.",
      "Check 10-20 shoot tips per tree on 10 trees.",
    ],
    whatToLookFor: [
      {
        category: "Larval Damage",
        signs: [
          "Tight rolling or curling of leaf margins on young expanding leaves",
          "Tiny (~2mm) orange to red larvae inside rolled leaf edges",
          "Rolled leaves become thickened and may develop brown necrotic edges",
          "Severe infestations stunt terminal growth",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Rosy apple aphid",
        distinction: "Aphid-curled leaves have visible aphids on underside and sticky honeydew",
      },
    ],
    threshold: [
      ">50% of shoot tips with rolled leaves on young/nursery trees = treat",
      "Mature trees tolerate moderate damage — treatment rarely needed",
    ],
    record: "Date, % shoot tips with curled leaves, larvae per tip, tree age",
  },

  "european-apple-sawfly": {
    when: "Scout from bloom through 3 weeks after petal fall. Damage happens early.",
    where: "Check developing fruitlets after petal fall. Blocks with history of sawfly damage.",
    how: [
      "At bloom, use white sticky traps to monitor adult flight.",
      "After petal fall, inspect 100 fruitlets for ribbon-like surface scars and entry holes.",
      "Cut suspect fruit to find larvae inside.",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Small (6-7mm) wasp-like insect, yellow-brown with dark head",
          "Caught on white sticky traps during bloom",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Ribbon-like scar spiraling on fruit surface from initial surface feeding",
          "Later: larvae bore into fruit, creating a wide, frass-filled tunnel",
          "Damaged fruit drops within 3-4 weeks of petal fall (early June drop)",
          "THIS IS THE KEY SIGN: ribbon scar = sawfly (not codling moth)",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Codling moth",
        distinction: "Codling moth entry is a round hole with frass; sawfly leaves a surface ribbon scar first",
      },
    ],
    threshold: [
      ">2-3% of fruitlets with ribbon scars or entry = treat next season at petal fall",
      "First cover spray (petal fall) with Imidan or Assail typically controls sawfly",
    ],
    record: "Date, % fruitlets with ribbon scars, % with entry holes, trap counts",
  },

  "spotted-wing-drosophila": {
    when: "Deploy traps from mid-July. Scout soft or damaged fruit from August through harvest.",
    where: "Ripe or near-ripe fruit, especially thin-skinned or damaged fruit. SWD is primarily a soft-fruit pest but attacks damaged apples.",
    how: [
      "Set apple cider vinegar bait traps at canopy edges from mid-July.",
      "Check traps weekly — identify SWD by serrated ovipositor on females.",
      "Inspect damaged or cracked fruit for small larvae.",
    ],
    whatToLookFor: [
      {
        category: "Adults",
        signs: [
          "Small (2-3mm) fruit fly; males have distinctive dark spot on each wing",
          "Females have serrated ovipositor — can puncture intact fruit skin",
          "Caught in vinegar traps",
        ],
      },
      {
        category: "Fruit Damage",
        signs: [
          "Small puncture marks in fruit skin from oviposition",
          "Tiny white larvae (~3mm) inside fruit flesh",
          "Secondary decay develops rapidly around larval feeding sites",
        ],
      },
    ],
    threshold: [
      "SWD primarily attacks soft fruit (cherries, berries) — risk to intact apples is low",
      "Damaged, cracked, or overripe apples are susceptible — harvest on time and remove drops",
    ],
    record: "Date, trap counts, % damaged fruit with larvae, fruit condition (cracked/intact)",
  },

  "voles": {
    when: "Scout year-round. Peak damage occurs in late fall through early spring under snow cover.",
    where: "Check trunk base and root collar area. Grassy/weedy areas within tree rows provide vole habitat.",
    how: [
      "Inspect trunk base for bark gnawing — pull back mulch and grass to see soil-level damage.",
      "Look for vole runways (narrow trails ~3cm wide) in grass near tree rows.",
      "In fall, check for fresh gnawing before snow arrives.",
    ],
    whatToLookFor: [
      {
        category: "Vole Damage",
        signs: [
          "Irregular gnaw marks on bark at or below soil level",
          "Bark stripped in patches, exposing white wood beneath",
          "Complete girdling of trunk (bark removed all the way around) = tree will die",
          "Network of surface runways (3cm wide trails) through grass leading to trees",
        ],
      },
    ],
    lookAlikes: [
      {
        name: "Rabbit damage",
        distinction: "Rabbit gnaw marks are higher (above snow line), cleaner cuts at 45-degree angle",
      },
      {
        name: "Deer damage",
        distinction: "Deer strip bark in long vertical shreds, typically higher on trunk",
      },
    ],
    threshold: [
      "Any fresh gnawing at trunk base = protect immediately with hardware cloth guards",
      "Active runway systems near trees = apply bait stations or mow/herbicide grass strip",
      "Maintain bare soil or gravel strip (60cm minimum) around each trunk",
    ],
    record: "Date, trees with damage, severity (partial/complete girdling), guard type in place, grass height",
  },

  "deer": {
    when: "Scout year-round. Browse damage peaks in winter. Buck rub damage occurs in fall (September-November).",
    where: "Border rows near woods. Young trees and new plantings. Check leaders and terminal shoots.",
    how: [
      "Walk perimeter rows looking for browsed shoot tips and torn leaves.",
      "Check young tree trunks for buck rub damage (bark shredded vertically).",
      "Look for deer trails, tracks, and droppings near orchard.",
    ],
    whatToLookFor: [
      {
        category: "Browse Damage",
        signs: [
          "Ragged, torn shoot tips and leaves (deer tear rather than cut cleanly)",
          "Leader and lateral shoots stripped — can destroy tree training structure",
          "Damage concentrated on shoots within reach (up to ~1.8m height)",
        ],
      },
      {
        category: "Buck Rub",
        signs: [
          "Bark shredded and stripped vertically on trunk (bucks rub antler velvet)",
          "Usually on 2-5 year old trees at 30-90cm height",
          "Can girdle and kill young trees",
        ],
      },
    ],
    threshold: [
      "Any browse damage on young trees = install tree shelters or perimeter fencing",
      "Repeated damage = 2.4m perimeter fencing is the only reliable long-term solution",
    ],
    record: "Date, trees damaged, damage type (browse/rub), block location, fence status",
  },

  "dagger-nematode": {
    when: "Test soil before planting and periodically (every 3-5 years) in established orchards.",
    where: "Soil in root zone. Blocks with declining tree vigor. Pre-plant assessment on new planting sites.",
    how: [
      "Collect soil cores from root zone (15-30cm depth) — 10 cores per block, mix into one composite sample.",
      "Submit sample to a nematode diagnostic lab for extraction and identification.",
      "Sample in fall (September-October) when populations peak.",
    ],
    whatToLookFor: [
      {
        category: "Above-Ground Symptoms",
        signs: [
          "Non-specific decline: reduced vigor, small pale leaves, poor shoot growth",
          "Symptoms resemble replant disease or nutrient deficiency",
          "Xiphinema (dagger nematode) also vectors tomato ringspot virus (ToRSV) which causes apple union necrosis",
        ],
      },
      {
        category: "Root Symptoms",
        signs: [
          "Stubby, stunted root tips (visible on excavated feeder roots)",
          "Reduced feeder root density in root zone",
        ],
      },
    ],
    threshold: [
      ">50 Xiphinema per 100cm³ soil = damaging population, consider pre-plant fumigation",
      "If ToRSV is confirmed, remove infected trees — virus is incurable",
    ],
    record: "Date, block, nematode count per sample, species identified, tree vigor rating, virus testing result",
  },
}
