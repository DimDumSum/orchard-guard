22222# OrchardGuard — Apple Orchard Disease, Pest & Risk Management System

## Project Brief for Claude Code

Build a full-stack Next.js application for Ontario apple orchard growers that runs multiple disease and pest prediction models against live weather data, displays a real-time risk dashboard, and sends email/SMS alerts when thresholds are exceeded.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite via better-sqlite3 (zero config, runs anywhere)
- **Weather APIs**: Open-Meteo (primary, free, no key), Environment Canada XML feed (secondary), custom weather station CSV import (tertiary)
- **Alerts**: Resend (email), Twilio (SMS) — both optional, configured via env vars
- **Scheduling**: node-cron for hourly weather checks and alert evaluation
- **Charts**: Recharts for trend visualization
- **Deployment**: Works on local machine, Raspberry Pi, VPS, or Vercel

---

## Data Architecture

### Weather Data Table
```
weather_hourly:
  id, station_id, timestamp, source (open-meteo|env-canada|custom),
  temp_c, humidity_pct, precip_mm, wind_kph, leaf_wetness_hours,
  dew_point_c, created_at
```

### Daily Aggregation View
```
weather_daily:
  date, station_id, max_temp, min_temp, mean_temp,
  total_precip, avg_humidity, max_humidity,
  leaf_wetness_hours, degree_hours_15_5, degree_hours_18_3,
  degree_hours_10, degree_days_base5, degree_days_base10
```

### Orchard Config Table
```
orchards:
  id, name, latitude, longitude, elevation_m,
  primary_varieties (JSON array), rootstock,
  fire_blight_history (none|nearby|in_orchard),
  bloom_stage (dormant|silver-tip|green-tip|tight-cluster|pink|bloom|petal-fall|fruit-set),
  codling_moth_biofix_date,
  last_updated
```

### Alert Config Table
```
alert_config:
  id, orchard_id, alert_type, threshold,
  email, phone, enabled, cooldown_hours
```

### Alert Log Table
```
alert_log:
  id, orchard_id, model, risk_level, message, sent_at, channel (email|sms|dashboard)
```

---

## Disease Models to Implement

### 1. Fire Blight — CougarBlight + MaryBlyt (Combined)

**CougarBlight:**
- Sum degree hours above 15.5°C over rolling 4-day window
- Use sine-curve approximation from daily max/min if hourly data unavailable
- Inoculum adjustment: orchards with history use 0.7x thresholds
- Risk levels: Low (<110 DH), Caution (110-220), High (220-400), Extreme (>400)
- Adjusted by inoculum factor

**MaryBlyt:**
- Four simultaneous conditions for infection event:
  1. Open blossoms present (user-set bloom stage)
  2. ≥198 cumulative degree hours (base 18.3°C) since bloom start
  3. Wetting event (rain >0.25mm OR humidity >90%)
  4. Mean daily temperature ≥15.6°C
- Track all four conditions independently, show which are active

**Combined logic:**
- MaryBlyt infection + CB High/Extreme → EXTREME
- MaryBlyt 3/4 conditions + CB elevated → step up one level
- Otherwise use CougarBlight as baseline

**Spray recommendations by risk level and bloom stage.**

### 2. Apple Scab — Modified Mills Table

The most important disease model for Ontario orchards.

**Mills Table (infection periods):**
| Mean Temp °C | Light Infection (hrs wet) | Moderate | Severe |
|---|---|---|---|
| 1-5 | 48 | 41 | 35 |
| 6-8 | 30 | 25 | 20 |
| 9-11 | 20 | 17 | 14 |
| 12-15 | 15 | 12 | 9 |
| 16-19 | 12 | 9 | 7 |
| 20-24 | 11 | 8 | 6 |
| 25-26 | 15 | 12 | 9 |

**Implementation:**
- Track continuous leaf wetness periods (rain or humidity >90%)
- During each wet period, calculate mean temperature
- Look up Mills table to determine if infection occurred and severity
- Track cumulative ascospore maturity using degree days (base 0°C) from Jan 1
  - 50% mature at ~400 DD, 100% at ~800 DD
- Primary scab season ends when ascospore supply exhausted (~petal fall + 2 weeks)
- Output: infection event (yes/no), severity (light/moderate/severe), spray window

