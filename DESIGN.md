---
name: Heritage Kitchen
colors:
  surface: "#f7f9ff"
  surface-dim: "#c9dcf3"
  surface-bright: "#f7f9ff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#edf4ff"
  surface-container: "#e3efff"
  surface-container-high: "#d9eaff"
  surface-container-highest: "#d1e4fb"
  on-surface: "#091d2e"
  on-surface-variant: "#594238"
  inverse-surface: "#203243"
  inverse-on-surface: "#e8f2ff"
  outline: "#8c7166"
  outline-variant: "#e0c0b2"
  surface-tint: "#a23f00"
  primary: "#9e3d00"
  on-primary: "#ffffff"
  primary-container: "#c64f00"
  on-primary-container: "#fffbff"
  inverse-primary: "#ffb595"
  secondary: "#006d37"
  on-secondary: "#ffffff"
  secondary-container: "#7bf8a1"
  on-secondary-container: "#007239"
  tertiary: "#ad2b1f"
  on-tertiary: "#ffffff"
  tertiary-container: "#cf4434"
  on-tertiary-container: "#fffbff"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdbcd"
  primary-fixed-dim: "#ffb595"
  on-primary-fixed: "#351000"
  on-primary-fixed-variant: "#7c2e00"
  secondary-fixed: "#7efba4"
  secondary-fixed-dim: "#61de8a"
  on-secondary-fixed: "#00210c"
  on-secondary-fixed-variant: "#005228"
  tertiary-fixed: "#ffdad5"
  tertiary-fixed-dim: "#ffb4a9"
  on-tertiary-fixed: "#410000"
  on-tertiary-fixed-variant: "#8e130c"
  background: "#f7f9ff"
  on-background: "#091d2e"
  surface-variant: "#d1e4fb"
typography:
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: "500"
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 26px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.5px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  touch-target-min: 56px
  margin-mobile: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

The design system is centered on accessibility, warmth, and cultural resonance. Designed specifically for low-literacy users, the brand personality is **nourishing, intuitive, and respectful**. It prioritizes visual storytelling through photography and iconography over complex text instructions.

The style is a blend of **Modern High-Contrast** and **Tactile Minimalism**. It utilizes bold, vibrant colors inspired by the Khmer landscape and culinary ingredients to create an immediate emotional connection. Every element is oversized to ensure ease of use on mid-range mobile devices, reducing the cognitive load and physical precision required for navigation. The result is a welcoming, "food-first" experience that feels like a trusted companion in the kitchen.

## Colors

The color palette is derived from the essential ingredients of Khmer cuisine:

- **Amok Orange (Primary):** Used for primary actions and key highlights. It stimulates appetite and represents warmth.
- **Lemongrass Green (Secondary):** Used for "success" states, health-related indicators, and fresh ingredient categories.
- **Earthy Red (Tertiary):** Inspired by spices and chiles, used for secondary accents and seasonal highlights.
- **Dark Blue-Gray (Text):** A high-contrast neutral chosen to ensure maximum legibility against light backgrounds, exceeding standard accessibility ratios.
- **Surface & Background:** Clean, off-white tones are used to keep the interface feeling fresh and to let high-quality food photography remain the focal point.

## Typography

Typography in this design system is optimized for the Khmer script, prioritizing stroke clarity and vertical balance. **Noto Sans** is used for its exceptional legibility and consistent rendering across Android devices.

To accommodate low-literacy users:

- **Font Sizes:** The base body size is set to 18px (larger than standard) to ensure characters are easily distinguishable.
- **Weights:** Use "Bold" or "700" for all key information headers to create a clear visual hierarchy that can be scanned quickly.
- **Line Height:** Generous leading is applied to prevent Khmer sub-scripts and super-scripts from overlapping or feeling cramped.
- **Hierarchy:** Minimal type scales are used to avoid confusing the user; visual emphasis is achieved through color and size rather than multiple font families.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for the OPPO A20 vertical viewport.

- **The 8px Rhythm:** All spacing and component heights are multiples of 8px to maintain a consistent visual tempo.
- **Touch Targets:** A strict minimum height of **56px** is enforced for all interactive elements (buttons, list items, inputs) to ensure ease of use for users with varying motor precision or those in high-activity environments like a kitchen.
- **Margins:** Large 24px side margins provide "breathing room," reducing visual noise and helping the user focus on one piece of content at a time.
- **Mobile First:** The layout predominantly uses a single-column "stack" to simplify the mental model of navigation. Information is presented linearly.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Soft Ambient Shadows** to communicate hierarchy.

- **Level 0 (Base):** The primary background (#FDFEFE), appearing flat.
- **Level 1 (Cards/Surfaces):** Use a slight elevation with a soft, diffused shadow (10% opacity of the Text color) to indicate that these elements can be tapped.
- **Level 2 (Floating Actions/Modals):** Use a more pronounced shadow to lift the element clearly above the content, reserved for critical path actions like "Start Cooking."
- **Depth Cues:** Rather than complex blurs, use subtle color shifts (e.g., from Background to Surface) to group related items without adding visual complexity.

## Shapes

The shape language is **Rounded and Friendly**, intended to feel approachable and safe.

- **Corner Radii:** Standard components use a 0.5rem (8px) radius. Larger containers, such as recipe cards or image containers, use 1rem (16px) to reinforce a modern, "soft" aesthetic.
- **Visual Consistency:** Buttons and input fields should always match the corner radius of the cards they sit within to maintain a unified appearance.
- **Icons:** Icons should feature rounded caps and corners, avoiding sharp points to align with the overall brand personality.

## Components

### Buttons

- **Primary:** Solid "Amok Orange" with white text. Height: 56px. Full-width on mobile to maximize hit area.
- **Secondary:** Outlined with a 2px "Lemongrass Green" border. Used for secondary tasks like "Save for Later."

### Recipe Cards

- **Visual Dominance:** 70% of the card area must be the recipe image.
- **Minimal Text:** Card should only display the Recipe Name and a clear time/difficulty icon.
- **Interaction:** The entire card acts as a single large touch target.

### Inputs & Selection

- **Checkboxes/Radios:** Oversized (32px x 32px) to ensure visibility and easy toggling.
- **Fields:** Use "Surface" color backgrounds with a thick 2px bottom border for clear affordance.

### Navigation

- **Bottom Bar:** Icons paired with labels. Use high-contrast active states (Amok Orange for selected, Dark Blue-Gray for inactive).
- **Progress Indicators:** In step-by-step cooking modes, use large, numbered circles and high-contrast bars to show the user exactly where they are in the process.

### Instruction Blocks

- Combine a large, clear photo of the specific step with a single sentence of text. If possible, include a small "play" icon for audio instructions to support users with low literacy.
