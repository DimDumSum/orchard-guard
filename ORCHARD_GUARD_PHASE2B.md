# OrchardGuard Phase 2B — Expanded Disease & Pest Models

## Full Ontario Apple Disease Library

Read this spec and add ALL of the following disease and pest models to OrchardGuard. Each model should include: weather-driven risk calculation, scouting protocol, action thresholds, product recommendations from the existing product database, and integration with the dashboard risk cards.

---

### FUNGAL DISEASES

---

#### 1. Apple Scab (Venturia inaequalis) — ALREADY BUILT, ENHANCE PER PHASE 2

Primary disease. See Phase 2 spec for enhancements (Mills table interpolation, ascospore maturity curve, kickback timers, dormant-stage gating).

**Additional enhancement — Secondary Scab:**
- After primary season ends (100% ascospore maturity), switch to secondary scab mode
- Secondary infections come from conidia produced on existing lesions
- Risk calculation: if primary season had >3 unprotected infections, secondary risk = HIGH
- Secondary scab needs: leaf wetness >6h at temps 15-25°C
- Fruit infections increasingly important as season progresses
- Show: "Primary scab season ended [date]. Secondary risk: [level] based on [X] primary infections this season."
- Pin scab risk indicator shows fruit vs leaf infection risk separately after June

**Scab Races / Resistance:**
- Note if user grows Vf-resistant varieties (e.g., Liberty, Enterprise, Pristine)
- Flag: race 6 and 7 of V. inaequalis can overcome Vf resistance in some Ontario regions
- Recommend monitoring resistant varieties, not assuming zero risk

---

#### 2. Powdery Mildew (Podosphaera leucotricha) — ALREADY BUILT, ENHANCE

**Full model:**
- Overwintering: mycelium in infected buds (flag-shoots emerge at green tip)
- Primary inoculum: conidia from flag shoots, released in dry weather
- Optimal conditions: 10-25°C, RH 70-90%, NO rain (rain inhibits spore germination)
- Infection cycle: 48h from spore landing to new conidia production at 20°C
- Most critical window: tight cluster through 2 weeks post-bloom (new leaf tissue highly susceptible)
- Secondary spread: continues all summer on succulent shoot growth

**Risk scoring:**
- Flag shoot risk: based on previous year's mildew severity (user logs)
- Daily infection risk: hours at 10-25°C with RH >70% and no rain
- Cumulative risk: consecutive favorable days multiply risk
- Susceptible growth present: yes/no based on shoot growth activity

**Variety susceptibility ratings (Ontario):**
| Variety | Susceptibility |
|---|---|
| Cortland | Very High |
| McIntosh | High |
| Idared | High |
| Jonagold | High |
| Gala | Moderate |
| Empire | Moderate |
| Honeycrisp | Moderate |
| Red Delicious | Low-Moderate |
| Northern Spy | Low |
| Liberty | Resistant |

---

#### 3. Cedar Apple Rust (Gymnosporangium juniperi-virginianae) — ALREADY BUILT, ENHANCE

**Full model:**
- Requires juniper/cedar hosts within 3-5 km (user setting: juniper proximity)
- Telial horn emergence: spring rains after sustained temps >10°C
- Spore release: requires >2.5mm rain at >10°C for >4 continuous hours
- Basidiospore viability: 1-3 hours after release (short range dispersal)
- Apple infection window: green tip through 30 days after bloom
- Infection period: 6-12 hours of wetness at 8-24°C (optimal 13-21°C)
- Incubation: symptoms appear 10-18 days after infection (temperature dependent)
- Symptom prediction: infection date + degree days (base 0°C) ~200 DD = yellow spots visible

**Risk scoring:**
- Check: juniper nearby? → rain event meeting criteria? → susceptible window? → wetness + temp criteria?
- All four conditions = infection event
- Show: "Rust infection event [date]. Expect symptoms by approximately [date]."

**Related rusts to also track:**
- Quince rust (G. clavipes) — affects fruit, more damaging, same weather triggers but longer wetting needed (>24h)
- Hawthorn rust (G. globosum) — affects leaves, similar conditions to cedar apple rust
- Track all three with shared weather model, separate alert cards

---

#### 4. Sooty Blotch & Flyspeck Complex (SBFS) — ALREADY BUILT, ENHANCE

**Full model (expanded pathogen complex):**
- Actually 30+ species of fungi causing the SBFS complex
- Primary model: cumulative hours of relative humidity ≥97% since petal fall
- Three regional thresholds:
  - Maritime/cool-wet: 175 hours
  - Central Ontario: 200 hours
  - Warm/dry microclimate: 270 hours
- Reset rules:
  - Partial reset: subtract 24h from accumulation for each consecutive day where RH never reaches 90%
  - Major reset: 7+ consecutive days with max RH <90% → reset to zero
  - Heavy rain event (>25mm): does NOT reset, adds humidity hours
