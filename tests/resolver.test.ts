import { describe, it, expect } from 'vitest';
import { defineAd, defaultAdSpec } from '../src/spec';
import { defaultSurfaces, SurfaceProfile, validateSurface } from '../src/surfaces';
import { resolveLayout, checkCollision } from '../src/resolver';

describe('AdSpec and Surface Validation', () => {
  it('throws error when ad spec has duplicate element IDs', () => {
    expect(() => {
      defineAd({
        id: 'test-ad',
        name: 'Test',
        elements: [
          { id: 'item1', type: 'text', role: 'primary', priority: 1, content: 'A' },
          { id: 'item1', type: 'text', role: 'secondary', priority: 2, content: 'B' },
        ],
      });
    }).toThrow('[AdSpecError] Duplicate element ID detected: "item1"');
  });

  it('throws error when surface safe area exceeds dimensions', () => {
    expect(() => {
      validateSurface({
        id: 'invalid-surface',
        name: 'Invalid',
        description: '',
        category: 'custom',
        width: 100,
        height: 100,
        safeArea: { top: 60, bottom: 60, left: 10, right: 10 },
        minTapTarget: 44,
        minTextSize: 12,
        viewingDistance: 'near',
        touchOnly: false,
      });
    }).toThrow('Total vertical safe area (120px) exceeds surface height (100px)');
  });
});

describe('Adaptive Layout Engine Resolution', () => {
  it('resolves Mobile Interstitial (tall portrait) without collision', () => {
    const layout = resolveLayout(defaultAdSpec, defaultSurfaces.mobileInterstitial);

    expect(layout.diagnostics.aspectRatioClass).toBe('tall-portrait');
    expect(layout.diagnostics.placedCount).toBeGreaterThanOrEqual(4);

    const placed = layout.elements.filter(e => e.isVisible);
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const collides = checkCollision(placed[i].rect, placed[j].rect);
        expect(collides, `Elements ${placed[i].id} and ${placed[j].id} should not overlap`).toBe(false);
      }
    }
  });

  it('resolves Broadcast Lower-Third (1920x250) with horizontal pipeline and enforces minTextSize', () => {
    const layout = resolveLayout(defaultAdSpec, defaultSurfaces.broadcastLowerThird);

    expect(layout.diagnostics.aspectRatioClass).toBe('extreme-wide');
    
    // Check min text size constraint for far viewing distance
    const headline = layout.elements.find(e => e.id === 'headline');
    expect(headline?.isVisible).toBe(true);
    expect(headline?.computedStyles.fontSize).toBeGreaterThanOrEqual(defaultSurfaces.broadcastLowerThird.minTextSize);
  });

  it('resolves Retail Kiosk (1080x1080) and enforces minTapTarget >= 64px on CTA button', () => {
    const layout = resolveLayout(defaultAdSpec, defaultSurfaces.retailKiosk);

    expect(layout.diagnostics.aspectRatioClass).toBe('balanced-square');
    
    const cta = layout.elements.find(e => e.id === 'cta');
    expect(cta?.isVisible).toBe(true);
    expect(cta?.rect.height).toBeGreaterThanOrEqual(defaultSurfaces.retailKiosk.minTapTarget);
  });

  it('demonstrates priority-based degradation on cramped space (P3 drops first)', () => {
    const layout = resolveLayout(defaultAdSpec, defaultSurfaces.crampedBanner);

    const logo = layout.elements.find(e => e.id === 'logo'); // Priority 3
    const headline = layout.elements.find(e => e.id === 'headline'); // Priority 1
    const cta = layout.elements.find(e => e.id === 'cta'); // Priority 1

    // Under cramped banner (400x120), Priority 3 logo must be dropped or skipped to protect P1
    if (layout.diagnostics.droppedCount > 0) {
      expect(logo?.isVisible).toBe(false);
      expect(logo?.degradationReason).toBeDefined();
    }
    // High-priority CTA & Headline are preserved
    expect(cta?.isVisible).toBe(true);
    expect(headline?.isVisible).toBe(true);
  });

  it('resolves a 5th novel unknown-at-design-time surface correctly', () => {
    const unknownSurface: SurfaceProfile = {
      id: 'car-dash-hud',
      name: 'Automotive Center Display',
      description: 'Novel widescreen surface unknown at engine design time',
      category: 'custom',
      width: 720,
      height: 240,
      safeArea: { top: 16, right: 24, bottom: 16, left: 24 },
      minTapTarget: 50,
      minTextSize: 18,
      viewingDistance: 'arm',
      touchOnly: true,
    };

    const layout = resolveLayout(defaultAdSpec, unknownSurface);
    expect(layout.elements.length).toBe(defaultAdSpec.elements.length);
    expect(layout.diagnostics.placedCount).toBeGreaterThan(0);

    // Verify no overlaps in resolved elements
    const placed = layout.elements.filter(e => e.isVisible);
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(checkCollision(placed[i].rect, placed[j].rect)).toBe(false);
      }
    }
  });
});
