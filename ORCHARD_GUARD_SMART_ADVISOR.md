# OrchardGuard — Smart Advisor Mode

The app currently shows all 55 models equally. This is overwhelming and unhelpful. Redesign the experience so OrchardGuard acts like a knowledgeable orchard consultant who only tells you what you NEED to know today.

Principle: Don't make the grower search for what matters. Surface it automatically and tell them exactly what to do.

---

## 1. Replace Dashboard Risk Grid with "Today's Actions"

Remove the current grid of 55 risk cards from the dashboard homepage. Replace it with a prioritized action list.

### New Dashboard Structure:

```
Grills Orchards — Friday, April 3
Dormant · 7°C · Cloudy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ACTION REQUIRED (do today)
─────────────────────────────────────────
Nothing urgent today. ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 PREPARE THIS WEEK
─────────────────────────────────────────

📋 Finish dormant pruning
   Your pruning window closes when buds push to 
   green tip. At current temperatures, that's 
   roughly 2-3 weeks away. Prioritize removing 
   fire blight cankers — you had blight last year 
   and those cankers are the #1 source of spring 
   infection.
   
   → Mark complete ☐

📋 Plan dormant oil spray
   Best applied at silver tip to smother 
   overwintering mite eggs and scale. Watch for 
   buds to start swelling. You'll want a day 
   that's above 4°C with no rain for 24 hours.
   
   Check inventory: Do you have dormant oil? 
   → Yes ☐  → Need to order ☐

📋 Check deer fencing
   Spring browse risk is moderate. New buds are 
   attractive to deer. Walk your fence line before 
   growth starts.
   
   → Mark complete ☐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 COMING UP (next 7-14 days)
─────────────────────────────────────────

At current temps, expect these milestones:

• Green tip: ~2-3 weeks (est. Apr 17-24)
  When this happens:
  - Apple scab monitoring activates
  - Apply copper spray (silver tip to ¼" green)
  - First rosy apple aphid hatch possible
  - UPDATE YOUR BLOOM STAGE in settings

• Dormant oil deadline: before green tip
  Must be applied before buds open. Once green 
  tissue is visible, oil can cause phytotoxicity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💤 EVERYTHING ELSE: ALL CLEAR
55 models monitored · 47 inactive for current 
growth stage · 8 monitoring — all low risk
→ View all models
```

### When Risks Are Elevated, Show Them Prominently:

```
Grills Orchards — Thursday, May 14
Bloom · 18°C · Rain expected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ACTION REQUIRED (do today)
─────────────────────────────────────────

1. SPRAY FOR FIRE BLIGHT — before tonight's rain
   ─────────────────────────────────────────
   WHY: Both models predict infection conditions. 
   CougarBlight shows 285 degree hours (EXTREME 
   for your orchard). MaryBlyt has all 4 conditions 
   met. Rain tonight will wash bacteria into open 
   blossoms.
   
   WHAT TO SPRAY:
   → Streptomycin at 100 ppm
     You've used it 1 time this season (max 3).
     Apply late afternoon/evening before rain.
     Protects open blossoms for ~24 hours.
   
   OR if you applied streptomycin in the last 3 days:
   → Kasumin 2L at 3.3 L/ha
     Rotate to reduce resistance risk.
   
   ⏰ WINDOW: Apply before 6 PM today. 
   Rain starts ~9 PM per forecast.
   
   [Log this spray →]

2. APPLE SCAB — protectant needed before rain
   ─────────────────────────────────────────
   WHY: Rain tonight at 18°C with 35% ascospore 
   maturity = severe infection conditions. Last 
   scab spray was 11 days ago (Captan, Apr 3). 
   That coverage has washed off after 28mm rain 
   since then. You are UNPROTECTED.
   
   WHAT TO SPRAY:
   → Captan 80 WDG at 3.4 kg/ha
     Can tank-mix with streptomycin — compatible.
     One pass covers both fire blight and scab.
   
   💡 TANK MIX: Streptomycin + Captan in one pass.
   Both are compatible. Saves a trip through the 
   orchard. [Open tank mix builder →]
   
   [Log this spray →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 PREPARE THIS WEEK
─────────────────────────────────────────

📋 Codling moth traps — set by petal fall
   Petal fall is approximately 7-10 days away. 
   Have pheromone traps ready. Place 2-3 per 
   block at eye level in upper canopy.
   → Traps ready ☐  → Need to order ☐

📋 Plum curculio spray at petal fall
   Emergence expected ~10 days after petal fall.
   Have Imidan or Assail on hand.
   → In stock ☐  → Need to order ☐

📋 Calcium spray program starts at petal fall
   You grow Honeycrisp (very high bitter pit risk).
   First calcium chloride foliar spray due at 
   petal fall. Plan for every 10-14 days through 
   August (12-15 applications total).
   → Calcium chloride in stock ☐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 THIS WEEK'S FORECAST
─────────────────────────────────────────
Today  Thu  18°C 🌧️  ← SPRAY BEFORE RAIN
Fri        12°C ☁️   Recovery day
Sat        14°C ☀️   Good scouting day
Sun        16°C ☁️   Check for blight symptoms
Mon        19°C 🌧️  ← Another scab risk
Tue        15°C ☁️   
Wed        13°C ☀️   Good spray day if needed

⚠️ Monday's rain could be another infection event.
   If you spray today, you'll likely need to 
   re-apply Sunday evening before Monday's rain.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💤 EVERYTHING ELSE: ALL CLEAR
→ View all 55 models
```