- Show: cumulative hours as percentage toward threshold with projected date of reaching threshold based on historical RH patterns

**Fruit protection timing:**
- First cover spray timing to prevent SBFS: typically 7-10 days after petal fall
- Re-spray interval: 10-14 days (shorter in wet weather)
- Critical protection period: June through August
- Late season: if threshold approached, apply Captan or Pristine within 2 weeks of harvest

---

#### 5. Black Rot / Frogeye Leaf Spot (Botryosphaeria obtusa)

**New model — add to system.**

**Epidemiology:**
- Overwinters in: mummified fruit (primary), cankers, dead wood
- Spore release: rain events during growing season
- Infection requirements: leaf wetness ≥9 hours at 15-30°C (optimal 20-25°C)
- Incubation: 1-3 weeks depending on temperature
- Disease cycle: polycyclic — each infection produces more spores for further infections

**Risk calculation:**
- Inoculum potential: user rates (none / low / moderate / high) based on mummies and cankers present
- Per wet period: check hours of wetness at qualifying temperatures
- If inoculum present AND infection criteria met → flag event
- Fruit becomes susceptible after early June (enlarging fruit with lenticels)

**Scouting protocol:**
- Check for frogeye leaf spots: tan circular lesions with purple border
- Check fruit for rot: starts at calyx or wound, firm brown/black rot
- Mummy count: number of mummified fruit visible in canopy and on ground

**Cultural recommendations:**
- "Remove mummified fruit during dormant pruning — primary inoculum source"
- "Prune out dead wood and cankers"
- "Mow fallen leaves and fruit to promote decomposition"

---

#### 6. Bitter Rot (Colletotrichum spp.)

**New model.**

**Epidemiology:**
- Increasing problem in Ontario with warming temperatures
- Overwinters in: cankers, mummified fruit, dead bark
- Requires warm temperatures: minimum 15°C, optimal 25-32°C
- Infection: rain splash + warm temps, 5+ hours wetness
- Latent infections common: fruit infected early, symptoms appear near harvest
- Most damage in hot, wet summers (July-August)

**Risk calculation:**
- Track degree days base 15°C from petal fall
- Risk activates when cumulative DD >200 AND wet period occurs at temps >21°C
- Higher risk in seasons with frequent July-August rain events
- Risk level: LOW (cool dry summer), MODERATE (occasional warm rain), HIGH (frequent warm wet periods), EXTREME (sustained hot wet weather)

**Alert triggers:**
- "Hot wet period forecast in July/August with bitter rot inoculum present — apply Captan + phosphorous acid within 48h"
- Track latent infection risk: "X potential infection events since June. Consider pre-harvest Captan application."

---

#### 7. White Rot / Bot Rot (Botryosphaeria dothidea)

**New model.**

**Epidemiology:**
- Similar to black rot but favors warmer temps
- Infection primarily through lenticels on fruit
- Temperature requirement: >25°C with wetness
- Most problematic in southern Ontario (Norfolk, Niagara) in warm years
- Canker phase: sunken bark cankers on trunks and limbs

**Risk calculation:**
- Track hot+wet events (>25°C + >6h wetness) from June through harvest
- Cumulative risk score based on number of infection events
- Flag when >3 qualifying events occur: "Elevated white rot risk this season"

---

#### 8. Brooks Spot (Mycosphaerella pomi)

**New model.**

**Epidemiology:**
- Often overlooked, causes dark sunken lesions on fruit at harvest
- Infection period: petal fall through mid-June
- Requires moderate temps (15-25°C) and extended wetness (>24 hours)
- Symptoms don't appear until August-September
- Commonly confused with bitter pit or cork spot

**Risk calculation:**
- Track wet periods >24h at 15-25°C during petal fall through June
- If >2 extended wet periods in window → flag moderate risk
- Show: "Brooks spot infection events this spring: [X]. Watch for symptoms in August."

---

#### 9. Alternaria Leaf Blotch / Core Rot (Alternaria mali / A. alternata)

**New model.**

**Epidemiology:**
- Core rot: spores enter through open calyx during bloom
- Leaf blotch: warm wet conditions promote infection
- Core rot often not detected until storage or eating
- Susceptible varieties: Gala, Fuji, Red Delicious

**Risk calculation:**
- Bloom-period rain events: flag each rain event during open bloom
- "X rain events during bloom — moderate core rot risk for susceptible varieties"
- Foliar phase: wet periods >12h at >20°C during summer

---

#### 10. Nectria Canker / European Canker (Neonectria ditissima)

**New model.**

**Epidemiology:**
- Major problem in some Ontario orchards
- Infection through: leaf scars (fall), pruning wounds (winter/spring), picking wounds (harvest)
- Optimal infection conditions: 11-16°C with rain
- Fall leaf-scar infection: critical window — 2 weeks around leaf drop
- Year-round canker expansion; girdles branches

