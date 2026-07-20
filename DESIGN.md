# Design System Specification: High-End Editorial for Neurodiversity

## 1. Overview & Creative North Star

### The Creative North Star: "The Tactile Sanctuary"
This design system moves away from the sterile, clinical appearance often associated with medical or educational software. Instead, it embraces a **Tactile Sanctuary**—a digital environment that feels like a premium, physical object. We are creating a space that is intentionally calm, highly predictable, yet sophisticated.

We break the "template" look by rejecting rigid, boxy layouts and harsh dividers. Instead, we use **intentional asymmetry**, **extreme corner radii**, and **tonal layering**. This system prioritizes cognitive ease for children with ASD and AAC needs while maintaining a high-end, editorial aesthetic that respects the user's intelligence and the caregiver's need for a serene interface.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

The color palette is rooted in earth tones, designed to reduce visual overstimulation. We use Material Design token conventions to manage a complex hierarchy of surfaces.

### Surface Hierarchy & Nesting
To move beyond a flat grid, treat the UI as a series of physical layers—like stacked sheets of heavy, organic paper.
*   **The Base:** Start with `surface` (#fefae8).
*   **The Nest:** Use `surface-container-low` (#f8f4e3) for large content areas.
*   **The Focus:** Place `surface-container-highest` (#e6e3d2) or `surface-container-lowest` (#ffffff) cards on top to create a natural "lift."

### Key Color Rules
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   **Glass & Gradient:** For floating action buttons or modal overlays, use **Glassmorphism**. Apply `surface` colors at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#486456) to `primary_container` (#a4c3b2) at a 135-degree angle. This adds "soul" and dimension that flat fills lack.

---

## 3. Typography: Editorial Clarity

We utilize a pairing of **Plus Jakarta Sans** for large-scale impact and **Be Vietnam Pro** for utility. Both fonts feature open counters and rounded terminals, echoing the friendly nature of the brand while maintaining professional rigor.

*   **Display (Plus Jakarta Sans):** Used for large, welcoming greetings or milestones. Its geometric nature provides an "authoritative yet kind" voice.
*   **Body (Be Vietnam Pro):** Chosen for its exceptional legibility at small scales, critical for AAC labels and instruction.
*   **Hierarchy as Identity:** Use `display-lg` (3.5rem) sparingly to create focal points. Overlap these large headers slightly with surface containers to break the "standard" boxy layout, creating an editorial, layered feel.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "noisy" for children with sensory sensitivities. This system uses **Ambient Light** principles.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. A `surface-container-lowest` card placed on a `surface-container-low` background creates a soft, natural lift without the need for visual clutter.
*   **Ambient Shadows:** If a floating effect is required (e.g., a critical AAC button), shadows must be extra-diffused.
    *   *Blur:* 24px - 40px.
    *   *Opacity:* 4% - 6%.
    *   *Color:* Use a tinted version of `on-surface` (#1d1c12) rather than pure black to keep the light "warm."
*   **The Ghost Border:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. 100% opaque borders are forbidden.

---

## 5. Components: The Primitive Building Blocks

### Buttons (Extreme Softness)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (3rem) rounded corners. Padding: `1.5rem 2.5rem`.
*   **Secondary:** `surface-container-highest` fill with `primary` text. No border.
*   **States:** On press, scale the button down to `0.98` and increase shadow density slightly to mimic physical depression.

### AAC Communication Chips
*   **Visual Style:** `md` (1.5rem) rounded corners. Use `surface-container-lowest` backgrounds. 
*   **Pictograms:** Icons must be centered with a generous `16px` safe zone. Use the `tertiary` (#506074) color for icon strokes to maintain a "Slate Blue" softness.

### Cards & Lists
*   **Layout:** Forbid divider lines. Use `1.5rem` (md) or `2rem` (lg) vertical spacing to separate list items.
*   **Interaction:** Cards should utilize the `surface-container-high` color on hover/tap to provide clear, gentle feedback.

### Additional Signature Component: The "Safe Space" Drawer
A unique bottom-sheet component using the `secondary_container` (#fdc5b5) color. It features a heavy backdrop blur and `xl` rounded corners at the top, housing calming tools or "break" timers.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use the Spacing Scale religiously. Consistent white space is a primary navigation cue for ASD users.
*   **DO** use `full` (pill-shaped) rounding for interactive elements like Chips and Search Bars.
*   **DO** overlap elements slightly (e.g., an icon overshooting the edge of a card) to create a premium, bespoke feel.

### Don’t:
*   **DON'T** use pure black (#000000). Always use `on-surface` or `slate-blue` variants to prevent visual "vibration."
*   **DON'T** use 1px dividers. If you feel you need a line, use a background color change instead.
*   **DON'T** use rapid animations. All transitions must be "Spring" based, feeling heavy and organic rather than "snappy" or "robotic."

---

## 7. Roundedness Scale (Reference)

*   **None:** 0px (Prohibited)
*   **sm:** 0.5rem (Inside nested elements)
*   **DEFAULT:** 1rem (Small cards)
*   **md:** 1.5rem (Standard cards)
*   **lg:** 2rem (Main containers/sections)
*   **xl:** 3rem (Buttons and Hero elements)
*   **full:** 9999px (Chips/Pills)