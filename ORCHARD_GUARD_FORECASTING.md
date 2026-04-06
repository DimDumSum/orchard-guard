# OrchardGuard — Predictive Forecasting & Proactive Spray Advisor

The system currently only shows what's happening RIGHT NOW. A useful orchard tool needs to look FORWARD and tell the grower:
1. What infections could happen in the next 7 days based on the weather forecast
2. What to spray RIGHT NOW for an active infection (specific products, rates, timing)
3. What to prepare for in the coming days (get equipment ready, order product, plan spray day)

Implement ALL of the following changes.

---

## 1. Forecast Risk Timeline — Add to Dashboard

### New Section: "Your Week Ahead"

Add a prominent section on the dashboard between the weather strip and the risk cards. This is the MOST IMPORTANT section — it tells the grower what's coming.

Display a 7-day timeline where each day shows:
- Date and day name
- Forecast high/low temp and precipitation
- Predicted risk events for that day
- Recommended actions

**Example layout:**

```
📅 Your Week Ahead
─────────────────────────────────────────────────────────────

TODAY — Fri Apr 3                                    15°C ☁️
  🔴 APPLE SCAB: Active infection from 58h ago. 
     SPRAY TODAY — see recommendations below.

TOMORROW — Sat Apr 4                          12°C 🌧️ 8mm
  🟡 APPLE SCAB: Rain + 12°C = likely infection conditions.
     If no fungicide applied today, infection almost certain.
  🟢 FIRE BLIGHT: Too cold for bacterial growth.

Sun Apr 5                                      6°C ☁️
  🟢 Cool and dry. Low disease pressure. 
     Good day for fieldwork if ground is dry enough.

Mon Apr 6                                      3°C ❄️
  🟡 FROST RISK: Low of -4°C forecast. At green tip, 
     10% bud kill threshold is -8°C — safe, but monitor.

Tue Apr 7                                      3°C ☀️
  🟢 Cold and dry. No disease activity expected.

Wed Apr 8                                      6°C ☁️
  🟢 Gradual warming trend beginning. No immediate risks.

Thu Apr 9                                     11°C 🌧️ 5mm
  🟡 APPLE SCAB: Rain returning with warmer temps. 
     If ascospore maturity >5%, this could be an infection event.
     PLAN: Have fungicide ready. Spray protectant before rain.
─────────────────────────────────────────────────────────────
```

### How to Generate the Forecast

For each day in the 7-day forecast:

**Apple Scab:**
- Get forecast temp and precipitation for that day
- If rain >0.5mm AND temp >6°C AND bloom stage >= green-tip AND ascospore maturity >0%:
  - Calculate potential wet period duration (estimate from precip amount: light rain <5mm = 6-8h, moderate 5-15mm = 8-14h, heavy >15mm = 14-24h)
  - Look up Mills table with forecast mean temp and estimated wet hours
  - If infection criteria would be met: flag as "LIKELY INFECTION CONDITIONS"
  - If close to meeting criteria: flag as "POSSIBLE INFECTION CONDITIONS"
- Add: "Spray protectant BEFORE this rain to prevent infection" or "Apply within X hours after rain starts for kickback protection"

**Fire Blight:**
- Run CougarBlight forward using forecast temps
- If projected DH would exceed caution threshold AND rain/dew expected AND bloom stage is bloom/petal-fall:
  - Flag: "Fire blight infection conditions likely — have streptomycin ready"
- If 3+ days of warm temps (>18°C) forecast leading into a rain event during bloom:
  - Flag: "CRITICAL — bacterial population building. Spray BEFORE rain event."

**Frost Risk:**
- Compare forecast overnight low to bud stage kill thresholds
- If forecast low within 3°C of 10% kill threshold: MODERATE risk
- If forecast low within 1°C or below: HIGH risk
- Include: "Protect with overhead irrigation or wind machines if available"

**Codling Moth (when active):**
- Project DD accumulation forward using forecast temps
- If projected DD will cross a threshold (100, 250, 550): flag it
- "Codling moth egg hatch expected in approximately X days based on forecast"

**All other models:**
- Run the same forecast projection logic: apply model rules to forecast weather
- Only flag days where conditions are expected to meet infection/emergence criteria

---

## 2. Active Infection Action Cards — Expand Risk Cards

