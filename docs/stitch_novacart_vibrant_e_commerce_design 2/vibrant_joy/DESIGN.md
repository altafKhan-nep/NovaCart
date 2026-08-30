---
name: Vibrant Joy
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#57423b'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#8b7169'
  outline-variant: '#dec0b6'
  surface-tint: '#a43c12'
  primary: '#a43c12'
  on-primary: '#ffffff'
  primary-container: '#ff7f50'
  on-primary-container: '#6c2000'
  inverse-primary: '#ffb59c'
  secondary: '#006a62'
  on-secondary: '#ffffff'
  secondary-container: '#5ef6e6'
  on-secondary-container: '#006f66'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c0a200'
  on-tertiary-container: '#453900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#380c00'
  on-primary-fixed-variant: '#822800'
  secondary-fixed: '#61f9e9'
  secondary-fixed-dim: '#3adccc'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '800'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built to evoke optimism, energy, and a sense of effortless discovery. It targets a modern, trend-conscious demographic that values personality and friendliness over corporate rigidity. 

The aesthetic is a fusion of **Modern Minimalism** and **Soft-Organic** styles. It utilizes heavy whitespace to let product imagery breathe, while injecting "moments of delight" through vibrant color accents and fluid shapes. The interface should feel bouncy and tactile, moving away from sharp edges toward a world of soft curves and approachable surfaces.

**Visual Keynotes:**
- **Energy:** High-saturation accents against a serene background.
- **Approachability:** Rounded forms and friendly typography.
- **Joy:** Use of illustrated flourishes (blobs, sparkles) to celebrate user actions.

## Colors

The palette is anchored by a warm, soft cream background to reduce eye strain while maintaining a "sunny" disposition. 

- **Primary (Coral):** Used for main CTAs, price highlights, and critical path icons.
- **Secondary (Turquoise):** Used for trust indicators, success states, and secondary interactions.
- **Tertiary (Sunny Yellow):** Reserved for promotions, ratings, and "sparkle" decorative elements.
- **Quaternary (Grass Green):** Applied to availability status and sustainability-related badges.
- **Neutrals:** Soft charcoals are used for text to maintain high legibility without the harshness of pure black.

## Typography

This design system utilizes a dual-font approach to balance personality and utility. **Quicksand** provides a friendly, rounded geometric structure for headlines, creating an immediate sense of warmth. **Nunito Sans** handles the heavy lifting for body copy and UI labels, offering excellent legibility with slightly softened terminals that complement the headline choice.

**Usage Rules:**
- Use **Display-LG** only for marketing hero sections.
- **Headline-MD** is the standard for product titles and section headers.
- **Label-Bold** should be used for badges, buttons, and overlines to create a strong visual hierarchy.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous white space to prevent the colorful accents from feeling overwhelming.

- **Grid:** A 12-column system for desktop and a 2-column system for mobile.
- **Rhythm:** All margins and paddings must be multiples of the 8px base unit. 
- **Reflow:** On mobile, product cards typically transition from a 3 or 4-column grid to a 2-column "masonry" or "gallery" style to keep imagery large and tappable.
- **Safe Zones:** Content containers should maintain a minimum 16px horizontal margin on mobile devices.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers**. Instead of harsh black shadows, this design system uses "Colored Glows"—shadows that take on a very faint tint of the element's primary color or the background's cream tone.

- **Level 1 (Cards):** Low-offset, high-blur shadow (0px 4px 20px) with 5% opacity.
- **Level 2 (Dropdowns/Modals):** Medium-offset (0px 8px 30px) with 10% opacity.
- **Interactions:** When hovered, cards should "lift" by increasing shadow spread and slightly scaling up (1.02x).

## Shapes

The shape language is defined by the "Squircle" and fully rounded "Pill" forms. 

- **Cards & Containers:** Use `rounded-lg` (1rem) for a friendly, modern look.
- **Interactive Elements:** Buttons, chips, and input fields utilize `rounded-xl` or full pill shapes to signify touch-readiness.
- **Illustrative Blobs:** Decorative background elements should be asymmetrical, organic circles to break the rigidity of the grid.

## Components

### Buttons
Buttons are the primary vehicle for the brand’s energy.
- **Primary:** Fully rounded (pill) with a linear gradient (Coral #FF7F50 to Pink-Orange). They feature a soft glow shadow of the same color.
- **Secondary:** Fully rounded with a Turquoise (#40E0D0) to Green gradient.
- **Ghost:** Transparent background with a 2px colored border and matching text.

### Cards
Product cards are white with a 1px soft-cream border. The image area should have a slightly different background tint to separate the product from the card frame. Titles are centered or left-aligned using Quicksand Semi-Bold.

### Input Fields
Inputs should feel "pill-like" with a soft gray background that shifts to the Primary color border upon focus. Icons within inputs should be rounded and colorful.

### Chips & Tags
Used for categories and filters. They should use high-contrast combinations (e.g., Light Coral background with Deep Coral text) and be fully rounded.

### Delighters (Micro-animations)
- **Add to Cart:** A small burst of "sparkle" icons (Tertiary Yellow) should appear briefly around the button.
- **Loading:** A fluid "blob" shape that morphs and pulses using the brand's secondary color.