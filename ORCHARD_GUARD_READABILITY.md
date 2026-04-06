# OrchardGuard — Readability & Guidance Overhaul

DO NOT change the visual styling or design that was just applied. ONLY improve text content, readability, font sizes, explanations, and add helpful context throughout the app. The goal: a grower with no technical background should understand every screen without training.

---

## Global Text Rules

1. **Increase base font size** — body text should be 15px minimum, not 13px. Card descriptions 14px minimum. People read this on phones and in bright sunlight.

2. **Increase line height** — all body text should be line-height 1.7 (not 1.4 or 1.5). Gives text room to breathe.

3. **Increase card padding** — cards feel cramped. Increase internal padding to 24px on all sides.

4. **No jargon without explanation** — every technical term should have plain English next to it or a tooltip. "Degree hours" means nothing to most growers on its first appearance.

5. **Every risk card should answer three questions:**
   - What is the current risk? (clear level)
   - Why? (one sentence explaining what's driving it)
   - What should I do? (one sentence action item)

6. **Use conversational tone** — not clinical/scientific. Write like an experienced grower advising a neighbor.

---

## Dashboard Improvements

### Page Header
Current: "Grills Orchards / Friday, April 3, 2026"

Better — add a one-line seasonal context:
```
Grills Orchards
Friday, April 3, 2026 — Dormant season. Focus on pruning, canker removal, and dormant sprays.
```

### Current Weather Card
Current: Just shows numbers.

Add context:
```
Current Weather                    
7.4°C  — Cool. No disease pressure from today's temperatures.

Humidity  92%      Precip (24h)  3.8 mm
Wind      4.5 km/h    Dew Point     6.2°C

Updated 43 min ago

🔮 Next 48h: Rain likely tomorrow (8mm), highs reaching 12°C Saturday.
```

### Bloom Stage Card
Current: Shows the selector but no explanation of what it means.

Add below the selector:
```
Bloom Stage: Dormant
Your trees are still fully dormant. Most disease and pest models 
won't activate until buds begin to push (green tip stage).

👉 Walk your orchard every few days — when you see the first 
green showing at bud tips, update to "Green Tip" to activate 
spring disease monitoring.
```

### Orchard Health Score
Current: "92 Good — All 55 models nominal"

Better:
```
92 — Good
All clear. No urgent action needed today.

Your orchard health score is calculated from all 55 disease, 
pest, and weather models. It drops when risks increase. 
Below 70 means something needs attention.
```

### Risk Cards — Rewrite ALL descriptions

**Fire Blight — LOW:**
Current: "Low bacterial growth — 10.6 degree hours accumulated."

Better:
```
Fire Blight                                              LOW

No risk right now. Temperatures are too cold for the fire blight 
bacteria to multiply. Risk increases when warm weather (above 15°C) 
coincides with bloom.

✅ No action needed — continue dormant canker removal if not complete.
```

**Nectria Canker — LOW:**
Current: "Nectria Canker risk is low — no action needed."

Better:
```
Nectria Canker                                           LOW

Canker infection needs rain at 11–16°C during wound-healing periods. 
Conditions haven't aligned recently. 

✅ Good time to prune — dry weather means low infection risk for cuts. 
   Remove any visible cankers while pruning.
```

**Deer Damage — MODERATE:**
Current: "Spring browse risk — new growth and exposed buds attracting deer. Maintain exclusion fencing."

Better:
```
Deer Damage                                         MODERATE

Early spring is peak deer browse time. Buds are starting to 
swell and deer are hungry after winter. Young trees are most 
vulnerable.

⚠️ Check fencing integrity this week. Inspect young tree blocks 
   for browse damage. Repair trunk guards if damaged.
```

**Winter Moth — LOW:**
Current: "Winter Moth risk is low — no action needed."

Better:
```
Winter Moth                                              LOW

An invasive caterpillar that hatches at bud break and feeds on 
opening leaves. Still too early — larvae won't emerge until 
green tip stage. 22.9 degree days accumulated of 50–100 needed.

✅ No action yet. Will alert you when emergence approaches.
```

**European Red Mite — LOW:**
Current: "Mite pressure low — natural predators active."

Better:
```
European Red Mite                                        LOW

Overwintering eggs haven't hatched yet. Egg hatch begins around 
185 degree days (base 5°C) — you're at 22.9, so roughly 
3–4 weeks away depending on temperatures.

✅ Plan dormant oil spray before green tip if mite pressure was 
   high last season. Oil smothers overwintering eggs.
```

**Voles — LOW:**
Current: "Low vole pressure — maintain bait stations."

Better:
```
Voles                                                    LOW

Spring vole risk drops as snow melts and predators become active. 
Check trunks at the base for any winter gnawing damage, especially 
under mulch rings.

✅ Check bait stations. Pull mulch 15cm away from trunks if you 
   haven't already. Replace damaged trunk guards.
```

---

## Disease Overview Page (`/diseases`)

### Page Introduction
Add a paragraph at the top:
```
Disease Risk Overview
Grills Orchards — Bloom stage: Dormant

OrchardGuard monitors 20 diseases using weather data, your orchard 
history, and published prediction models. During dormant season, 
most fungal disease models are inactive because there's no green 
tissue to infect. They'll activate as your trees progress through 
green tip, bloom, and into the growing season.

Active now: fire blight canker monitoring, Nectria canker risk
Coming soon: apple scab (activates at green tip), powdery mildew, 
cedar apple rust, frost risk
```

### Each Disease Card
Add one-line "What is this?" below the disease name:
```
Apple Scab                                              NONE
A fungal disease that causes dark spots on leaves and fruit.
───────────────────────────────────────────────
No green tissue exposed yet — scab monitoring starts at green tip.
```

```
Cedar Apple Rust                                         LOW
Orange spots on leaves caused by a fungus that alternates 
between apple trees and cedar/juniper.
───────────────────────────────────────────────
Bloom stage: dormant. Susceptible window opens at green tip.
```

```
Sooty Blotch & Flyspeck                                  LOW
Dark smudges and tiny black dots on fruit skin. Cosmetic 
damage — doesn't affect flesh but downgrades fruit.
───────────────────────────────────────────────
Tracking starts after petal fall. 0 of 200 humidity hours accumulated.
```

---

## Pest Overview Page (`/pests`)

### Page Introduction
```
Pest Risk Overview
Grills Orchards — Bloom stage: Dormant

OrchardGuard tracks 25 insect and animal pests using degree-day 
models and scouting thresholds. Degree days measure accumulated 
warmth — pests develop at predictable rates based on temperature, 
so we can forecast when they'll emerge and when to spray.

Active now: deer browse, vole monitoring, winter moth watch, 
dormant mite egg assessment
Coming soon: rosy apple aphid (green tip), codling moth (after bloom)
```

---

## Individual Disease/Pest Detail Pages

Each detail page should have an expandable "About this disease/pest" section:

```
ℹ️ About Fire Blight

Fire blight is a bacterial disease (Erwinia amylovora) that can 
kill branches and entire trees. The bacteria overwinter in cankers 
on infected wood. In spring, ooze from cankers attracts insects 
that carry the bacteria to open flowers.

Infection requires: open blossoms + warm temperatures (above 15°C) 
+ moisture (rain or heavy dew). When all three align, bacteria 
multiply rapidly and can infect flowers within hours.

Why two models? OrchardGuard runs CougarBlight (which tracks 
bacterial growth potential from temperature) and MaryBlyt (which 
predicts specific infection events). When both models agree, 
confidence in the prediction is highest.

Your orchard: FIRE BLIGHT HISTORY — IN ORCHARD
This means lower thresholds for alerts because overwintering 
bacteria are likely still present.
```

---

## Weather Page

### Add Forecast Interpretation
Don't just show raw forecast numbers. Add:
```
📋 What This Week's Weather Means For Your Orchard:

• Friday (today): Cool and damp. Good pruning conditions — cuts 
  will heal with low infection risk.
  
• Saturday: Rain forecast with warming temperatures. NOT a scab 
  risk yet (still dormant) but note the moisture for planning 
  fieldwork.
  
• Sunday–Monday: Cooling trend with possible frost. No concerns 
  at dormant stage — would be critical during bloom.

• Week ahead: Temperatures mostly below disease thresholds. 
  Focus on completing dormant pruning and canker removal.
```

---

## Settings Page

### Add Help Text to Every Field
Current: Labels only, no explanation.

Better — add gray help text below each field:

```
Primary Varieties: [Honeycrisp, Gala, McIntosh]
Your varieties affect disease susceptibility ratings. Honeycrisp 
is highly susceptible to bitter pit and fire blight. McIntosh is 
susceptible to scab and powdery mildew.

Rootstock: [M.9, B.9, G.41]
Dwarfing rootstocks (M.9, B.9) are more susceptible to fire blight, 
Phytophthora, and borer insects. This information adjusts risk 
thresholds for rootstock-related diseases.

Fire Blight History: [in_orchard ▾]
Set this based on last season. "In orchard" means fire blight 
bacteria are almost certainly overwintering in your trees — the 
system will use lower alert thresholds and more aggressive 
spray recommendations.

Bloom Stage: [dormant ▾]
This is the most important setting to keep current. Many models 
depend on knowing your growth stage. Walk your orchard regularly 
and update this as buds progress. When in doubt, set it one 
stage behind — it's better to get an alert a day late than to 
miss an early one.
```

---

## Spray Log Page

### Add Guidance When Empty
If no sprays logged:
```
No sprays recorded yet this season.

🍎 Dormant Season Spray Checklist:
  □ Dormant oil (before green tip) — targets overwintering mite 
    eggs and scale insects
  □ Copper spray (silver tip to ¼" green) — reduces fire blight 
    inoculum and early scab
  
Use "Log Spray" to record applications. The system will track 
product intervals, resistance group rotation, pre-harvest 
intervals, and re-entry times for worker safety.
```

---

## Tank Mix Page

### Add Guidance
```
Tank Mix Builder
Combine multiple products into a single spray application. 
The system checks product compatibility and calculates exact 
amounts for your tank size.

⚠️ Always read product labels before mixing. This tool checks 
known incompatibilities but cannot account for all formulation 
interactions. When in doubt, do a jar test first.
```

---

## Nutrition Page

### Enhance Timing Table
Add a "Why" column:
```
Window     | Timing   | Application              | Why
─────────────────────────────────────────────────────────────
Dormant    | Mar–Apr  | Boron (Solubor) foliar    | Boron supports 
(Current)  |          |                           | bud development 
           |          |                           | and fruit set. 
           |          |                           | Best absorbed 
           |          |                           | through bark 
           |          |                           | before leaves open.
```

---

## Tooltips for Technical Terms

Add info icon (ℹ️) tooltips on first appearance of these terms throughout the app:

- **Degree hours**: "A measure of accumulated warmth above a base temperature. Higher numbers mean pests and diseases develop faster."
- **Degree days**: "Similar to degree hours but calculated daily. Used to predict when insects will emerge based on accumulated warmth."
- **Biofix**: "The date when you first consistently catch a pest in monitoring traps. All degree-day predictions are counted from this date."
- **PHI (Pre-Harvest Interval)**: "The minimum number of days between the last spray application and harvest. Required by law for food safety."
- **REI (Restricted Entry Interval)**: "The minimum time after spraying before workers can safely enter the treated area without protective equipment."
- **FRAC/IRAC Group**: "Classification system for fungicides (FRAC) and insecticides (IRAC). Rotating between groups prevents pests from developing resistance."
- **Kickback activity**: "A fungicide's ability to stop an infection that has already started. Not all products have this — some only prevent new infections."
- **Ascospore maturity**: "Apple scab fungus releases spores in spring. This percentage shows how much of the season's total spore supply has matured and is ready to cause infection."
- **Inoculum**: "The amount of disease-causing organisms present. Higher inoculum means higher infection risk when conditions are right."
- **MaryBlyt / CougarBlight**: "Two published scientific models for predicting fire blight infection risk. Running both gives higher confidence than either alone."

---

## Summary

After these changes, every screen should feel like a knowledgeable orchard consultant is standing next to you explaining what's going on and what to do about it — not like a technical dashboard dumping data at you.
