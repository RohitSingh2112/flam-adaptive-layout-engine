# Architecture Document — Adaptive Layout Engine

## 1. System Overview & Flow

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
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │      ResolvedLayout       │
       │  (x, y, width, height)    │
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │     RenderDOM Component   │
       │  Pure CSS / DOM mapping   │
       └───────────────────────────┘
```

## 2. Core Decisions & Rationale

1. **Aspect-Ratio Driven Topology**:
   - Rather than checking surface IDs or names, the layout topology is governed by continuous aspect ratio ($AR = \text{Width} / \text{Height}$).
   - Any new surface profile with arbitrary dimensions will naturally fall into the correct spatial arrangement without code changes.

2. **Priority-Based Graceful Degradation**:
   - Priority 1 (Critical): Headline, Hero product image, CTA button.
   - Priority 2 (Secondary): Price.
   - Priority 3 (Supplemental): Logo / Branding.
   - When height drops below threshold ($< 180\text{px}$), the engine drops Priority 3 elements first with logged reasons, preventing clipping or overflow.

3. **Separation of Concerns**:
   - `spec.ts`: Pure content declaration.
   - `surfaces.ts`: Pure environmental constraints.
   - `resolver.ts`: Pure mathematical positioning logic.
   - `render-dom.tsx`: Pure visual presentation.
