# Flam — Adaptive Layout Engine for Multi-Surface Ads

A type-safe, constraint-based layout engine built in TypeScript and React that takes a **single declarative ad specification** and resolves it dynamically across wildly different surfaces (tall mobile interstitial, wide broadcast lower-third, square retail kiosk, and arbitrary custom aspect ratios) **without per-surface hardcoded layouts or CSS media query hacks**.

---

## 🚀 Quick Start

### 1. Installation
Ensure you have Node.js (v18+) installed:
```bash
npm install
```

### 2. Run Interactive Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to explore the interactive showcase.

### 3. Run Automated Test Suite
```bash
npm test
```
Executes 7 unit tests verifying constraint solving, collision detection, and priority degradation.

### 4. Build for Production Deployment
```bash
npm run build
```
Creates an optimized static bundle in `dist/`, ready for 1-click deployment on **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 🎯 Features & Core Requirements

1. **Single Declarative Ad Spec (`spec.ts`)**:
   - The ad content (headline, hero visual, price tag, CTA button, branding logo) is declared **once** via `defineAd()`.
   - Each element possesses semantic roles (`primary`, `hero`, `action`, `branding`, `secondary`) and explicit priority levels (`1 = critical`, `2 = high value`, `3 = supplemental`).

2. **Real Constraint-Based Surface Profiles (`surfaces.ts`)**:
   - Beyond just width and height, profiles specify `safeArea`, `minTapTarget` (touch ergonomics), `minTextSize` (typography legibility floors), `viewingDistance` (`near` vs. `far` for broadcast TV), and `touchOnly`.

3. **Pure Algorithmic Constraint Resolver (`resolver.ts`)**:
   - **No hardcoded branches**: No `if (surface === "mobile") return layoutA`.
   - Layout topology is computed mathematically from the continuous aspect ratio $AR = W_{avail} / H_{avail}$:
     - Extreme Wide ($AR \ge 2.2$): Horizontal pipeline (Broadcast Lower-Third)
     - Wide ($1.15 \le AR < 2.2$): Dual-column split (Mobile Landscape, Tablet)
     - Balanced Square ($0.85 \le AR < 1.15$): High-density centered kiosk grid
     - Tall Portrait ($AR < 0.85$): Vertical flow cascade (Mobile Interstitial)

4. **Deterministic Priority Degradation**:
   - When available viewport height or width is constrained (or squeezed via the live slider), the engine enters an elastic degradation loop:
     1. Flexible elements scale down to their minimum dimension.
     2. Supplemental elements with Priority 3 (e.g. `logo` / branding) drop cleanly with recorded reasons.
     3. Priority 2 elements (e.g. `price`) drop next if space remains cramped.
     4. Core conversion elements (Priority 1: `headline`, `product-image`, `cta`) are preserved and centered with zero overlap or clipping.

5. **Multi-Target Renderers**:
   - `render-dom.tsx`: Clean DOM/CSS renderer with bounding box debug guides and smooth transitions.
   - `render-canvas.ts`: Alternative Canvas 2D renderer proving total separation of the solver from presentation.

6. **Bonus Capabilities**:
   - **Interactive Viewport Squeeze**: Live range sliders to continuously squeeze width/height and observe real-time degradation.
   - **5th Unknown-at-Design-Time Surface Creator**: Create completely arbitrary surfaces at runtime and observe the solver resolve them with zero code changes.
   - **Real Text Measurement Engine (`text-measure.ts`)**: Uses HTML5 Canvas `measureText` to measure typography bounding boxes accurately.

---

## 📐 Resolution Flow

```
┌─────────────────┐       ┌──────────────────────┐
│  AdSpec Schema  │   +   │   Surface Profile    │
│  (1 spec only)  │       │ (Constraints & Safe) │
└────────┬────────┘       └──────────┬───────────┘
         │                           │
         └─────────────┬─────────────┘
                       ▼
         ┌───────────────────────────┐
         │ Constraint Resolver       │
         │ - Deduct Safe Area        │
         │ - AR Topology Selection   │
         │ - Enforce Hard Bounds     │
         │ - Priority Degradation    │
         └─────────────┬─────────────┘
                       ▼
         ┌───────────────────────────┐
         │ ResolvedLayout Tree       │
         │ (x, y, w, h per element)  │
         └─────────────┬─────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ DOM/CSS Renderer│         │ Canvas Renderer │
└─────────────────┘         └─────────────────┘
```

---

## 🛠️ TypeScript Design & Type Safety

- **Discriminated Unions**: Elements are typed as `TextAdElement | ImageAdElement | ButtonAdElement` tagged with `type: 'text' | 'image' | 'button'`.
- **Validation**: `defineAd()` and `validateSurface()` prevent duplicate IDs, empty contents, missing labels, and safe areas exceeding screen bounds at runtime.
- **Resolved Output**: `ResolvedElement` provides strictly typed `{ rect: { x, y, width, height }, computedStyles, isVisible, status, degradationReason }`.

---

## 🧪 Automated Test Suite

Run tests via `npm test`:
- `✓ AdSpec and Surface Validation`: Tests duplicate ID and safe-area overflow prevention.
- `✓ Mobile Interstitial`: Verifies non-overlapping portrait placement.
- `✓ Broadcast Lower-Third`: Verifies horizontal placement and `minTextSize >= 32px`.
- `✓ Retail Kiosk`: Verifies `minTapTarget >= 64px`.
- `✓ Priority Degradation`: Verifies Priority 3 logo drops first on cramped banners.
- `✓ Unknown Surface`: Verifies live resolution for an arbitrary automotive HUD.

---

## ⚠️ Known Limitations

- Image aspect ratios are preserved by letterboxing or fit within computed rects rather than content-aware saliency cropping.
- Multi-column complex nested flexbox wrap is simplified into 4 primary mathematical topology archetypes.

---

## ⏱️ Time Spent
- **Architecture & Constraint Solver Design**: ~2.5 hours
- **Renderer & Component Implementation**: ~2 hours
- **Testing & Documentation**: ~1 hour
- **Total**: ~5.5 hours
