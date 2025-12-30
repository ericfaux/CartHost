# CartHost - Incident Dossier Design System

A liability-first golf cart rental management platform with the "Incident Dossier" design aesthetic.

## Design System Overview

CartHost uses a custom design system inspired by legal dossiers and military intelligence briefings. The interface is designed to feel like a "legal-grade evidence console" and "fleet health instrument panel."

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Paper | `#F4F1EA` | Background, main canvas |
| Surface | `#FFFFFF` | Cards, panels, elevated elements |
| Ink | `#0B1220` | Primary text, headers |
| Ink Subtle | `#475569` | Secondary text |
| Ink Muted | `#64748B` | Tertiary text, captions |
| Accent Ops | `#0F766E` | Primary actions, success states |
| Accent Legal | `#B91C1C` | Critical alerts, legal matters |
| Accent Warning | `#D97706` | Warnings, attention required |
| Accent Info | `#0284C7` | Informational, links |
| Accent Success | `#16A34A` | Positive states, completed |

### Typography

- **Headings**: Fraunces (serif) - Legal document authority
- **UI Text**: Plus Jakarta Sans (sans-serif) - Modern clarity
- **Forensic Text**: JetBrains Mono (monospace) - Technical precision

### Signature Motifs

1. **Dossier Header Strip** - Beige-tinted header with dark text and action buttons
2. **Stamp Badges** - Rotated, all-caps badges for status (SIGNED, SEALED, VERIFIED)
3. **Evidence Tags** - Monospace labels on evidence photos
4. **Ledger Lines** - Alternating row backgrounds in tables
5. **Chain of Custody** - Forensic metadata panels

## Visual Regression Checklist

Use this checklist after making design system changes to ensure visual consistency.

### Global Elements

