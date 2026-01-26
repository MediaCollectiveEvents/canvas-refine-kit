
# Home Hero Standardization Options

The Home page hero is currently a unique, elaborate design with a two-column grid layout and parallax image. Bringing it in line with the other pages' `PageHero` component requires a decision on how much of the current design to preserve.

---

## Option A: Full Standardization (Recommended for Consistency)

Replace the custom `HeroSection` with the `PageHero` component, matching the About/Events/Partners/Blog pages exactly.

### Changes Required

**1. Update `src/pages/Home.tsx`:**
- Remove the `HeroSection` import
- Add `PageHero` import and `heroImage` import
- Replace `<HeroSection>` with `<PageHero>` using the image variant
- Add the gradient transition divider after the hero
- Move the CTA button to a separate section below (or extend PageHero to support optional CTA)

**2. Extend `src/components/shared/PageHero.tsx`:**
- Add optional `ctaText` and `onCtaClick` props to support a CTA button within the hero
- This allows the Home page to have a registration button while maintaining the standardized layout

**3. Delete or archive `src/components/sections/HeroSection.tsx`:**
- No longer needed once Home uses PageHero

### Result
```
Home Hero will look like:
┌─────────────────────────────────────────┐
│         [Background Image]              │
│                                         │
│     THE MEDIA COLLECTIVE (eyebrow)      │
│                                         │
│       Curated Events (title)            │
│                                         │
│   Exclusive networking events for...    │
│                                         │
│     [Register Your Interest]            │
│                                         │
└─────────────────────────────────────────┘
│ Gradient transition from-black/60       │
└─────────────────────────────────────────┘
```

---

## Option B: Hybrid Approach (Preserve Uniqueness)

Keep the Home hero's elaborate design but apply visual consistency with PageHero styling.

### Changes Required

**1. Update `src/components/sections/HeroSection.tsx`:**
- Change background from solid `bg-primary` to image-based with overlay (like PageHero)
- Keep the two-column layout with parallax image
- Keep the multi-line headline structure
- Apply the same eyebrow styling (`tracking-[0.3em]`)
- Keep the CTA button in place

**2. Update `src/pages/Home.tsx`:**
- Add the gradient transition divider after HeroSection (matching other pages)

### Result
The Home page retains its unique layout but uses the same background treatment and post-hero gradient as other pages.

---

## Recommendation

**Option A (Full Standardization)** is recommended for maximum consistency. The Home page will feel cohesive with the rest of the site while the CTA button ensures it still drives registrations effectively.

---

## Technical Implementation (Option A)

### File: `src/components/shared/PageHero.tsx`

Add optional CTA support:

```tsx
interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  variant?: "primary" | "image" | "muted";
  backgroundImage?: string;
  className?: string;
  ctaText?: string;           // NEW
  onCtaClick?: () => void;    // NEW
}
```

Add button rendering after the description:

```tsx
{ctaText && onCtaClick && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="mt-8"
  >
    <Button
      size="lg"
      className="rounded-full font-body uppercase tracking-wider text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
      onClick={onCtaClick}
    >
      {ctaText}
    </Button>
  </motion.div>
)}
```

### File: `src/pages/Home.tsx`

```tsx
import PageHero from "@/components/shared/PageHero";
import heroImage from "@/assets/hero-placeholder.jpg";

// In the component:
<PageHero
  eyebrow="The Media Collective"
  title="Curated Events"
  description="Exclusive networking events for senior executives and innovators across the global media landscape."
  variant="image"
  backgroundImage={heroImage}
  ctaText="Register Your Interest"
  onCtaClick={() => setIsFormOpen(true)}
/>

{/* Gradient transition divider */}
<div className="relative h-24 bg-gradient-to-b from-black/60 to-background overflow-hidden">
  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
</div>
```

### File: `src/components/sections/HeroSection.tsx`

This file can be deleted once the changes are complete, as it will no longer be used.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/shared/PageHero.tsx` | Add optional `ctaText` and `onCtaClick` props with button rendering |
| `src/pages/Home.tsx` | Replace HeroSection with PageHero, add gradient divider |
| `src/components/sections/HeroSection.tsx` | Delete (no longer needed) |

---

## Benefits

1. **Complete Visual Consistency**: Every page now uses the same hero pattern
2. **Simplified Codebase**: One less component to maintain
3. **Reusable CTA Pattern**: PageHero can now optionally include CTAs on any page
4. **Unified Animations**: Same Framer Motion entrance effects across all heroes