When a disease model detects an ACTIVE infection event or HIGH+ risk, the risk card should EXPAND to show a full action plan. Not just "spray urgently" — tell them exactly what, how much, and when.

### Active Infection Card Template:

```
┌─ 🔴 ──────────────────────────────────────────────────────┐
│  🍂 Apple Scab                                    SEVERE  │
│                                                           │
│  WHAT HAPPENED:                                           │
│  A scab infection event began ~58 hours ago during the    │
│  rain on April 1st. The wet period lasted approximately   │
│  14 hours at a mean temperature of 9.3°C, which exceeds  │
│  the severe infection threshold of 9 hours.               │
│                                                           │
│  ⏰ KICKBACK WINDOW:                                      │
│  You have approximately 14 hours remaining to apply a     │
│  curative fungicide that can stop this infection.         │
│  After that, the fungus will be established in the leaf   │
│  tissue and only protectant sprays will help going        │
│  forward.                                                 │
│                                                           │
│  💊 SPRAY NOW — Pick ONE:                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ BEST: Inspire Super (FRAC 3+9)                      │  │
│  │ Rate: 585 mL/ha │ Kickback: up to 96h              │  │
│  │ PHI: 75 days │ REI: 12h │ Cost: ~$42/ha            │  │
│  │ ✅ Best kickback activity for post-infection use     │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ GOOD: Myclobutanil / Nova (FRAC 3)                  │  │
│  │ Rate: 340 g/ha │ Kickback: up to 72h               │  │
│  │ PHI: 14 days │ REI: 24h │ Cost: ~$28/ha            │  │
│  │ ⚠️ FRAC 3 — check if you've already used this      │  │
│  │    group this season (resistance risk if >3 uses)   │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ BUDGET: Dodine / Syllit (FRAC U12)                  │  │
│  │ Rate: 1.5 L/ha │ Kickback: up to 48h               │  │
│  │ PHI: 7 days │ REI: 48h │ Cost: ~$18/ha             │  │
│  │ ⚠️ Shorter kickback — only if infection was recent  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  🔄 RESISTANCE NOTE:                                      │
│  You've applied FRAC Group 3 once this season.            │
│  Max recommended: 3-4 times. 2 remaining.                 │
│                                                           │
│  📋 AFTER SPRAYING:                                       │
│  Log this spray using "Log Spray" so the system can       │
│  track your coverage, FRAC rotation, and PHI countdown.   │
│                                                           │
│  🔮 LOOKING AHEAD:                                        │
│  Rain forecast again Thursday (8mm). Apply a PROTECTANT   │
│  spray (Captan or Mancozeb) before that rain to prevent   │
│  the next infection. Protectants must be on BEFORE rain.  │
└───────────────────────────────────────────────────────────┘
```

### Pre-Infection Warning Card Template:

When a future infection event is predicted (rain + warm temps in forecast):

```
┌─ 🟡 ──────────────────────────────────────────────────────┐
│  🍂 Apple Scab — INFECTION RISK THURSDAY                  │
│                                                           │
│  FORECAST:                                                │
│  Rain (8mm) expected Thursday Apr 9 with temps reaching   │
│  11°C. At current ascospore maturity (2%), this would     │
│  be a light-to-moderate infection event if unprotected.   │
│                                                           │
│  🛡️ PREVENT IT — Spray BEFORE the rain:                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Captan 80 WDG (FRAC M4)                             │  │
│  │ Rate: 3.4 kg/ha │ No kickback (protectant only)     │  │
│  │ PHI: 1 day │ REI: 24h │ Cost: ~$22/ha              │  │
│  │ ✅ Multi-site — no resistance risk                   │  │
│  │ ✅ Apply Wednesday afternoon or Thursday morning     │  │
│  │    before rain begins                                │  │
│  │ ⚠️ Must be dry on leaves for 2h to become rainfast  │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Mancozeb / Dithane (FRAC M3)                        │  │
│  │ Rate: 4.5 kg/ha │ PHI: 45 days │ REI: 24h          │  │
│  │ Cost: ~$15/ha                                        │  │
│  │ ✅ Budget option, good broad-spectrum protectant     │  │
│  │ ⚠️ Long PHI — not suitable close to harvest         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  📅 BEST SPRAY DAY: Wednesday Apr 8                       │
│  Forecast: dry, 6°C, light wind. Good spray conditions.   │
│  Apply in afternoon for maximum drying time before rain.  │
│                                                           │
│  🚜 PREPARE:                                              │
│  • Check sprayer calibration                              │
│  • Confirm product inventory (need X kg Captan)           │
│  • Plan for 2-hour drying window after application        │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Fire Blight Forecast During Bloom

When bloom stage = bloom or petal-fall, fire blight forecasting becomes critical. Show a special bloom-period forecast panel:

```
🔥 Fire Blight Bloom Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bacterial Growth Potential (next 7 days):
  Today    ▰▰░░░░░░░░  Low (45 DH)     — cool
  Tomorrow ▰▰▰░░░░░░░  Building (88 DH) — warming  
  Sat      ▰▰▰▰▰░░░░░  CAUTION (156 DH) — warm + dew likely
  Sun      ▰▰▰▰▰▰▰░░░  HIGH (245 DH)   — warm + rain 🌧️
  Mon      ▰▰▰▰▰▰░░░░  Declining (180 DH) — cooling
  Tue      ▰▰░░░░░░░░  Low (62 DH)     — cold front
  Wed      ▰▰░░░░░░░░  Low (55 DH)     — cool

