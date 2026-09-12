/**
 * Simple, Constraint-Based Layout Resolver
 * 
 * Takes an AdSpec and SurfaceProfile and dynamically computes:
 * 1. Layout Mode (based on Aspect Ratio, NOT surface name)
 * 2. Element positions and dimensions (no overlap, strictly within safe bounds)
 * 3. Priority Degradation (drops P3 logo, then P2 price if space is too constrained)
 */

import { AdSpec, AdElement } from './spec';
import { SurfaceProfile } from './surfaces';

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedElement {
  id: string;
  element: AdElement;
  rect: LayoutRect;
  fontSize?: number;
}

export interface ResolvedLayout {
  surfaceId: string;
  layoutMode: 'horizontal-row' | 'two-column' | 'vertical-stack';
  aspectRatio: number;
  width: number;
  height: number;
  safeArea: SurfaceProfile['safeArea'];
  placedElements: PlacedElement[];
  droppedElements: { id: string; reason: string; priority: number }[];
}

export function resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const safe = surface.safeArea;
  const availW = surface.width - (safe.left + safe.right);
  const availH = surface.height - (safe.top + safe.bottom);
  const aspectRatio = availW / availH;

  // 1. Priority Degradation Logic
  // If vertical space is cramped, drop lower-priority elements cleanly
  const activeElements = [...spec.elements];
  const droppedElements: { id: string; reason: string; priority: number }[] = [];

  // Drop Priority 3 (Logo/Branding) if vertical height is under 180px
  if (availH < 180) {
    const p3Idx = activeElements.findIndex(e => e.priority === 3);
    if (p3Idx !== -1) {
      const dropped = activeElements.splice(p3Idx, 1)[0];
      droppedElements.push({
        id: dropped.id,
        priority: 3,
        reason: `Dropped Priority 3 element because available height (${availH}px) is constrained.`,
      });
    }
  }

  // Drop Priority 2 (Price) if vertical height is severely cramped under 120px
  if (availH < 120) {
    const p2Idx = activeElements.findIndex(e => e.priority === 2);
    if (p2Idx !== -1) {
      const dropped = activeElements.splice(p2Idx, 1)[0];
      droppedElements.push({
        id: dropped.id,
        priority: 2,
        reason: `Dropped Priority 2 element to fit critical headline and CTA within ${availH}px height.`,
      });
    }
  }

  const placedElements: PlacedElement[] = [];
  let layoutMode: 'horizontal-row' | 'two-column' | 'vertical-stack';

  const logo = activeElements.find(e => e.role === 'logo');
  const headline = activeElements.find(e => e.role === 'headline');
  const hero = activeElements.find(e => e.role === 'hero');
  const price = activeElements.find(e => e.role === 'price');
  const cta = activeElements.find(e => e.role === 'cta');

  // Enforce viewing distance / typography constraint
  const baseFontSize = Math.max(surface.minTextSize, surface.viewingDistance === 'far' ? 28 : 15);
  const btnHeight = Math.max(surface.minTapTarget, surface.viewingDistance === 'far' ? 56 : 44);

  // 2. Continuous Aspect-Ratio Layout Selection
  if (aspectRatio >= 2.0) {
    // -------------------------------------------------------------
    // HORIZONTAL ROW (Broadcast / Wide Banners)
    // [Logo] [Hero Image] [Headline + Price] [CTA Button]
    // -------------------------------------------------------------
    layoutMode = 'horizontal-row';
    const gap = 16;
    let curX = safe.left;
    const centerY = safe.top + availH / 2;

    // Optional Logo
    if (logo) {
      const logoH = Math.min(40, availH * 0.4);
      const logoW = logoH * (logo.aspectRatio || 3.2);
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: curX, y: Math.round(centerY - logoH / 2), width: Math.round(logoW), height: Math.round(logoH) },
      });
      curX += logoW + gap;
    }

    // Hero Visual
    if (hero) {
      const heroH = availH * 0.85;
      const heroW = heroH * (hero.aspectRatio || 1.1);
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: { x: Math.round(curX), y: Math.round(centerY - heroH / 2), width: Math.round(heroW), height: Math.round(heroH) },
      });
      curX += heroW + gap * 1.5;
    }

    // CTA (Positioned from the right edge)
    const ctaW = Math.max(160, availW * 0.16);
    const ctaX = surface.width - safe.right - ctaW;
    if (cta) {
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: Math.round(ctaX), y: Math.round(centerY - btnHeight / 2), width: Math.round(ctaW), height: btnHeight },
        fontSize: Math.max(baseFontSize * 0.8, 14),
      });
    }

    // Middle Content (Headline + Price)
    const middleW = Math.max(80, ctaX - curX - gap);
    if (headline) {
      const headlineH = baseFontSize * 1.4;
      const headlineY = centerY - (price ? headlineH : headlineH / 2);
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: Math.round(curX), y: Math.round(headlineY), width: Math.round(middleW), height: Math.round(headlineH) },
        fontSize: baseFontSize,
      });

      if (price) {
        placedElements.push({
          id: price.id,
          element: price,
          rect: { x: Math.round(curX), y: Math.round(headlineY + headlineH + 4), width: Math.round(middleW), height: Math.round(baseFontSize * 1.2) },
          fontSize: Math.max(13, baseFontSize * 0.65),
        });
      }
    }

  } else if (aspectRatio >= 1.0) {
    // -------------------------------------------------------------
    // TWO-COLUMN SPLIT (Landscape Mobile, Tablets, Square Kiosk)
    // Left: Hero visual
    // Right: Logo + Headline + Price + CTA
    // -------------------------------------------------------------
    layoutMode = 'two-column';
    const colGap = 20;
    const leftW = Math.round((availW - colGap) * 0.45);
    const rightW = availW - colGap - leftW;
    const rightX = safe.left + leftW + colGap;

    // Left Column: Hero Image
    if (hero) {
      const heroH = Math.min(availH * 0.9, leftW / (hero.aspectRatio || 1.1));
      const heroW = heroH * (hero.aspectRatio || 1.1);
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: {
          x: Math.round(safe.left + (leftW - heroW) / 2),
          y: Math.round(safe.top + (availH - heroH) / 2),
          width: Math.round(heroW),
          height: Math.round(heroH),
        },
      });
    }

    // Right Column Stack
    let curY = safe.top + 8;
    if (logo) {
      const logoH = 28;
      const logoW = logoH * (logo.aspectRatio || 3.2);
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: rightX, y: curY, width: Math.round(logoW), height: logoH },
      });
      curY += logoH + 12;
    }

    if (headline) {
      const headlineFontSize = Math.min(32, Math.max(baseFontSize, availW * 0.035));
      const headlineH = headlineFontSize * 2.2;
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: rightX, y: curY, width: rightW, height: Math.round(headlineH) },
        fontSize: Math.round(headlineFontSize),
      });
      curY += headlineH + 10;
    }

    if (price) {
      const priceFontSize = Math.round(baseFontSize * 0.85);
      placedElements.push({
        id: price.id,
        element: price,
        rect: { x: rightX, y: curY, width: rightW, height: 26 },
        fontSize: priceFontSize,
      });
      curY += 34;
    }

    if (cta) {
      const ctaW = Math.min(rightW, 240);
      const ctaY = Math.max(curY, safe.top + availH - btnHeight);
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: rightX, y: Math.round(ctaY), width: Math.round(ctaW), height: btnHeight },
        fontSize: Math.max(14, baseFontSize * 0.8),
      });
    }

  } else {
    // -------------------------------------------------------------
    // VERTICAL STACK (Portrait Mobile Interstitial)
    // Logo -> Headline -> Hero -> Price -> Bottom CTA
    // -------------------------------------------------------------
    layoutMode = 'vertical-stack';
    let curY = safe.top;

    if (logo) {
      const logoH = 24;
      const logoW = logoH * (logo.aspectRatio || 3.2);
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: Math.round(safe.left + (availW - logoW) / 2), y: curY, width: Math.round(logoW), height: logoH },
      });
      curY += logoH + 14;
    }

    if (headline) {
      const headlineFontSize = Math.max(baseFontSize, 18);
      const headlineH = headlineFontSize * 2.2;
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: safe.left, y: curY, width: availW, height: Math.round(headlineH) },
        fontSize: Math.round(headlineFontSize),
      });
      curY += headlineH + 12;
    }

    // Reserve space for CTA + Price at bottom
    const bottomSpace = btnHeight + (price ? 32 : 0) + 16;
    const heroH = Math.max(80, safe.top + availH - curY - bottomSpace);
    const heroW = Math.min(availW * 0.9, heroH * (hero?.aspectRatio || 1.1));

    if (hero) {
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: {
          x: Math.round(safe.left + (availW - heroW) / 2),
          y: Math.round(curY + (heroH - (heroW / (hero.aspectRatio || 1.1))) / 2),
          width: Math.round(heroW),
          height: Math.round(heroW / (hero.aspectRatio || 1.1)),
        },
      });
      curY += heroH + 10;
    }

    if (price) {
      placedElements.push({
        id: price.id,
        element: price,
        rect: { x: safe.left, y: curY, width: availW, height: 24 },
        fontSize: 15,
      });
      curY += 28;
    }

    if (cta) {
      const ctaW = Math.min(availW, 280);
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: Math.round(safe.left + (availW - ctaW) / 2), y: Math.round(curY), width: Math.round(ctaW), height: btnHeight },
        fontSize: 16,
      });
    }
  }

  return {
    surfaceId: surface.id,
    layoutMode,
    aspectRatio: Number(aspectRatio.toFixed(2)),
    width: surface.width,
    height: surface.height,
    safeArea: safe,
    placedElements,
    droppedElements,
  };
}
