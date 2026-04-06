# OrchardGuard Phase 2 — Comprehensive Upgrade Spec

Read this entire spec, then implement all sections systematically. Fix the apple scab dormant-stage bug first (gate all infection events on bloom_stage >= green-tip), then proceed with upgrades.

---

## 1. Model Accuracy Upgrades

### Fire Blight — Enhanced CougarBlight + MaryBlyt

Current models are simplified. Upgrade to production accuracy:

**CougarBlight v5.1 (full implementation):**
- Use actual hourly temps when available, not just daily max/min approximation
- Degree hours peak at 31°C and decline toward 40°C (not linear above 31)
- Include the rain/dew trigger: risk only activates when a wetting event coincides with accumulated DH
- Inoculum potential should have 5 levels, not 3:
  - Extreme: active cankers oozing in orchard
  - High: blight in orchard last year, cankers removed
  - Moderate: blight in nearby orchards
  - Low: no blight within 1km for 2+ years
  - None: virgin orchard, no history
- Show the 4-day rolling window as a visual breakdown (each day's contribution)
- Project risk 3 days forward using forecast temps

**MaryBlyt v7.1 (full implementation):**
- Track individual blossom cohorts: each day's newly opened blossoms are a separate cohort
- Each cohort independently accumulates degree hours (base 18.3°C) from its opening date
- A cohort becomes susceptible when its cumulative DH ≥ 198
- Infection occurs when a susceptible cohort is wetted AND mean temp ≥ 15.6°C
- Cohorts age out after petal fall (no longer susceptible)
- Show expected symptom appearance: infection date + 103 degree hours (base 12.7°C) = symptom date
- Track Epiphytic Infection Potential (EIP): daily bacterial population estimate on stigma surfaces

### Apple Scab — Full Mills Table + Ascospore Maturity

**Bug fix:** Gate ALL infection calculations on bloom_stage >= 'green-tip'. During dormant/silver-tip, show: "No green tissue exposed — scab season has not started."

**Enhanced Mills Table:**
- Interpolate between temperature bands (don't just use brackets)
- Track each wet period independently with start time, duration, mean temp
- Calculate infection severity: light / moderate / severe based on exact hours vs threshold
- Show "time remaining" during active wet periods: "3.2 more hours of wetness at current temp would trigger moderate infection"
- Post-infection timer: once infection occurs, show countdown for fungicide kickback activity
  - Most fungicides effective up to 72h post-infection (product-dependent)
  - Show: "Infection occurred ~X hours ago. Kickback window: Y hours remaining for [product list]"

**Ascospore Maturity Model (detailed):**
- Base: 0°C degree days from January 1 (biofix)
- Maturity curve (New Hampshire model):
  - 0% at 0 DD
  - 1% at ~90 DD  
  - 10% at ~200 DD
  - 50% at ~400 DD
  - 90% at ~600 DD  
  - 100% at ~750 DD
- Use logistic curve fit, not linear interpolation
- Show: "Ascospore maturity: 34% — X% of seasonal spore load has been released"
- Primary scab season ends at 100% maturity (typically 2-3 weeks after petal fall)
- After primary season: only secondary scab from existing lesions (much lower risk)

**Scab Infection History:**
- Log every infection event with: date, severity, temp, wetness duration
- Show cumulative infection count for the season
- If >3 unprotected infections early season, flag: "Scab inoculum building — increase spray frequency"

### Powdery Mildew — Enhanced

- Add variety susceptibility ratings (e.g., McIntosh = high, Liberty = resistant)
- Track primary vs secondary infection windows
- Flag-leaf infection risk model: highest risk at pink through petal fall
- Ascospore release from overwintering chasmothecia triggered by rain >2.5mm after green tip
- Conidial spread risk: temps 10-25°C, RH >70%, no rain

### Cedar Apple Rust — Enhanced

- 2-year cycle tracking: flag if juniper hosts are nearby (user setting)
- Telial horn wetting model: rain >2.5mm at temps >10°C for >4 hours
- Spore dispersal window: 4-6 hours after rain begins
- Show infection window status: open / closed / approaching

### Sooty Blotch & Flyspeck — Enhanced

- Track 3 separate thresholds for different regions:
  - Cool/wet: 175 hours RH >97%
  - Moderate: 200 hours
  - Warm/dry: 270 hours
- Let user select their microclimate
- Partial reset: subtract 24 hours from accumulation for each dry day (RH <90% for 24h+)
- Full reset: 7+ consecutive dry days resets to zero
- Show percentage toward threshold with trend line

### Codling Moth — Enhanced

- Add pheromone trap count logging (weekly entries)
- Auto-detect biofix from trap data: first catch of 2+ moths in consecutive weeks
- Show spray timing windows clearly:
  - "First spray window: X days away (at 100 DD from biofix)"
  - "Peak hatch: Y days away (at 250 DD)"
- Separate recommendations for conventional vs organic programs
- Second generation tracking with independent thresholds
- Late-season risk assessment for third generation (if applicable in Ontario)

### All Pest Models — Enhanced

- Add economic thresholds from OMAFRA IPM guidelines
- Include scouting protocol reminders: what to look for, how many trees to check
- Threshold-based action levels, not just degree-day emergence

---

## 2. Spray Program Guidance System

### Product Database

Create a comprehensive product database table:

```
spray_products:
  id, product_name, active_ingredient, product_group (fungicide|insecticide|miticide|growth_regulator|nutrient),
  frac_group (for fungicides) | irac_group (for insecticides),
  target_pests (JSON array),
  rate_per_hectare, rate_per_acre, rate_unit,
  phi_days, rei_hours,
  max_applications_per_season,
  resistance_risk (low|medium|high),
  organic_approved (boolean),
  rainfast_hours,
  kickback_hours (fungicides: post-infection activity window),
  tank_mix_compatible (JSON array of compatible product IDs),
  tank_mix_incompatible (JSON array of incompatible product IDs),
  cost_per_unit, unit_size, unit_measure,
  notes, label_url
```

**Seed with Ontario apple products** (all registered products from OMAFRA Publication 360):

Fungicides:
- Captan (FRAC M4) — scab, black rot, brooks spot
- Mancozeb / Dithane (FRAC M3) — scab, rust, black rot
- Myclobutanil / Nova (FRAC 3) — scab, mildew, rust — kickback 72h
- Fluxapyroxad+pyraclostrobin / Merivon (FRAC 7+11) — scab, mildew, sooty blotch
- Difenoconazole+cyprodinil / Inspire Super (FRAC 3+9) — scab, mildew — kickback 96h
- Dodine / Syllit (FRAC U12) — scab — kickback 48h
- Trifloxystrobin / Flint (FRAC 11) — scab, mildew, sooty blotch
- Copper (FRAC M1) — fire blight, scab (pre-bloom only)
- Streptomycin (antibiotic) — fire blight during bloom
- Kasugamycin / Kasumin — fire blight during bloom
- Blossom Protect (biological) — fire blight, preventive
- Serenade OPTI (biological) — fire blight, scab
- Sulfur (FRAC M2) — mildew, mites

Insecticides:
- Imidacloprid / Admire (IRAC 4A) — aphids, leafminers
- Acetamiprid / Assail (IRAC 4A) — codling moth, aphids, plum curculio
- Chlorantraniliprole / Altacor (IRAC 28) — codling moth, leafrollers
- Phosmet / Imidan (IRAC 1B) — codling moth, plum curculio, apple maggot
- Carbaryl / Sevin (IRAC 1A) — thinning + codling moth + apple maggot
- Spinosad / Entrust (IRAC 5) — codling moth (organic), leafrollers
- Kaolin clay / Surround (barrier) — plum curculio, apple maggot (organic)
- Mineral oil — mite eggs, scale

Growth Regulators:
- Prohexadione-calcium / Apogee — shoot growth suppression, fire blight reduction
- NAA / Fruitone — thinning
- 6-BA / MaxCel — thinning
- Ethephon / Ethrel — preharvest drop control
- ReTain / AVG — preharvest drop control, delayed maturity
- 1-MCP / Harvista — preharvest, storage quality

### Spray Timing Recommendations

For each active risk, show specific product recommendations with timing:

```
FIRE BLIGHT — HIGH RISK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recommended spray options:
  1. Streptomycin — apply within 24h before or after wetting event
     Rate: 100 ppm | PHI: 50 days | REI: 12h
     ⚠️ Max 3 applications/season (resistance management)
     Season applications so far: 1 of 3
     
  2. Kasumin 2L — alternative antibiotic
     Rate: 3.3 L/ha | PHI: 45 days | REI: 12h
     ⚠️ Rotate with streptomycin
     
  3. Blossom Protect — biological (apply preventively 2-3 days BEFORE risk)
     Rate: 1.25 kg/ha | PHI: 0 days | REI: 4h
     Note: Not compatible with copper
```

### Resistance Management Tracker

- Track FRAC/IRAC group usage per season
- Flag when approaching max applications for a group
- Suggest rotation: "You've applied Group 11 twice. Switch to Group 3 or Group 7 for next spray."
- Color code resistance risk: low (green) / medium (yellow) / high (red)

### Spray Calendar View

- Season-long calendar showing all sprays applied
- Overlay with disease/pest risk periods
- Show coverage gaps: days since last spray + rainfast status
- "Your last scab spray was 8 days ago (Captan). With 32mm rain since, coverage has degraded. Consider re-application."

---

## 3. Tank Mix Builder

### `/tank-mix` page

Interactive tool for building spray tank mixes:

- Select multiple products to combine in one tank
- Auto-check compatibility: flag incompatible combinations with specific warnings
  - e.g., "Captan + oil = phytotoxicity risk"
  - e.g., "Blossom Protect + copper = reduced efficacy"
  - e.g., "Do not mix sulfur within 14 days of oil application"
- Calculate combined rate for desired tank volume
- Input: tank size (L or gal), area to cover (ha or acres), application rate (L/ha water volume)
- Output: exact amount of each product to add
- Show mixing order: "1. Fill tank 50% with water → 2. Add wettable powders → 3. Add flowables → 4. Add EC formulations → 5. Top up water"
- Save commonly used tank mixes as templates
- Print/export tank mix sheet for applicator

### Compatibility Matrix

Build a visual compatibility matrix:
- Green = compatible
- Yellow = compatible with conditions (note conditions)  
- Red = incompatible
- Grey = no data (flag for caution)

---

## 4. Spray Product Inventory

### `/inventory` page

Track product stock levels:

```
inventory:
  id, product_id, quantity_on_hand, unit_measure,
  lot_number, expiry_date, purchase_date, purchase_price,
  supplier, storage_location, notes
```

- Dashboard showing current stock levels
- Auto-deduct from inventory when spray is logged
- Low stock alerts: "Captan: 2 applications remaining at current rate. Reorder?"
- Expiry date warnings: "Dithane lot #2024-08 expires in 30 days"
- Season usage summary: total cost per product, total cost per pest/disease target
- Purchase history and price trends

---

## 5. Nutrition & Fertilizer Timing

### `/nutrition` page

**Soil & Leaf Analysis Logging:**
```
soil_tests:
  id, orchard_id, date, pH, organic_matter_pct,
  N_ppm, P_ppm, K_ppm, Ca_ppm, Mg_ppm, B_ppm, Zn_ppm, Mn_ppm,
  CEC, base_saturation, lab_name, notes

leaf_tests:
  id, orchard_id, date, sample_type (mid-season|post-harvest),
  N_pct, P_pct, K_pct, Ca_pct, Mg_pct, B_ppm, Zn_ppm, Mn_ppm, Fe_ppm, Cu_ppm,
  lab_name, notes
```

**Fertilizer Application Tracking:**
```
fertilizer_log:
  id, orchard_id, date, product_name, analysis (e.g., "20-10-10"),
  rate, rate_unit, method (broadcast|foliar|fertigation|banded),
  target_nutrient, cost, notes
```

**Timing Recommendations (Ontario apple):**

| Window | Application | Purpose |
|---|---|---|
| Dormant (Mar-Apr) | Boron (Solubor) foliar | Bud health, fruit set |
| Green tip | Nitrogen (CAN/Urea) ground | Early growth flush |
| Pink - Bloom | Calcium chloride foliar | Bitter pit prevention (start) |
| Petal fall | Foliar Zn + Mn + Mg | Correct deficiencies |
| 2-3 weeks post bloom | Nitrogen adjustment based on crop load | Match N to fruit demand |
| June (every 10-14 days) | Calcium foliar sprays | Bitter pit prevention (continue through August) |
| July | Potassium if deficient | Fruit color, size |
| Post-harvest | Foliar urea (5%) | Nitrogen cycling, scab inoculum reduction |
| Fall | Lime if pH < 6.0 | pH adjustment |

- Show current window and upcoming applications on dashboard
- Tie calcium spray reminders to bitter pit risk model
- Flag nutrient interactions: "High K can reduce Ca uptake — monitor leaf Ca levels"
- Foliar urea post-harvest note: "Also reduces scab ascospore production by 50%+"

---

## 6. Season History & Year-Over-Year Comparison

### Data Retention

- Archive all weather, model outputs, spray logs, and scouting data per season
- Season = user-defined (typically dormant pruning through post-harvest)

### `/history` page

- Season selector dropdown
- Side-by-side comparison charts:
  - Degree day accumulation curves (this year vs previous years)
  - Disease pressure timeline comparison
  - Spray count and cost comparison
  - Bloom date comparison
  - First pest emergence dates
- Key season milestones table:
  - Green tip date, bloom date, petal fall date
  - First scab infection, first fire blight symptom
  - Codling moth biofix, first egg hatch
  - Total sprays, total cost
  - Harvest date, yield (if entered)
- Export season report as PDF

---

## 7. Worker Safety — REI Notifications

### Worker Management

```
workers:
  id, orchard_id, name, phone, email, role,
  notification_preference (sms|email|both), active
```

### REI Tracking

- When a spray is logged, automatically calculate REI expiry time
- Show active REIs on dashboard: "Block A: Imidan applied 6h ago. REI: 24h. Safe entry at: Apr 3, 2:00 PM"
- Send notification to workers:
  - When spray applied: "⚠️ Block A sprayed with Imidan. DO NOT ENTER until Apr 3, 2:00 PM (24h REI)"
  - When REI expires: "✅ Block A REI expired. Safe to enter."
- Block-level tracking (user can define blocks/sections of orchard)
- Visual map or list showing which blocks are under active REI
- PHI countdown on dashboard: "Days until harvest clearance: Captan (1 day remaining), Imidan (7 days remaining)"

---

## 8. OMAFRA Integration

### Automatic Bulletin Monitoring

- Fetch and parse OMAFRA crop protection bulletins from ONfruit.ca
- Check for new postings daily
- Display relevant bulletins on dashboard
- Show fire blight prediction maps link when bloom approaches
- Parse key alerts: pest emergence reports, disease outbreak warnings, regulatory changes

### Ontario-Specific Resources

- Link to OMAFRA Publication 360 (Crop Protection Guide) for each product
- Link to Pest Diagnostic Clinic submission forms
- Ontario apple grower association news feed
- Show GDD comparisons to OMAFRA weather stations when available

---

## 9. Cost Tracking & Reporting

### Per-Application Costs

- When logging a spray, auto-calculate cost from inventory unit prices:
  - Product cost = rate × area × price per unit
  - Application cost = product cost + user-defined equipment/labor cost per hectare
- Track per-pass costs (multiple products in one tank mix = one pass)

### Season Financial Summary

- Total spray cost by category (fungicide, insecticide, growth regulator, nutrient)
- Cost per pest/disease target
- Cost per acre/hectare
- Cost trend vs previous seasons
- ROI estimates: "Fire blight program cost: $X/ha. Average loss without program: $Y/ha."
- Export for accountant/tax purposes

---

## Database Migrations

Add all new tables while preserving existing data. Use SQLite migrations with version tracking:

```
schema_version:
  version INTEGER PRIMARY KEY,
  applied_at TEXT DEFAULT (datetime('now')),
  description TEXT
```

---

## UI Updates

- Add new navigation items: Tank Mix, Inventory, Nutrition, History
- Dashboard should show top 3 most urgent items across ALL systems (disease, pest, spray, nutrition, REI)
- Mobile-responsive: growers will check this on their phone in the field
- Dark mode option (easier to read at 5 AM)

---

## Implementation Order

1. Fix apple scab dormant-stage bug (gate on green-tip)
2. Enhanced disease models (fire blight, scab, mildew)
3. Product database + spray recommendations
4. Tank mix builder
5. Inventory tracking
6. Enhanced pest models
7. Worker REI notifications
8. Nutrition & fertilizer
9. OMAFRA integration
10. Season history & comparison
11. Cost tracking & reporting
12. UI polish + mobile responsiveness + dark mode
