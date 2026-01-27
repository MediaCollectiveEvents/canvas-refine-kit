

# Partnership Package Card Color Suggestions

## Current Design Analysis

Looking at your current cards:
- **Co-Host & Custom Event**: Dark background (`bg-background`) with subtle border
- **Sponsor (highlighted)**: Solid turquoise/primary background

## Suggested Color Schemes

### Option 1: Gradient Cards with Accent Borders
Use subtle gradient backgrounds with colored accent borders matching your icon color palette (Lime, Cyan, Orange):

| Card | Background | Border Accent |
|------|-----------|---------------|
| Co-Host | `bg-gradient-to-br from-secondary/40 to-background` | Lime (`border-l-4 border-l-[hsl(var(--icon-lime))]`) |
| Sponsor | Keep current turquoise highlight | Cyan glow ring |
| Custom Event | `bg-gradient-to-br from-secondary/40 to-background` | Orange (`border-l-4 border-l-[hsl(var(--icon-red))]`) |

### Option 2: Colored Header Bands
Keep dark card bodies but add a colored accent band at the top of each card:

| Card | Header Band Color | Body |
|------|------------------|------|
| Co-Host | Lime strip at top | Dark background |
| Sponsor | Full turquoise (current) | Turquoise background |
| Custom Event | Orange strip at top | Dark background |

### Option 3: Subtle Icon-Colored Tint
Give each card a very subtle tint matching the signature colors:

| Card | Background Tint |
|------|----------------|
| Co-Host | `bg-[hsl(var(--icon-lime)/0.05)]` with `border-[hsl(var(--icon-lime)/0.2)]` |
| Sponsor | Current turquoise (or `bg-[hsl(var(--icon-cyan)/0.1)]` for subtler) |
| Custom Event | `bg-[hsl(var(--icon-red)/0.05)]` with `border-[hsl(var(--icon-red)/0.2)]` |

### Option 4: All Cards Same Style (Remove Highlight)
Make all three cards consistent with a premium dark glass effect:

```
All cards: bg-gradient-to-br from-primary/10 via-background to-primary/5
           border border-primary/20
           hover:border-primary/40
```

This matches the "Ready to Join Us?" CTA card styling for consistency.

---

## Recommended Approach: Option 3 (Subtle Icon-Colored Tint)

This approach:
- Maintains visual distinction between packages
- Uses your established color palette (Lime, Cyan, Orange)
- Keeps the Sponsor card prominent while making others feel premium
- Creates visual harmony with the Benefits section icons

### Technical Implementation

**Update the `sponsorshipTiers` data:**
```tsx
const sponsorshipTiers = [
  {
    name: "Co-Host",
    description: "...",
    features: [...],
    highlighted: false,
    accentColor: "lime",  // NEW
  },
  {
    name: "Sponsor",
    description: "...",
    features: [...],
    highlighted: true,
    accentColor: "cyan",  // NEW
  },
  {
    name: "Custom Event",
    description: "...",
    features: [...],
    highlighted: false,
    accentColor: "red",   // NEW (orange)
  },
];
```

**Update card styling logic:**
```tsx
// Color mapping
const colorStyles = {
  lime: {
    bg: "bg-[hsl(var(--icon-lime)/0.05)]",
    border: "border-[hsl(var(--icon-lime)/0.3)]",
    check: "text-[hsl(var(--icon-lime))]",
    checkBg: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  cyan: {
    bg: "bg-primary",
    border: "ring-4 ring-primary/20",
    check: "text-white",
    checkBg: "bg-white/20",
  },
  red: {
    bg: "bg-[hsl(var(--icon-red)/0.05)]",
    border: "border-[hsl(var(--icon-red)/0.3)]",
    check: "text-[hsl(var(--icon-red))]",
    checkBg: "bg-[hsl(var(--icon-red)/0.1)]",
  },
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Partners.tsx` | Update `sponsorshipTiers` data structure and card rendering logic with color-coded styling |

---

## Visual Result

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Co-Host       │  │    Sponsor      │  │  Custom Event   │
│                 │  │                 │  │                 │
│  [Lime tint]    │  │  [Cyan/Primary] │  │  [Orange tint]  │
│  [Lime checks]  │  │  [White checks] │  │  [Orange checks]│
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     Subtle              Prominent             Subtle
```