⚠️ CRITICAL WINDOW: Saturday–Sunday
Warm temperatures building bacterial populations, followed by rain 
Sunday that would wash bacteria into open blossoms.

💊 RECOMMENDED ACTION:
Apply streptomycin Saturday evening or Sunday morning BEFORE rain.
If using Blossom Protect (biological), apply Thursday — it needs 
2-3 days to colonize blossoms before the infection event.

MaryBlyt Conditions for Sunday:
  ✅ Blossoms open: YES
  ✅ Cumulative DH ≥198: YES (projected 312 DH)
  🟡 Wetting event: Rain forecast (85% probability)
  ✅ Mean temp ≥15.6°C: YES (projected 18°C)
  → 3 of 4 conditions confirmed, 4th likely = HIGH INFECTION RISK
```

---

## 4. Spray Timing Optimizer

### New Section on Dashboard: "Best Spray Days"

Analyze the 7-day forecast to identify optimal spray windows:

```
🚜 Best Spray Days This Week
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wednesday Apr 8                              ⭐ BEST
  Dry, 6°C, wind 8 km/h. Full drying time before 
  Thursday rain. Ideal for protectant application.

Sunday Apr 5                                  👍 GOOD  
  Dry, 6°C, wind 12 km/h. Cool but workable.
  Slightly windy — use low-drift nozzles.

Days to AVOID spraying:
  ❌ Tomorrow (Sat Apr 4): Rain expected, 8mm
  ❌ Thursday Apr 9: Rain expected, 5mm
  ❌ Today if wind >20 km/h: Drift risk too high

Conditions for good spray day:
  • No rain for 2+ hours after application
  • Wind <15 km/h (ideally <10)  
  • Temperature >2°C (to avoid freezing in tank)
  • Humidity <95% (for drying)
```

---

## 5. Preparation Alerts — "Get Ready" Notifications

Send alerts 2-3 days BEFORE a predicted risk event, not just when it happens:

### Alert Types:

**3 days before predicted infection:**
```
📋 HEADS UP — Apple Scab Risk Thursday

Rain (8mm) forecast for Thursday with temps reaching 11°C. 
This will likely be an infection event.

Get ready:
  □ Check Captan inventory (need ~3.4 kg/ha)
  □ Test sprayer — last used 12 days ago
  □ Plan spray for Wednesday afternoon
  □ Check weather Wednesday morning to confirm timing
```

**2 days before bloom-period fire blight risk:**
```
📋 HEADS UP — Fire Blight Risk This Weekend

Warm temps building Saturday-Sunday with rain Sunday. 
Bacterial populations will be high on open blossoms.

Get ready:
  □ Confirm streptomycin inventory
  □ Check if Blossom Protect was applied this week
  □ Plan spray for Saturday evening
  □ If biologicals needed, apply Thursday (needs lead time)
```

**1 week before predicted pest emergence:**
```
📋 COMING SOON — Codling Moth Egg Hatch (~10 days away)

Degree day accumulation: 72 of 100 DD from biofix.
At current temperatures, 100 DD expected around April 15.

Get ready:
  □ Order Altacor or Assail if not in stock
  □ Set pheromone traps if not already out
  □ Plan first cover spray for April 14-15
