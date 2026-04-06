# OrchardGuard — Irrigation Management System

Add a complete irrigation management module that tracks rainfall, forecasts water needs, calculates evapotranspiration, monitors soil moisture balance, and tells the grower exactly when and how much to irrigate.

---

## 1. Water Balance Model

The core of the irrigation system is a daily soil water balance:

```
Soil Water Today = Yesterday's Water 
                   + Rainfall 
                   + Irrigation Applied
                   - Evapotranspiration (ET)
                   - Deep Drainage (if above field capacity)
```

### Key Parameters (user configures in settings):

**Soil Properties:**
```
irrigation_config:
  id, orchard_id,
  soil_type TEXT (sand|loamy-sand|sandy-loam|loam|clay-loam|clay),
  root_depth_cm REAL DEFAULT 60,
  field_capacity_mm REAL,       -- auto-calculated from soil type
  wilting_point_mm REAL,        -- auto-calculated from soil type  
  available_water_mm REAL,      -- field_capacity - wilting_point
  management_allowable_depletion REAL DEFAULT 0.50,  -- irrigate at 50% depletion
  irrigation_type TEXT (drip|micro-sprinkler|overhead|none),
  irrigation_rate_mm_per_hour REAL,
  emitter_spacing_m REAL,
  row_spacing_m REAL,
  tree_spacing_m REAL,
  block_area_ha REAL,
  notes TEXT
```

**Auto-calculated soil defaults:**
| Soil Type | Field Capacity (mm/m) | Wilting Point (mm/m) | Available Water (mm/m) |
|---|---|---|---|
| Sand | 120 | 40 | 80 |
| Loamy Sand | 160 | 60 | 100 |
| Sandy Loam | 230 | 90 | 140 |
| Loam | 310 | 120 | 190 |
| Clay Loam | 360 | 170 | 190 |
| Clay | 400 | 210 | 190 |

For a 60cm root zone in sandy loam: available water = 140mm/m × 0.6m = 84mm total.
Management allowable depletion at 50% = irrigate when 42mm has been used.

### Daily Water Balance Table:
```
water_balance:
  id, orchard_id, date,
  rainfall_mm REAL,
  irrigation_mm REAL,
  et_reference_mm REAL,         -- ET₀ from Penman-Monteith
  crop_coefficient REAL,        -- Kc based on growth stage
  et_crop_mm REAL,              -- ET₀ × Kc
  soil_water_mm REAL,           -- current available water in root zone
  depletion_mm REAL,            -- how much has been used
  depletion_pct REAL,           -- percentage of available water used
  deep_drainage_mm REAL,        -- lost below root zone
  status TEXT,                  -- optimal|watch|irrigate|stress|saturated
  created_at TEXT DEFAULT (datetime('now'))
```

---

## 2. Evapotranspiration Calculation (ET₀)

Use the **FAO Penman-Monteith** simplified equation with available weather data:

### Hargreaves Method (when only temp data available):
```
ET₀ = 0.0023 × (T_mean + 17.8) × (T_max - T_min)^0.5 × Ra
```
Where Ra = extraterrestrial radiation (calculated from latitude and day of year).

This works with the Open-Meteo data you already have (just needs daily max/min temp).

### Enhanced calculation (when humidity + wind available):
Use the full Penman-Monteith with:
- Temperature (max, min, mean)
- Relative humidity
- Wind speed
- Solar radiation (from Open-Meteo if available, otherwise estimated)

### Crop Coefficient (Kc) by Growth Stage:
| Growth Stage | Kc | Notes |
|---|---|---|
| Dormant | 0.30 | Ground cover only, minimal tree transpiration |
| Silver Tip – Green Tip | 0.35 | Buds swelling, minimal leaf area |
| Tight Cluster – Pink | 0.50 | Leaves emerging, canopy expanding |
| Bloom | 0.65 | Active transpiration beginning |
| Petal Fall – June Drop | 0.85 | Full canopy expanding, fruit growing |
| Mid-Summer (Jul–Aug) | 1.05 | Peak demand — full canopy, fruit sizing |
| Late Summer (Sep) | 0.90 | Fruit maturing, reduced growth |
| Post-Harvest | 0.65 | Leaf senescence beginning |
| Leaf Drop | 0.35 | Declining |

Kc automatically adjusts based on the bloom_stage setting.

**Crop ET = ET₀ × Kc**

---

## 3. Irrigation Scheduling

### When to Irrigate