**Risk calculation:**
- Fall: rain events at 11-16°C during leaf drop period → HIGH risk
- Spring: rain events at pruning wound healing time → MODERATE risk
- Summer: wet conditions + wound events (hail, insect damage) → flag
- Show: "Nectria canker risk during leaf fall: [level]. Consider copper application at 50% leaf drop."

**Management timing:**
- Dormant copper at silver tip
- Fall copper at 50% and 90% leaf drop
- Pruning hygiene: seal large cuts with wound paint in wet weather

---

#### 11. Phytophthora Crown/Root Rot (Phytophthora spp.)

**New model.**

**Epidemiology:**
- Soilborne — favors waterlogged soils
- Most common on dwarfing rootstocks (M.9, M.26)
- Symptoms: poor growth, leaf chlorosis, collar rot at soil line
- Infection: prolonged soil saturation at soil temps >10°C

**Risk calculation:**
- Track consecutive days with >10mm precipitation
- Soil temperature estimate from air temp (lagged ~2°C)
- Flag: ">3 consecutive days saturated soil at soil temp >10°C on susceptible rootstock"
- Higher risk in poorly drained sites (user marks drainage quality)

**Alert:**
- "Extended wet period — monitor M.9 rootstock blocks for Phytophthora symptoms"
- "Consider phosphorous acid drench for at-risk blocks"

---

#### 12. Apple Replant Disease Complex

**New model — advisory only (not weather-driven).**

- User logs: is this block a replant site? (yes/no, with year planted)
- If replant: flag "Replant disease risk. Consider fumigation, rootstock selection, or biological amendments."
- Track tree vigor ratings for replant blocks vs established blocks
- Not weather-modeled but important for orchard planning

---

#### 13. Flyspeck — see SBFS (combined model above)

---

#### 14. Bull's Eye Rot / Gloeosporium Rot (Neofabraea spp.)

**New model.**

**Epidemiology:**
- Primarily a storage disease but infection occurs in the orchard
- Spore release: late summer rain events from cankers on wood
- Infection through lenticels: August through harvest
- Latent: symptoms appear after 3-4 months in storage

**Risk calculation:**
- Late season (Aug-Oct) rain events: count and intensity
- If orchard has canker history: flag late-season rain events as infection risk
- "X late-season infection events. Consider pre-harvest fungicide and prompt cold storage."

---

#### 15. Post-Harvest Diseases (Blue Mold, Gray Mold, Mucor)

**Advisory model — not weather-driven.**

- Track pre-harvest risk factors: hail damage, insect wounds, handling bruises
- Recommend: "Pre-harvest wound events detected. Apply post-harvest treatment or prioritize for immediate sale, not long storage."
- Storage temperature monitoring integration (future feature)

---

### BACTERIAL DISEASES

---

#### 16. Fire Blight (Erwinia amylovora) — ALREADY BUILT, ENHANCE PER PHASE 2

See Phase 2 spec for full CougarBlight v5.1 + MaryBlyt v7.1 implementation.

**Additional — Shoot Blight Phase:**
- After bloom, track shoot blight risk separately
- Shoot blight drivers: active cankers + sucking insects (aphids, leafhoppers) + trauma events (hail, wind)
- Trauma blight model:
  - Hail event at temps >15°C with blight inoculum present → EXTREME shoot/trauma blight risk
  - Wind >60 km/h with inoculum → HIGH risk (wind whipping creates wounds)
  - Apply streptomycin within 24h of trauma event if blight history present
- Rootstock blight:
  - Track infections moving toward rootstock on dwarfing trees
  - Flag: "Fire blight strike within 30cm of graft union on M.9 — urgent removal required to save tree"
- Post-bloom management:
  - Track Apogee application timing and efficacy window
  - "Apogee applied [date]. Growth suppression active for approximately 3-4 weeks. Re-apply if vigorous regrowth."

---

### VIRAL / PHYTOPLASMA DISEASES

---

#### 17. Apple Mosaic Virus

**Advisory model — not weather-driven.**
- Scouting log: flag trees showing mosaic leaf patterns in spring
- Track locations of symptomatic trees on block map
- Note: no cure, manage by removal of severely affected trees
- Advisory: "Avoid propagation wood from symptomatic trees"

---

#### 18. Apple Proliferation Phytoplasma

**Advisory model.**
- Scouting log for symptoms: witches' brooms, small fruit, enlarged stipules
- Vector: psyllids — track psyllid populations if present
- Advisory: rare in Ontario but emerging. Log and report suspicious symptoms.

---

### PHYSIOLOGICAL / ABIOTIC DISORDERS

---

