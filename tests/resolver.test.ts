import { describe, it, expect } from 'vitest';
import { defineAd, defaultAdSpec } from '../src/spec';
import { surfaces, SurfaceProfile } from '../src/surfaces';
import { resolveLayout } from '../src/resolver';

describe('AdSpec Validation', () => {
  it('throws error when ad spec has duplicate element IDs', () => {
    expect(() => {
      defineAd({
        id: 'test',
        title: 'Test',
        elements: [
          { id: 'item1', type: 'text', role: 'headline', priority: 1, content: 'A' },
          { id: 'item1', type: 'text', role: 'price', priority: 2, content: 'B' },
        ],
      });
    }).toThrow('Duplicate element ID: item1');
  });
});

describe('Layout Resolver Adaptation', () => {
  it('resolves Mobile Portrait into vertical-stack', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.mobilePortrait);
    expect(layout.layoutMode).toBe('vertical-stack');
    expect(layout.placedElements.length).toBe(5);
    expect(layout.droppedElements.length).toBe(0);
  });

  it('resolves Mobile Landscape into two-column', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.mobileLandscape);
    expect(layout.layoutMode).toBe('two-column');
    expect(layout.placedElements.length).toBe(5);
  });

  it('resolves Broadcast Lower-Third into horizontal-row with enforced text size', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.broadcastLowerThird);
    expect(layout.layoutMode).toBe('horizontal-row');
    const headline = layout.placedElements.find(p => p.id === 'headline');
    expect(headline).toBeDefined();
    expect(headline!.fontSize).toBeGreaterThanOrEqual(surfaces.broadcastLowerThird.minTextSize);
  });

  it('resolves Retail Kiosk into two-column with enforced minTapTarget', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.retailKiosk);
    expect(layout.layoutMode).toBe('two-column');
    const cta = layout.placedElements.find(p => p.id === 'cta');
    expect(cta!.rect.height).toBeGreaterThanOrEqual(surfaces.retailKiosk.minTapTarget);
  });

  it('demonstrates priority-based degradation on cramped space (logo drops first)', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.crampedBanner);
    expect(layout.droppedElements.length).toBeGreaterThan(0);
    // Priority 3 logo dropped
    const droppedLogo = layout.droppedElements.find(d => d.id === 'logo');
    expect(droppedLogo).toBeDefined();
    expect(droppedLogo!.priority).toBe(3);
    // Critical Priority 1 CTA and Headline are preserved
    const cta = layout.placedElements.find(p => p.id === 'cta');
    const headline = layout.placedElements.find(p => p.id === 'headline');
    expect(cta).toBeDefined();
    expect(headline).toBeDefined();
  });

  it('dynamically adapts to an unknown-at-design-time surface', () => {
    const customSurface: SurfaceProfile = {
      id: 'custom-banner',
      name: 'Custom Display',
      width: 500,
      height: 200,
      safeArea: { top: 10, right: 10, bottom: 10, left: 10 },
      minTapTarget: 40,
      minTextSize: 14,
      viewingDistance: 'near',
      touchOnly: false,
    };

    const layout = resolveLayout(defaultAdSpec, customSurface);
    expect(layout.layoutMode).toBe('horizontal-row');
    expect(layout.placedElements.length).toBeGreaterThan(0);
  });
});