The system monitors daily soil water depletion and alerts when irrigation is needed:

```
SOIL MOISTURE STATUS:

██████████████████████████░░░░░░░░░░ 72% available
                                     
Optimal ←──────────→ Watch ←──→ Irrigate ←→ Stress
100%                  60%         50%         30%

Current: 72% available — OPTIMAL
Estimated days to irrigation trigger: 4 days (based on forecast ET)
```

**Status levels:**
- **Optimal** (100-60% available): No action needed
- **Watch** (60-50%): Approaching irrigation trigger, monitor closely  
- **Irrigate** (50-30%): Below management allowable depletion — irrigate now
- **Stress** (<30%): Tree stress occurring — irrigate immediately, potential crop damage
- **Saturated** (>100%): Over field capacity — drainage occurring, stop irrigation

### How Much to Irrigate

When irrigation is triggered, calculate the exact amount:

```
Irrigation Needed = Depletion × Efficiency Factor

Example:
  Available water capacity: 84 mm
  Current depletion: 50% = 42 mm depleted
  Target: refill to field capacity
  Irrigation needed: 42 mm
  
  System efficiency:
    Drip: 90% → Apply 42 / 0.90 = 46.7 mm
    Micro-sprinkler: 80% → Apply 42 / 0.80 = 52.5 mm
    Overhead: 70% → Apply 42 / 0.70 = 60 mm

  At your drip rate of 4 mm/hour:
  Run time: 46.7 / 4 = 11.7 hours
```

### Irrigation Recommendation Card:
```
💧 IRRIGATION NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Soil moisture has dropped to 48% available.
Below your 50% trigger threshold.

APPLY: 47 mm (to refill to field capacity)

Your drip system at 4 mm/hr:
  Run time: ~12 hours
  Best start: Tonight 8 PM → 8 AM tomorrow
  
  Water volume: 470 m³/ha (47mm × 10,000m²/ha)
  Estimated cost: $28/ha at $0.06/m³

Forecast check: No rain in next 5 days.
If 8mm rain forecast Thursday, reduce application 
to 39mm (saves ~2 hours run time).

[Log irrigation →]  [Dismiss — I'll check soil first →]
```

---

## 4. Rainfall Tracking

### Automatic from Weather API
- Already pulling precipitation from Open-Meteo
- Track cumulative rainfall: daily, weekly, monthly, season-to-date
- Compare to historical average for the period

### Manual Rain Gauge Entry
Some growers have their own rain gauges. Allow manual override:
```
irrigation_rainfall_manual:
  id, orchard_id, date, amount_mm, source (gauge|estimate), notes
```
When manual entry exists, use it instead of API data (more accurate for specific orchard location).

### Effective Rainfall
Not all rainfall enters the root zone. Calculate effective rainfall:
- Rain < 5mm: mostly intercepted by canopy, ~25% effective
- Rain 5-25mm: ~75% effective
- Rain 25-75mm: ~90% effective  
- Rain > 75mm: excess runs off or drains, cap at ~75mm effective per event

```
Effective rainfall = min(actual × efficiency_factor, 75mm)
```

---

## 5. Forecast-Driven Irrigation

### Smart Scheduling Based on Weather Forecast

Don't just react — plan ahead:

```
💧 IRRIGATION FORECAST — Next 7 Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current soil water: 68% available (57mm of 84mm)
Daily crop ET: ~4.2 mm/day (mid-summer, Kc=1.05)

Day       Rain    ET     Balance  Status
─────────────────────────────────────────
Today      0mm   4.2mm   53mm     Optimal
Tomorrow   0mm   4.5mm   48mm     Watch
Wednesday  0mm   4.3mm   44mm     Watch
Thursday   8mm   3.8mm   48mm     Watch ← rain helps
Friday     0mm   4.5mm   44mm     Watch
Saturday   0mm   4.8mm   39mm     ⚠️ IRRIGATE
Sunday     0mm   4.2mm   35mm     ⚠️ Stress risk

📋 RECOMMENDATION:
Without irrigation, you'll hit the trigger threshold 
Saturday. Thursday's rain (8mm, ~6mm effective) buys 
you about 1.5 extra days.

OPTION A: Irrigate Wednesday night
  Apply 30mm (8 hours). Brings you to 74mm.
  Next irrigation needed: ~8 days later.
  
OPTION B: Wait for Thursday rain, irrigate Friday
  If rain delivers 8mm+, irrigate Friday with 25mm.
  Risk: if rain doesn't materialize, you're at 44mm 
  and falling. Tight window.

RECOMMENDED: Option A — irrigate Wednesday night.
More reliable. Don't gamble on forecast rain.
```

