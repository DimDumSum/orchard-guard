# OrchardGuard — Visual Styling Only

DO NOT change any functionality, logic, models, routes, or data. ONLY change visual appearance: colors, fonts, spacing, shadows, borders, and component styling. Every page should look different when you're done, but work exactly the same.

---

## Step 1: Import Fonts

Add to `app/layout.tsx` head or via next/font:
- Headings: `DM Sans` weights 500, 600, 700
- Body: `DM Sans` weight 400
- Data/numbers (temperatures, degree hours, percentages, scores): `IBM Plex Mono` weight 400, 600

---

## Step 2: Global Color Palette

Update `tailwind.config.ts` with these custom colors and apply globally:

```js
colors: {
  // Backgrounds
  'earth-50': '#FAFAF7',    // page background (warm off-white, NOT pure white)
  'earth-100': '#F5F2EC',   // secondary background
  'earth-200': '#E8E5DE',   // borders, dividers
  
  // Card surfaces
  'card': '#FFFFFF',
  'card-hover': '#FDFCFA',
  
  // Primary (forest green)
  'grove-600': '#2D6A4F',   // primary buttons, active states
  'grove-500': '#40916C',   // hover states
  'grove-400': '#52B788',   // accents, positive indicators
  'grove-100': '#D8F3DC',   // light green backgrounds
  
  // Text
  'bark-900': '#1B1B18',    // primary text (warm near-black)
  'bark-600': '#5A4A3A',    // secondary text
  'bark-400': '#8B7355',    // muted text, labels
  'bark-300': '#A09080',    // disabled, placeholder
  
  // Risk levels
  'risk-low': '#2D6A4F',
  'risk-caution': '#E76F51',
  'risk-high': '#D62828',
  'risk-extreme': '#6A040F',
  'risk-none': '#9CA3AF',
  'risk-moderate': '#E9A820',
  
  // Accents
  'rain': '#457B9D',        // weather, water-related
  'rain-light': '#A8D5E2',
}
```

## Step 3: Apply to `globals.css`

```css
body {
  background-color: #FAFAF7;
  color: #1B1B18;
  font-family: 'DM Sans', sans-serif;
}

/* All monospace data */
.font-mono {
  font-family: 'IBM Plex Mono', monospace !important;
}
```

---

## Step 4: Component-by-Component Styling

### Sidebar
- Background: `#FFFFFF` with right border `#E8E5DE`
- Section labels (MONITOR, MANAGE, PLAN): `IBM Plex Mono`, 10px, uppercase, letter-spacing 2px, color `#8B7355`
- Nav items: `DM Sans` 14px, color `#5A4A3A`, padding 10px 16px, border-radius 8px
- Active nav item: background `#D8F3DC`, color `#2D6A4F`, font-weight 600
- Hover: background `#F5F2EC`
- OrchardGuard logo text: `DM Sans` 18px weight 700, color `#2D6A4F`
- Leaf icon: color `#2D6A4F`
- Collapse/theme buttons at bottom: color `#8B7355`, hover `#5A4A3A`

### All Cards (risk cards, info cards, form sections)
- Background: `#FFFFFF`
- Border: `1px solid #E8E5DE` (subtle warm gray, not harsh)
- Border-radius: `12px`
- Padding: `20px 24px`
- Shadow: `0 1px 3px rgba(27, 27, 24, 0.04), 0 1px 2px rgba(27, 27, 24, 0.03)`
- Hover: shadow `0 4px 12px rgba(27, 27, 24, 0.07)`, translateY `-1px`, transition `0.2s ease`
- NO harsh black borders anywhere

### Risk Cards specifically
- Left border: 3px solid, color matches risk level
- Risk badge: pill shape, border-radius 20px, padding 3px 12px
  - LOW: background `#D8F3DC`, text `#2D6A4F`, font-weight 700
  - MODERATE: background `#FEF3C7`, text `#92400E`, font-weight 700
  - CAUTION: background `#FAE1D0`, text `#E76F51`, font-weight 700
  - HIGH: background `#FCD5D5`, text `#D62828`, font-weight 700
  - EXTREME: background `#F8C4C4`, text `#6A040F`, font-weight 700
  - NONE: background `#F3F4F6`, text `#6B7280`, font-weight 600
- Card title: `DM Sans` 15px, weight 600, color `#1B1B18`
- Card description: `DM Sans` 13px, weight 400, color `#5A4A3A`, line-height 1.5
- Progress bar track: background `#E8E5DE`, height 4px, border-radius 2px
- Progress bar fill: color matches risk level, border-radius 2px
- Score number (right side): `IBM Plex Mono` 12px, color `#8B7355`

### Orchard Health Circle
- Ring stroke: use risk-appropriate color (green for >80, yellow for 50-80, red for <50)
- Ring track: `#E8E5DE`
- Score number: `IBM Plex Mono` 36px, weight 700, color `#1B1B18`
- "Good" label: `DM Sans` 14px, weight 600, color `#2D6A4F`
- Sub-label: `DM Sans` 12px, color `#8B7355`

### Weather Section
- Temperature: `IBM Plex Mono` 42px, weight 700, color `#1B1B18`
- Weather data labels (Humidity, Wind, etc): `DM Sans` 12px, color `#8B7355`, uppercase, letter-spacing 0.5px
- Weather data values: `IBM Plex Mono` 15px, weight 600, color `#1B1B18`
- "Updated X min ago": `DM Sans` 11px, color `#A09080`, italic
- Refresh icon: color `#8B7355`, hover `#2D6A4F`, cursor pointer

