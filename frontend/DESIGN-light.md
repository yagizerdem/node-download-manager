---
name: Precision Workstation
colors:
  surface: "#f8f9ff"
  surface-dim: "#cbdbf5"
  surface-bright: "#f8f9ff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#eff4ff"
  surface-container: "#e5eeff"
  surface-container-high: "#dce9ff"
  surface-container-highest: "#d3e4fe"
  on-surface: "#0b1c30"
  on-surface-variant: "#434655"
  inverse-surface: "#213145"
  inverse-on-surface: "#eaf1ff"
  outline: "#747686"
  outline-variant: "#c4c5d7"
  surface-tint: "#2151da"
  primary: "#0037b0"
  on-primary: "#ffffff"
  primary-container: "#1d4ed8"
  on-primary-container: "#cad3ff"
  inverse-primary: "#b7c4ff"
  secondary: "#565e74"
  on-secondary: "#ffffff"
  secondary-container: "#dae2fd"
  on-secondary-container: "#5c647a"
  tertiary: "#004f35"
  on-tertiary: "#ffffff"
  tertiary-container: "#006948"
  on-tertiary-container: "#76eab6"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#dce1ff"
  primary-fixed-dim: "#b7c4ff"
  on-primary-fixed: "#001551"
  on-primary-fixed-variant: "#0039b5"
  secondary-fixed: "#dae2fd"
  secondary-fixed-dim: "#bec6e0"
  on-secondary-fixed: "#131b2e"
  on-secondary-fixed-variant: "#3f465c"
  tertiary-fixed: "#85f8c4"
  tertiary-fixed-dim: "#68dba9"
  on-tertiary-fixed: "#002114"
  on-tertiary-fixed-variant: "#005137"
  background: "#f8f9ff"
  on-background: "#0b1c30"
  surface-variant: "#d3e4fe"
typography:
  headline-xl:
    fontFamily: hankenGrotesk
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: hankenGrotesk
    fontSize: 22px
    fontWeight: "600"
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: inter
    fontSize: 15px
    fontWeight: "500"
    lineHeight: 22px
  body-md:
    fontFamily: inter
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 18px
  body-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  label-md:
    fontFamily: inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: inter
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.02em
  code-mono:
    fontFamily: inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xxs: 2px
  space-xs: 4px
  space-sm: 8px
  space-md: 12px
  space-lg: 16px
  space-xl: 24px
  space-2xl: 32px
  sidebar-width: 240px
  inspector-width: 320px
  toolbar-height: 48px
---

## Brand & Style

This design system delivers a high-performance, distraction-free desktop workstation aesthetic. Engineered for utility, speed, and uncompromising clarity, it translates the high-throughput mechanics of a modern download manager into a disciplined, premium graphical environment.

The visual narrative relies on **Engineered Minimalism**:

- Pristine, architectural canvas surfaces accented with sharp, micro-radii geometries.
- Dense typographic cadence prioritizing technical legibility, telemetry readouts, and clear data hierarchies.
- Deliberate restraint in decorative visual noise—favoring micro-borders, sharp hairline dividers, and functional chromatic signals over gratuitous ornamentation.
- Immediate feedback loops utilizing a targeted royal cobalt for intent, paired with high-legibility telemetry semantics (emerald completion, amber saturation, rose bottlenecks).

## Colors

The color system establishes a razor-sharp hierarchy across structural surfaces and actionable states:

- **Primary (`#1D4ED8`)**: A focused royal cobalt used exclusively for primary actions, active process toggles, active progress indicators, and key structural focus rings.
- **Secondary (`#0F172A`)**: Deep obsidian slate commanding primary headings, active telemetry metrics, and high-emphasis textual readouts.
- **Neutral Foundation**:
  - `Canvas Root`: `#F8FAFC` (subtle cool slate foundation preventing glare during long sessions).
  - `Surface Elevated / Workstation Card`: `#FFFFFF` (crisp white card and panel substrate).
  - `Border Hairline`: `#E2E8F0` (structural definition across containers and list partitions).
  - `Muted / Telemetry Labels`: `#64748B` (secondary metadata, transfer speeds, and timestamps).
- **Semantic Accents**:
  - `Success / Completed`: `#059669` (transfer finalized, verification integrity confirmed).
  - `Warning / Throttled`: `#D97706` (network degradation, queue paused).
  - `Critical / Error`: `#DC2626` (checksum failure, broken stream, disk capacity alert).

## Typography

Typography balances structural presence with dense telemetry performance:

- **Headlines (Hanken Grotesk)**: Chosen for its clean, geometric cadence and disciplined terminals. It governs application views, section headers, modal titles, and high-level performance banners.
- **Body & Data (Inter)**: Built for neutral high-density legibility. Tabular figures must be enabled (`font-variant-numeric: tabular-nums`) across all transfer speeds, file sizes, ETA counters, and queue positions to ensure visual alignment without jitter during dynamic re-renders.