### Rain Skip Logic
If irrigation is scheduled but rain is forecast:
- Rain >10mm in next 24h with >70% probability: "Skip irrigation — rain expected"
- Rain 5-10mm: "Reduce irrigation by forecast amount"
- Rain <5mm or <50% probability: "Irrigate as planned — forecast rain insufficient"

---

## 6. Irrigation Logging

### Log Table:
```
irrigation_log:
  id, orchard_id, date, 
  block TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_hours REAL,
  amount_mm REAL,
  source TEXT (drip|micro-sprinkler|overhead|manual),
  water_volume_m3 REAL,
  cost REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
```

### Quick Log Interface:
- Start/stop timer for active irrigation
- Or manual entry: date, duration, amount
- Auto-calculate amount from duration × system rate
- Auto-calculate cost from volume × water price

---

## 7. Critical Irrigation Periods for Apples

Flag these high-demand periods with elevated monitoring:

### Fruit Cell Division (3-6 weeks after bloom)
```
⚠️ CRITICAL PERIOD: Fruit Cell Division
Weeks 3-6 after bloom. Water stress now permanently 
reduces fruit size. Maintain soil moisture above 60% 
available. Current: 65% — monitor closely.

This is the most important irrigation period of the 
season. Fruit size is determined NOW. You cannot make 
up for water stress later with extra irrigation.
```

### Fruit Sizing (June–August)
```
Peak water demand period. ET can reach 5-6mm/day.
Maintain soil moisture above 50% available.
Monitor every 2-3 days during hot dry stretches.
```

### Pre-Harvest (2-4 weeks before harvest)
```
⚠️ Reduce irrigation 2 weeks before harvest.
Excess water reduces: sugar content, color development, 
storage quality. Let soil moisture decline to 40-45% 
available. Do NOT let it reach stress level.

Variety-specific:
  Honeycrisp: reduce to 40% — improves color and firmness
  Gala: reduce to 45% — improves sugar/acid balance
  McIntosh: reduce to 40% — helps with color
```

### Post-Harvest (fall)
```
Gradually reduce irrigation after harvest.
Trees still need water for:
  - Nutrient storage in roots
  - Winter hardiness preparation
  - Root growth continues into October

Stop irrigation when trees enter dormancy or ground freezes.
Do NOT send trees into winter with dry soil — drought stress 
reduces winter hardiness.
```

---

## 8. Frost Protection Irrigation

During bloom, overhead irrigation can protect against frost:

```
❄️ FROST PROTECTION MODE

Forecast low tonight: -3°C
Bloom stage kill threshold: -2.2°C (10% kill)

Overhead irrigation for frost protection:
  - Start when temp drops to 0°C
  - Run continuously until temp rises above 0°C AND 
    all ice has melted on trees
  - Application rate: minimum 2.5 mm/hour for protection to -3°C
  - Rate needed: 2.5mm/hr × your area
  
  ⚠️ DO NOT start and stop — intermittent irrigation 
  causes MORE damage than no irrigation at all. The 
  evaporative cooling effect when you stop can drop 
  temperatures below ambient.

  Your system capacity: [X] mm/hr
  Can protect to: [calculated temp based on rate]
  
  Estimated water use: 8-12 hours × rate × area
  Make sure your water supply can sustain this duration.
```

---

## 9. Soil Moisture Sensor Integration (Optional)

For growers with soil moisture sensors:

```
soil_sensors:
  id, orchard_id, block, depth_cm, sensor_type,
  serial_number, calibration_date, notes

soil_readings:
  id, sensor_id, timestamp,
  volumetric_water_content REAL,  -- percentage
  soil_temperature_c REAL,
  battery_level REAL,
  raw_value REAL
```

Support common sensor types:
- Watermark (resistance-based) — readings in kPa
- Capacitance probes (FDR) — readings in % VWC
- TDR probes — readings in % VWC
- Manual: tensiometer readings

If sensor data available, use it to calibrate/override the water balance model:
"Water balance model estimates 55% available. Your sensor at 30cm reads 62%. Using sensor data."

If no sensors: model runs entirely on weather data + irrigation/rainfall logs. Still very useful.

---

## 10. Dashboard Integration

