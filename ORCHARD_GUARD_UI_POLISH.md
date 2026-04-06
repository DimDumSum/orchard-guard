# OrchardGuard — UI/UX Design Overhaul

Redesign the entire OrchardGuard interface to feel like a premium, professional agriculture management platform. Think: clean, confident, grounded — like a modern farm management tool, not a developer prototype. Every page needs attention. The current version is functional but visually unpolished.

---

## Design Direction

**Aesthetic:** Modern agricultural — clean, earthy, confident. Think John Deere Operations Center meets a premium weather app. Not techy/startup. Not generic dashboard template. This is a tool a grower checks at 5 AM on their phone before heading out.

**Color palette:**
- Background: warm off-white `#FAFAF7` (not stark white)
- Cards/surfaces: `#FFFFFF` with subtle warm shadow
- Primary green: `#2D6A4F` (deep forest — trust, growth)
- Secondary green: `#52B788` (lighter, for accents and positive states)
- Danger/urgent: `#D62828` 
- Warning/caution: `#E76F51`
- Info/advisory: `#457B9D`
- Text primary: `#1B1B18` (near-black, warm)
- Text secondary: `#6B7280`
- Text muted: `#9CA3AF`
- Border/divider: `#E8E5DE` (warm gray, not blue-gray)
- Risk LOW: `#2D6A4F` green
- Risk CAUTION: `#E76F51` orange  
- Risk HIGH: `#D62828` red
- Risk EXTREME: `#6A040F` dark red
- Risk NONE: `#9CA3AF` gray

**Typography:**
- Headings: `Inter` or `DM Sans`, 600-700 weight, tight letter-spacing (-0.02em)
- Body: `Inter`, 400 weight, relaxed line-height (1.6)
- Data/numbers: `JetBrains Mono` or `IBM Plex Mono` — monospace for temperatures, degree hours, percentages
- Size hierarchy: page title 28px, section title 20px, card title 16px, body 14px, caption/label 12px
- Import fonts from Google Fonts CDN

**Spacing & Layout:**
- Generous padding inside cards (24px)
- Consistent gap between cards (16px)
- Max content width: 1280px, centered
- Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Breathing room — don't cram data. White space is a feature.