## Layout & Spacing

The layout employs a multi-pane desktop shell optimized for continuous workflow visibility:

- **Spatial Baseline**: An explicit 4px/8px modular scale. Spacing is tightly controlled to balance high information density with comfortable scanning margins.
- **Application Shell Architecture**:
  - **Global Header / Toolbar (48px height)**: Houses persistent navigation controls, global throughput telemetry, new task initiation, and search/filter inputs.
  - **Left Rail (240px fixed)**: Category trees (Active, Completed, Queued, Scheduled), protocol filters (HTTP, Torrent, SFTP), and bandwidth allocation profiles.
  - **Primary Workspace (Fluid)**: Virtualized data table/stream containing download items, segmented progress meters, and dynamic speed graphs.
  - **Contextual Inspector (320px optional panel)**: Deep inspection pane providing chunk maps, peer lists, connection threads, and file integrity check outputs.
- **Density Adaptation**: Responsive breakpoints at `1024px` (collapsing inspector to overlay) and `768px` (collapsing navigation rail to micro-icon bar).

## Elevation & Depth

Visual hierarchy is maintained via **crisp structural layering and micro-elevation**:

1. **Surface 0 (Base Canvas)**: `#F8FAFC` – Root desktop frame.
2. **Surface 1 (Panels & Cards)**: `#FFFFFF` bordered with a 1px solid hairline (`#E2E8F0`). Flat elevation with zero ambient shadow, maintaining geometric precision.
3. **Surface 2 (Hover & Floating Menus)**: `#FFFFFF` backed by an ultra-subtle ambient shadow:
   - `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04);`
   - Border: `1px solid #CBD5E1`.
4. **Surface 3 (Modals & Command Palette)**: `#FFFFFF` backed by a high-definition depth shadow:
   - `box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.04);`
   - Border: `1px solid #CBD5E1`.

## Shapes

The design system uses a strict **Level 1 (Soft)** shape language:

- **Base Radius (`4px`)**: Applied to standard inputs, segmented controls, small buttons, tags, table rows, and progress track caps.
- **Medium Radius (`6px`)**: Applied to standard cards, inspector flyouts, and modal dialogs.
- **Micro Radius (`2px`)**: Applied to data tooltips, inner progress bar segments, and micro status pips.
- **Pill Radius (`9999px`)**: Reserved exclusively for connection status indicators and global state chips.

## Components

### Buttons

- **Primary**: Solid `#1D4ED8` background, `#FFFFFF` text, 4px border-radius, font size 13px, weight 600. Hover: `#1E40AF`. Active: `#1E3A8A`. Focus: 2px offset ring in `#1D4ED8`.
- **Secondary**: `#FFFFFF` background, 1px solid `#CBD5E1`, text `#0F172A`. Hover: `#F1F5F9` background, border `#94A3B8`.
- **Icon / Utility**: Transparent background, text `#64748B`. Hover: `#F1F5F9`, text `#0F172A`. Dimensions: 28x28px or 32x32px.

### Inputs & Search Bars

- Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`, placeholder `#94A3B8`, border-radius 4px, height 32px.
- Focus: Border color `#1D4ED8`, outline: 2px solid rgba(29, 78, 216, 0.15).

### Progress Tracks & Visualizers

- **Background Track**: Solid `#E2E8F0`, 4px height (inline list) or 8px height (inspector detail), border-radius 2px.
- **Fill Bar**:
  - In Progress: `#1D4ED8` solid or multi-segmented thread visualizer.
  - Completed: `#059669`.
  - Paused: `#94A3B8`.
  - Error: `#DC2626`.

### Data Table Rows (Download Queue)

- Height: 44px compact, 56px detailed.
- Separation: Hairline 1px `#F1F5F9` bottom divider.
- Selected State: `#EFF6FF` background with a 2px left vertical highlight in `#1D4ED8`.
- Hover State: `#F8FAFC`.

### Status Badges & Chips

- Padding: 2px 8px, border-radius 4px, text 11px, weight 600.
- Variants:
  - `Downloading`: Background `rgba(29, 78, 216, 0.08)`, text `#1D4ED8`.
  - `Completed`: Background `rgba(5, 150, 105, 0.08)`, text `#059669`.
  - `Paused`: Background `rgba(100, 116, 139, 0.10)`, text `#475569`.
  - `Error`: Background `rgba(220, 38, 38, 0.08)`, text `#DC2626`.

### Cards & Group Panels

- Surface: `#FFFFFF`, border: 1px solid `#E2E8F0`, padding: 16px, border-radius 6px. No ambient shadow unless hovered.
