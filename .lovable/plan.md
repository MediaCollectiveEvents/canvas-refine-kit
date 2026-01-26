
# Site Consistency Improvement Plan

Based on my thorough analysis of all pages (Home, About, Events, Partners, Blog) and shared components, I've identified several inconsistencies that can be standardized to create a more cohesive experience.

---

## Summary of Issues Found

### 1. Hero Section Variations
Each page has a slightly different hero implementation:
- **Home**: Custom grid layout with parallax image, `bg-primary` background
- **About**: Background image with overlay, `min-h-[70vh]`
- **Events**: Solid `bg-primary`, `pt-40 pb-16` padding
- **Partners**: Solid `bg-primary`, `pt-40 pb-20` padding
- **Blog**: `bg-muted` background, different structure entirely

### 2. Decorative Divider Inconsistencies
Dividers vary in structure and placement:
- Some use single-dot pattern, others use triple-dot (Lime/Cyan/Orange)
- Vertical spacing varies (`py-8` vs `py-12`)
- After-hero dividers differ (gradient fade vs standard horizontal line)

### 3. Section Header Styling Variations
- Some use eyebrow text above the title, others don't
- Inconsistent use of `font-script` vs `font-display` for emphasis
- Varied approaches to the italic accent word styling

### 4. Button Styling Inconsistencies
- Events page uses raw `<button>` elements with inline SVG arrows
- Other pages use the `<Button>` component from the UI library
- CTA buttons have varying border-radius (`rounded-full` vs default)
- Inconsistent use of `uppercase tracking-wider`

### 5. Card/Grid Component Patterns
- Icon containers mostly standardized (w-16 h-16 rounded-full)
- But card padding varies: `p-8` vs `p-6`
- Card title font sizes vary: `text-xl` vs `text-2xl`

### 6. Motion Animation Patterns
- Some sections use Framer Motion entrance animations
- Others (like AboutSection) have no animations at all
- Animation delays and durations vary across components

---

## Recommended Improvements

### Phase 1: Create Reusable Components

#### 1.1 Create a `PageHero` Component
A standardized hero component that accepts:
- `eyebrow`: The small uppercase text above the title
- `title`: The main heading (with script font styling)
- `description`: Supporting paragraph
- `variant`: `'primary'` (turquoise bg) | `'image'` (background image) | `'muted'` (subtle bg)
- `backgroundImage`: Optional image URL for the image variant

This will replace the 5 different hero implementations with one consistent pattern.

#### 1.2 Create a `SectionDivider` Component
Standardized divider with two variants:
- `'single'`: Single primary-colored dot
- `'triple'`: Three dots using Lime/Cyan/Orange palette

Consistent `py-8` spacing and gradient line styling.

#### 1.3 Create a `SectionHeader` Component
Unified section header accepting:
- `eyebrow`: Optional uppercase text
- `title`: Main title text
- `accentWord`: The word to be styled with primary color + italic
- `description`: Optional supporting text

### Phase 2: Standardize Existing Patterns

#### 2.1 Unify Button Styling
- Replace all raw `<button>` elements with the `<Button>` component
- Standardize CTA buttons to use `rounded-full` consistently
- Apply `font-body uppercase tracking-wider text-sm` to all action buttons

#### 2.2 Standardize Card Components
- Consistent padding: `p-8`
- Consistent icon container: `w-16 h-16 rounded-full`
- Consistent title size: `text-xl` with `font-display`
- Consistent description: `text-sm text-muted-foreground leading-relaxed`

#### 2.3 Add Motion Animations to Static Sections
- Add entrance animations to `AboutSection` (currently has none)
- Standardize animation delays: use `delay: index * 0.1` for grid items
- Standardize durations: `0.5s` for elements, `0.6s` for section headers

### Phase 3: Page-Specific Fixes

#### 3.1 Blog Page
- Update hero to match the `bg-primary` pattern used on Events/Partners
- Add decorative dividers between sections
- Add CTA section at the bottom for consistency

#### 3.2 Events Page
- Replace raw `<button>` in EventCard with `<Button>` component
- Match eyebrow text styling to other pages

#### 3.3 About Page
- Ensure the post-hero gradient transition matches Events/Partners pages

---

## Technical Implementation Details

### New File: `src/components/shared/PageHero.tsx`
```text
Props:
- eyebrow: string
- title: string
- description: string
- variant: 'primary' | 'image' | 'muted'
- backgroundImage?: string

Structure:
- Section with variant-based background
- Container with max-w-6xl
- Staggered motion animations for eyebrow, title, description
- Consistent padding: pt-40 pb-16
- Script font title with text shadow
```

### New File: `src/components/shared/SectionDivider.tsx`
```text
Props:
- variant: 'single' | 'triple'
- className?: string (for spacing overrides)

Structure:
- Relative container with py-8
- Horizontal gradient line
- Centered dot(s) based on variant
```

### New File: `src/components/shared/SectionHeader.tsx`
```text
Props:
- eyebrow?: string
- title: string
- accentWord: string
- description?: string
- className?: string

Structure:
- Optional eyebrow with uppercase tracking
- Title split to wrap accentWord in primary italic span
- Optional description in muted foreground
- Centered text alignment
- Motion entrance animation
```

---

## Files to be Modified

| File | Changes |
|------|---------|
| `src/pages/Home.tsx` | Replace inline dividers with SectionDivider component |
| `src/pages/About.tsx` | Use PageHero, SectionDivider, SectionHeader components |
| `src/pages/Events.tsx` | Use PageHero, SectionDivider; update EventCard buttons |
| `src/pages/Partners.tsx` | Use PageHero, SectionDivider, SectionHeader components |
| `src/pages/Blog.tsx` | Use PageHero, add SectionDivider, add CTA section |
| `src/components/sections/AboutSection.tsx` | Add motion animations |
| `src/components/sections/EventsSection.tsx` | Use SectionHeader component |
| `src/components/sections/ValuePillarsSection.tsx` | Use SectionHeader component |
| `src/components/sections/WhoAttendsSection.tsx` | Use SectionHeader component |
| `src/components/sections/TestimonialsSection.tsx` | Standardize indicator styling |

---

## Benefits

1. **Maintainability**: Changes to hero styling only need to happen in one place
2. **Consistency**: Every page will follow the same visual language
3. **Developer Experience**: New pages can be built faster using shared components
4. **Brand Cohesion**: Visitors experience a unified design across all pages
5. **Accessibility**: Consistent motion patterns are easier to control globally

---

## Priority Order

1. **High Priority**: Create PageHero and SectionDivider components (biggest visual impact)
2. **Medium Priority**: Standardize buttons across Events page
3. **Medium Priority**: Add animations to static sections
4. **Lower Priority**: Create SectionHeader component (smaller benefit, more refactoring)
