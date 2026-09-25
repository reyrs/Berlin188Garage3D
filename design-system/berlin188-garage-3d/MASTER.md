# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/berlin188-garage-3d/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. If not, follow the rules below.

---

**Project:** Berlin188 Garage 3D
**Generated:** 2026-09-25 by ui-ux-pro-max (`--design-system`, variance 5, motion 8, density 3)
**Category:** Automotive (3D showroom) + local service business (trust & conversion)
**Brand override:** the skill proposed `#1E293B/#DC2626` and Syncopate/Space Mono. Both are **rejected**:
Brand Guideline v3 colours and fonts are mandatory. Everything else below is the skill's output
adapted to the brand. Tokens live in `src/index.css` (`@theme`), which removes the default
Tailwind palette so no other colour can be used.

---

## Global Rules

### Color Palette (Brand Guideline v3 — exact, no new colours)

| Role | Hex | Tailwind token | Notes |
|------|-----|----------------|-------|
| Primary / interactive | `#0065C0` | `berlin-blue` | Buttons (CTA), links, lift in 3D |
| Primary hover | `#004D99` | `berlin-blue-dark` | |
| Primary light | `#1A7FDA` | `berlin-blue-light` | Focus ring |
| Accent | `#F9000D` | `berlin-red` | Rings, curved lines, highlights, crane in 3D — **never behind small text** |
| Accent light | `#FB3340` | `berlin-red-light` | |
| Gold | `#D4A017` | `berlin-gold` | Logo only — not an accent |
| Background | `#F4F6FF` | `cloud-white` | Page, header, 3D studio |
| Text / contrast sections | `#181818` | `jet-black` | Body text, footer, CTA section |
| Surface | `#FFFFFF` | `white` | Cards, text on blue |

**Contrast (measured):** jet-black on cloud-white 16.5:1 · jet-black/70 ≈ 6.4:1 · berlin-blue on cloud-white 5.4:1 ·
white on berlin-blue 5.8:1 · white on berlin-red **4.17:1** (display type only, ≥ 24px bold = WCAG AA large) ·
berlin-red on cloud-white 3.9:1 (never text).

### Typography

- **Display:** Poppins 800, UPPERCASE, letter-spacing -0.035em (`.brand-headline`); 800 italic for `.brand-emphasis`
- **Body:** Instrument Sans 400–700, 16–18px, line-height 1.6
- **Label:** `.spec-label` — 12px bold uppercase, tracking 0.16em
- **Scale:** H1 `clamp(2.4rem, 5.2vw, 5rem)` · H2 `clamp(2rem, 4vw, 3.5rem)` · service title `clamp(1.75rem, 2.4vw, 2.5rem)`

### Signature elements

- `.brand-emphasis` — key phrase in a red box, white bold italic caps, radius 4px. Max once per section, display sizes only.
- `.brand-red-ring` / `CurveAccent` — "ring, circle, or curved line — never straight". Also in 3D: the red arc on the bay
  floor, the scan ring, data/import arcs, curved hoses.

### Spacing Variables (density 3/10 — spacious)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight gaps |
| `--space-sm` | 8px | Icon gaps |
| `--space-md` | 24px | Standard padding |
| `--space-lg` | 32px | Card padding |
| `--space-xl` | 48px | Large gaps |
| `--space-2xl` | 64px | Section margins |
| `--space-3xl` | 96px | Section padding / hero |

### Radius & Shadow

- Radius: `rounded-xl` (12px) buttons, `rounded-card` (16px) cards, `rounded-media` (12px) photos
- `shadow-product`: `0 8px 20px -4px rgb(0 101 192 / .10), 0 2px 6px -2px rgb(0 101 192 / .06)` (blue-tinted, from the main site)
- `shadow-float`: floating panels over the 3D stage

---

## Component Specs

### Buttons (`src/components/ui/ButtonLink.tsx`)

- **Primary:** `berlin-blue` fill, white label, 48px min height (44px `sm`), radius 12px, hover `berlin-blue-dark`, 200ms
- **Secondary:** white fill, jet-black label, 1px jet-black/15 border → blue border + label on hover
- **On dark:** cloud-white/35 border, cloud-white label
- No red buttons (white on red fails 4.5:1 at button sizes).

### Cards

- White surface on cloud-white, `rounded-card`, `shadow-product`, 24–32px padding; reveal on scroll 300ms (fade + 12px).

---

## Style Guidelines

**Style (2026-09-25, replaces the 3D studio):** dark photographic showroom hero (Jet Black, real photos —
premium automotive, not dark/gamer: no neon, no RGB glows) handing over to the light Cloud White service story.
**Key effects:** sticky (CSS) showroom scrubbed by ScrollTrigger — each make lifts away like a garage door
(transform-only, compositor-friendly); scroll-scrubbed video per photo when a clip exists; sticky 4:5 media frame
for services on desktop; reveals 200–400ms, hover 150–200ms.
**Motion budget:** 1–2 animated focal elements per view. Nothing plays by itself except the one-time hero entrance.

### Page Pattern

**Hero-Centric + Trust/Conversion:** full-bleed showroom hero (headline + blue CTA) → makes sequence → services scroll story →
process → reviews (Google) → FAQ → closing CTA + location → footer. Sticky header CTA ("Booking via WhatsApp").

---

## Accessibility & Performance Rules

- Everything that matters is DOM text; showroom slides and the desktop service frame are `aria-hidden` duplicates.
- `prefers-reduced-motion` is live (listener): no entrance, parallax, lifts, video scrubbing or smooth scroll — instant cuts.
- Touch targets ≥ 44px; visible focus (3px `berlin-blue-light` outline).
- First showroom photo preloaded (LCP); videos attach only for the current and next slot.

---

## Anti-Patterns (Do NOT Use)

- ❌ Colours outside the brand palette; gold as an accent
- ❌ Straight red lines or bars (brand accents are rings/curves)
- ❌ White text on red below 24px bold
- ❌ Dark/gamer RGB styling; emoji icons (use Phosphor duotone)
- ❌ Fabricated testimonials, prices, ratings or counts
- ❌ Layout-shifting hovers; instant state changes; invisible focus

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (Phosphor duotone only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover transitions 150–300ms
- [ ] Text contrast ≥ 4.5:1 (display emphasis excepted, see above)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind the fixed header (`scroll-mt-16` on anchors)
- [ ] No horizontal scroll on mobile