---

## 2. Smart Filtering Rules

### What to Show and When

Only surface a disease/pest on the dashboard when it meets ONE of these criteria:

**Show as ACTION REQUIRED (red) when:**
- Active infection event detected (scab, fire blight, etc.)
- Risk level is HIGH or EXTREME
- Frost kill threshold will be breached tonight
- Spray coverage has expired and conditions are favorable for infection
- Pest emergence is happening NOW (within DD threshold)

**Show as PREPARE THIS WEEK (yellow) when:**
- Risk forecast shows HIGH+ conditions in next 7 days
- Pest emergence expected within 14 days (based on DD projection)
- Spray coverage expiring soon and rain forecast
- Upcoming growth stage transition triggers new vulnerability
- Scouting is overdue for an active pest (last scouted >14 days ago)
- Product inventory low for a product you'll need soon

**Show as COMING UP (informational) when:**
- Growth stage milestone approaching (green tip, bloom, petal fall)
- Seasonal pest emergence >14 days but <30 days away
- Upcoming management windows (thinning, calcium program start)

**DON'T show on dashboard when:**
- Risk is LOW and no change expected in 7-day forecast
- Model is inactive for current growth stage
- Disease/pest is out of season
- Conditions are well below any threshold

All hidden models are still accessible under "View all models" but they don't clutter the daily view.

---

## 3. Automatic Spray Recommendations

### When a spray is needed, be SPECIFIC:

Don't just say "apply fungicide." Tell them:

1. **Exact product name** from their inventory (check inventory table first, recommend what they actually HAVE)
2. **Exact rate** per hectare or acre
3. **When to apply** — specific time window ("before 6 PM today" or "Wednesday afternoon")
4. **What it covers** — list all diseases/pests this spray will protect against
5. **Tank mix opportunity** — if multiple targets need spraying, suggest combining
6. **What it costs** — pull from inventory pricing
7. **FRAC/IRAC group check** — warn if they're overusing a group
8. **How long protection lasts** — "effective for approximately 10-14 days or until 25mm cumulative rainfall"
9. **When to re-apply** — based on forecast rain and coverage degradation
10. **One-click log** — button to immediately log the spray with all details pre-filled

### Inventory-Aware Recommendations:

```
WHAT TO SPRAY:
→ Captan 80 WDG at 3.4 kg/ha

📦 INVENTORY CHECK:
   You have 15 kg in stock.
   This application uses ~3.4 kg (for your 1 ha block).
   Remaining after spray: 11.6 kg (~3 more applications).
   ✅ Sufficient stock.

— OR —

📦 INVENTORY CHECK:
   You have 2 kg in stock.
   This application needs 3.4 kg — NOT ENOUGH.
   ⚠️ Order more Captan or use alternative:
   → Mancozeb (you have 8 kg — sufficient)
```

---

## 4. Automatic Growth Stage Suggestions

Instead of making the grower remember to update their bloom stage, prompt them:

```
🌱 GROWTH STAGE CHECK
━━━━━━━━━━━━━━━━━━━━━━

Based on accumulated growing degree days (127 DD 
base 5°C since March 1), your trees may be 
approaching GREEN TIP.

Have you seen green tissue showing at bud tips?

  [Yes — update to Green Tip]
  [Not yet — still dormant]
  [Remind me in 3 days]
```

Show this prompt when DD accumulation reaches the typical threshold for the next stage:
- Silver tip: ~30 DD base 5°C
- Green tip: ~55 DD
- Tight cluster: ~100 DD
- Pink: ~170 DD
- Bloom: ~230 DD
- Petal fall: ~310 DD

These are approximate — the prompt ASKS the grower to confirm, it doesn't auto-advance.

---

## 5. After-Action Follow-up

When an infection event occurs, follow up automatically:

**Day of infection:**
"Scab infection occurred today. Apply curative fungicide within 72 hours."

**Day after:**
"Scab infection was yesterday. Kickback window: ~48 hours remaining. Have you sprayed? [Yes / Not yet]"