```

---

## 6. Forecast-Driven Risk on Each Disease/Pest Detail Page

On every individual disease or pest detail page, add a "7-Day Forecast Risk" section:

```
7-Day Apple Scab Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day         Temp    Rain    Wet hrs*   Risk    Action
──────────────────────────────────────────────────
Today       15°C    0mm     0          ✅ Low   —
Sat Apr 4   12°C    8mm     ~10h       🔴 HIGH  Spray before rain
Sun Apr 5    6°C    0mm     0          ✅ Low   —
Mon Apr 6    3°C    0mm     0          ✅ Low   Too cold
Tue Apr 7    3°C    0mm     0          ✅ Low   Too cold
Wed Apr 8    6°C    0mm     0          ✅ Low   Best spray day
Thu Apr 9   11°C    5mm     ~8h        🟡 MOD   Spray Wed afternoon

*Estimated wet hours based on precipitation forecast

Ascospore maturity: 2.0% — early season, low spore load.
Even if infection occurs, severity limited by available spores.
Primary scab season is just beginning.
```

---

## 7. Product Recommendations by Scenario

Build a recommendation engine that suggests products based on the SPECIFIC situation:

### Scenario: Active infection, need kickback
- Prioritize products with longest kickback activity
- Show hours of kickback remaining based on infection timing
- Rank: Inspire Super (96h) > Myclobutanil (72h) > Dodine (48h) > Captan (no kickback)

### Scenario: Rain coming, need protectant
- Prioritize products that are rainfast quickly
- Show hours to rainfast for each product
- Rank by cost-effectiveness for protectant use
- Flag: "Must be applied and DRY before rain begins"

### Scenario: Multiple disease risks overlapping
- Suggest products that cover multiple targets
- "Merivon covers both scab AND mildew — one spray, two diseases"
- Show tank mix options for combined coverage

### Scenario: Approaching FRAC group limits  
- Automatically suggest alternative groups
- "You've used FRAC 3 twice this season. For this spray, consider FRAC 11 (Flint) or FRAC M4 (Captan) instead."

### Scenario: Near harvest
- Filter out products whose PHI would extend past expected harvest
- "Harvest in approximately 14 days. Only showing products with PHI ≤14 days."
- Show: Captan (1 day), Flint (14 days). Exclude: Mancozeb (45 days), Inspire Super (75 days).

---

## 8. Update Existing Risk Cards

Every risk card that shows CAUTION, MODERATE, HIGH, SEVERE, or EXTREME should include:

1. **What's happening** (1-2 sentences, plain English)
2. **What to do right now** (specific action)
3. **What's coming next** (forecast-based, 1-2 sentences)
4. **Expand for full spray options** (click to see product recommendations)

Every risk card that shows LOW should include:
1. **Why it's low** (1 sentence)
2. **When it could change** (forecast-based)
3. **What to watch for** (scouting guidance)

---

## 9. Smart Spray Reminders Based on Coverage

Track when the last spray was applied for each disease target. Show coverage status:

```
Spray Coverage Status:
  Apple Scab:  ⚠️ NO ACTIVE PROTECTION
               Last spray: none this season
               Recommendation: apply first protectant at green tip
               
  Fire Blight: ✅ Copper applied Mar 28 (6 days ago)
               Copper degrades — re-apply if rain >10mm since application
               
  Mites:       ✅ Dormant oil applied Mar 15
               Egg coverage: good (if applied before green tip)
```

After a spray is logged, update coverage status:
```
  Apple Scab:  ✅ PROTECTED — Captan applied today
               Rainfast in ~2 hours
               Protection window: ~10-14 days or until ~25mm cumulative rain
               Next spray due: approximately Apr 15 (or sooner if heavy rain)
```

---

## 10. Implementation Notes

- Fetch the 7-day hourly forecast from Open-Meteo (already available)
- Run each disease/pest model against forecast data, not just historical
- Store forecast risk projections and update every time weather refreshes
- The "Your Week Ahead" section should be the FIRST thing a grower sees after the header
- Product recommendations should pull from the existing spray_products database
- Cross-reference with spray_log to check FRAC/IRAC group usage and inventory
- All text should be conversational, specific, and actionable — never vague
- Include costs and timing details — growers make real decisions based on this
