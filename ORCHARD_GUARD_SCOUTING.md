# OrchardGuard — Scouting Guides, Visual ID & Product Efficacy

Add comprehensive visual identification, scouting protocols, and detailed product efficacy information to every disease and pest detail page. This turns OrchardGuard into a field reference guide — a grower should be able to open a pest page on their phone in the orchard and identify exactly what they're looking at and what to do about it.

---

## 1. Visual Identification Image Library

### Image Source
Use high-quality open-source images from these public domain / Creative Commons sources. For each disease and pest, search and fetch images from Wikimedia Commons, USDA ARS image gallery, and university extension sites. Store image URLs and display them on detail pages.

### Implementation
Add an image gallery section to every disease/pest detail page with:
- 3-5 reference images per disease/pest
- Each image has a caption describing what to look for
- Images are displayed in a responsive grid (2 columns on mobile, 3 on desktop)
- Click/tap to enlarge with caption overlay
- "Upload Your Own" button so growers can add photos from their orchard for comparison

### Image Database Table
```sql
CREATE TABLE reference_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  credit TEXT,
  sort_order INTEGER DEFAULT 0,
  image_type TEXT CHECK(image_type IN ('symptom','lifecycle','damage','scouting','management'))
);
```

### Grower Photo Upload Table
```sql
CREATE TABLE scouting_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orchard_id INTEGER REFERENCES orchards(id),
  model_slug TEXT,
  date TEXT NOT NULL,
  file_path TEXT NOT NULL,
  notes TEXT,
  block TEXT,
  severity TEXT CHECK(severity IN ('trace','light','moderate','severe')),
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Image Descriptions Per Disease/Pest

For each model, create placeholder image cards with detailed text descriptions of what photos should show. Use emoji-based visual indicators until real images are sourced. Each image card should describe exactly what the symptom looks like so a grower can identify it even without the photo.

---

## 2. Scouting Guides — Add to Every Detail Page

### Scouting Section Layout

Each detail page gets a prominent "How to Scout" section with:

```
🔍 How to Scout for [Disease/Pest]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHEN: [timing / frequency]
WHERE: [which parts of tree, which blocks]
HOW: [step-by-step method]
WHAT TO LOOK FOR: [specific visual signs]
THRESHOLD: [action level — when to spray]
RECORD: [what to log]
```

---

### DISEASE SCOUTING GUIDES

#### Apple Scab
```
🔍 How to Scout for Apple Scab

WHEN: Every 5-7 days from green tip through June. 
      After every rain event during primary scab season.

WHERE: Check interior canopy first — scab starts where 
       leaves stay wet longest. Focus on:
       • Lower canopy leaves (last to dry)
       • Cluster leaves around fruit
       • Water sprouts in canopy interior

HOW: 
  1. Select 10 trees spread across the block
  2. On each tree, examine 20 leaves (10 cluster leaves 
     + 10 shoot leaves)
  3. Check both top and bottom of leaves
  4. Also check developing fruit after petal fall

