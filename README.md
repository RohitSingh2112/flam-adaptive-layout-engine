# Flam — Multi-Surface Adaptive Ad Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Active-emerald?style=for-the-badge&logo=googlechrome&logoColor=white)](https://rohitsingh2112.github.io/flam-adaptive-layout-engine/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-10%20Passed-success?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

> **Frontend R&D Assignment — Option 1: Adaptive Layout Engine for Multi-Surface Ads**  
> A declarative, constraint-based layout engine built with **TypeScript**, **React**, and **HTML5 Canvas** that dynamically adapts a single ad specification across disparate aspect ratios and strict device constraints without hardcoded layout templates or conditional CSS media query hacks.

---

## 🌐 Live Application
Experience the interactive engine live in your browser:  
👉 **[https://rohitsingh2112.github.io/flam-adaptive-layout-engine/](https://rohitsingh2112.github.io/flam-adaptive-layout-engine/)**

---

## ⏱️ Time Spent on Assignment
* **Total Time**: ~6.5 hours
  * **Spec Definition & Math Resolver**: 2.5 hours
  * **Multi-Surface & Priority Degradation Logic**: 1.5 hours
  * **Dual Rendering Backends (DOM & HTML5 Canvas)**: 1.5 hours
  * **Automated Unit Tests & Documentation**: 1.0 hour

---

## 🔄 Resolution Flow

```
┌────────────────────────┐      ┌─────────────────────────┐
│ Declarative Ad Spec    │  +   │ Surface Profile         │
│ (src/spec.ts)          │      │ (src/surfaces.ts)       │
└───────────┬────────────┘      └────────────┬────────────┘
            │                                │
            └───────────────┬────────────────┘
                            ▼
            ┌────────────────────────────────┐
            │ Mathematical Constraint Solver │
            │ (src/resolver.ts)              │
            │ 1. Compute Safe Bounds & AR    │
            │ 2. Priority-Driven Degradation │
            │ 3. Enforce minTap & minText    │
            │ 4. Density-Aware Scaling Pass  │
            └───────────────┬────────────────┘
                            ▼
            ┌────────────────────────────────┐
            │ Resolved Layout Tree           │
            │ (x, y, width, height, font)    │
            └───────┬────────────────┬───────┘
                    │                │
      ┌─────────────▼──────┐  ┌──────▼─────────────┐
      │ DOM / CSS Renderer │  │ HTML5 Canvas       │
      │ (src/render-dom)   │  │ (src/render-canvas)│
      └────────────────────┘  └────────────────────┘
```

---

## 📐 Supported Target Surfaces & Aspect Ratios

The engine computes layout positioning mathematically based on continuous aspect ratios ($AR = \text{Width} / \text{Height}$) and safe areas:

| Surface Category | Name | Aspect Ratio | Dimensions | Layout Topology | Enforced Constraints |
|---|---|---|---|---|---|
| **Standard** | **Widescreen Landscape** | **16:9** | $1920 \times 1080\text{px}$ | Two-Column Split | `viewingDistance: 'far'`, `minTapTarget: 44px` |
| **Standard** | **Full Vertical / Stories** | **9:16** | $1080 \times 1920\text{px}$ | Vertical Cascade | `touchOnly: true`, `minTapTarget: 56px` |
| **Standard** | **Universal Square** | **1:1** | $1080 \times 1080\text{px}$ | Vertical Cascade | `touchOnly: true`, `minTapTarget: 52px` |
| **Standard** | **Standard Portrait** | **4:5** | $1080 \times 1350\text{px}$ | Vertical Cascade | `touchOnly: true`, `minTapTarget: 50px` |
| **Standard** | **Presentation Landscape** | **4:3** | $1024 \times 768\text{px}$ | Two-Column Split | `minTapTarget: 44px`, `minTextSize: 18px` |
| **Standard** | **Classic Photo Portrait** | **3:4** | $1200 \times 1600\text{px}$ | Vertical Cascade | `touchOnly: true`, `minTapTarget: 52px` |
| **Challenge** | **Broadcast Lower-Third** | **7.68:1** | $1920 \times 250\text{px}$ | Horizontal Row | `viewingDistance: 'far'`, `minTextSize: 28px` |
| **Stress Demo**| **Cramped Banner** | **3.6:1** | $500 \times 140\text{px}$ | Constrained Row | **Degradation Trigger**: Drops P3 Logo, shrinks secondary text |

---

## 🧠 Layout & Constraint Resolution Algorithm

### Step 1: Safe Boundary & Aspect Ratio Computation
$$\text{availW} = \text{width} - (\text{safeArea.left} + \text{safeArea.right})$$
$$\text{availH} = \text{height} - (\text{safeArea.top} + \text{safeArea.bottom})$$
$$\text{Aspect Ratio } (AR) = \frac{\text{availW}}{\text{availH}}$$

### Step 2: Priority Degradation Pass
When surface bounds are constrained:
* If $\text{availH} < 180\text{px}$: Priority 3 elements (e.g. Branding / Logo) drop cleanly to prevent clutter.
* If $\text{availH} < 150\text{px}$: Priority 2 secondary descriptions drop to prioritize the headline and CTA.
* If $\text{availH} < 110\text{px}$: Priority 2 price tag drops, guaranteeing that critical conversion anchors (Headline and CTA button) are never compromised.
* Dropped elements are logged in `layout.droppedElements` with specific diagnostic reasons.

### Step 3: Hard Surface Constraints & Density Scaling
* **Viewing Distance**: When `viewingDistance === 'far'`, typography scale increases by $1.25\times$ for long-distance legibility.
* **Touch Target Floor**: Interactive CTA button height is clamped: $\max(\text{minTapTarget}, 48 \times \text{scaleRef})$.
* **Text Size Floor**: Text elements enforce $\max(\text{minTextSize}, \dots)$.

### Step 4: Aspect Ratio Driven Spatial Topologies
* **Ultra-Wide ($AR \ge 2.0$)**: Horizontal row layout (`[Logo] [Hero Image] [Headline + Copy] [CTA Button]`).
* **Wide / Balanced ($AR \ge 1.05$)**: Two-column split layout (Left Pane: Hero Visual; Right Pane: Brand, Headline, Description, Price, and CTA).
* **Tall / Compact ($AR < 1.05$)**: Vertical cascade stack with centered hero and full-width CTA.

---

## 🔒 TypeScript Design: Preventing Invalid Combinations

1. **Strict Element Typing**:
   ```ts
   export type ElementRole = 'headline' | 'description' | 'hero' | 'price' | 'cta' | 'logo';
   export type ElementType = 'text' | 'image' | 'button';
   ```
2. **Duplicate & Inconsistency Detection**:
   `defineAd(spec)` validates uniqueness of IDs at specification time and validates aspect ratio bounds.
3. **Decoupled Architecture**:
   The resolver produces a typed `ResolvedLayout` containing pure coordinates:
   ```ts
   export interface PlacedElement {
     id: string;
     element: AdElement;
     rect: { x: number; y: number; width: number; height: number };
     fontSize?: number;
   }
   ```
   Renderers (DOM or Canvas) consume this interface without knowing anything about surface constraints or layout algorithms.

---

## 🎨 Dual Rendering Backends

1. **DOM / CSS Renderer (`src/render-dom.tsx`)**:
   - Renders semantic HTML elements (`h2`, `p`, `img`, `button`).
   - Uses hardware-accelerated CSS transitions for smooth visual morphing when switching surfaces.
2. **HTML5 Canvas Renderer (`src/render-canvas.tsx`)**:
   - Renders directly to an HTML5 `<canvas>` using 2D context drawing operations.
   - Shares the exact same `ResolvedLayout` output, proving true architectural decoupling.

---

## ⚠️ Known Limitations

1. **Text Measurement Aware Wrapping**:
   - The engine estimates line breaks using mathematical character budgets and font size metrics rather than measuring every word with an offscreen `CanvasRenderingContext2D.measureText()` loop.
2. **Fixed Semantic Role Taxonomy**:
   - The resolver is optimized for realistic ad taxonomies (`headline`, `description`, `hero`, `price`, `cta`, `logo`). Additional novel roles require defining placement priorities in the solver.
3. **No Dynamic Auto-Crop for Hero Images**:
   - Images preserve native aspect ratio using `object-contain` / aspect scaling rather than AI subject-focused smart cropping.

---

## 🛠️ Project Structure

```
flam-adaptive-layout-engine/
├── src/
│   ├── spec.ts          # Declarative Ad Spec schema, types & content model
│   ├── surfaces.ts      # 8 surface definitions (6 standard + broadcast + cramped)
│   ├── resolver.ts      # Pure mathematical constraint solver & degradation engine
│   ├── render-dom.tsx   # DOM/CSS presentation renderer with smooth animations
│   ├── render-canvas.tsx# HTML5 Canvas presentation renderer (Bonus Requirement)
│   ├── App.tsx          # Interactive showcase dashboard with Content Options drawer
│   ├── main.tsx         # Application entry point
│   └── index.css        # Tailwind directives & global styling
├── tests/
│   └── resolver.test.ts # Vitest automated test suite (10 unit tests passing)
├── ARCHITECTURE.md      # Architectural design document
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Local Development & Testing

### 1. Clone & Install
```bash
git clone https://github.com/RohitSingh2112/flam-adaptive-layout-engine.git
cd flam-adaptive-layout-engine
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```
Executes 10 automated unit tests verifying constraint solving, 2D collision avoidance, degradation rules, and hard constraint enforcement.

### 4. Build for Production
```bash
npm run build
```
Compiles TypeScript and bundles via Vite with 0 errors.