**Alert triggers:**
- Wet period starting with temps in infection range → "Spray window closing"
- Infection event completed → "Infection occurred X hours ago, fungicide within Y hours"

### 3. Powdery Mildew

**Model:**
- Risk increases when: temps 10-25°C, high humidity but NO rain (rain washes spores)
- Track consecutive hours of favorable conditions
- Flag-leaf infection risk highest at pink through petal fall
- Degree day accumulation from green tip for timing

**Alert:** Flag when 3+ consecutive days of favorable conditions align with susceptible growth stage.

### 4. Cedar Apple Rust

**Model:**
- Spore release requires: rain >2.5mm AND temp >10°C during bloom through 4 weeks post-bloom
- Track rain events during susceptible window
- Risk is binary per rain event during window

**Alert:** Rain + warm temps forecast during susceptible window.

### 5. Sooty Blotch & Flyspeck Complex

**Model:**
- Cumulative hours of relative humidity >97% since petal fall
- Threshold: ~270 hours for first appearance (with 10-day reset for dry periods >4 days)
- Track running total, reset partial count after extended dry

**Alert:** Approaching threshold → "Spray before next rain"

### 6. Black Rot / Frogeye Leaf Spot

**Model:**
- Infection requires: leaf wetness ≥9 hours at temps 15-30°C
- Higher risk with inoculum from mummified fruit
- Track wet periods during growing season

---

## Pest Models to Implement (Degree-Day Based)

### 7. Codling Moth

**The single most important pest model.**

**Model:**
- Base temperature: 10°C
- Biofix: first sustained moth catch in pheromone trap (user sets date)
- Key thresholds from biofix:
  - 100 DD: first egg hatch begins → START spray coverage
  - 250 DD: peak egg hatch → critical spray window
  - 550 DD: first generation complete
  - 1050 DD: second generation egg hatch begins
  - 1200 DD: second generation peak
- Calculate DD from biofix date using daily max/min with sine method
- Show current DD accumulation and days until next threshold

**Alert:** "X degree days until egg hatch — prepare spray" at 70 DD.

### 8. Plum Curculio

**Model:**
- Emergence: ~120 DD (base 5°C) after petal fall
- Active when night temps consistently >16°C
- Risk highest during warm, humid evenings after petal fall through 4-6 weeks
- Track DD from petal fall date

**Alert:** Approaching emergence threshold.

### 9. Apple Maggot

**Model:**
- Emergence: ~900 DD (base 5°C) from January 1
- Peak activity: ~1200-1700 DD
- Calculate running DD from Jan 1

**Alert:** Approaching emergence → "Set traps" at 800 DD, "First flies expected" at 900 DD.

### 10. Oriental Fruit Moth

**Model:**
- Base temperature: 7.2°C
- Biofix: first sustained moth catch
- First generation: 170-350 DD from biofix
- Second generation: 680-850 DD
- Third generation: 1400+ DD

### 11. Obliquebanded Leafroller

**Model:**
- Base temperature: 6°C
- Summer generation emergence: ~700 DD from March 1
- Track DD from March 1

### 12. European Red Mite

**Model:**
- Egg hatch: ~185 DD (base 5°C) from March 1
- Track cumulative mite-days (scouting integration)
- Threshold: 500 mite-days per leaf triggers action

### 13. Aphid Complex (Rosy Apple, Green Apple, Woolly)

**Model:**
- Activity onset: mean daily temp consistently >10°C
- Population growth rate tied to temperature
- Scout-based thresholds (user inputs counts)

---

## Abiotic / Physiological Models

### 14. Frost/Freeze Risk

**Critical during bloom.**

**Michigan State bud stage thresholds:**
| Bud Stage | 10% kill °C | 90% kill °C |
|---|---|---|
| Silver tip | -12 | -17 |
| Green tip | -8 | -12 |
| Tight cluster | -5 | -8 |
| Pink | -3 | -5 |
| Bloom | -2 | -3 |
| Post-bloom | -1 | -2 |

**Model:**
- Compare forecast overnight lows to kill threshold for current bud stage
- Factor in orchard elevation and cold air drainage
- 48-hour lookahead

**Alert:** Forecast low within 2°C of kill threshold.

### 15. Bitter Pit Risk Index