WHAT TO LOOK FOR:
  🍂 ON LEAVES:
  • Olive-green to dark brown velvety spots
  • Usually on upper leaf surface first
  • Spots may be small (2-3mm) early or large (10mm+) later
  • Severely infected leaves curl and drop
  • Young lesions look "oily" and darken with age
  
  🍎 ON FRUIT:
  • Dark, scabby, rough-textured spots
  • Early infections cause misshapen fruit
  • Late infections cause small cosmetic spots ("pin-point scab")
  • Cracking may occur at scab lesions
  
  ⚠️ LOOK-ALIKES:
  • Sooty blotch — smudgy, wipes off with thumb (scab doesn't)
  • Bitter pit — sunken brown spots, usually at calyx end
  • Spray burn — uniform bronzing, follows spray pattern

THRESHOLD:
  • Primary season: ANY new lesions on unsprayed leaves = 
    confirm infection, adjust spray program
  • 1-2% of leaves with lesions = light infection
  • 5-10% = moderate — tighten spray intervals
  • >10% = severe — scab management has failed, 
    increase frequency and switch products

RECORD: Date, block, % leaves infected, % fruit infected, 
        lesion size, which varieties affected
```

#### Fire Blight
```
🔍 How to Scout for Fire Blight

WHEN: Daily during bloom if conditions are favorable.
      Weekly from petal fall through July.
      After any hail or severe wind storm.

WHERE: Start with:
       • Most susceptible varieties (Gala, Honeycrisp, Fuji)
       • Young vigorous trees (most susceptible)
       • Trees near last year's infections
       • Perimeter rows near wild hosts (crabapples, hawthorn)

HOW:
  1. Walk every row, scanning tree tops for wilting
  2. Look for "shepherd's crook" — drooping shoot tips
  3. Check blossom clusters for blackened, water-soaked flowers
  4. Look for bacterial ooze (amber droplets) on infected tissue
  5. Check trunk and scaffold limbs for cankers

WHAT TO LOOK FOR:
  🌸 BLOSSOM BLIGHT:
  • Water-soaked, then brown/black blossom clusters
  • Blossoms stay attached (don't fall off cleanly)
  • Amber ooze droplets on infected spurs
  • Usually appears 1-3 weeks after infection event
  
  🌿 SHOOT BLIGHT:
  • Young shoot tips wilt and curve into "shepherd's crook"
  • Leaves turn brown/black but stay attached
  • Rapidly progresses down the shoot — can move 15-30cm/day
  • Dark discoloration visible under bark if you scrape
  
  🪵 CANKER BLIGHT:
  • Sunken, darkened areas on bark of branches/trunk
  • Cracked bark at canker margins
  • Amber ooze on canker surface in spring
  • Branch dieback beyond the canker
  
  🌳 ROOTSTOCK BLIGHT (CRITICAL):
  • Wilting of entire tree or large section
  • Dark discoloration at graft union
  • On M.9 and M.26 — can kill tree in one season
  • CHECK graft unions on all dwarfing rootstocks
  
  ⚠️ LOOK-ALIKES:
  • Oriental fruit moth — shoot wilting but NO blackening, 
    frass visible at entry point
  • Pseudomonas — brown blossom clusters but lacks ooze 
    and doesn't progress into wood as aggressively
  • Winter injury — dead shoot tips but no shepherd's crook

THRESHOLD:
  • ANY active blight = take action immediately
  • Even a single infected blossom cluster means the 
    bacteria are active in your orchard
  • Zero tolerance during bloom — every strike matters

RECORD: Date, block, type (blossom/shoot/canker/rootstock), 
        number of strikes, tree location (tag trees), 
        variety and rootstock affected
```

#### Powdery Mildew
```
🔍 How to Scout for Powdery Mildew

WHEN: Weekly from tight cluster through mid-summer.
      Focus at pink through 3 weeks post-bloom (critical window).

WHERE: 
  • Flag shoots (white-tipped shoots from infected buds) — 
    check these FIRST at green tip, they're primary inoculum
  • Susceptible varieties: Cortland, McIntosh, Idared, Jonagold
  • Interior canopy where air circulation is poor

HOW:
  1. At green tip: walk rows looking for flag shoots 
     (silvery-white shoot tips emerging)
  2. Count flag shoots per 100 trees
  3. Later: examine 20 terminal shoots per tree on 10 trees
  4. Check top and bottom of youngest 5 leaves per shoot

WHAT TO LOOK FOR:
  🌿 FLAG SHOOTS:
  • Stunted, silvery-white shoots emerging at green tip
  • Leaves are narrow, stiff, and covered in white powder
  • These are the PRIMARY inoculum source for the whole block
  
  🍃 LEAF INFECTION:
  • White powdery patches on leaf surface (usually underside first)
  • Young leaves curl upward at edges
  • Severely infected leaves become brittle and stunted
  • Net-like russeting pattern visible on older infections
  
  🍎 FRUIT INFECTION:
  • Russet netting pattern on fruit skin
  • Rarely causes rot but significantly downgrades fruit appearance
  
  ⚠️ LOOK-ALIKES:
  • Spray residue — washes off, mildew doesn't
  • Natural pubescence on young leaves — disappears as leaf matures

THRESHOLD:
  • >3 flag shoots per 100 trees = significant primary inoculum
  • >10% of terminal leaves with active mildew = treat
  • During pink-bloom: any active mildew on susceptible 
    varieties warrants treatment

RECORD: Date, flag shoot count, % terminals affected, 
        variety, severity (trace/light/moderate/severe)
```

#### Cedar Apple Rust
```
🔍 How to Scout for Cedar Apple Rust

WHEN: Weekly from green tip through 4 weeks after bloom.
      Check junipers in March-April for telial horns.

WHERE:
  • Susceptible varieties: most non-resistant cultivars
  • Trees closest to cedar/juniper (within 3-5 km)
  • Also check nearby ornamental crabapples

HOW:
  1. Early spring: inspect nearby junipers for orange 
     gelatinous telial horns (look like orange tentacles 
     on brown galls)
  2. In orchard: check upper leaf surface for yellow-orange spots
  3. Later: check leaf undersides for cluster cups (tube-like 
     structures)
  4. Check fruit for similar lesions

WHAT TO LOOK FOR:
  🟠 ON JUNIPERS (March-April):
  • Brown woody galls (1-5cm) on branches
  • After rain: bright orange gelatinous "horns" emerge from galls
  • These release basidiospores that infect apples
  
  🍃 ON APPLE LEAVES:
  • Bright yellow-orange spots on upper surface (1-2 weeks after infection)
  • Spots enlarge and develop red border
  • Underside: raised cluster cups (aecia) with fringed edges
  • Tubes release spores that re-infect junipers
  
  🍎 ON APPLE FRUIT (Quince Rust):
  • Green to dark green bumpy lesions near calyx end
  • Fruit distortion and drop possible
  • More damaging than leaf infection

THRESHOLD:
  • >5% of leaves with lesions on susceptible varieties = 
    significant, improve protection next season
  • Rust is largely a protectant-managed disease — once 
    you see symptoms, that infection cannot be cured
  • Focus on prevention during infection window

RECORD: Date, % leaves affected, fruit symptoms, 
        juniper gall activity observed (yes/no)
```

#### European Red Mite
```
🔍 How to Scout for European Red Mite

WHEN: Every 7-10 days from petal fall through August.
      Weekly during hot dry periods (populations explode).

WHERE:
  • Interior canopy leaves
  • Both sides of leaves (mites feed on undersides)
  • Check across all varieties — some more susceptible

HOW:
  1. Select 10 trees per block, scattered throughout
  2. Pick 5 leaves per tree from mid-canopy interior
  3. Use a hand lens (10x) to count mites per leaf
  4. Count BOTH pest mites AND predatory mites separately
  5. Record average per leaf

WHAT TO LOOK FOR:
  🔴 EUROPEAN RED MITE:
  • Tiny dark red mites (barely visible to naked eye)
  • Round red eggs on bark and leaf undersides
  • Feed on leaf cells — causes bronzing/stippling
  • Bronzed leaves look dull, grayish-brown
  • Severe: premature leaf drop, small pale fruit
  
  🟡 PREDATORY MITES (BENEFICIAL):
  • Typhlodromus pyri — slightly larger, pear-shaped, fast-moving
  • Amblyseius fallacis — translucent to amber colored
  • Move faster than pest mites
  • If predators present at >1 per leaf, biological control 
    is likely working — AVOID spraying

  ⚠️ LOOK-ALIKES:
  • Two-spotted spider mite — yellowish with two dark spots, 
    makes webbing (ERM doesn't web)
  • Apple rust mite — microscopic, torpedo-shaped, usually 
    BENEFICIAL (food for predatory mites)

THRESHOLD:
  • Through July: >5 mites per leaf with <1 predator per leaf
  • August: >10 mites per leaf (tolerance higher later season)
  • If predator:pest ratio is >1:10, hold off and reassess 
    in 5-7 days — predators may bring it under control
  • >500 cumulative mite-days per leaf = economic damage

RECORD: Date, pest mites per leaf (avg of 50 leaves), 
        predator mites per leaf, bronzing severity, 
        recent spray history (some sprays cause mite flares)
```

#### Codling Moth
```
🔍 How to Scout for Codling Moth

WHEN: Weekly trap checks from pink through September.
      Fruit inspections at 2-week intervals from June on.

WHERE:
  • Pheromone traps: place at eye level in upper-third 
    of canopy, 2-3 traps per block
  • Fruit checks: all varieties, focus on king fruit 
    and upper canopy

HOW:
  TRAP MONITORING:
  1. Set pheromone traps at pink stage (before first flight)
  2. Check weekly — count and remove moths
  3. Replace lure every 4-6 weeks
  4. Record counts to establish biofix (first sustained catch)
  
  FRUIT SCOUTING:
  1. Check 50-100 fruit per block at 2-week intervals
  2. Look at calyx end and sides of fruit
  3. Cut open suspect fruit to confirm larvae
  4. Count "stings" (shallow entries) and "deep entries" separately

WHAT TO LOOK FOR:
  🦋 ADULTS:
  • Gray-brown moth, ~10mm, copper band at wing tip
  • Attracted to pheromone trap — count weekly
  • Biofix: first consistent catch (2+ moths in successive weeks)
  
  🥚 EGGS:
  • Tiny (1mm), flat, translucent disc on leaf or fruit surface
  • Laid singly, usually on leaves near fruit clusters
  • Nearly impossible to see without hand lens
  
  🐛 LARVAE:
  • White to pinkish caterpillar with brown head
  • Up to 15-20mm long when mature
  • Found inside fruit, feeding toward core
  
  🍎 FRUIT DAMAGE:
  • STING: small brown spot with no frass — larva entered 
    but didn't survive (may indicate spray is working)
  • ENTRY: round hole with reddish-brown frass (sawdust) 
    pushed out — active larva inside
  • CALYX ENTRY: frass visible in calyx cavity
  • Cut fruit open: tunnel toward core with frass-filled gallery
  
  ⚠️ LOOK-ALIKES:
  • Lesser appleworm — shallower, smaller tunnels, rarely 
    reaches core
  • Oriental fruit moth — similar but usually enters through 
    shoot first (check for shoot flagging)
  • European apple sawfly — ribbon-like scar on fruit surface

THRESHOLD:
  • Conventional: 5+ moths per trap per week = spray
  • Mating disruption: 1-2 moths per trap = investigate
  • Fruit: >0.5% entry damage = program needs adjustment
  • ZERO tolerance for premium/direct-market fruit

RECORD: Weekly trap counts, biofix date, fruit entry %, 
        sting %, products applied, DD accumulation
```

#### Plum Curculio
```
🔍 How to Scout for Plum Curculio

WHEN: Daily checks for 3-4 weeks starting at petal fall.
      Especially after warm humid evenings (>16°C nights).

WHERE:
  • BORDER ROWS FIRST — curculio enters from woodland edges
  • Perimeter trees closest to hedgerows, woods, or stone walls
  • Drops from trees when disturbed — check early morning

HOW:
  1. At petal fall: place a white sheet under border-row trees
  2. Sharply strike limbs with a padded stick (limb jarring)
  3. Count adults that fall onto the sheet
  4. Check 5 trees per border row, 3-4 rows per block
  5. Also: inspect 100 fruitlets for egg-laying scars

WHAT TO LOOK FOR:
  🪲 ADULTS:
  • Small (4-6mm) dark brown snout beetle
  • Rough/bumpy wing covers
  • Plays dead when disturbed (drops and curls up)
  • Most active on warm, calm, humid evenings
  
  🥚 EGG-LAYING SCARS:
  • Distinctive crescent or D-shaped cut in fruit skin
  • Female cuts a flap, lays egg underneath, pushes flap back
  • THIS IS THE KEY DIAGNOSTIC SIGN
  • Fresh scars have clean edges; old scars have brown, 
    corky healed edges
  
  🍎 FRUIT DAMAGE:
  • Scarred, dimpled, misshapen fruit
  • Internal feeding damage from larvae
  • Damaged fruit often drops prematurely (June drop)
  
  ⚠️ LOOK-ALIKES:
  • Hail damage — random bruising, no crescent shape
  • Tarnished plant bug — dimpling but no crescent scar
  • Mechanical damage — bruising pattern follows limb contact

THRESHOLD:
  • 1 adult per tapped tree on border rows = spray border rows
  • 1-2% of fruitlets with crescent scars = spray full block
  • After 3-4 weeks post petal fall with no new scars, 
    curculio management can cease for the season

RECORD: Date, adults per tree (tap method), % fruit with 
        crescent scars, which rows/blocks, night temperature
```

---

## 3. Product Efficacy Tables

### Add to Every Disease/Pest Detail Page

Show a comprehensive product table specific to each disease/pest:

```
💊 Products Effective Against Apple Scab
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROTECTANTS (apply BEFORE infection):
┌──────────────────────────────────────────────────────────┐
│ Product          │ FRAC │ Efficacy │ Kickback │ Notes    │
├──────────────────────────────────────────────────────────┤
│ Captan 80 WDG    │ M4   │ ★★★★☆   │ None     │ No       │
│ 3.4 kg/ha        │      │         │          │ resistance│
│ PHI: 1d REI: 24h │      │         │          │ risk.    │
│ Cost: ~$22/ha    │      │         │          │ Workhorse│
│                  │      │         │          │ protectant│
├──────────────────────────────────────────────────────────┤
│ Mancozeb/Dithane │ M3   │ ★★★★☆   │ None     │ Budget   │
│ 4.5 kg/ha        │      │         │          │ option.  │
│ PHI: 45d REI: 24h│      │         │          │ Long PHI │
│ Cost: ~$15/ha    │      │         │          │ limits   │
│                  │      │         │          │ late use │
├──────────────────────────────────────────────────────────┤
│ Merivon          │ 7+11 │ ★★★★★   │ 48h      │ Premium. │
│ 365 mL/ha        │      │         │          │ Also     │
│ PHI: 30d REI: 12h│      │         │          │ covers   │
│ Cost: ~$55/ha    │      │         │          │ mildew   │
│                  │      │         │          │ and SBFS │
└──────────────────────────────────────────────────────────┘

CURATIVES (apply AFTER infection — kickback):
┌──────────────────────────────────────────────────────────┐
│ Product          │ FRAC │ Efficacy │ Kickback │ Notes    │
├──────────────────────────────────────────────────────────┤
│ Inspire Super    │ 3+9  │ ★★★★★   │ 96h      │ Best     │
│ 585 mL/ha        │      │         │          │ kickback.│
│ PHI: 75d REI: 12h│      │         │          │ Max 4    │
│ Cost: ~$42/ha    │      │         │          │ per      │
│                  │      │         │          │ season   │
├──────────────────────────────────────────────────────────┤
│ Myclobutanil/Nova│ 3    │ ★★★★☆   │ 72h      │ Good     │
│ 340 g/ha         │      │         │          │ kickback.│
│ PHI: 14d REI: 24h│      │         │          │ Resistance│
│ Cost: ~$28/ha    │      │         │          │ risk if  │
│                  │      │         │          │ overused │
├──────────────────────────────────────────────────────────┤
│ Dodine/Syllit    │ U12  │ ★★★☆☆   │ 48h      │ Shorter  │
│ 1.5 L/ha         │      │         │          │ kickback.│
│ PHI: 7d REI: 48h │      │         │          │ Budget   │
│ Cost: ~$18/ha    │      │         │          │ curative │
├──────────────────────────────────────────────────────────┤
│ Flint/Trifloxy   │ 11   │ ★★★★☆   │ 72h      │ Strobilurin│
│ 210 g/ha         │      │         │          │ Resistance│
│ PHI: 14d REI: 12h│      │         │          │ risk HIGH│
│ Cost: ~$35/ha    │      │         │          │ Max 4/yr │
└──────────────────────────────────────────────────────────┘

★ = Efficacy rating: ★★★★★ Excellent, ★★★★☆ Good, 
                      ★★★☆☆ Moderate, ★★☆☆☆ Fair

⚠️ RESISTANCE MANAGEMENT:
• Alternate FRAC groups — never apply same group consecutively
• Multi-site protectants (M3, M4) have no resistance risk
• Single-site fungicides (3, 7, 9, 11) — max 3-4 uses per season
• Your usage this season: Group 3 (1x), Group 11 (0x), Group M4 (0x)
```

### Product Tables for Key Diseases

Build complete efficacy tables for:

**Apple Scab:** protectants (Captan, Mancozeb, Merivon, Flint) + curatives (Inspire Super, Nova, Syllit, Flint) + biologicals (Serenade)

**Fire Blight:** antibiotics (Streptomycin, Kasumin) + biologicals (Blossom Protect, BloomTime, Serenade, Double Nickel) + copper (various) + growth regulators (Apogee)

**Powdery Mildew:** Nova, Flint, Merivon, Sulfur, Rally, Inspire Super

**Cedar Apple Rust:** Nova, Flint, Merivon, Inspire Super (same SI fungicides as scab — note dual coverage)

**Sooty Blotch/Flyspeck:** Captan, Merivon, Flint, Pristine, phosphorous acid

**Codling Moth:** Altacor, Assail, Imidan, Delegate, Entrust (organic), Cyd-X (virus), mating disruption

**Plum Curculio:** Imidan, Assail, Avaunt, Actara, Surround (organic)

**European Red Mite:** Dormant oil, Apollo, Envidor, Acramite, Nexter, predatory mite conservation

**Apple Maggot:** Imidan, Assail, Surround (organic), GF-120 (organic bait)

---

## 4. Timing & Coincidence Tables

### Add to Dashboard or Spray Log: "What Covers What"

Show growers which products pull double or triple duty:

```
🔄 Multi-Target Products — Spray Smarter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These products cover multiple targets in one application:

Merivon (FRAC 7+11)
  ✅ Apple scab    ✅ Powdery mildew    ✅ Sooty blotch
  ✅ Flyspeck      ✅ Bitter rot         ✅ Black rot

Inspire Super (FRAC 3+9)  
  ✅ Apple scab    ✅ Powdery mildew    ✅ Cedar apple rust
  ✅ Black rot     Best kickback for post-infection scab

Captan 80 WDG (FRAC M4)
  ✅ Apple scab    ✅ Black rot         ✅ Brooks spot
  ✅ Bitter rot    ✅ Sooty blotch      ✅ Flyspeck
  No resistance risk — can use all season

Imidan (IRAC 1B)
  ✅ Codling moth  ✅ Plum curculio     ✅ Apple maggot
  ✅ Sawfly        Standard summer insecticide

Assail (IRAC 4A)
  ✅ Codling moth  ✅ Plum curculio     ✅ Aphids
  ✅ Leafminers   ✅ Apple maggot      Shorter REI than Imidan
```

### Seasonal Timing Chart

```
📅 When to Use What — Ontario Apple Season
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                Dormant   GT   TC   PK   BL   PF   Cover  Pre-H
                ──────── ──── ──── ──── ──── ──── ────── ─────
Copper            ████   ██                              
Dormant Oil       ████   ██                              
Captan                   ████ ████ ████      ████  ████  ████
Mancozeb                 ████ ████ ████      ████  ████  
Nova/Myclobutanil        ████ ████ ████      ████  ████  
Merivon                            ████      ████  ████  ████
Streptomycin                            ████ 
Blossom Protect                    ████ ████ 
Apogee                                  ████ ████ 
Imidan                                       ████  ████  ████
Assail                                       ████  ████  ████
Altacor                                      ████  ████  ████
Surround               ████ ████ ████ ████  ████  ████  ████
Calcium                          ████  ████  ████  ████  ████

GT=Green Tip  TC=Tight Cluster  PK=Pink  BL=Bloom  
PF=Petal Fall  Cover=Summer covers  Pre-H=Pre-harvest

████ = Labeled use window for this timing
```

---

## 5. Coincidence Alerts — Cross-Disease Connections

When multiple models show elevated risk simultaneously, highlight the overlap:

```
🔗 Connected Risks Right Now:

Apple Scab (SEVERE) + Rain Thursday forecast
  → Same rain event could also trigger:
    • Cedar apple rust infection (if spores available)
    • Black rot infection (if temps >15°C)
    • Powdery mildew suppression (rain inhibits mildew)
  
  💡 SMART SPRAY: Merivon before Thursday's rain covers 
     scab + mildew + sooty blotch in one application.
     Add Captan if you want to save Merivon uses for later.

Fire Blight (LOW) + Approaching bloom
  → When bloom opens:
    • Fire blight risk activates (bacteria + open flowers)
    • Pollinator protection becomes critical (no insecticides during bloom)
    • Frost risk at bloom stage has lowest damage thresholds
  
  💡 PREPARE: Have streptomycin and Blossom Protect ready. 
     Plan spray timing around bee activity (spray evening/early AM).

Codling Moth + Apple Maggot (both approaching emergence)
  → Both controlled by same insecticides (Imidan, Assail)
  → Time first cover spray to coincide with codling moth egg hatch
     and you'll also get early apple maggot control
  
  💡 EFFICIENCY: One well-timed spray at 100 DD from CM biofix
     covers both pests.
```

---

## Implementation

1. Add scouting guide section to every detail page (below "About" section)
2. Add product efficacy table to every detail page (below spray recommendations)
3. Add coincidence alerts to dashboard when multiple risks are elevated
4. Add multi-target product reference to spray log page
5. Add seasonal timing chart to a new "Spray Guide" page or section
6. Create reference_images table and scouting_photos table
7. Add image gallery component to detail pages with upload capability
8. Add "Log Scouting Observation" button to every detail page with 
   quick-entry form: date, block, severity, count, notes, photo upload
9. All scouting data feeds back into risk models to adjust thresholds
