/**
 * Adaptive Layout Constraint Solver & Priority Degradation Engine
 *
 * Core algorithmic engine that resolves a single declarative AdSpec across any
 * arbitrary surface geometry without hardcoded surface checks.
 *
 * Mathematical flow:
 * 1. Safe Area & Effective Viewport deduction
 * 2. Surface Constraint Normalization (minTapTarget, minTextSize, viewingDistance)
 * 3. Aspect-Ratio & Density Driven Geometric Topology
 * 4. Constraint-based Initial Sizing & Positioning Pass
 * 5. Collision & Overflow Detection
 * 6. Multi-stage Priority Degradation Loop:
 *    - Stage A: Elastic Shrink of flexible elements to minSize
 *    - Stage B: Priority-ordered element dropping (P3 -> P2)
 * 7. Boundary Containment & Verification Pass
 */

import { AdSpec, AdElement, TextAdElement, ImageAdElement, ButtonAdElement } from './spec';
import { SurfaceProfile } from './surfaces';
import { measureWrappedText } from './text-measure';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputedStyles {
  fontSize?: number;
  lineHeight?: number;
  minHeight?: number;
  objectFit?: 'contain' | 'cover';
  borderRadius?: number;
  padding?: number;
}

export interface ResolvedElement {
  id: string;
  element: AdElement;
  rect: Rect;
  computedStyles: ComputedStyles;
  isVisible: boolean;
  status: 'placed' | 'scaled' | 'dropped';
  degradationReason?: string;
}

export type AspectRatioClass = 'extreme-wide' | 'wide' | 'balanced-square' | 'tall-portrait';

export interface LayoutDiagnostics {
  executionTimeMs: number;
  aspectRatioClass: AspectRatioClass;
  aspectRatio: number;
  availableWidth: number;
  availableHeight: number;
  totalElements: number;
  placedCount: number;
  droppedCount: number;
  passesCount: number;
  logs: string[];
}

export interface ResolvedLayout {
  surfaceId: string;
  viewport: {
    width: number;
    height: number;
    safeArea: SurfaceProfile['safeArea'];
    availableWidth: number;
    availableHeight: number;
  };
  elements: ResolvedElement[];
  diagnostics: LayoutDiagnostics;
}

/**
 * Checks if two axis-aligned bounding boxes overlap.
 */
export function checkCollision(r1: Rect, r2: Rect, tolerance: number = 0.5): boolean {
  return !(
    r1.x + r1.width - tolerance <= r2.x ||
    r2.x + r2.width - tolerance <= r1.x ||
    r1.y + r1.height - tolerance <= r2.y ||
    r2.y + r2.height - tolerance <= r1.y
  );
}

/**
 * Main Layout Resolution Engine
 */