### Bloom Stage Selector
- Inactive dots: `#E8E5DE`, 10px diameter
- Active dot: `#2D6A4F`, 12px diameter, with subtle glow `0 0 0 3px #D8F3DC`
- Active label: background `#2D6A4F`, text white, border-radius 8px, padding 6px 16px
- Inactive labels: `DM Sans` 11px, color `#8B7355`
- Connector line between dots: 2px, color `#E8E5DE`

### Quick Action Buttons (Update Bloom Stage, Log Spray, View All Models)
- Border: `1px solid #E8E5DE`
- Background: `#FFFFFF`
- Text: `DM Sans` 13px, weight 500, color `#5A4A3A`
- Border-radius: 8px
- Padding: 8px 16px
- Hover: background `#F5F2EC`, border-color `#2D6A4F`, color `#2D6A4F`
- Icon: 16px, same color as text
- Transition: `0.15s ease`

### Section Headers (Disease Risk, Pest Risk)
- `DM Sans` 16px, weight 700, color `#1B1B18`
- Margin-bottom: 12px
- No border, no background — just clean text

### "Dormant Season" Badge
- Background: `#F5F2EC`
- Border: `1px solid #E8E5DE`
- Text: `IBM Plex Mono` 11px, weight 600, color `#8B7355`
- Border-radius: 20px
- Padding: 4px 12px

### "8 of 55 models active" Text
- `DM Sans` 13px, color `#8B7355`, weight 400

### Page Title (Grills Orchards)
- `DM Sans` 24px, weight 700, color `#1B1B18`, letter-spacing -0.02em
- Date below: `DM Sans` 14px, color `#8B7355`, weight 400

---

## Step 5: Settings Page Styling

### Form sections (Orchard Configuration, Weather Configuration)
- Same card styling as above (12px radius, warm border, shadow)
- Section title inside card: `DM Sans` 16px, weight 600, color `#1B1B18`, margin-bottom 20px
- Form labels: `DM Sans` 13px, weight 500, color `#5A4A3A`, margin-bottom 4px
- Help text: `DM Sans` 12px, color `#A09080`
- Input fields:
  - Background: `#FAFAF7`
  - Border: `1px solid #E8E5DE`
  - Border-radius: 8px
  - Padding: 10px 14px
  - Font: `DM Sans` 14px for text, `IBM Plex Mono` 14px for number inputs (lat, lon, elevation)
  - Focus: border-color `#2D6A4F`, ring `0 0 0 2px #D8F3DC`
  - Placeholder: color `#A09080`
- Select dropdowns: same styling as inputs
- Save button: background `#2D6A4F`, text white, `DM Sans` 14px weight 600, border-radius 8px, padding 10px 24px, hover background `#40916C`

---

## Step 6: Diseases & Pests Overview Pages

- Grid of cards: same risk card styling
- 3 columns desktop, 2 tablet, 1 mobile
- Gap: 16px
- Page header: same styling as dashboard (title + subtitle)
- Filter tabs (if present): pill-style buttons, active = `#2D6A4F` bg + white text, inactive = `#F5F2EC` bg + `#5A4A3A` text

---

## Step 7: Nutrition Page

### Timing table
- Header row: background `#F5F2EC`, `DM Sans` 12px weight 600, color `#5A4A3A`, uppercase, letter-spacing 0.5px
- Body rows: `DM Sans` 14px, color `#1B1B18`
- Current row highlight: background `#D8F3DC`, with "Current" badge in `#2D6A4F`
- Row borders: `1px solid #E8E5DE` (bottom only, not full grid)
- Row hover: background `#FAFAF7`
- Row padding: 12px 16px

### Fertilizer form
- Same input styling as Settings page

---

## Step 8: Spray Log Page

- Same card and table styling patterns
- Calendar dots (if present): use risk-level colors
- PHI/REI badges: pill style with appropriate urgency color

---

## Step 9: Dark Mode

Add dark mode CSS variables. Toggle should already exist in sidebar.

```css
.dark body, [data-theme="dark"] {
  --bg-page: #1A1A18;
  --bg-card: #2A2A27;
  --bg-secondary: #222220;
  --border: #3A3A36;
  --text-primary: #E8E5DE;
  --text-secondary: #A09080;
  --text-muted: #6B6560;
}
```

Dark mode specifics:
- Page background: `#1A1A18` (warm dark)
- Card background: `#2A2A27`
- Card border: `#3A3A36`
- Card shadow: `0 1px 3px rgba(0,0,0,0.2)`
- Text primary: `#E8E5DE`
- Text secondary: `#A09080`
- Input backgrounds: `#222220`
- Input borders: `#3A3A36`
- Sidebar background: `#222220`, border `#3A3A36`
- Active nav: background `#2D6A4F30`, text `#52B788`
- Risk colors stay the same (they work on dark backgrounds)
- Progress bar tracks: `#3A3A36`

---

## Step 10: Micro-animations

Add these CSS transitions globally:

```css
/* Cards */
.card, [class*="card"] {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* Buttons */  
button, a, [role="button"] {
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* Inputs */
input, select, textarea {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
```

---

## Verification

After applying all changes, every page should:
- Have warm off-white (`#FAFAF7`) page background, NOT stark white
- Use `DM Sans` for all text
- Use `IBM Plex Mono` for all numbers, scores, temperatures, and degree hours
- Have cards with 12px radius, subtle shadow, warm gray borders
- Have risk badges as colored pills
- Have risk cards with colored left borders
- Look warm and earthy, not cold and techy
- Dark mode should work with the toggle
- All functionality unchanged
