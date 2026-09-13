/**
 * Simple, Constraint-Based Layout Resolver
 * 
 * Takes an AdSpec and SurfaceProfile and dynamically computes:
 * 1. Layout Mode (based on Aspect Ratio, NOT surface name)
 * 2. Element positions and dimensions (headline, description, hero, price, CTA)
 * 3. Density-aware scaling for High-Resolution surfaces (1080p, 4K)
 * 4. Priority Degradation (drops P3 logo, then P2 description/price if space is too constrained)
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

  // Density reference scale (1.0 for ~400px mobile, 2.25 for 1080p)
  const scaleRef = Math.max(1.0, Math.min(availW, availH) / 460);

  // 1. Priority Degradation Logic (Hierarchical Drop Pass)
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
        reason: `Dropped Priority 3 (${dropped.role}) because available height (${availH}px) is under 180px threshold.`,
      });
    }
  }

  // Drop Priority 2 Description if vertical height is under 150px
  if (availH < 150) {
    const descIdx = activeElements.findIndex(e => e.role === 'description');
    if (descIdx !== -1) {
      const dropped = activeElements.splice(descIdx, 1)[0];
      droppedElements.push({
        id: dropped.id,
        priority: 2,
        reason: `Dropped secondary description to protect headline & CTA legibility in constrained height (${availH}px).`,
      });
    }
  }

  // Drop Priority 2 Price if vertical height is severely cramped under 110px
  if (availH < 110) {
    const priceIdx = activeElements.findIndex(e => e.role === 'price');
    if (priceIdx !== -1) {
      const dropped = activeElements.splice(priceIdx, 1)[0];
      droppedElements.push({
        id: dropped.id,
        priority: 2,
        reason: `Dropped price tag to preserve critical conversion anchors (headline & CTA) in ${availH}px height.`,
      });
    }
  }

  const placedElements: PlacedElement[] = [];
  let layoutMode: 'horizontal-row' | 'two-column' | 'vertical-stack';

  const logo = activeElements.find(e => e.role === 'logo');
  const headline = activeElements.find(e => e.role === 'headline');
  const description = activeElements.find(e => e.role === 'description');
  const hero = activeElements.find(e => e.role === 'hero');
  const price = activeElements.find(e => e.role === 'price');
  const cta = activeElements.find(e => e.role === 'cta');

  // Enforce surface hard constraints: minTextSize, minTapTarget, viewingDistance
  const viewingMultiplier = surface.viewingDistance === 'far' ? 1.25 : 1.0;
  const baseFontSize = Math.max(surface.minTextSize, Math.round(18 * scaleRef * viewingMultiplier));
  const btnHeight = Math.max(surface.minTapTarget, Math.round(48 * scaleRef));

  // 2. Aspect-Ratio Driven Spatial Arrangement
  if (aspectRatio >= 2.0) {
    // -------------------------------------------------------------
    // HORIZONTAL ROW (Ultra-Wide Banners)
    // [Logo] [Hero Image] [Headline + Description + Price] [CTA Button]
    // -------------------------------------------------------------
    layoutMode = 'horizontal-row';
    const gap = Math.round(20 * scaleRef);
    let curX = safe.left;
    const centerY = safe.top + availH / 2;

    // Optional Logo
    if (logo) {
      const logoH = Math.min(Math.round(44 * scaleRef), availH * 0.4);
      const logoW = Math.round(logoH * (logo.aspectRatio || 3.2));
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: curX, y: Math.round(centerY - logoH / 2), width: logoW, height: logoH },
      });
      curX += logoW + gap;
    }

    // Hero Visual
    if (hero) {
      const heroH = Math.round(availH * 0.85);
      const heroW = Math.round(heroH * (hero.aspectRatio || 1.1));
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: { x: curX, y: Math.round(centerY - heroH / 2), width: heroW, height: heroH },
      });
      curX += heroW + gap * 1.5;
    }

    // CTA (Right aligned)
    const ctaW = Math.max(Math.round(160 * scaleRef), Math.round(availW * 0.18));
    const ctaX = surface.width - safe.right - ctaW;
    if (cta) {
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: ctaX, y: Math.round(centerY - btnHeight / 2), width: ctaW, height: btnHeight },
        fontSize: Math.round(btnHeight * 0.35),
      });
    }

    // Middle Content (Headline + Description + Price)
    const middleW = Math.max(80, ctaX - curX - gap);
    if (headline) {
      const headlineH = baseFontSize * 1.3;
      const headlineY = centerY - (description ? headlineH * 1.2 : headlineH / 2);
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: curX, y: Math.round(headlineY), width: middleW, height: Math.round(headlineH) },
        fontSize: baseFontSize,
      });

      let contentCurY = headlineY + headlineH + 4;
      if (description && availH >= 160) {
        const descFontSize = Math.round(baseFontSize * 0.65);
        placedElements.push({
          id: description.id,
          element: description,
          rect: { x: curX, y: Math.round(contentCurY), width: middleW, height: Math.round(descFontSize * 2.2) },
          fontSize: descFontSize,
        });
        contentCurY += descFontSize * 2.2 + 4;
      }

      if (price) {
        placedElements.push({
          id: price.id,
          element: price,
          rect: { x: curX, y: Math.round(contentCurY), width: middleW, height: Math.round(baseFontSize * 1.1) },
          fontSize: Math.round(baseFontSize * 0.75),
        });
      }
    }

  } else if (aspectRatio >= 1.05) {
    // -------------------------------------------------------------
    // TWO-COLUMN SPLIT (16:9 Widescreen, 4:3 Presentation)
    // Left Pane (46%): Hero Image
    // Right Pane (54%): Logo + Headline + Description + Price + CTA
    // -------------------------------------------------------------
    layoutMode = 'two-column';
    const colGap = Math.round(30 * scaleRef);
    const leftW = Math.round((availW - colGap) * 0.46);
    const rightW = availW - colGap - leftW;
    const rightX = safe.left + leftW + colGap;

    // Left Column: Hero Image
    if (hero) {
      const heroH = Math.min(availH * 0.9, leftW / (hero.aspectRatio || 1.1));
      const heroW = Math.round(heroH * (hero.aspectRatio || 1.1));
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: {
          x: Math.round(safe.left + (leftW - heroW) / 2),
          y: Math.round(safe.top + (availH - heroH) / 2),
          width: heroW,
          height: Math.round(heroH),
        },
      });
    }

    // Right Column Stack
    let curY = safe.top + Math.round(8 * scaleRef);
    if (logo) {
      const logoH = Math.round(30 * scaleRef);
      const logoW = Math.round(logoH * (logo.aspectRatio || 3.2));
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: rightX, y: curY, width: logoW, height: logoH },
      });
      curY += logoH + Math.round(14 * scaleRef);
    }

    if (headline) {
      const headlineFontSize = Math.round(28 * scaleRef);
      const headlineH = headlineFontSize * 2.1;
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: rightX, y: curY, width: rightW, height: Math.round(headlineH) },
        fontSize: headlineFontSize,
      });
      curY += Math.round(headlineH + 12 * scaleRef);
    }

    // Description right below headline
    if (description) {
      const descFontSize = Math.round(14 * scaleRef);
      const descH = Math.round(descFontSize * 3.2);
      placedElements.push({
        id: description.id,
        element: description,
        rect: { x: rightX, y: curY, width: rightW, height: descH },
        fontSize: descFontSize,
      });
      curY += Math.round(descH + 16 * scaleRef);
    }

    if (price) {
      const priceFontSize = Math.round(17 * scaleRef);
      placedElements.push({
        id: price.id,
        element: price,
        rect: { x: rightX, y: curY, width: rightW, height: Math.round(priceFontSize * 1.5) },
        fontSize: priceFontSize,
      });
      curY += Math.round(priceFontSize * 1.5 + 20 * scaleRef);
    }

    if (cta) {
      const ctaW = Math.min(rightW, Math.round(260 * scaleRef));
      const ctaY = Math.max(curY, safe.top + availH - btnHeight);
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: rightX, y: Math.round(ctaY), width: ctaW, height: btnHeight },
        fontSize: Math.round(btnHeight * 0.35),
      });
    }

  } else {
    // -------------------------------------------------------------
    // VERTICAL STACK (9:16 Stories, 1:1 Square, 4:5 Portrait, 3:4 Classic)
    // Logo -> Headline -> Description -> Center Hero -> Price -> Bottom CTA
    // -------------------------------------------------------------
    layoutMode = 'vertical-stack';
    let curY = safe.top;

    if (logo) {
      const logoH = Math.round(26 * scaleRef);
      const logoW = Math.round(logoH * (logo.aspectRatio || 3.2));
      placedElements.push({
        id: logo.id,
        element: logo,
        rect: { x: Math.round(safe.left + (availW - logoW) / 2), y: curY, width: logoW, height: logoH },
      });
      curY += logoH + Math.round(14 * scaleRef);
    }

    if (headline) {
      const headlineFontSize = Math.round(23 * scaleRef);
      const headlineH = headlineFontSize * 2.1;
      placedElements.push({
        id: headline.id,
        element: headline,
        rect: { x: safe.left, y: curY, width: availW, height: Math.round(headlineH) },
        fontSize: headlineFontSize,
      });
      curY += Math.round(headlineH + 10 * scaleRef);
    }

    // Description right below headline
    if (description) {
      const descFontSize = Math.round(13 * scaleRef);
      const descH = Math.round(descFontSize * 2.8);
      placedElements.push({
        id: description.id,
        element: description,
        rect: { x: safe.left, y: curY, width: availW, height: descH },
        fontSize: descFontSize,
      });
      curY += Math.round(descH + 12 * scaleRef);
    }

    // Reserve space for CTA + Price at bottom
    const bottomSpace = btnHeight + (price ? Math.round(34 * scaleRef) : 0) + Math.round(18 * scaleRef);
    const heroH = Math.max(Math.round(75 * scaleRef), safe.top + availH - curY - bottomSpace);
    const heroW = Math.min(availW * 0.9, heroH * (hero?.aspectRatio || 1.1));

    if (hero) {
      const finalHeroH = Math.round(heroW / (hero.aspectRatio || 1.1));
      placedElements.push({
        id: hero.id,
        element: hero,
        rect: {
          x: Math.round(safe.left + (availW - heroW) / 2),
          y: Math.round(curY + (heroH - finalHeroH) / 2),
          width: Math.round(heroW),
          height: finalHeroH,
        },
      });
      curY += Math.round(heroH + 10 * scaleRef);
    }

    if (price) {
      const priceFontSize = Math.round(16 * scaleRef);
      placedElements.push({
        id: price.id,
        element: price,
        rect: { x: safe.left, y: curY, width: availW, height: Math.round(priceFontSize * 1.4) },
        fontSize: priceFontSize,
      });
      curY += Math.round(priceFontSize * 1.4 + 14 * scaleRef);
    }

    if (cta) {
      const ctaW = Math.min(availW, Math.round(320 * scaleRef));
      placedElements.push({
        id: cta.id,
        element: cta,
        rect: { x: Math.round(safe.left + (availW - ctaW) / 2), y: Math.round(curY), width: ctaW, height: btnHeight },
        fontSize: Math.round(btnHeight * 0.35),
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