#### 19. Bitter Pit — ALREADY BUILT, ENHANCE

**Full predictive model:**
- Primary drivers: low fruit calcium, high nitrogen, light crop load, large fruit size, hot dry weather
- Calcium demand model:
  - Track daily max temps during cell division (June-July)
  - Cumulative hours >30°C = stress indicator
  - Irrigation deficit tracking (if user has soil moisture data)
- Variety susceptibility:
  - Very High: Honeycrisp, Spy, Mutsu
  - High: Cortland, Jonagold
  - Moderate: Empire, Gala
  - Low: McIntosh, Red Delicious
- Crop load factor: user enters estimated crop load (light/moderate/heavy)
- Risk score = variety factor × crop load factor × temperature stress × calcium spray compliance
- Show: "Bitter pit risk: HIGH. Honeycrisp block with light crop load and 5 missed calcium sprays."
- Calcium spray schedule: "Next calcium spray due in [X] days. You've completed [Y] of recommended [Z] sprays this season."

---

#### 20. Sunscald / Southwest Injury — ALREADY BUILT, ENHANCE

**Add:**
- Late winter bark temperature model: estimate bark temp from air temp + solar radiation
- South/southwest exposure = +15°C above air temp on sunny winter days
- When daytime bark temp >0°C followed by night temp <-15°C → injury likely
- Track these events cumulatively through Dec-March
- Young tree alert: "Trees <5 years old: apply white latex trunk paint before November"

---

#### 21. Frost Ring / Frost Damage on Fruit

**New model.**
- Post-bloom frost events during cell division
- Track frost events (min temp <0°C) during first 30 days after bloom
- Symptoms: russeted ring or misshapen fruit, visible at harvest
- Show: "Frost event at [temp] during early fruit development on [date]. Monitor fruit for frost ring symptoms."

---

#### 22. Water Core

**New model (pre-harvest).**
- Associated with: late harvest, warm days/cool nights, certain varieties (Fuji, Delicious)
- Risk increases when: nighttime temps <10°C with daytime >20°C and fruit overmaturity
- Show risk as harvest approaches for susceptible varieties
- "Water core conditions developing. Consider advancing harvest on Fuji block."

---

#### 23. Sunburn on Fruit

**New model.**
- Sudden exposure to high solar radiation + temps >32°C
- Risk increases after: thinning (newly exposed fruit), summer pruning
- Track: daily max temp + UV index estimates
- Alert: ">32°C forecast with high UV. Recently thinned blocks at risk for fruit sunburn. Consider kaolin clay (Surround) application."

---

## Full Ontario Apple Pest Library

---

### LEPIDOPTERA (Moths & Caterpillars)

---

#### 24. Codling Moth (Cydia pomonella) — ALREADY BUILT, ENHANCE PER PHASE 2

See Phase 2 spec for pheromone trap integration, biofix detection, 2-generation tracking.

**Additional:**
- Spray window visualization: green/yellow/red zones on DD timeline
- Mating disruption tracking: if user uses dispensers, note reduced trap thresholds
- Fruit entry detection: scouting log for frass at calyx and side entries
- Sting/entry damage tracking: % fruit damage at harvest for year-over-year comparison
- Second generation: independent biofix optional, or default to 1050 DD from first biofix
- Third generation risk: if DD accumulation >2000 from first biofix, flag potential 3rd gen (uncommon in Ontario but possible in warm years)

---

#### 25. Oriental Fruit Moth (Grapholita molesta) — ALREADY BUILT, ENHANCE

**Full model:**
- Base: 7.2°C
- Biofix: first sustained catch in pheromone trap
- Generation timing from biofix:
  - 1st gen larvae: 170-350 DD (attack shoots first, then fruit)
  - 2nd gen: 680-850 DD (primarily fruit)
  - 3rd gen: 1400+ DD (late season fruit entry)
- Shoot flagging model: first gen larvae bore into growing shoot tips → wilting/flagging
- Differentiation from fire blight: OFM flagging = clean wilting at tip; fire blight = blackened, shepherd's crook
- Scouting protocol: check 10 shoot tips per block, flag if >2% wilted

---

#### 26. Obliquebanded Leafroller (Choristoneura rosaceana) — ALREADY BUILT, ENHANCE

**Full model:**
- Overwintering larvae emerge at ~115 DD base 6°C from March 1
- Spring generation feeds on leaves and buds
- Summer generation (more damaging to fruit): ~700 DD base 6°C from March 1
- Adults: 1100-1250 DD base 6°C
- Scouting: check 25 fruit clusters, threshold = 3% with live larvae
- Resistance note: some Ontario populations have developed resistance to organophosphates

---

#### 27. Spotted Tentiform Leafminer (Phyllonorycter blancardella)

**New model.**