### New Sidebar Item: 💧 Irrigation (under MANAGE)

### Dashboard Water Status Card:
```
┌─────────────────────────────────────────────────┐
│  💧 Soil Moisture                    OPTIMAL    │
│                                                 │
│  ████████████████████░░░░░░░░░░  68% available  │
│                                                 │
│  Today's ET: 4.2 mm  |  Rain 24h: 0 mm         │
│  Next irrigation: ~4 days (est. Saturday)       │
│                                                 │
│  Season: 280mm rain + 120mm irrigated           │
│          vs 350mm crop demand (ET)              │
└─────────────────────────────────────────────────┘
```

Show this card on the main dashboard between weather and the action items.

### `/irrigation` Page:
- Large soil moisture gauge (like the health score ring but for water)
- 7-day water balance forecast chart (stacked area: rainfall, irrigation, ET)
- Irrigation history log
- Season water budget summary
- Quick log buttons: "Start irrigation" / "Log manual irrigation" / "Log rain gauge"
- Settings: soil type, system type, rates, costs

### Water Balance Chart:
Visual chart showing:
- Blue bars: rainfall
- Green bars: irrigation
- Red line: ET (crop water use)
- Shaded area: soil moisture level
- Dashed line: irrigation trigger threshold
- Projected forward 7 days based on forecast

---

## 11. Water Budget & Cost Tracking

### Season Summary:
```
💧 2026 Season Water Budget
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUPPLY:
  Rainfall:        312 mm (season to date)
  Effective rain:  248 mm (after interception/runoff)
  Irrigation:      145 mm (applied)
  Total supply:    393 mm

DEMAND:
  Crop ET:         420 mm (season to date)
  
BALANCE:           -27 mm (slight deficit)

COST:
  Water volume:    1,450 m³/ha
  Cost at $0.06/m³: $87/ha
  Pumping energy:  ~$42/ha
  Total irrigation cost: $129/ha
  
  vs. estimated yield benefit: $2,000-4,000/ha
  ROI: irrigating is significantly cost-effective

COMPARISON TO AVERAGE:
  This season: 12% drier than 10-year average
  Irrigation demand: 18% above typical
```

---

## 12. Alerts

### Irrigation-Specific Alerts:

**3 days before trigger:**
"Soil moisture declining. At current ET rate, you'll need to irrigate by Saturday. Check system is operational."

**At trigger threshold:**
"💧 IRRIGATE — Soil moisture at 48% available (below 50% trigger). Apply 47mm. Run drip for 12 hours. Best tonight."

**Stress warning:**
"⚠️ WATER STRESS — Soil moisture at 28%. Trees are experiencing stress. Irrigate immediately. Fruit sizing will be impacted."

**Rain skip:**
"Rain forecast (15mm) tonight. Skip planned irrigation. Will reassess tomorrow after actual rainfall measured."

**Frost protection:**
"❄️ FROST ALERT — Low of -3°C tonight during bloom. If you have overhead irrigation, prepare for frost protection. Start when temp reaches 0°C. Run continuously."

**Post-harvest reduction:**
"Harvest approaching on Honeycrisp. Reduce irrigation to allow soil moisture to decline to 40-45%. Improves color and storage quality."

**End of season:**
"Trees entering dormancy. Ensure adequate soil moisture before freeze-up. One final deep irrigation if soil is dry."

---

## 13. Implementation Notes

- ET calculation runs daily using weather data already in the system
- Water balance updates automatically when weather refreshes
- Rainfall from Open-Meteo feeds directly into the balance
- Manual rain gauge overrides API data when entered
- Irrigation logs feed back into the balance
- Forecast-driven projections update hourly with new weather data
- All calculations happen server-side in the existing cron job
- Sensor integration is optional — system works without sensors
- Cost tracking pulls water prices from settings

## 14. Database Migrations

Add all new tables in a single migration:
- irrigation_config
- water_balance (daily records)
- irrigation_log
- irrigation_rainfall_manual
- soil_sensors (optional)
- soil_readings (optional)

Seed irrigation_config with defaults based on user's soil type selection.

## 15. Settings Addition

Add to the Settings page under a new "Irrigation" section:
- Soil type dropdown (auto-fills field capacity and wilting point)
- Root depth slider (30-120cm, default 60)
- Management allowable depletion slider (30-70%, default 50%)
- Irrigation system type
- Application rate (mm/hour)
- Water cost ($/m³)
- Enable/disable irrigation module toggle