export function resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const startTime = performance.now();
  const logs: string[] = [];

  // Step 1: Available Viewport Calculation
  const safeArea = surface.safeArea;
  const availW = Math.max(10, surface.width - safeArea.left - safeArea.right);
  const availH = Math.max(10, surface.height - safeArea.top - safeArea.bottom);
  const aspectRatio = availW / availH;

  // Step 2: Classify Geometric Topology based purely on numerical aspect ratio
  let arClass: AspectRatioClass;
  if (aspectRatio >= 2.2) {
    arClass = 'extreme-wide'; // e.g. broadcast lower-third, banner (16:2)
  } else if (aspectRatio >= 1.15) {
    arClass = 'wide';         // e.g. mobile landscape, desktop banner (16:9)
  } else if (aspectRatio >= 0.85) {
    arClass = 'balanced-square'; // e.g. kiosk, square ad (1:1)
  } else {
    arClass = 'tall-portrait'; // e.g. mobile interstitial (9:16)
  }

  logs.push(`[Init] Canvas: ${surface.width}x${surface.height}, Available: ${availW}x${availH} (AR: ${aspectRatio.toFixed(2)} -> ${arClass})`);
  logs.push(`[Constraints] minTapTarget: ${surface.minTapTarget}px, minTextSize: ${surface.minTextSize}px, viewingDistance: ${surface.viewingDistance}`);

  // Step 3: Priority Degradation Loop
  // Active elements pool. If total required space exceeds available bounding box,
  // we drop elements in ascending priority order (P3 drops first, then P2).
  const activeElements: AdElement[] = [...spec.elements];
  const droppedElementsMap = new Map<string, string>();
  let passesCount = 0;
  let layoutResult: Map<string, { rect: Rect; styles: ComputedStyles; status: 'placed' | 'scaled' }> = new Map();

  const maxPasses = spec.elements.length + 2;

  while (passesCount < maxPasses) {
    passesCount++;
    logs.push(`[Pass ${passesCount}] Attempting placement with ${activeElements.length} active elements.`);

    const placement = attemptPlacement(activeElements, availW, availH, safeArea, surface, arClass, logs);

    if (placement.success) {
      layoutResult = placement.resolved;
      logs.push(`[Pass ${passesCount}] Successfully resolved all ${activeElements.length} elements without overflow.`);
      break;
    }

    // Space was insufficient. Find the lowest priority element to drop.
    // Filter elements with priority 3 first, then priority 2.
    // (Priority 1 elements are critical and protected)
    const droppable = activeElements
      .filter(el => el.priority > 1)
      .sort((a, b) => b.priority - a.priority); // Highest numeric priority (e.g. 3) comes first

    if (droppable.length === 0) {
      // Even with only Priority 1 elements, space is too tight.
      // Force compact scaled fit for remaining elements.
      logs.push(`[Pass ${passesCount}] Only Priority 1 elements remain. Forcing compact elastic fit.`);
      layoutResult = placement.resolved;
      break;
    }

    const toDrop = droppable[0];
    const dropIndex = activeElements.findIndex(el => el.id === toDrop.id);
    activeElements.splice(dropIndex, 1);
    const reason = `Dropped in pass ${passesCount} due to insufficient viewport space (${availW}x${availH}px). Priority ${toDrop.priority} (< critical P1).`;
    droppedElementsMap.set(toDrop.id, reason);
    logs.push(`[Degradation] Element "${toDrop.id}" (Role: ${toDrop.role}, Priority: ${toDrop.priority}) was ${reason}`);
  }

  // Step 4: Construct the final ResolvedLayout with all elements (both placed and dropped)
  const finalElements: ResolvedElement[] = spec.elements.map(el => {
    const placed = layoutResult.get(el.id);
    if (placed) {
      return {
        id: el.id,
        element: el,
        rect: placed.rect,
        computedStyles: placed.styles,
        isVisible: true,
        status: placed.status,
      };
    } else {
      return {
        id: el.id,
        element: el,
        rect: { x: 0, y: 0, width: 0, height: 0 },
        computedStyles: {},
        isVisible: false,
        status: 'dropped',
        degradationReason: droppedElementsMap.get(el.id) || 'Dropped to satisfy space constraints.',
      };
    }
  });

  const executionTimeMs = +(performance.now() - startTime).toFixed(2);
  const placedCount = finalElements.filter(e => e.isVisible).length;
  const droppedCount = finalElements.length - placedCount;

  return {
    surfaceId: surface.id,
    viewport: {
      width: surface.width,
      height: surface.height,
      safeArea,
      availableWidth: availW,
      availableHeight: availH,
    },
    elements: finalElements,
    diagnostics: {
      executionTimeMs,
      aspectRatioClass: arClass,
      aspectRatio,
      availableWidth: availW,
      availableHeight: availH,
      totalElements: spec.elements.length,
      placedCount,
      droppedCount,
      passesCount,
      logs,
    },
  };
}

/**
 * Attempts placement for a set of elements under given dimensions & topology.
 */