**Biology:**
- 3 generations per year in Ontario
- Tiny moths lay eggs on leaf undersides
- Larvae create blotch mines in leaves — first tissue-feeding, then sap-feeding
- Tissue-feeding instars: little damage. Sap-feeding instars: can reduce photosynthesis if severe

**Degree day model (base 6.1°C from March 1):**
- 1st gen adults: ~200 DD
- 1st gen sap-feeding larvae: ~350 DD → scout
- 2nd gen adults: ~650 DD
- 2nd gen sap-feeding larvae: ~850 DD → scout (most damaging generation)
- 3rd gen adults: ~1150 DD

**Thresholds:**
- Count mines per leaf on 10 leaves per tree, 5 trees per block
- Action threshold: >5 sap-feeding mines per leaf on >50% of leaves
- Below threshold: parasitoid wasps usually provide adequate control
- Note: "Leafminer populations often controlled by natural enemies. Avoid broad-spectrum sprays early season to conserve parasitoids."

---

#### 28. Lesser Appleworm (Grapholita prunivora)

**New model.**
- Often confused with codling moth but smaller, shallower boring
- DD model: base 10°C, similar timing to codling moth but 2 weeks earlier
- First generation: ~80 DD from biofix
- Less economically important but can cause surface scarring
- Track alongside codling moth
- Note: "If codling moth program is in place, lesser appleworm is usually controlled."

---

#### 29. Eyespot Bud Moth (Spilonota ocellana)

**New model.**
- Spring: larvae emerge from overwintering and tie leaves together
- Feed on buds, flowers, and young fruit
- One generation per year
- Adults fly in July
- DD model: base 5°C, larvae active at ~100 DD from April 1
- Threshold: >5% of buds infested at tight cluster
- Usually a minor pest; becomes significant after warm winters

---

#### 30. Winter Moth (Operophtera brumata)

**New model.**
- Invasive species, spreading in Eastern Canada
- Adult males fly late November-December (unique timing)
- Larvae hatch at bud break, feed on expanding leaves and flowers
- Can completely defoliate young trees
- DD model: base 5°C from Jan 1, larvae active at ~50-100 DD (coincides with green tip)
- Scouting: sticky bands on trunks in November to trap wingless females climbing to lay eggs
- Alert: "Green tip approaching — check for winter moth larvae emerging in buds"

---

#### 31. Apple Clearwing Moth (Synanthedon myopaeformis)

**New model.**
- Borer — larvae tunnel in bark at graft union, especially on dwarfing rootstocks
- Adults: wasp-like moths, fly June-August
- DD model: base 10°C, first emergence ~400 DD from Jan 1
- Pheromone traps available for monitoring
- Damage: weakened graft union, tree lean/breakage, entry points for disease
- Scouting: look for frass and sawdust-like debris at graft union
- Alert: "Apple clearwing moth emergence expected in [X] days. Scout graft unions for frass."

---

#### 32. Dogwood Borer (Synanthedon scitula)

**New model.**
- Similar to clearwing moth — borrows in burr knots on rootstock
- Very common on M.9, M.26 rootstocks with exposed burr knots
- Adults: June-August, peak at ~800 DD base 10°C from Jan 1
- Management: paint exposed burr knots with white latex, mound soil over graft union
- Scouting: inspect burr knots for entry holes and frass
- Advisory: "Dogwood borer activity period starting. Inspect burr knots on dwarfing rootstock blocks."

---

### HEMIPTERA (True Bugs & Aphids)

---

#### 33. Rosy Apple Aphid (Dysaphis plantaginea)

**New model.**

**Biology:**
- Most damaging aphid in Ontario apples
- Overwintering eggs hatch at green tip to tight cluster
- Colonies curl leaves and distort fruit (small, misshapen "aphid apples")
- Damage is done early — by bloom, fruit distortion is locked in
- Migrates to plantain (summer host) by late June, returns in fall

**Model:**
- Egg hatch: DD base 5°C from March 1, ~80-120 DD
- Critical window: green tip through pink (MUST control before bloom)
- Post-bloom control is largely futile — damage already done
- Scouting: check 100 flower clusters at pink, threshold = 1-2% infested clusters

**Alert triggers:**
- "Rosy apple aphid hatch expected in [X] days. Scout at green tip."
- "1% infestation at pink — apply insecticide NOW before bloom. After bloom control will not prevent fruit deformation."

---

#### 34. Green Apple Aphid (Aphis pomi)

**New model.**
- Less damaging than rosy apple aphid
- Present all season on shoot tips
- Honeydew → sooty mold on fruit
- Threshold: 50% of terminals infested with active colonies
- Usually controlled by natural enemies (ladybugs, lacewings, syrphid flies)
- Advisory: "Green apple aphid populations moderate. Natural enemy activity: [observed/not observed]. Consider targeted spray only if >50% terminals infested AND natural enemies absent."

