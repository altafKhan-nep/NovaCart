# NovaCart Design System — "Vibrant Joy"

This is the design guide for NovaCart. It is implemented in
`client/tailwind.config.js` and `client/src/index.css`. The original design source
(`vibrant_joy/DESIGN.md` and the Stitch mockups) lives in the `docs/` folder.

## Brand & Style

The aesthetic is a fusion of **Modern Minimalism** and **Soft-Organic** styles. It uses
heavy whitespace to let product imagery breathe while injecting "moments of delight"
through vibrant color accents and fluid shapes. The interface feels bouncy and tactile,
moving away from sharp edges toward a world of soft curves and approachable surfaces.

**Visual Keynotes:**
- **Energy:** High-saturation accents against a serene background.
- **Approachability:** Rounded forms and friendly typography.
- **Joy:** Illustrated flourishes (blobs, sparkles) celebrate user actions.

## Color Palette

The palette is anchored by a warm, soft cream background that reduces eye strain while
maintaining a "sunny" disposition. All tokens are exposed as Tailwind colors.

| Role | Hex | Usage |
| --- | --- | --- |
| `surface` / `background` | `#fbf9f5` | Page background (warm cream) |
| `on-surface` | `#1b1c1a` | Primary text (soft charcoal) |
| `primary` | `#a43c12` | Main CTAs, price highlights, critical icons |
| `primary-container` | `#ff7f50` | Coral gradient, active states, highlights |
| `secondary` | `#006a62` | Trust indicators, success states |
| `secondary-container` | `#5ef6e6` | Secondary gradient (turquoise) |
| `tertiary-fixed` | `#ffe16d` | Promotions, ratings, sparkles (sunny yellow) |
| `error` / `error-container` | `#ba1a1a` / `#ffdad6` | Availability/errors |
| `surface-container-*` | greys `#f5f3ef → #e4e2de` | Cards, borders, raised surfaces |
| `outline` / `outline-variant` | `#8b7169` / `#dec0b6` | Borders and dividers |

**Quaternary (Grass Green)** is applied to availability/eco badges via secondary tones.

## Typography

Professional, clean type system using **Inter** (Google Fonts) as the single
family for both headlines and body. Inter is a contemporary sans-serif designed
for screens — high x-height, open counters, and well-spaced weights give a
polished, modern feel while staying friendly and readable.

| Token | Font | Size | Weight | Line-height | Use |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Inter | 48px | 700 | 1.2 | Marketing hero only |
| `display-lg-mobile` | Inter | 32px | 700 | 1.2 | Mobile hero |
| `headline-md` | Inter | 24px | 600 | 1.3 | Product titles, section headers |
| `body-lg` | Inter | 18px | 400 | 1.6 | Descriptive paragraphs |
| `body-md` | Inter | 16px | 400 | 1.5 | Default body text |
| `label-bold` | Inter | 14px | 800 | 1.0 | Badges, buttons, overlines |

Inter is loaded from Google Fonts (weights 400–900) in `client/index.html` and
exposed as Tailwind `font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif`
via the `font-headline-md`, `font-body-md`, `font-label-bold`, etc. tokens.

Use Tailwind classes: `font-headline-md`, `font-body-md`, `font-label-bold`, etc.

## Layout & Spacing

- **Grid:** 12-column desktop, 2-column mobile.
- **Rhythm:** all spacing is a multiple of the 8px base unit (`spacing.base = 8px`).
- **Token spacing:** `gutter = 24px`, `margin-mobile = 16px`, `margin-desktop = 40px`,
  `container-max = 1280px`.
- **Reflow:** product cards go from a 3/4-column grid on desktop to a 2-column gallery
  on mobile, keeping imagery large and tappable.

## Shape & Radius

The shape language is the **"Squircle"** and fully rounded **"Pill"** forms.

- **Cards & containers:** `rounded-2xl` (1rem) — friendly, modern.
- **Buttons, chips, inputs:** pill (`rounded-full`).
- **Decorative blobs:** asymmetrical organic circles with blur + `mix-blend-multiply`.

## Elevation & Depth

"Colored Glows" — shadows tinted with the element's primary color or the cream
background, instead of harsh black.

| Level | Shadow | Opacity |
| --- | --- | --- |
| 1 (cards) | `0 4px 20px` | 5% |
| 2 (dropdowns/modals) | `0 8px 30px` | 10% |
| Hover | card lifts: `translateY(-8px) scale(1.02)` + deeper shadow | |

Tailwind tokens: `shadow-ambient-surface`, `shadow-ambient-primary`, `shadow-level-2`.

## Components

### Buttons
- **Primary:** pill, linear gradient Coral (`#ff7f50`) → Pink-Orange, soft glow shadow,
  hover scale-up → `btn-primary`.
- **Secondary:** pill, Turquoise (`#40E0D0`) → Green gradient → `btn-secondary`.
- **Ghost:** transparent, 2px colored border, matching text → `btn-ghost`.

### Cards
White (`surface-container-lowest`) with a 1px soft-cream border, a tinted image area,
and Quicksand titles. Hover lifts the card. Reusable via `ProductCard` component.

### Input Fields
Pill-shaped with a soft gray background that shifts to the Primary border + a colored
ring on focus.

### Chips & Tags
High-contrast, fully rounded (e.g., Light Coral background with Deep Coral text).

## Motion & Delighters (Micro-animations)

Defined in `client/src/index.css`:

| Animation | Trigger | Implementation |
| --- | --- | --- |
| Fade-up | Section entrance | `.animate-fade-up` |
| Blob float | Decorative hero blobs | `.animate-blob` |
| Wiggle | Brand icon / category icons on hover | `.hover\:animate-wiggle` |
| Sparkles | Add-to-cart success | `createSparkles()` in `ProductCard.jsx` |
| Bounce-in | Order-success checkmark | `.bounce-in` |
| Pop | Wishlist heart | `.animate-pop` |
| Timeline dot | Active order progress | `.animate-timeline-dot` |
| Draw line | Admin KPI charts | `.animated-chart-line` |
| Pulse | Loading blob / pipeline stage | `.animate-pulse`, `.pulse-tag` |

**Loading state:** a fluid "blob" shape pulsing in the Secondary (turquoise) color —
reused across pages while data loads.

## How to Use the Tokens

Anywhere in the frontend JSX, reference tokens directly:

```jsx
<button className="btn-primary font-label-bold text-label-bold px-8 py-4 rounded-full">
  Shop Now
</button>

<div className="bg-surface-container-low rounded-2xl shadow-ambient-surface border border-surface-variant">
  ...
</div>
```
