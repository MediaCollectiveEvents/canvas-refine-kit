
# CTA Styling Consistency Plan

## Overview
This plan standardizes all call-to-action (CTA) buttons across the site to create a unified visual language. Currently, there are inconsistencies in button shape, typography, color schemes, and icon usage that detract from the professional feel of the site.

---

## Current Issues Identified

### Shape Inconsistencies
- Some buttons use `rounded-full` (pill shape), others use default `rounded-md`
- Mixed usage creates visual fragmentation

### Typography Inconsistencies  
- Some CTAs use `uppercase tracking-wider text-sm`
- Others use normal sentence case
- Font family not always specified

### Color/Style Inconsistencies
- Home Hero uses inverted colors (appropriate for primary background)
- About page CTA lacks the rounded-full styling
- EventsSection cards use a ghost/outline style

### Icon Usage Inconsistencies
- Some CTAs have `ArrowRight` icons, others don't
- No clear pattern for when icons should appear

---

## Proposed Standardization

### Primary CTA Pattern (Page-Level CTAs)
Used for main page call-to-actions in CTA sections:

```text
<Button
  size="lg"
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
>
  Register Interest
</Button>
```

**Characteristics:**
- Pill shape (`rounded-full`)
- Uppercase with letter spacing
- Large size with generous horizontal padding
- No icon (clean, prominent appearance)

### Secondary CTA Pattern (Card-Level CTAs)
Used within cards, event listings, and inline actions:

```text
<Button
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-6"
>
  Register Interest
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

**Characteristics:**
- Pill shape (`rounded-full`)
- Uppercase with letter spacing
- Includes arrow icon for action indication
- Slightly smaller horizontal padding

### Hero CTA Pattern (On Primary Backgrounds)
Used in hero sections where background is primary color:

```text
<Button
  size="lg"
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
>
  Register Your Interest
</Button>
```

**Characteristics:**
- Inverted colors for contrast
- Same shape and typography as Primary CTA
- Maintains readability against turquoise background

### Ghost CTA Pattern (Subtle Actions)
Used for secondary actions within cards:

```text
<Button
  className="w-full rounded-full font-body uppercase tracking-wider text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-300"
>
  Learn More
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

**Characteristics:**
- Transparent background with border
- Transitions to solid on hover
- Includes arrow icon

---

## Files to Modify

### 1. Home Hero Section
**File:** `src/components/sections/HeroSection.tsx`

**Current:**
```tsx
<Button
  size="lg"
  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-base"
  onClick={onRegisterClick}
>
  Register Your Interest
</Button>
```

**Updated:**
```tsx
<Button
  size="lg"
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
  onClick={onRegisterClick}
>
  Register Your Interest
</Button>
```

### 2. About Page CTA
**File:** `src/pages/About.tsx`

**Current:**
```tsx
<Button
  size="lg"
  className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base"
  onClick={() => setIsFormOpen(true)}
>
  Register Your Interest
</Button>
```

**Updated:**
```tsx
<Button
  size="lg"
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
  onClick={() => setIsFormOpen(true)}
>
  Register Your Interest
</Button>
```

### 3. Events Section Cards
**File:** `src/components/sections/EventsSection.tsx`

**Current:**
```tsx
<Button
  onClick={onRegisterClick}
  className="w-full mt-auto bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-300"
>
  <span>LEARN MORE</span>
  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
</Button>
```

**Updated:**
```tsx
<Button
  onClick={onRegisterClick}
  className="w-full mt-auto rounded-full font-body uppercase tracking-wider text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-300"
>
  Learn More
  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
</Button>
```

### 4. Partners Page "Book a Meeting" Button
**File:** `src/pages/Partners.tsx`

**Current:**
```tsx
<Button
  size="lg"
  className="font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90"
>
  Book a Meeting
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

**Updated:**
```tsx
<Button
  size="lg"
  className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
>
  Book a Meeting
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

---

## Summary of Changes

| File | Component/Section | Change |
|------|-------------------|--------|
| `HeroSection.tsx` | Home Hero CTA | Add `rounded-full`, `uppercase tracking-wider text-sm`, remove custom `py-4 text-base` |
| `About.tsx` | Bottom CTA | Add `rounded-full`, `uppercase tracking-wider text-sm`, standardize padding |
| `EventsSection.tsx` | Card buttons | Add `rounded-full`, clean up inline uppercase text |
| `Partners.tsx` | "Book a Meeting" button | Add `rounded-full` and `px-8` padding |

**No changes needed for:**
- `Events.tsx` - EventCard and page CTA already use correct pattern
- `Blog.tsx` - CTA already uses correct pattern
- `Partners.tsx` - Page CTA already uses correct pattern

---

## Benefits

1. **Visual Cohesion**: All CTAs share the same pill shape and typography
2. **Brand Recognition**: Consistent styling reinforces brand identity
3. **User Experience**: Predictable button appearance improves usability
4. **Maintainability**: Clear patterns make future development easier
5. **Professional Polish**: Unified design elevates perceived quality