---

#### 35. Woolly Apple Aphid (Eriosoma lanigerum)

**New model.**
- Colonies on wounds, pruning cuts, root systems
- White waxy coating distinctive
- Root infestations cause galls, weaken trees
- Aerial colonies on trunks and branches — visible as white cottony masses
- Spread by crawlers and wind
- Threshold: expanding colonies on >10% of trees
- Natural enemy: Aphelinus mali (parasitoid wasp) — check for mummies
- Advisory: "Woolly apple aphid colonies expanding. Parasitoid activity: [present/absent]. Apply targeted spray to aerial colonies if parasitoids insufficient."

---

#### 36. Tarnished Plant Bug (Lygus lineolaris)

**New model.**
- Feeds on developing fruit causing dimpling/catfacing
- Most damaging: petal fall through 3 weeks post-bloom
- Active when temps >15°C, associated with weedy orchard floors
- Moves into orchard from adjacent alfalfa, clover, or weed hosts
- DD model: active at ~150 DD base 5°C from April 1
- Scouting: tap 25 flower clusters onto white board, threshold = 4-5 per 25 clusters
- Management: mow orchard floor BEFORE bloom to reduce habitat, spray at petal fall if threshold met
- Warning: "Do NOT mow during bloom — drives plant bugs from groundcover into trees"

---

#### 37. Apple Brown Bug / Apple Red Bug (Lygidea mendax / Lygocoris communis)

**New model.**
- Similar feeding damage to tarnished plant bug
- Nymphs hatch at bloom from eggs laid in bark
- Feed on developing fruit → deep dimples and distortion
- Less common than tarnished plant bug but more damaging per insect
- DD model: egg hatch at ~170 DD base 5°C from March 1
- Threshold: 2 nymphs per 25 tapped clusters
- Note: "Often controlled by petal fall insecticide targeting plum curculio"

---

#### 38. Mullein Bug / Campylomma (Campylomma verbasci)

**New model.**
- Predator AND pest — nymphs feed on mites (beneficial) but also on fruit (pest)
- Damage: tiny raised bumps on developing fruit, visible at harvest
- Most problematic: bloom through 2-3 weeks post-bloom
- DD model: egg hatch at ~200 DD base 7°C from April 1
- Threshold: 2 per tray of 25 tapped clusters during bloom
- Dilemma: "Campylomma provides significant mite control but causes fruit damage. Weigh pest vs predator value."

---

#### 39. San Jose Scale (Diaspidiotus perniciosus)

**New model.**
- Armored scale — sucks sap from bark, fruit, leaves
- Red halos on fruit around feeding sites
- Crawler emergence: ~450-500 DD base 10°C from March 1
- Second generation crawlers: ~1100 DD
- Scouting: sticky tapes on branches, check for crawlers under hand lens
- Overwintering scale: black bumps on bark, often on inner branches
- Dormant oil spray: most effective control (kills overwintering nymphs)
- Alert: "Crawler emergence expected in [X] days. Apply targeted insecticide or oil."

---

#### 40. European Fruit Scale (Quadraspidiotus ostreaeformis)

**New model.**
- Less common than SJS but increasing in some Ontario orchards
- Similar biology to San Jose scale, managed similarly
- Crawler emergence: slightly later than SJS (~550 DD base 10°C)
- Track alongside San Jose scale
- Dormant oil is primary management tool

---

### COLEOPTERA (Beetles)

---

#### 41. Plum Curculio (Conotrachelus nenuphar) — ALREADY BUILT, ENHANCE

**Full model:**
- Emergence: ~120 DD base 5°C after petal fall
- Adults migrate from leaf litter / woodland edges into orchard
- Most active on warm, humid, still evenings (>16°C nights)
- Egg-laying: crescent-shaped scar on fruit (diagnostic)
- Peak oviposition: first 2-3 weeks after emergence
- Border-row effect: perimeter trees most heavily attacked

**Enhanced tracking:**
- Night temperature monitoring: flag evenings >16°C with calm wind as high-activity nights
- "Tonight: 19°C, light wind — HIGH plum curculio activity expected"
- Border row advisory: "Consider perimeter-only sprays if pressure is moderate"
- Trap tree strategy: monitoring unsprayed trap trees at orchard edge
- Scouting: check 100 fruit on border rows for crescent scars, threshold = 1-2%

---

#### 42. Apple Flea Weevil (Orchestes pallicornis)

**New model.**
- Small weevil, feeds on leaves creating small holes
- Larvae mine leaves
- Usually minor pest, occasionally significant in individual orchards
- Active from green tip through June
- DD model: adult activity at ~100 DD base 5°C from April 1
- Threshold: >25% of leaves with feeding damage
- Note: "Typically minor. Monitor only if damage noticed in previous years."

---