**Model:**
- Based on: crop load (light = higher risk), variety susceptibility, summer temps
- User inputs crop load estimate
- Track cumulative heat units during cell division (June-July)
- Recommend calcium sprays when risk elevated

### 16. Sunscald / Southwest Injury

**Model:**
- Risk when: daytime temps >5°C followed by night temps <-10°C
- Track temperature differential in late winter / early spring
- Most relevant December through March

---

## Dashboard Pages

### 1. `/` — Main Dashboard
- Today's risk summary: color-coded cards for each active model
- Combined "orchard health score" (worst-case across all models)
- 7-day forecast strip with risk overlay
- Active alerts banner
- Quick-action buttons: "Update bloom stage", "Set biofix date", "Log scout data"

### 2. `/diseases` — Disease Detail View
- Individual model pages with full charts
- Infection event timeline (scab, fire blight)
- Cumulative degree hour / wetness charts
- Spray log with product tracking

### 3. `/pests` — Pest Detail View
- Degree day accumulation charts per pest
- Generation timing visualization
- Trap count logging interface
- Spray window recommendations

### 4. `/weather` — Weather Station
- Current conditions
- 7-day forecast (hourly resolution)
- Historical data browser
- Weather source status (which APIs are active)
- Manual data entry for custom weather station

### 5. `/settings` — Configuration
- Orchard setup (location, varieties, rootstock)
- Weather source configuration
- Alert preferences (email, SMS, thresholds)
- Bloom stage / biofix date management
- Data export (CSV)

### 6. `/spray-log` — Spray Record
- Log sprays: date, product, rate, target pest/disease
- PHI (pre-harvest interval) countdown
- REI (restricted entry interval) tracking
- Season spray summary

---

## API Routes

```
GET  /api/weather/current         — latest conditions
GET  /api/weather/forecast        — 7-day hourly forecast
POST /api/weather/import          — upload CSV from weather station
GET  /api/models/fire-blight      — current fire blight risk
GET  /api/models/apple-scab       — current scab risk + infection events
GET  /api/models/all              — all model outputs
POST /api/orchard/bloom-stage     — update bloom stage
POST /api/orchard/biofix          — set codling moth biofix
POST /api/spray-log               — log a spray application
GET  /api/alerts/active           — current active alerts
POST /api/alerts/config           — update alert settings
```

---

## Weather Data Sources

### Open-Meteo (Primary — no API key)
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &hourly=temperature_2m,relative_humidity_2m,precipitation,
          dew_point_2m,wind_speed_10m
  &daily=temperature_2m_max,temperature_2m_min,precipitation_sum
  &timezone=America/Toronto
  &past_days=7&forecast_days=7
```

### Environment Canada (Secondary)
- XML feed: `https://dd.weather.gc.ca/citypage_weather/xml/ON/`
- Parse current conditions + forecast
- Station mapping by nearest lat/lon

### Custom Weather Station (Tertiary)
- CSV upload with columns: timestamp, temp_c, humidity, precip_mm, leaf_wetness
- Davis Vantage, Onset HOBO, or generic CSV format
- Auto-detect column mapping

---

## Alert System

### Trigger Evaluation (runs hourly via cron)
```javascript
// Pseudocode for alert evaluation
for each orchard:
  fetch latest weather
  run all models
  for each model output:
    if risk >= orchard.alert_threshold:
      if not recently_alerted(cooldown):
        send_alert(email, sms, dashboard)
        log_alert()
```

### Alert Types
- **URGENT**: Fire blight extreme, scab infection event, frost kill risk
- **WARNING**: Fire blight high, scab infection starting, pest emergence imminent
- **ADVISORY**: Approaching thresholds, spray window reminders, PHI countdown

### Alert Content Template
```
🍎 OrchardGuard Alert — [ORCHARD NAME]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ FIRE BLIGHT: EXTREME RISK

CougarBlight: 385 DH (4-day) — EXTREME
MaryBlyt: 4/4 conditions met — INFECTION EVENT

ACTION: Apply streptomycin within 24h.
Rain forecast: Tomorrow 8am, 12mm expected.

Current conditions: 22°C, 78% humidity
Bloom stage: Full bloom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View dashboard: http://your-server/
```

---

## Environment Variables

