/**
 * Constraint-Based Layout Resolver for the 6 Target Surfaces
 */

import { AdContent } from './spec';
import { SurfaceScreen } from './surfaces';

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  isVisible: boolean;
}

export interface ResolvedAdLayout {
  screenId: string;
  width: number;
  height: number;
  aspectRatio: number;
  template: 'text-dominant' | 'stacked' | 'horizontal-strip';
  brand: LayoutBox;
  headline: LayoutBox;
  description: LayoutBox;
  hero: LayoutBox;
  cta: LayoutBox;
}

export function resolveAdLayout(_content: AdContent, screen: SurfaceScreen): ResolvedAdLayout {
  const { width, height } = screen;
  const aspectRatio = width / height;

  // 1. Extreme Thin Banner (e.g. Leaderboard 728×90)
  if (aspectRatio >= 5.0 || height <= 120) {
    const pad = Math.round(height * 0.12);
    const heroSize = height - pad * 2;
    const btnHeight = Math.round(height * 0.55);
    const btnWidth = Math.min(160, Math.round(width * 0.18));
    const btnX = width - pad - btnWidth;
    const btnY = (height - btnHeight) / 2;

    const textX = pad + heroSize + pad * 1.5;
    const textW = btnX - textX - pad;

    return {
      screenId: screen.id,
      width,
      height,
      aspectRatio,
      template: 'stacked',
      hero: {
        x: pad,
        y: pad,
        width: heroSize,
        height: heroSize,
        isVisible: true,
      },
      brand: {
        x: textX,
        y: pad + 2,
        width: Math.min(100, textW * 0.35),
        height: height * 0.7,
        fontSize: Math.max(11, Math.round(height * 0.18)),
        isVisible: true,
      },
      headline: {
        x: textX + Math.min(95, textW * 0.32),
        y: (height - height * 0.45) / 2,
        width: textW - Math.min(95, textW * 0.32),
        height: height * 0.5,
        fontSize: Math.max(13, Math.round(height * 0.22)),
        isVisible: true,
      },
      description: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        isVisible: false, // Dropped on thin banners
      },
      cta: {
        x: btnX,
        y: btnY,
        width: btnWidth,
        height: btnHeight,
        fontSize: Math.max(12, Math.round(height * 0.18)),
        isVisible: true,
      },
    };
  }

  // 2. Wide Billboard (1920×540)
  if (aspectRatio >= 2.5) {
    const pad = Math.round(width * 0.04);
    const heroW = Math.round(width * 0.28);
    const heroH = height - pad * 2;
    const heroX = width - pad - heroW;

    const textW = heroX - pad * 2;
    const brandH = Math.round(height * 0.08);
    const headlineFontSize = Math.round(height * 0.11);
    const headlineH = headlineFontSize * 2.1;

    const btnW = Math.round(width * 0.22);
    const btnH = Math.round(height * 0.16);

    return {
      screenId: screen.id,
      width,
      height,
      aspectRatio,
      template: 'text-dominant',
      brand: {
        x: pad,
        y: pad,
        width: 200,
        height: brandH,
        fontSize: Math.round(height * 0.045),
        isVisible: true,
      },
      headline: {
        x: pad,
        y: pad + brandH + 16,
        width: textW,
        height: headlineH,
        fontSize: headlineFontSize,
        isVisible: true,
      },
      description: {
        x: pad,
        y: pad + brandH + headlineH + 24,
        width: textW,
        height: Math.round(height * 0.1),
        fontSize: Math.round(height * 0.038),
        isVisible: true,
      },
      hero: {
        x: heroX,
        y: pad,
        width: heroW,
        height: heroH,
        isVisible: true,
      },
      cta: {
        x: pad,
        y: height - pad - btnH,
        width: btnW,
        height: btnH,
        fontSize: Math.round(btnH * 0.35),
        isVisible: true,
      },
    };
  }

  // 3. Standard Responsive (Square 1080x1080, Story 1080x1920, Landscape 1200x628, Med Rect 300x250)
  const padX = Math.round(width * 0.08);
  const padY = Math.round(height * 0.06);

  // Hero Image (Upper Right)
  const isTall = aspectRatio < 0.7; // e.g. Story 1080x1920
  const heroW = isTall ? Math.round(width * 0.32) : Math.round(width * 0.34);
  const heroH = isTall ? Math.round(height * 0.38) : Math.round(height * 0.44);
  const heroX = width - padX - heroW;
  const heroY = padY + Math.round(height * 0.04);

  // Brand Name
  const brandFontSize = Math.max(11, Math.round(width * 0.024));
  const brandY = padY;

  // Headline
  const headlineW = heroX - padX - Math.round(width * 0.04);
  const headlineFontSize = isTall
    ? Math.round(width * 0.09)
    : Math.max(18, Math.round(width * 0.072));
  const headlineY = brandY + brandFontSize + Math.round(height * 0.06);

  // Description
  const descFontSize = Math.max(9, Math.round(width * 0.023));
  const descY = headlineY + headlineFontSize * 3 + Math.round(height * 0.04);
  const descW = Math.max(headlineW, width * 0.6);

  // CTA Button
  const btnW = Math.min(width * 0.65, Math.max(140, width * 0.38));
  const btnH = Math.max(42, Math.round(height * 0.12));
  const btnY = height - padY - btnH;

  return {
    screenId: screen.id,
    width,
    height,
    aspectRatio,
    template: 'text-dominant',
    brand: {
      x: padX,
      y: brandY,
      width: 200,
      height: 30,
      fontSize: brandFontSize,
      isVisible: true,
    },
    headline: {
      x: padX,
      y: headlineY,
      width: headlineW,
      height: headlineFontSize * 2.8,
      fontSize: headlineFontSize,
      isVisible: true,
    },
    description: {
      x: padX,
      y: descY,
      width: descW,
      height: descFontSize * 3.5,
      fontSize: descFontSize,
      isVisible: width >= 280, // visible on all standard sizes
    },
    hero: {
      x: heroX,
      y: heroY,
      width: heroW,
      height: heroH,
      isVisible: true,
    },
    cta: {
      x: padX,
      y: btnY,
      width: btnW,
      height: btnH,
      fontSize: Math.max(12, Math.round(btnH * 0.28)),
      isVisible: true,
    },
  };
}
