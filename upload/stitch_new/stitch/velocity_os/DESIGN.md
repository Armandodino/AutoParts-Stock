# Design System Strategy: The Kinetic Ledger

## 1. Overview & Creative North Star
This design system is built to transform automotive stock management from a utilitarian task into a high-precision editorial experience. The **Creative North Star** for this system is **"The Kinetic Ledger."** 

Unlike traditional SaaS platforms that rely on rigid grids and heavy borders, "The Kinetic Ledger" treats the desktop interface as a series of physical, layered sheets of premium material. We break the "template" look by using intentional asymmetry—such as oversized typography for key inventory metrics—and tonal depth. The goal is to create an environment that feels as calibrated and high-end as the vehicles being managed. We prioritize breathing room (whitespace) to reduce cognitive load in offline-first environments, ensuring the user feels in control even when the data is dense.

## 2. Color Architecture
Our palette is anchored by a deep, authoritative emerald (`primary: #005147`) which evokes a sense of luxury and stability. 

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined through background color shifts or tonal transitions. For example, a main content area using `surface` should be distinguished from a sidebar using `surface_container_low` through the color change alone, not a stroke.

### Surface Hierarchy & Nesting
We treat the UI as a series of nested layers. Each level of importance is represented by a shift in the `surface_container` tier:
*   **Canvas:** `surface` (#f8f9fa) — The base of the application.
*   **Secondary Regions:** `surface_container_low` (#f3f4f5) — Used for sidebars or inactive panels.
*   **Active Cards:** `surface_container_lowest` (#ffffff) — Used for primary data cards to make them "pop" against the canvas.
*   **Interactive Elements:** `surface_container_high` (#e7e8e9) — Used for hovered states or inset form regions.

### The "Glass & Gradient" Rule
To move beyond a "standard" app feel, we utilize **Glassmorphism** for floating elements like modals or top-bar navigation. Use a semi-transparent `surface` color with a `backdrop-blur` of 12px–20px. 
*   **Signature Textures:** Main CTAs should not be flat. Use a subtle linear gradient from `primary` (#005147) to `primary_container` (#006b5f) at a 135-degree angle to provide a "machined" professional polish.

## 3. Typography: The Editorial Edge
This system utilizes a dual-font strategy to balance brand personality with data density.

*   **Display & Headlines (Manrope):** We use Manrope for all `display-` and `headline-` scales. Its geometric but warm curves provide a modern, bespoke feel. Large stock counts or vehicle names should use `display-md` to create an authoritative visual hierarchy.
*   **Data & Utility (Inter):** For `body-` and `label-` scales, we use Inter. Its high x-height and exceptional legibility at small sizes make it perfect for VIN numbers, stock IDs, and status labels.

**Hierarchy Note:** Always pair a `headline-sm` in Manrope with a `label-md` in Inter (All Caps, 0.05em tracking) for section headers to create a "magazine" style layout.

## 4. Elevation & Depth
In this design system, depth is a functional tool, not just a decoration.

*   **Tonal Layering:** Avoid shadows for static elements. Place a `surface_container_lowest` card on a `surface_container_low` background to create a soft, natural lift.
*   **Ambient Shadows:** For "floating" elements (modals, dropdowns), use extra-diffused shadows. 
    *   *Spec:* `box-shadow: 0 12px 32px -4px rgba(25, 28, 29, 0.08);`
    *   Shadows must use a tint of the `on_surface` color, never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use the `outline_variant` token at **20% opacity**. 100% opaque borders are strictly forbidden as they clutter the visual field.

## 5. Components

### Sidebar Navigation
*   **Style:** Use `surface_container_low`. 
*   **Active State:** Do not use a box. Use a vertical "pill" indicator (4px wide) in `primary` on the far left, and shift the active text to `on_surface`.

### Modern Data Tables
*   **Layout:** Strictly forbid vertical divider lines.
*   **Row Separation:** Use a `1px` height `outline_variant` at 10% opacity for horizontal separation, or simple `surface_container_lowest` / `surface` alternating row colors (zebra striping) at a very low contrast.
*   **Typography:** Use `body-md` for row data. Header labels must be `label-sm` in all caps.

### Data Cards
*   **Style:** `border-radius: lg (1rem)`.
*   **Background:** `surface_container_lowest`.
*   **Content:** Group related vehicle data using whitespace (`spacing: 4`) rather than internal lines.

### Structured Forms
*   **Inputs:** `surface_container_highest` background with a `2px` bottom-only border in `outline_variant` that transitions to `primary` on focus.
*   **Radius:** `md (0.75rem)`.

### Status Badges
*   **Success:** `on_primary_container` text on `primary_fixed` background.
*   **Warning:** `on_tertiary_fixed_variant` text on `tertiary_fixed` background.
*   **Danger:** `on_error_container` text on `error_container` background.
*   **Shape:** Full pill `rounded-full`.

### Custom Automotive Components
*   **Stock Health Gauge:** A custom progress bar using a gradient from `tertiary` to `primary` to show stock turnover.
*   **Offline Indicator:** A glassmorphic pill in the top bar using `secondary_container` to indicate local-first sync status.

## 6. Do's and Don'ts

### Do
*   **Do** use the `16 (4rem)` spacing token for page margins to create an "expansive" premium feel.
*   **Do** use `manrope` for any number larger than 24px.
*   **Do** use `backdrop-blur` on the sidebar to let vehicle imagery peek through slightly.

### Don't
*   **Don't** use 100% black text. Always use `on_surface` (#191c1d) for better optical comfort.
*   **Don't** use standard `border-radius: 0` or `2px`. Our minimum is `sm (0.25rem)` for tiny elements and `lg (1rem)` for containers.
*   **Don't** use "Drop Shadows" that have a visible offset on only one side; aim for "Ambient Glows" that feel centered and soft.