#### 43. Japanese Beetle (Popillia japonica)

**New model — increasing problem in Ontario.**
- Adults active July-August, feed on foliage (skeletonize leaves)
- Larvae (grubs) feed on grass roots in orchard floor
- DD model: adult emergence ~700-1000 DD base 10°C from Jan 1 (or track from soil temp)
- No formal threshold for apples — manage if defoliation significant
- Traps: controversial — may attract more beetles than they catch
- Advisory: "Japanese beetle adults active. Scout for defoliation. Treat only if severe — most orchards tolerate moderate feeding without yield loss."

---

### ACARI (Mites)

---

#### 44. European Red Mite (Panonychus ulmi) — ALREADY BUILT, ENHANCE

**Full model:**
- Overwintering eggs hatch: ~185 DD base 5°C from March 1
- Multiple generations per season (6-8)
- Egg hatch coincides with tight cluster / pink stage
- Bronzing of leaves reduces photosynthesis → smaller fruit, poor coloring

**Enhanced:**
- Cumulative mite-day tracking: daily count × days
- Threshold: 500-750 cumulative mite-days per leaf through July, 1000-1250 in August
- Predator mite ratio: if predators (Typhlodromus pyri, Amblyseius fallacis) present at >1 per leaf, biological control likely adequate
- "European red mite: [X] per leaf. Predatory mites: [Y] per leaf. Ratio indicates [adequate/inadequate] biological control."
- Dormant oil efficacy: rate egg hatch suppression based on oil spray coverage
- Mite flare warning: "Broad-spectrum spray applied [date]. Monitor for mite resurgence in 10-14 days."
- Resistance tracking: some populations resistant to specific miticides — log products used

---

#### 45. Two-Spotted Spider Mite (Tetranychus urticae)

**New model.**
- Hot, dry weather favors outbreaks (opposite of ERM which tolerates cool weather)
- Usually mid-late summer pest
- Threshold: 5 mites per leaf with visible stippling and no predators
- Hot/dry streak alert: ">5 consecutive days >30°C with no rain — monitor for spider mite buildup"
- Webbing indicates heavy infestation — treatment urgent at this stage
- Predator mites: same beneficials as ERM
- Product note: "Avoid carbaryl (Sevin) which is known to cause mite outbreaks"

---

#### 46. Apple Rust Mite (Aculus schlechtendali)

**New model.**
- Very tiny — requires hand lens to see
- Usually beneficial: primary food source for predatory mites
- Only damaging at extreme populations: silvering/russeting of fruit skin
- Threshold: 200 per leaf (most orchardists tolerate well below this)
- Advisory: "Apple rust mite is food for predatory mites. Maintain moderate populations to support biological mite control."

---

### DIPTERA (Flies)

---

#### 47. Apple Maggot (Rhagoletis pomonella) — ALREADY BUILT, ENHANCE

**Full model:**
- Emergence: ~900 DD base 5°C from January 1
- Peak: 1200-1700 DD
- Females lay eggs under fruit skin → larvae tunnel through flesh
- Strongly attracted to unsprayed/abandoned trees and hawthorn

**Enhanced:**
- Trap monitoring: yellow sticky boards with apple-shaped sphere traps
- Trap placement: orchard perimeter, especially near woodland/abandoned trees
- Threshold: 1 fly per trap triggers spray for that block
- "Apple maggot: first fly captured on [date] at [location]. Apply border-row spray within 7 days."
- Border-row strategy: "Perimeter 2-3 rows often sufficient if surrounding area is managed"
- Temporal tracking: show fly capture timeline through season

---

#### 48. Apple Leaf Curling Midge (Dasineura mali)

**New model.**
- Tiny fly, larvae cause leaf margins to roll tightly
- Usually on terminal leaves of actively growing shoots
- 3-4 generations per year
- Damage mostly cosmetic on mature trees; can stunt young trees
- First generation: ~150 DD base 5°C from April 1
- Threshold: >50% of shoot tips affected on young trees
- Note: "Usually minor on mature trees. Monitor young plantings."

---

### HYMENOPTERA (Sawflies & Wasps)

---

#### 49. European Apple Sawfly (Hoplocampa testudinea)

**New model.**
- Adults active during bloom — lay eggs in flowers
- Larvae bore into developing fruitlets → spiral feeding scar on surface, or enter fruit
- Primary fruitlet drop due to sawfly = natural thinning (can be beneficial at low levels!)
- DD model: adult flight at ~100 DD base 5°C from April 1 (coincides with bloom)
- White sticky traps in trees at bloom to monitor
- Threshold: 2-3 per trap
- Spray timing: petal fall (targeting newly hatched larvae before they enter fruit)
- Note: "Low sawfly populations may provide beneficial thinning. Only treat if trap counts exceed threshold."

---

