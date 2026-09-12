# Flam — Adaptive Layout Engine for Multi-Surface Ads

A clean, lightweight, constraint-based layout engine built in TypeScript and React that takes a **single declarative ad specification** and adapts it dynamically across wildly different surfaces (mobile portrait, mobile landscape, broadcast lower-third, retail kiosk, and cramped banner) **without per-surface hardcoded layouts or CSS media query hacks**.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Interactive Demo
```bash
npm run dev
```
Open `http://localhost:5173` to switch surfaces and test the engine live.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎯 Architecture & Implementation

### 1. Declarative Ad Spec (`src/spec.ts`)
The ad is defined once with semantic roles and priority levels:
```typescript
const adSpec = defineAd({
  id: 'flam-audio',
  title: 'Flam Spatial One XR Headphones',
  elements: [
    { id: 'logo', type: 'image', role: 'logo', priority: 3, ... },
    { id: 'headline', type: 'text', role: 'headline', priority: 1, ... },
    { id: 'product-image', type: 'image', role: 'hero', priority: 1, ... },
    { id: 'price', type: 'text', role: 'price', priority: 2, ... },
    { id: 'cta', type: 'button', role: 'cta', priority: 1, ... },
  ],
});
```

### 2. Surface Profiles (`src/surfaces.ts`)
Surfaces specify real constraints: dimensions, safe areas, minimum tap targets, and minimum readable text sizes:
- **Mobile Portrait** ($320 \times 480$): Tall 9:16 portrait.
- **Mobile Landscape** ($640 \times 360$): Widescreen smartphone layout.
- **Broadcast Lower-Third** ($1920 \times 250$): Far viewing distance ($10\text{ft}$) enforcing $\ge 28\text{px}$ readable text.
- **Retail Kiosk** ($1080 \times 1080$): Square touch kiosk enforcing $\ge 60\text{px}$ tap targets.
- **Cramped Banner** ($380 \times 110$): Stress-test demonstrating priority degradation.

### 3. Constraint Resolver Algorithm (`src/resolver.ts`)
- **No hardcoded surface names**: Topology is chosen mathematically from continuous aspect ratio $\text{AR} = W_{\text{avail}} / H_{\text{avail}}$:
  - $\text{AR} \ge 2.0 \implies$ **Horizontal Row** (Hero $\to$ Copy $\to$ CTA)
  - $1.0 \le \text{AR} < 2.0 \implies$ **Two-Column Split** (Hero on left, text & CTA on right)
  - $\text{AR} < 1.0 \implies$ **Vertical Stack** (Logo $\to$ Headline $\to$ Hero $\to$ Price $\to$ CTA)
- **Priority Degradation**: If space is constrained, Priority 3 (`logo`) drops cleanly first, followed by Priority 2 (`price`), while Priority 1 (`headline`, `hero`, `cta`) are strictly preserved.

### 4. DOM Renderer (`src/render-dom.tsx`)
Pure presentation component that maps calculated layout coordinates `(x, y, width, height)` directly to styled elements with smooth CSS animations.

---

## 🧪 Automated Test Suite
- `✓ AdSpec Validation`: Prevents duplicate element IDs.
- `✓ Mobile Portrait`: Adapts to vertical stack.
- `✓ Mobile Landscape`: Adapts to two-column split.
- `✓ Broadcast Lower-Third`: Adapts to horizontal row with enforced text size floor.
- `✓ Retail Kiosk`: Adapts to two-column with enforced 60px tap target.
- `✓ Priority Degradation`: Verifies Priority 3 logo drops cleanly on cramped banner while CTA and headline remain intact.
- `✓ Unknown Surface`: Verifies live adaptation to an arbitrary custom aspect ratio.
