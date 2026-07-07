# Wallet Primitive — Frontend Design System

This document outlines the visual identity, tokens, styling components, and UI layout design patterns for the **Wallet Primitive** frontend application. Reference this document whenever creating new views, refactoring dashboard pages, or updating components to ensure absolute aesthetic continuity.

---

## 🎨 Theme & Palette (Tailwind Tokens)

The UI is built on a **high-contrast dark-mode-first** system inspired by double-entry terminal ledger sheets. 

### 1. Color System

#### 🌌 Ink (Backgrounds & Deep Fills)
Used for dark-theme surfaces, sidebars, cards, and modal components.
* `ink-950` (`#07090D`) — Deepest canvas black (Sidebar background).
* `ink-900` (`#0A0E14`) — Master layout page background.
* `ink-800` (`#10151D`) — Card container and surface fills.
* `ink-700` (`#161C26`) — Borders, grid lines, and dropdown containers.
* `ink-600` (`#212934`) — Hover states and input fills.
* `ink-500` (`#333E4C`) — Muted outlines and disabled states.

#### 📄 Paper (Typography & Light Surfaces)
Used for light mode canvas fills and body text.
* `paper-50` (`#F7F8FA`) — Light mode background.
* `paper-100` (`#ECEFF2`) — Default dark mode body text.
* `paper-200` (`#D9DEE5`) — Secondary text and descriptions.

#### ⚡ Accent (Nomba Blue)
*Note: Configured under the `amber` key in `tailwind.config.ts` to replace generic colors with signature blue branding.*
* `amber-400` (`#3B82F6`) — Interactive hover states.
* `amber-500` (`#0066FF`) — Primary brand blue (Buttons, active tabs, focus states).
* `amber-600` (`#0052CC`) — Active click/press states.

#### 🟢 Signal (Status Indicators)
* `signal-blue` (`#5B8DEF`) — Secondary info highlights.
* `signal-green` (`#3FB97F`) — Success (Active wallets, funded checkouts, credits).
* `signal-red` (`#E5544D`) — Alerts (Failed transactions, closed wallets, debits).

---

## 🔤 Typography & Font Hierarchy

The frontend relies on three complementary font families:

| Category | Token | Font Family | Usage |
| :--- | :--- | :--- | :--- |
| **Display** | `font-display` | `Space Grotesk` | Headings, page titles, logos, card headers. |
| **Body** | `font-body` | `Inter` | Paragraphs, forms, labels, status badges. |
| **Mono** | `font-mono` | `JetBrains Mono` | Numbers, transaction IDs, tables, code panels. |

---

## 🛠️ Custom Utility Classes & CSS Guidelines

Defined in `globals.css`:

### 1. Tabular Numbers Class (`.ledger-num`)
Monospace numeric characters naturally line up vertically. Always wrap table columns, ledger balances, and currency figures in `.ledger-num` to prevent column shifting:
```css
.ledger-num {
  font-variant-numeric: tabular-nums;
  @apply font-mono;
}
```

### 2. Focus Visible Rings
Interactive inputs use a custom focus state ring styled with an offset:
```css
:focus-visible {
  outline: 2px solid #f5a623;
  outline-offset: 2px;
}
```

### 3. Selection Highlights
Selected text displays a soft amber-gold selection background:
```css
::selection {
  background: rgba(245, 166, 35, 0.28);
}
```

---

## ✨ Aesthetic Enhancements

To maintain the premium "financial terminal" look, apply these visual features:

### 1. Faint Tech Grid (`bg-grid-faint`)
Draws a subtle 48px grid overlay behind hero sections or headers:
```html
<div className="bg-grid-faint bg-[size:48px_48px]">...</div>
```

### 2. Interactive Cursor Radial Glow (`bg-glow-amber`)
Renders a glowing radial spotlight centered at custom CSS variables `--x` and `--y`. Feed the mouse coordinates into the container style:
```html
<div className="bg-glow-amber" style={{ '--x': `${x}px`, '--y': `${y}px` }}>...</div>
```

### 3. Ambient Animations
* `animate-blob` — A slow, floating background circular blob useful for subtle gradient backdrops.
* `animate-tick` — A swift slide-up fade-in animation for loading cards and updating numbers.

---

## 🗂️ Layout & Navigation Structure

All pages inside `/dashboard` share a persistent side navigation layout.

```
+-----------------------------------------------------------+
|  wallet/primitive                                         |
|  ----------------                                         |
|  * Dashboard            [ Page Content Canvas ]           |
|  * Customers                                              |
|  * Wallets              bg-ink-900                        |
|  * Temporary Accounts   text-paper-100                    |
|  * Webhooks                                               |
|  * Analytics                                              |
|  * Audit Logs                                             |
|  * Reconciliation                                         |
|  * Settings                                               |
+-----------------------------------------------------------+
```
* **Sidebar (`Sidebar.tsx`)**: Fixed width (`w-60`), anchored to the left, uses `bg-ink-950` with a subtle right border (`border-white/5`).
* **Active items**: Styled with a translucent background: `bg-blue-500/10 text-blue-400`.