### ADDITIONAL ARTHROPOD PESTS

---

#### 50. Pear Psylla on Apple (Cacopsylla pyri)

**Advisory model.**
- Primarily a pear pest but can be found on apple
- Monitor only if pear trees nearby
- Vector of phytoplasma diseases

---

#### 51. Brown Marmorated Stink Bug (Halyomorpha halys)

**New model — invasive, spreading in Ontario.**
- Adults: shield-shaped, mottled brown
- Feed on fruit → corky, depressed areas under skin ("catfacing")
- Late season pest: most damaging August through harvest
- Overwinters in buildings, emerges in spring
- DD model: adult activity starts at ~500 DD base 14°C from Jan 1 (adapted from US models)
- Trap monitoring: pheromone traps for adults
- Threshold: emerging — no formal threshold yet, treat if found feeding on fruit
- Border effect: worst damage on perimeter rows adjacent to buildings, hedgerows, woods
- Alert: "BMSB detected in area. Increase perimeter scouting August through harvest."

---

#### 52. Spotted Wing Drosophila (Drosophila suzukii)

**Advisory model.**
- Primarily stone fruit and berry pest
- Can attack very ripe/damaged apples near harvest
- Monitor with vinegar traps if soft fruit nearby
- Low risk to apples unless fruit is wounded or overripe
- Note: "SWD risk to apples is low unless fruit is damaged or harvest is delayed."

---

### VERTEBRATE PESTS

---

#### 53. Voles (Microtus spp.)

**Seasonal advisory model.**
- Highest damage: late fall through early spring (bark gnawing under snow)
- Risk factors: heavy grass/weed cover at trunk base, snow depth, ground cover mulch
- Fall advisory: "Before snowfall — pull mulch 15cm away from trunks, install trunk guards on young trees, mow orchard floor short"
- Late winter advisory: "Check trunks after snowmelt for vole girdling damage"
- Bait station tracking: user logs bait stations placed and checked

---

#### 54. Deer (Odocoileus virginianus)

**Seasonal advisory model.**
- Browse damage: dormant season (twigs) and growing season (foliage, fruit)
- Antler rub: September-November, damages bark on young trees
- Advisory: "Fall — install tree guards on young trees to prevent antler rub damage"
- Fence integrity reminders: seasonal check alerts

---

### NEMATODES

---

#### 55. Dagger Nematode (Xiphinema americanum)

**Advisory model.**
- Soil pest — feeds on roots, vectors tomato ringspot virus
- Associated with apple replant disease
- User logs soil nematode test results
- Flag: "High dagger nematode counts. Consider pre-plant fumigation for new plantings."
- Tomato ringspot virus advisory if nematodes present

---

## Summary: Total Models

| Category | Count |
|---|---|
| Fungal diseases | 14 |
| Bacterial diseases | 1 (fire blight, multi-phase) |
| Viral/phytoplasma | 2 |
| Physiological/abiotic | 5 |
| Lepidoptera (moths) | 9 |
| Hemiptera (bugs/aphids/scale) | 8 |
| Coleoptera (beetles) | 3 |
| Acari (mites) | 3 |
| Diptera (flies) | 2 |
| Hymenoptera (sawflies) | 1 |
| Other arthropods | 2 |
| Vertebrates | 2 |
| Nematodes | 1 |
| Storage diseases | 1 (advisory) |
| Replant disease | 1 (advisory) |
| **TOTAL** | **55** |

---

## Dashboard Integration

### Risk Grid Updates
- Group by category: Diseases | Pests | Abiotic | Advisories
- Color-coded risk cards: only show active/relevant models based on season
- Dormant season: show fire blight (canker removal), vole risk, sunscald, mite egg counts
- Pre-bloom: add scab, mildew, frost, aphid hatch, leafroller emergence
- Bloom: add fire blight, rust, sawfly, tarnished plant bug, pollination weather
- Post-bloom: add codling moth, plum curculio, scab secondary, all summer pests
- Summer: add mites, SBFS, bitter rot, bitter pit, Japanese beetle, apple maggot
- Pre-harvest: add BMSB, fruit maturity, PHI countdowns, water core, sunburn
- Post-harvest: storage disease advisory, fall canker risk, vole prep

### Seasonal Mode
- Auto-switch dashboard emphasis based on current phenological stage
- Don't overwhelm grower with 55 risk cards — show top 5-8 most relevant
- "Show all" toggle for full list
- Archive low-priority advisories in expandable section

### Scouting Integration
- Each pest/disease model should have a "Log Scouting Data" button
- Quick entry: date, block, count/observation, photo upload
- Scouting data feeds back into models to adjust risk levels
- "Last scouted [X] days ago" reminder for each active pest
- Scouting protocol popup: "How to scout for [pest]: check [X] trees, sample [Y], threshold = [Z]"