- [ ] **Paper Background**: Main content area has warm beige (#F4F1EA) background
- [ ] **Fonts Loading**: Fraunces renders for headings, Jakarta for UI, JetBrains for mono
- [ ] **Sidebar**: Dark ink background with white text, active indicator bar
- [ ] **Mobile Navigation**: Hamburger menu works, overlay closes on route change

### Dashboard (`/dashboard`)

- [ ] **Page Header**: "Dashboard" title with subtitle renders correctly
- [ ] **Setup Docket**: Progress bar animates, checklist items show proper states
- [ ] **Quick Access Cards**: Hover elevation effect works, icons have color tints
- [ ] **Protection Overview Tiles**: 5-column grid on desktop, stacks on mobile
- [ ] **Open Sessions Tile**: Warning highlight when count > 0
- [ ] **Deposits Held Tile**: Warning state when deposits are held
- [ ] **Progress Ring**: SVG renders with correct percentage fill
- [ ] **Fleet Health Cards**: Green/Yellow/Red states display correctly
- [ ] **Attention List**: HealthIndicator dots pulse when overdue

### Fleet (`/dashboard/fleet`)

- [ ] **Page Header**: "My Fleet" with subtitle
- [ ] **Add Cart Button**: Opens modal with proper overlay
- [ ] **Cart Cards**: Display name, battery bar, service meter
- [ ] **Battery Bar**: Gradient fill from red to green based on level
- [ ] **Service Meter**: Trips counter with color-coded status
- [ ] **Health Indicator**: Dot pulses for due_soon/overdue states
- [ ] **Edit Modal**: Form fields have dossier styling
- [ ] **Delete Confirmation**: Red destructive button, proper warning text
- [ ] **Empty State**: Shows when no carts exist

### Evidence Locker (`/dashboard/history`)

- [ ] **Page Header**: "Evidence Locker" title
- [ ] **Tab Buttons**: Active state has dark fill, inactive has border
- [ ] **Search Input**: Magnifying glass icon, proper focus ring
- [ ] **Date Filter**: Calendar icon, date picker works
- [ ] **Ledger Table**: Alternating row backgrounds on hover
- [ ] **Status Badges**: Active (teal pulse), Needs Review (amber pulse), Completed (green)
- [ ] **Revenue Column**: Green text for positive amounts, edit button on hover
- [ ] **Deposit Dropdown**: Select control with proper styling
- [ ] **View Evidence Button**: "ops" variant with external link icon
- [ ] **Close Button**: Only shows for "needs_review" rentals
- [ ] **Empty State**: Shows when no rentals match filters

### Rental Detail (`/dashboard/history/[id]`)

- [ ] **Case File Header**: Back button, guest name, case file ID, print button
- [ ] **Case Summary Strip**: 4-column grid with icons and labels
- [ ] **Stamp Signed Badge**: Rotated badge next to guest name when waiver signed
- [ ] **Liability Waiver Section**: Sealed stamp, expand/collapse works
- [ ] **Chain of Custody Panel**: Monospace text, all fields display
- [ ] **Guest-Reported Issues**: Amber background, PRE-EXISTING stamp
- [ ] **Pre-Ride Photos**: Grid layout, PRE-01 labels, click to enlarge
- [ ] **Return Photo**: Full-width, RETURN PHOTO label
- [ ] **Lightbox Modal**: Dark overlay, close button, evidence label footer
- [ ] **Forensic Banner**: Case ID and timestamp at bottom
- [ ] **Empty State**: Shows when no evidence available

### Maintenance (`/dashboard/maintenance`)

- [ ] **Page Header**: "Maintenance Logs" title
- [ ] **Log Service Button**: Opens modal
- [ ] **Search and Filters**: All controls have dossier styling
- [ ] **Service Log Table**: Cart name, date, type, cost, notes columns
- [ ] **Cost Display**: Formatted currency with mono font
- [ ] **Service Type Badge**: Variant matches type (routine, repair, inspection)
- [ ] **Edit/Delete Actions**: Appear on row hover
- [ ] **Empty State**: Shows when no logs exist

### Settings (`/dashboard/settings`)

- [ ] **Page Sections**: Proper panel styling with headers
- [ ] **Form Inputs**: Labels above, proper focus states
- [ ] **Toggle Switches**: Track and thumb styling correct
- [ ] **Save Buttons**: Primary variant, loading state works
- [ ] **Success Messages**: Green toast/alert styling

### Interactive States

- [ ] **Button Hover**: Subtle background shift
- [ ] **Button Active**: Press-down transform
- [ ] **Button Loading**: Spinner replaces icon, disabled state
- [ ] **Input Focus**: Ring appears with proper offset
- [ ] **Card Hover**: Elevation increases, subtle translate
- [ ] **Link Hover**: Color shift, underline where appropriate
- [ ] **Modal Open**: Background overlay fades in, panel scales up
- [ ] **Modal Close**: Click outside or X button closes

### Responsive Breakpoints

- [ ] **Mobile (< 640px)**: Single column layouts, stacked elements
- [ ] **Tablet (640-1024px)**: 2-column grids where appropriate
- [ ] **Desktop (> 1024px)**: Full layouts, sidebar visible
- [ ] **Large Desktop (> 1280px)**: Max-width containers, centered content

### Accessibility

- [ ] **Focus Visible**: Keyboard focus indicators on all interactive elements
- [ ] **Color Contrast**: Text meets WCAG AA standards
- [ ] **Button Labels**: All icon buttons have aria-labels
- [ ] **Modal Focus Trap**: Focus stays within open modals
- [ ] **Screen Reader**: Semantic HTML, proper headings hierarchy

## Component Library

All reusable components are located in `components/ui/`:

| Component | File | Description |
|-----------|------|-------------|
| Button | `Button.tsx` | Primary, secondary, ghost, destructive, ops variants |
| Badge | `Badge.tsx` | Chip and stamp styles, status badges |
| Panel | `Panel.tsx` | Panel, PageHeader, SectionHeader |
| Table | `Table.tsx` | Ledger-style table components |
| Input | `Input.tsx` | Input, SearchInput, Select, Textarea, Toggle |
| Modal | `Modal.tsx` | Modal, Drawer, ConfirmDialog |
| EvidenceTag | `EvidenceTag.tsx` | Evidence labels, chain of custody |
| StatTile | `StatTile.tsx` | Dashboard stat tiles |
| Meters | `Meters.tsx` | BatteryBar, ServiceMeter, HealthIndicator, ProgressRing |
| EmptyState | `EmptyState.tsx` | Empty, loading, and error states |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase
- **Auth**: Supabase Auth
- **Fonts**: Google Fonts (Fraunces, Plus Jakarta Sans, JetBrains Mono)
