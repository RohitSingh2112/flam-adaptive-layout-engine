# Architecture Document — Adaptive Layout Engine

## 1. System Overview & Data Flow

```
[Declarative AdSpec]  +  [Surface Profile]
          │                     │
          └──────────┬──────────┘
                     ▼
       ┌───────────────────────────┐
       │     resolveLayout()       │
       │  1. Deduct safe areas     │
       │  2. Aspect-ratio topology │
       │  3. Priority degradation  │
       │  4. Enforce tap/text size │
       │  5. Density-aware scaling │
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │      ResolvedLayout       │
       │  (x, y, width, height)    │
       └───────┬───────────┬───────┘
               │           │
               ▼           ▼
       ┌──────────────┐  ┌────────────────┐
       │  RenderDOM   │  │  RenderCanvas  │
       │  (React/DOM) │  │  (HTML5 2D)    │
       └──────────────┘  └────────────────┘
```

---

## 2. Core Architectural Decisions & Rationale

### 1. Aspect-Ratio Driven Topology (Generalization to Novel Surfaces)
* **Design Decision**: The spatial arrangement of elements is driven strictly by continuous aspect ratio ($AR = \text{Width} / \text{Height}$) computed from the usable safe area.
* **Why it matters**: The layout engine never checks surface names, IDs, or device tags (`if (surface.id === 'mobile')`).
* **Live Interview Test**: An unknown surface introduced live (e.g. $800 \times 600$, $1440 \times 900$, or $2560 \times 1080$) immediately resolves into the mathematically appropriate arrangement with zero code changes.

### 2. Priority-Based Graceful Degradation
* **Hierarchy**:
  * **Priority 1 (Critical Conversion Anchors)**: Headline text, Hero product image, CTA button.
  * **Priority 2 (Secondary Details)**: Price tag, supplemental product description.
  * **Priority 3 (Supplemental Branding)**: Brand logo.
* **Drop Cascade**:
  * When available height $< 180\text{px}$, Priority 3 (Logo) drops cleanly.
  * When available height $< 150\text{px}$, Priority 2 (Description) drops to protect headline legibility.
  * When available height $< 110\text{px}$, Priority 2 (Price) drops to preserve the primary call to action.
* All dropped elements are captured in `layout.droppedElements` with explicit reasons rather than overflowing or clipping outside safe boundaries.

### 3. Separation of Concerns & Pluggable Renderers
* `src/spec.ts`: Pure content declaration. Specifies what exists, semantic roles, and priority ranks.
* `src/surfaces.ts`: Pure environmental constraints. Declares dimensions, safe areas, viewing distance, and tap target floors.
* `src/resolver.ts`: Pure mathematical positioning logic. Completely headless; has zero dependencies on React, the DOM, or Canvas.
* `src/render-dom.tsx` & `src/render-canvas.tsx`: Pluggable visual presentations. Both consume the identical `ResolvedLayout` interface.
  * *Question: Could a new renderer (e.g. SVG, React Native, or WebGL) be added without touching the resolution algorithm?*
  * *Answer: Yes.* The resolver emits pure numerical coordinates (`rect: { x, y, width, height }`), completely decoupled from presentation technology.

### 4. Hard Environmental Constraints
* **`minTapTarget`**: Touch screens (`touchOnly: true`) enforce a minimum button touch target (e.g. $52\text{px}$ – $56\text{px}$) to comply with WCAG accessibility guidelines.
* **`minTextSize` & `viewingDistance`**: For far-viewing surfaces like digital signage and broadcast lower-thirds, text scales up by a distance multiplier ($1.25\times$) with a hard minimum font size floor ($28\text{px}$ – $32\text{px}$).

---

## 3. Evaluation Questions Addressed

1. **How is collision avoided?**
   Elements are positioned within partition slices (columns in wide layouts, stacked rows in vertical layouts) where heights and widths are allocated based on available remaining space after padding. 2D overlap assertions in `tests/resolver.test.ts` verify zero collisions.

2. **How does the engine handle extreme aspect ratios?**
   - Ratios $\ge 2.0$ (e.g., Broadcast Lower-Third $7.68:1$) switch into a 4-segment horizontal ribbon.
   - Ratios between $1.05$ and $2.0$ (e.g., Widescreen 16:9, Presentation 4:3) use a 2-column balanced split.
   - Ratios $< 1.05$ (e.g., Stories 9:16, Square 1:1, Portrait 4:5, Classic 3:4) use a vertical cascade.