**2 days after:**
"Scab infection 2 days ago. Kickback window closing. If you haven't sprayed a curative, this infection will establish. Switch to protectant-only strategy for the next rain event."

**10-14 days after infection:**
"The scab infection from April 1 should be showing visible lesions now if it established. Scout your orchard today — check 10 trees, 20 leaves each. [Log scouting observation →]"

**After spray is logged:**
"✅ Captan applied today at 3.4 kg/ha. 
Protection active. Estimated coverage: 10-14 days 
or until ~25mm cumulative rain (currently 0mm since spray).
Next rain forecast: Thursday (5mm). Coverage should hold.
Re-spray reminder set for April 15."

---

## 6. Daily Morning Briefing

Generate a concise daily briefing that could also be sent as the morning email/SMS:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍎 OrchardGuard — Fri Apr 3
   Grills Orchards · Dormant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TODAY: 7°C, cloudy, dry. No disease pressure.

ACTION ITEMS: None today ✅

THIS WEEK:
• Finish pruning + canker removal
• Check deer fencing
• Watch for silver tip (est. 2-3 weeks)

WEATHER AHEAD:
Rain likely Sat (8mm). No disease concern 
while dormant.

Full dashboard: http://192.168.1.52:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

During active season:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍎 OrchardGuard — Thu May 14
   Grills Orchards · Bloom
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 SPRAY TODAY:
• Fire blight: Streptomycin before tonight's rain
• Apple scab: Captan (tank mix with strep)
• Window closes at ~6 PM

🟡 THIS WEEK:
• Set codling moth traps by petal fall
• Order calcium chloride for foliar program
• Scout for blight symptoms Sunday

WEATHER: Rain tonight (12mm), dry Fri-Sat, 
rain again Monday.

Full details: http://192.168.1.52:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 7. Checklist Mode

Add a checklist view for seasonal tasks. Auto-generate based on growth stage and model outputs:

### `/checklist` page (add to sidebar under PLAN)

```
📋 Dormant Season Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRUNING
  ☐ Complete dormant pruning
  ☐ Remove all fire blight cankers (cut 30cm 
    beyond visible infection)
  ☐ Remove mummified fruit (black rot inoculum)
  ☐ Prune out dead wood and crossing branches
  ☐ Sterilize pruning tools between trees

PEST MONITORING
  ☐ Inspect for overwintering mite eggs on bark
  ☐ Check trunks for vole damage
  ☐ Inspect graft unions for borer damage (M.9 blocks)
  ☐ Check deer fence integrity
  ☐ Set up weather station / verify data feed

SPRAY PREPARATION  
  ☐ Inventory spray products for season
  ☐ Calibrate sprayer
  ☐ Order dormant oil
  ☐ Order copper for silver tip spray
  ☐ Order streptomycin for bloom

ORCHARD PREP
  ☐ Mow orchard floor short (vole management)
  ☐ Pull mulch away from trunks (15cm minimum)
  ☐ Replace damaged trunk guards
  ☐ Check irrigation system
  ☐ Soil test if not done in 3 years
```

Auto-advance to next checklist when growth stage changes:
- Green Tip Checklist
- Pink/Bloom Checklist  
- Petal Fall Checklist
- Summer Cover Spray Checklist
- Pre-Harvest Checklist
- Post-Harvest Checklist

---

## 8. Simplify Navigation

### Reduce sidebar to essentials:

```
MONITOR
  📊 Dashboard          ← main view, action-focused
  🌤️ Weather            ← forecast + conditions

MANAGE  
  🚜 Spray Log          ← log + coverage status
  🧪 Tank Mix           ← builder
  📦 Inventory          ← stock levels

PLAN
  📋 Checklist          ← seasonal to-do
  💰 Costs              ← season summary
  ⚙️ Settings           ← orchard config

REFERENCE (collapsible)
  🔬 All Diseases (55)  ← full model library
  📖 Spray Guide        ← timing + products
  📜 History            ← past seasons
```

Move Diseases, Pests, Nutrition, Workers into a collapsible "Reference" section. The daily-use items should be front and center. The reference library is there when you need to look something up, but it shouldn't compete with the action items.

---

## 9. Implementation Priority

1. Replace dashboard with action-focused layout (ACTION / PREPARE / COMING UP / ALL CLEAR)
2. Add smart filtering rules so only pressing items surface
3. Add specific spray recommendations with product names, rates, timing, and inventory check
4. Add "Your Week Ahead" forecast with predicted infection events
5. Add growth stage prompts based on DD accumulation
6. Add after-action follow-up (spray logged → coverage tracking → re-spray reminder)
7. Add daily morning briefing text (also usable for email/SMS alerts)
8. Add seasonal checklists
9. Simplify navigation
10. All existing detail pages remain accessible under "All Diseases" — nothing is deleted, just reorganized