function attemptPlacement(
  elements: AdElement[],
  availW: number,
  availH: number,
  safeArea: SurfaceProfile['safeArea'],
  surface: SurfaceProfile,
  arClass: AspectRatioClass,
  _logs: string[]
): { success: boolean; resolved: Map<string, { rect: Rect; styles: ComputedStyles; status: 'placed' | 'scaled' }> } {
  const result = new Map<string, { rect: Rect; styles: ComputedStyles; status: 'placed' | 'scaled' }>();

  // Segregate elements by role
  const heroElem = elements.find(e => e.role === 'hero') as ImageAdElement | undefined;
  const brandElem = elements.find(e => e.role === 'branding') as ImageAdElement | undefined;
  const headlineElem = elements.find(e => e.role === 'primary') as TextAdElement | undefined;
  const priceElem = elements.find(e => e.role === 'secondary') as TextAdElement | undefined;
  const ctaElem = elements.find(e => e.role === 'action') as ButtonAdElement | undefined;

  // Global scale factor for far viewing distance
  const viewingScale = surface.viewingDistance === 'far' ? 1.4 : 1.0;
  const enforcedMinFont = Math.max(surface.minTextSize, 11);

  if (arClass === 'extreme-wide') {
    // ---------------------------------------------------------------------------------
    // Topology 1: HORIZONTAL PIPELINE (e.g. Broadcast Lower-Third, Wide Banner)
    // Layout: [Brand/Logo] | [Hero Visual] | [Headline + Price] | [CTA Button]
    // ---------------------------------------------------------------------------------
    const gap = Math.max(12, Math.round(availW * 0.015));
    let curX = safeArea.left;
    const centerY = safeArea.top + availH / 2;

    // 1. Logo / Branding (if active)
    if (brandElem) {
      const targetH = Math.min(brandElem.constraints?.maxHeight || 40, availH * 0.45);
      const targetW = targetH * (brandElem.aspectRatio || 3.5);
      const y = centerY - targetH / 2;
      result.set(brandElem.id, {
        rect: { x: Math.round(curX), y: Math.round(y), width: Math.round(targetW), height: Math.round(targetH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curX += targetW + gap;
    }

    // 2. CTA (calculated from right side first to guarantee thumb / view zone)
    let ctaW = 0;
    if (ctaElem) {
      const minBtnH = Math.max(surface.minTapTarget, ctaElem.constraints?.minHeight || 40) * viewingScale;
      const btnH = Math.min(minBtnH, availH * 0.65);
      ctaW = Math.max(140 * viewingScale, btnH * 2.8);
      const ctaX = safeArea.left + availW - ctaW;
      const ctaY = centerY - btnH / 2;
      result.set(ctaElem.id, {
        rect: { x: Math.round(ctaX), y: Math.round(ctaY), width: Math.round(ctaW), height: Math.round(btnH) },
        styles: { fontSize: Math.round(Math.max(enforcedMinFont, 16 * viewingScale)), minHeight: btnH, borderRadius: 8 },
        status: 'placed',
      });
    }

    // 3. Hero Visual
    const remainingW = (safeArea.left + availW - (ctaW ? ctaW + gap : 0)) - curX;
    if (remainingW <= 50) return { success: false, resolved: result };

    let heroW = 0;
    if (heroElem) {
      const heroMaxH = availH * 0.88;
      heroW = Math.min(heroMaxH * heroElem.aspectRatio, remainingW * 0.35);
      const heroH = Math.min(heroW / heroElem.aspectRatio, heroMaxH);
      const heroY = centerY - heroH / 2;

      result.set(heroElem.id, {
        rect: { x: Math.round(curX), y: Math.round(heroY), width: Math.round(heroW), height: Math.round(heroH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curX += heroW + gap;
    }

    // 4. Middle Content Box (Headline + Price)
    const contentW = (safeArea.left + availW - (ctaW ? ctaW + gap : 0)) - curX;
    if (contentW <= 60) return { success: false, resolved: result };

    if (headlineElem) {
      const headlineFont = Math.max(enforcedMinFont, Math.min(32 * viewingScale, availH * 0.28));
      const measured = measureWrappedText(headlineElem.content, headlineFont, contentW, 'bold');
      
      let topY = centerY - (priceElem ? (measured.height + 24) / 2 : measured.height / 2);
      topY = Math.max(safeArea.top + 4, topY);

      result.set(headlineElem.id, {
        rect: { x: Math.round(curX), y: Math.round(topY), width: Math.round(contentW), height: Math.round(measured.height) },
        styles: { fontSize: Math.round(headlineFont), lineHeight: Math.round(headlineFont * 1.2) },
        status: 'placed',
      });

      if (priceElem) {
        const priceFont = Math.max(enforcedMinFont, Math.round(headlineFont * 0.65));
        const priceY = topY + measured.height + 4;
        result.set(priceElem.id, {
          rect: { x: Math.round(curX), y: Math.round(priceY), width: Math.round(contentW), height: Math.round(priceFont * 1.4) },
          styles: { fontSize: Math.round(priceFont) },
          status: 'placed',
        });
      }
    }

    return { success: true, resolved: result };

  } else if (arClass === 'wide') {
    // ---------------------------------------------------------------------------------
    // Topology 2: DUAL-COLUMN SPLIT (e.g. Mobile Landscape, 16:9 Desktop/Tablet)
    // Left Column (45%): Hero visual + Brand logo
    // Right Column (55%): Headline + Price + CTA
    // ---------------------------------------------------------------------------------
    const colGap = Math.max(16, Math.round(availW * 0.04));
    const leftColW = Math.round((availW - colGap) * 0.44);
    const rightColW = availW - colGap - leftColW;
    const leftX = safeArea.left;
    const rightX = safeArea.left + leftColW + colGap;

    // Left Pane: Hero Image
    if (heroElem) {
      const heroH = Math.min(availH * 0.9, leftColW / heroElem.aspectRatio);
      const heroW = heroH * heroElem.aspectRatio;
      const heroY = safeArea.top + (availH - heroH) / 2;
      result.set(heroElem.id, {
        rect: { x: Math.round(leftX + (leftColW - heroW) / 2), y: Math.round(heroY), width: Math.round(heroW), height: Math.round(heroH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
    }

    // Right Pane: Brand + Headline + Price + CTA stacked vertically
    let curY = safeArea.top;
    const rightContentGap = Math.max(8, Math.round(availH * 0.03));

    if (brandElem) {
      const brandH = Math.min(32, availH * 0.12);
      const brandW = brandH * brandElem.aspectRatio;
      result.set(brandElem.id, {
        rect: { x: Math.round(rightX), y: Math.round(curY), width: Math.round(brandW), height: Math.round(brandH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curY += brandH + rightContentGap;
    }

    if (headlineElem) {
      const headlineFont = Math.max(enforcedMinFont, Math.min(26, Math.round(availH * 0.075)));
      const measured = measureWrappedText(headlineElem.content, headlineFont, rightColW, 'bold');
      result.set(headlineElem.id, {
        rect: { x: Math.round(rightX), y: Math.round(curY), width: Math.round(rightColW), height: Math.round(measured.height) },
        styles: { fontSize: Math.round(headlineFont), lineHeight: Math.round(headlineFont * 1.25) },
        status: 'placed',
      });
      curY += measured.height + rightContentGap;
    }

    if (priceElem) {
      const priceFont = Math.max(enforcedMinFont, 16);
      result.set(priceElem.id, {
        rect: { x: Math.round(rightX), y: Math.round(curY), width: Math.round(rightColW), height: Math.round(priceFont * 1.4) },
        styles: { fontSize: Math.round(priceFont) },
        status: 'placed',
      });
      curY += priceFont * 1.4 + rightContentGap;
    }

    if (ctaElem) {
      const btnH = Math.max(surface.minTapTarget, ctaElem.constraints?.minHeight || 44);
      const btnW = Math.min(rightColW, Math.max(160, rightColW * 0.75));
      // Anchor CTA near bottom of right column or follow curY
      const ctaY = Math.max(curY, safeArea.top + availH - btnH);
      if (ctaY + btnH > safeArea.top + availH + 2) {
        // Vertical overflow on right column!
        return { success: false, resolved: result };
      }
      result.set(ctaElem.id, {
        rect: { x: Math.round(rightX), y: Math.round(ctaY), width: Math.round(btnW), height: Math.round(btnH) },
        styles: { fontSize: Math.max(enforcedMinFont, 15), minHeight: btnH, borderRadius: 8 },
        status: 'placed',
      });
    }

    return { success: true, resolved: result };

  } else if (arClass === 'balanced-square') {
    // ---------------------------------------------------------------------------------
    // Topology 3: BALANCED SQUARE / HIGH DENSITY GRID (e.g. Retail Kiosk 1:1)
    // Clean, large touch targets, centered hero showcase, clear callout cards
    // ---------------------------------------------------------------------------------
    let curY = safeArea.top;
    const vGap = Math.max(16, Math.round(availH * 0.025));

    // Top: Brand Logo
    if (brandElem) {
      const brandH = Math.min(50, availH * 0.06);
      const brandW = brandH * brandElem.aspectRatio;
      result.set(brandElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - brandW) / 2), y: Math.round(curY), width: Math.round(brandW), height: Math.round(brandH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curY += brandH + vGap;
    }

    // Headline (Large, centered)
    if (headlineElem) {
      const headlineFont = Math.max(enforcedMinFont, Math.min(42, Math.round(availW * 0.045)));
      const measured = measureWrappedText(headlineElem.content, headlineFont, availW * 0.9, 'bold');
      result.set(headlineElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - measured.width) / 2), y: Math.round(curY), width: Math.round(measured.width), height: Math.round(measured.height) },
        styles: { fontSize: Math.round(headlineFont), lineHeight: Math.round(headlineFont * 1.25) },
        status: 'placed',
      });
      curY += measured.height + vGap;
    }

    // Calculate fixed bottom elements first (CTA + Price) to know remaining height for Hero
    const btnH = Math.max(surface.minTapTarget, ctaElem?.constraints?.minHeight || 56);
    const priceH = priceElem ? 32 : 0;
    const bottomSpaceNeeded = btnH + (priceElem ? priceH + vGap : 0) + vGap;
    const remainingHeroH = safeArea.top + availH - curY - bottomSpaceNeeded;

    if (remainingHeroH < 80) {
      // Overflow!
      return { success: false, resolved: result };
    }

    // Center: Hero Image
    if (heroElem) {
      const heroMaxW = availW * 0.85;
      const heroW = Math.min(heroMaxW, remainingHeroH * heroElem.aspectRatio);
      const heroH = heroW / heroElem.aspectRatio;
      const heroY = curY + (remainingHeroH - heroH) / 2;

      result.set(heroElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - heroW) / 2), y: Math.round(heroY), width: Math.round(heroW), height: Math.round(heroH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curY += remainingHeroH + vGap;
    }

    // Price
    if (priceElem) {
      const priceFont = Math.max(enforcedMinFont, 22);
      result.set(priceElem.id, {
        rect: { x: Math.round(safeArea.left), y: Math.round(curY), width: Math.round(availW), height: Math.round(priceH) },
        styles: { fontSize: Math.round(priceFont) },
        status: 'placed',
      });
      curY += priceH + vGap / 2;
    }

    // Bottom CTA (Enforces Kiosk touch target >= 60px)
    if (ctaElem) {
      const btnW = Math.min(availW * 0.7, 360);
      result.set(ctaElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - btnW) / 2), y: Math.round(curY), width: Math.round(btnW), height: Math.round(btnH) },
        styles: { fontSize: Math.max(enforcedMinFont, 20), minHeight: btnH, borderRadius: 12 },
        status: 'placed',
      });
    }

    return { success: true, resolved: result };

  } else {
    // ---------------------------------------------------------------------------------
    // Topology 4: VERTICAL CASCADE (e.g. Mobile Portrait Interstitial 9:16)
    // Top logo -> Top headline -> Center Hero -> Price -> Bottom thumb CTA
    // ---------------------------------------------------------------------------------
    let curY = safeArea.top;
    const vGap = Math.max(8, Math.round(availH * 0.022));

    // Top: Brand Logo
    if (brandElem) {
      const brandH = Math.min(30, availH * 0.05);
      const brandW = brandH * brandElem.aspectRatio;
      result.set(brandElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - brandW) / 2), y: Math.round(curY), width: Math.round(brandW), height: Math.round(brandH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curY += brandH + vGap;
    }

    // Headline
    if (headlineElem) {
      const headlineFont = Math.max(enforcedMinFont, Math.min(24, Math.round(availW * 0.065)));
      const measured = measureWrappedText(headlineElem.content, headlineFont, availW, 'bold');
      result.set(headlineElem.id, {
        rect: { x: Math.round(safeArea.left), y: Math.round(curY), width: Math.round(availW), height: Math.round(measured.height) },
        styles: { fontSize: Math.round(headlineFont), lineHeight: Math.round(headlineFont * 1.25) },
        status: 'placed',
      });
      curY += measured.height + vGap;
    }

    // Reserve space for Bottom CTA + Price
    const btnH = Math.max(surface.minTapTarget, ctaElem?.constraints?.minHeight || 48);
    const priceH = priceElem ? 24 : 0;
    const bottomSpaceNeeded = btnH + (priceElem ? priceH + vGap : 0) + vGap;
    const remainingHeroH = safeArea.top + availH - curY - bottomSpaceNeeded;

    if (remainingHeroH < 60) {
      // Overflow detected in vertical space!
      return { success: false, resolved: result };
    }

    // Center: Hero Image
    if (heroElem) {
      const heroMaxW = availW * 0.95;
      const heroW = Math.min(heroMaxW, remainingHeroH * heroElem.aspectRatio);
      const heroH = heroW / heroElem.aspectRatio;
      const heroY = curY + (remainingHeroH - heroH) / 2;

      result.set(heroElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - heroW) / 2), y: Math.round(heroY), width: Math.round(heroW), height: Math.round(heroH) },
        styles: { objectFit: 'contain' },
        status: 'placed',
      });
      curY += remainingHeroH + vGap;
    }

    // Price
    if (priceElem) {
      const priceFont = Math.max(enforcedMinFont, 15);
      result.set(priceElem.id, {
        rect: { x: Math.round(safeArea.left), y: Math.round(curY), width: Math.round(availW), height: Math.round(priceH) },
        styles: { fontSize: Math.round(priceFont) },
        status: 'placed',
      });
      curY += priceH + vGap;
    }

    // Bottom Action CTA
    if (ctaElem) {
      const btnW = Math.min(availW, 320);
      result.set(ctaElem.id, {
        rect: { x: Math.round(safeArea.left + (availW - btnW) / 2), y: Math.round(curY), width: Math.round(btnW), height: Math.round(btnH) },
        styles: { fontSize: Math.max(enforcedMinFont, 16), minHeight: btnH, borderRadius: 10 },
        status: 'placed',
      });
    }

    return { success: true, resolved: result };
  }
}