```env
# Required
ORCHARD_LAT=43.65
ORCHARD_LON=-79.38
ORCHARD_NAME="My Apple Orchard"

# Optional — alerts
RESEND_API_KEY=re_xxxxx
ALERT_EMAIL=grower@example.com
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+1234567890
ALERT_PHONE=+1234567890

# Optional — Environment Canada
EC_STATION_ID=s0000458

# Optional — custom weather station
WEATHER_STATION_TYPE=davis|hobo|generic
```

---

## File Structure

```
orchard-guard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main dashboard
│   ├── diseases/
│   │   ├── page.tsx                # Disease overview
│   │   ├── fire-blight/page.tsx
│   │   ├── apple-scab/page.tsx
│   │   ├── powdery-mildew/page.tsx
│   │   ├── cedar-rust/page.tsx
│   │   ├── sooty-blotch/page.tsx
│   │   └── black-rot/page.tsx
│   ├── pests/
│   │   ├── page.tsx                # Pest overview
│   │   ├── codling-moth/page.tsx
│   │   ├── plum-curculio/page.tsx
│   │   ├── apple-maggot/page.tsx
│   │   └── mites/page.tsx
│   ├── weather/page.tsx
│   ├── spray-log/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── weather/
│       ├── models/
│       ├── orchard/
│       ├── alerts/
│       └── spray-log/
├── lib/
│   ├── db.ts                       # SQLite setup + migrations
│   ├── weather/
│   │   ├── open-meteo.ts
│   │   ├── env-canada.ts
│   │   └── csv-import.ts
│   ├── models/
│   │   ├── fire-blight.ts          # CougarBlight + MaryBlyt
│   │   ├── apple-scab.ts           # Mills table
│   │   ├── powdery-mildew.ts
│   │   ├── cedar-rust.ts
│   │   ├── sooty-blotch.ts
│   │   ├── black-rot.ts
│   │   ├── codling-moth.ts
│   │   ├── plum-curculio.ts
│   │   ├── apple-maggot.ts
│   │   ├── oriental-fruit-moth.ts
│   │   ├── leafroller.ts
│   │   ├── european-red-mite.ts
│   │   ├── frost-risk.ts
│   │   └── index.ts                # Run all models
│   ├── alerts/
│   │   ├── evaluator.ts
│   │   ├── email.ts
│   │   └── sms.ts
│   ├── degree-days.ts              # Shared DD calculations
│   └── utils.ts
├── components/
│   ├── dashboard/
│   │   ├── risk-card.tsx
│   │   ├── forecast-strip.tsx
│   │   └── alert-banner.tsx
│   ├── models/
│   │   ├── risk-gauge.tsx
│   │   ├── condition-dots.tsx
│   │   ├── degree-day-chart.tsx
│   │   └── infection-timeline.tsx
│   ├── weather/
│   │   ├── current-conditions.tsx
│   │   └── forecast-table.tsx
│   └── ui/                         # shadcn components
├── data/
│   └── orchard.db                  # SQLite database
├── .env.local
├── package.json
└── README.md
```

---

## Getting Started with Claude Code

After saving this file, open your terminal and run:

```bash
claude
```

Then paste:

```
Read the file ORCHARD_GUARD_SPEC.md and build the OrchardGuard application step by step. Start with:
1. Initialize the Next.js project with TypeScript, Tailwind, and shadcn/ui
2. Set up the SQLite database with all tables
3. Implement the weather data fetching (Open-Meteo first)
4. Build the fire blight model (we already have the math)
5. Build the apple scab Mills table model
6. Create the main dashboard page
7. Add remaining disease and pest models
8. Implement the alert system
9. Add the spray log
10. Polish the UI

My orchard is in Ontario, Canada. I had bad fire blight last season. Primary varieties are [YOUR VARIETIES HERE]. Use Open-Meteo as the primary weather source.
```

---

## Priority Order for Implementation

Build in this order — each step is independently useful:

1. **Weather engine + Fire blight** (you can use this immediately)
2. **Apple scab Mills table** (the other critical spring model)
3. **Frost risk** (essential during bloom)
4. **Main dashboard** (see everything at a glance)
5. **Codling moth degree days** (critical pest, June onwards)
6. **Alert system** (get notified without checking)
7. **Remaining disease models**
8. **Remaining pest models**
9. **Spray log + PHI tracking**
10. **Abiotic models + polish**