**Shadows & Depth:**
- Cards: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Elevated cards (alerts, today's risk): `0 4px 12px rgba(0,0,0,0.08)`
- No harsh borders — use shadows and subtle background differences for separation
- Card border-radius: 12px consistently

**Icons:**
- Use Lucide React icons throughout (already available)
- Consistent sizing: 16px inline, 20px in card headers, 24px in navigation
- Color-match icons to their context (green for healthy, red for risk, etc.)

---

## Navigation Redesign

**Current:** Plain text links in a row. Looks like a prototype nav.

**Redesign:**
- Fixed top navigation bar with:
  - OrchardGuard logo/wordmark left (use a simple leaf or apple icon + "OrchardGuard" in 600 weight)
  - Main nav links center: Dashboard, Diseases, Pests, Weather, Spray Log, Settings
  - Right side: dark mode toggle, notification bell with badge count, orchard name dropdown
- Active nav item: bottom border accent (2px green), not just bold text
- Mobile: hamburger menu that slides in from left
- Nav background: white with subtle bottom border, slight backdrop blur on scroll
- Secondary nav items (Tank Mix, Inventory, Nutrition, History, Costs, Workers) go in a "More" dropdown or second row

**Sidebar alternative for desktop:**
- Consider a collapsible left sidebar for desktop view with icon+text nav items
- Grouped sections: "Monitor" (Dashboard, Diseases, Pests, Weather), "Manage" (Spray Log, Tank Mix, Inventory), "Plan" (Nutrition, Settings, History)
- Sidebar collapsed = icons only, expanded = icons + labels

---

## Dashboard Redesign (`/`)

The dashboard is the heart of the app. It should tell the grower everything they need to know in 10 seconds.

### Top Section: Today's Summary Bar
- Full-width bar at top with warm gradient background (subtle green gradient)
- Left: Orchard name, today's date, current weather icon + temp
- Center: Orchard Health Score — large number (87) with color ring indicator
- Right: "X active alerts" badge, bloom stage pill indicator
- Below: one-line scrolling alert ticker if urgent items exist

### Weather Strip
- Horizontal scrollable 7-day forecast strip
- Each day: icon (sun/cloud/rain), high/low temp, precip probability
- Today highlighted with accent border
- Current conditions card: temp (large), humidity, wind, dew point — with weather icon
- Last updated timestamp
- Style: clean cards with weather icons, not data dump

### Active Alerts Section
- Only show if there ARE active alerts
- Collapsible banner with red/orange/yellow left border indicating severity
- Icon + one-line summary + "View details" link
- Dismissible per session
- Example: "⚠️ Apple Scab — Infection event 39h ago. Kickback window closing. → View"

### Risk Grid
- 2-3 column grid of risk cards, grouped by category
- Each card:
  - Left color bar indicating risk level (4px wide, full height)
  - Icon + disease/pest name + risk badge (pill: LOW/CAUTION/HIGH/EXTREME)
  - One-line status summary (not a paragraph — current cards have too much text)
  - Mini progress bar or sparkline showing trend
  - Click to expand or navigate to detail page
- Only show ACTIVE/RELEVANT risks for current season phase
- "Show all models" toggle at bottom for completeness
- Sort by risk level (highest first)

**Card example (compact):**
```
┌─ 🟢 ─────────────────────────────────────────┐
│  🔥 Fire Blight                          LOW  │
│  10.6 DH (4-day) · MaryBlyt 1/4 · No action  │
│  ▰▰░░░░░░░░ 13/100                           │
└───────────────────────────────────────────────┘
```

**Card example (elevated risk):**
```
┌─ 🔴 ─────────────────────────────────────────┐
│  🍂 Apple Scab                        SEVERE  │
│  Infection 39h ago · Kickback closing · SPRAY  │
│  ▰▰▰▰▰▰▰▰▰░ 95/100                          │
│  ⚠️ Apply fungicide within 33 hours           │
└───────────────────────────────────────────────┘
```

### Upcoming Actions Section
- Timeline view of next 7 days
- Shows: upcoming spray windows, scouting reminders, REI expirations, nutrition timing
- Clean timeline with dots and connecting lines
- "Today" marker
- Example entries:
  - "Tomorrow — Calcium spray #4 due (Honeycrisp block)"
  - "Apr 5 — REI expires, Block A safe to enter at 2pm"
  - "Apr 7 — Scout for plum curculio (120 DD approaching)"

### Quick Actions Row
- Row of action buttons/cards:
  - "Update Bloom Stage" — opens modal with visual stage selector
  - "Log Spray" — quick spray entry
  - "Log Scouting" — quick observation entry
  - "Refresh Weather" — manual weather update

---

## Disease Detail Pages

### Overview page (`/diseases`)
- Grid of all disease models, same compact card style as dashboard
- Filter tabs: "Active Risks" | "All Diseases" | "Fungal" | "Bacterial" | "Abiotic"
- Search/filter by name

### Individual disease page (e.g., `/diseases/fire-blight`)
- Hero section with current risk level (large, color-coded)
- Model explanation in plain English (expandable "How this works" section)
- Current conditions breakdown:
  - Fire blight: CougarBlight DH chart (4-day bars) + MaryBlyt condition dots
  - Apple scab: wet period tracker, ascospore maturity gauge, infection event timeline
- 7-day risk forecast strip specific to this disease
- Recommended actions with specific products
- Season history chart (infections, sprays applied, risk over time)
- Scouting log for this disease with "Add observation" button

### Charts & Visualizations
- Use Recharts with consistent styling:
  - Area charts for degree day accumulation (filled gradient)
  - Bar charts for daily risk scores
  - Line charts for temperature trends
  - Gauge/donut for percentage-based metrics (ascospore maturity, SBFS accumulation)
- Chart colors: match the risk color palette
- Tooltips: clean, informative, with units
- Responsive: charts resize properly on mobile

---

## Pest Detail Pages

Same structure as disease pages but with degree-day focused visualizations:
- DD accumulation curve with threshold markers
- "You are here" indicator on the curve
- Generation timeline showing past and predicted emergence windows
- Trap count chart (if applicable)
- Economic threshold reference

---

## Settings Page Redesign

**Current:** Plain form fields. Looks like a developer config screen.

**Redesign:**
- Grouped in visually distinct sections with card containers:
  - "Orchard Profile" — name, location (with mini map preview), varieties, rootstock
  - "Phenology" — bloom stage with visual stage selector (icons showing each stage, click to select), biofix dates
  - "Disease History" — checkboxes/toggles for which diseases were present last year
  - "Weather Sources" — status cards for each source showing connected/disconnected, last sync time
  - "Notifications" — alert preferences with toggle switches
  - "Workers" — team member list with notification preferences
- Bloom stage selector: visual horizontal stepper with apple bud icons showing progression from dormant → fruit set
- Location: show a small map preview (or just formatted coordinates with "Change" button)
- Save button: sticky at bottom on mobile, green primary button
- Validation: inline error messages, not alert boxes

---

## Spray Log Redesign

- Calendar view (default) + list view toggle
- Calendar shows spray days with colored dots (fungicide=blue, insecticide=orange, etc.)
- Click day to see/add entries
- Each entry card shows: date, products, targets, cost, PHI countdown, REI status
- Active REI banner at top: "Block A — Imidan — Safe entry at 2:00 PM today"
- Active PHI list: countdown badges per product
- "New Spray" button: modal with smart form
  - Product dropdown with search (from product database)
  - Auto-fill: PHI, REI, rate, target from product database
  - Tank mix mode: add multiple products to one entry
  - Block/area selector
  - Cost auto-calculated from inventory prices
  - Notes field

---

## Weather Page Redesign

- Large current conditions display (like a weather app):
  - Big temperature number, weather icon
  - Feels like, humidity, wind, dew point, pressure in a clean grid
  - Mini chart of last 24h temperature
- 7-day forecast: card per day with icon, high/low, precip probability, wind
- Hourly forecast table: collapsible per day
- Weather data source status: which APIs are active, last sync time, data completeness
- Historical data: date range picker, download CSV

---

## Mobile Responsiveness

This app WILL be used on a phone in the field. Mobile is not secondary.

- All grids collapse to single column
- Cards stack vertically with full width
- Navigation becomes bottom tab bar (Dashboard, Diseases, Pests, Spray, More)
- Touch targets minimum 44px
- Swipeable forecast strips
- Quick action buttons become floating action button (FAB) with menu
- Charts resize and simplify on mobile (fewer data points, larger touch targets)
- Font sizes: slightly larger body text on mobile (15-16px)
- Pull-to-refresh on dashboard

---

## Dark Mode

- Toggle in navigation (sun/moon icon)
- Dark background: `#1A1A18` (warm dark, not blue-black)
- Card surfaces: `#2A2A27`
- Text: `#E8E5DE` (warm off-white)
- All risk colors remain the same (they already work on dark)
- Charts and graphs: light gridlines, bright data lines
- Save preference to localStorage

---

## Animations & Micro-interactions

Keep it subtle and functional, not decorative:
- Card hover: slight lift (translateY -2px + shadow increase)
- Risk level changes: smooth color transition (0.3s ease)
- Page transitions: fade in (0.2s)
- Loading states: skeleton cards (not spinners) that match card layout
- Number changes: count up/down animation for scores and degree hours
- Alert banners: slide in from top
- Toast notifications for save confirmations
- Pull-to-refresh: spring animation
- Bloom stage selector: smooth slide between stages

---

## Loading & Empty States

- Skeleton loading: gray placeholder cards that match real card shapes
- Empty state illustrations: simple line drawings
  - No spray data: "No sprays logged yet. Start tracking your spray program."
  - No scouting data: "No observations yet. Add your first scouting report."
  - No weather data: "Connecting to weather service..."
- Error states: friendly message + retry button, not technical errors

---

## Implementation Notes

- Use Tailwind CSS for all styling — no custom CSS files
- Use shadcn/ui Card, Badge, Button, Dialog, Select, Tabs, Progress, Table components
- Wrap risk colors in Tailwind theme config or CSS variables for consistency
- Create reusable components: RiskBadge, RiskCard, WeatherIcon, DegreeHourBar, ConditionDot
- Test on: Chrome desktop, Safari mobile (iPhone), Chrome mobile (Android)
- Performance: lazy load chart components, paginate long lists
- Accessibility: proper contrast ratios, keyboard navigation, screen reader labels

Apply this design overhaul to ALL existing pages and any new pages from Phase 2/2B specs.
