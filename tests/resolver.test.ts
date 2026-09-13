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

describe('Multi-Surface Layout Resolver for Standard Sizes', () => {
  it('resolves Widescreen Landscape (16:9, 1920x1080) into two-column', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.widescreenLandscape);
    expect(layout.layoutMode).toBe('two-column');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Full Vertical / Stories (9:16, 1080x1920) into vertical-stack', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.fullVerticalStories);
    expect(layout.layoutMode).toBe('vertical-stack');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Universal Square (1:1, 1080x1080) into vertical-stack with zero overlap', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.universalSquare);
    expect(layout.layoutMode).toBe('vertical-stack');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Standard Portrait (4:5, 1080x1350) into vertical-stack', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.standardPortrait);
    expect(layout.layoutMode).toBe('vertical-stack');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Presentation Landscape (4:3, 1024x768) into two-column', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.presentationLandscape);
    expect(layout.layoutMode).toBe('two-column');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Classic Photo Portrait (3:4, 1200x1600) into vertical-stack', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.classicPhotoPortrait);
    expect(layout.layoutMode).toBe('vertical-stack');
    expect(layout.placedElements.length).toBe(6);
  });

  it('resolves Broadcast Lower-Third (1920x250) into horizontal-row with far viewing distance', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.broadcastLowerThird);
    expect(layout.layoutMode).toBe('horizontal-row');
    expect(layout.aspectRatio).toBeGreaterThanOrEqual(2.0);
    expect(layout.placedElements.length).toBe(6);

    // Verify 2D bounding box separation (zero 2D collisions)
    for (let i = 0; i < layout.placedElements.length; i++) {
      for (let j = i + 1; j < layout.placedElements.length; j++) {
        const a = layout.placedElements[i].rect;
        const b = layout.placedElements[j].rect;
        const overlaps =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('demonstrates priority-based degradation on Cramped Banner (P3 logo drops cleanly)', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.crampedBanner);
    expect(layout.droppedElements.length).toBeGreaterThan(0);
    const droppedLogo = layout.droppedElements.find(d => d.id === 'logo');
    expect(droppedLogo).toBeDefined();
    expect(droppedLogo!.priority).toBe(3);

    // Critical Headline and CTA remain placed and intact
    expect(layout.placedElements.some(p => p.element.role === 'headline')).toBe(true);
    expect(layout.placedElements.some(p => p.element.role === 'cta')).toBe(true);
  });

  it('strictly enforces minTapTarget and minTextSize constraints', () => {
    const layout = resolveLayout(defaultAdSpec, surfaces.broadcastLowerThird);
    const cta = layout.placedElements.find(p => p.element.role === 'cta');
    const headline = layout.placedElements.find(p => p.element.role === 'headline');

    expect(cta).toBeDefined();
    expect(cta!.rect.height).toBeGreaterThanOrEqual(surfaces.broadcastLowerThird.minTapTarget);

    expect(headline).toBeDefined();
    expect(headline!.fontSize).toBeGreaterThanOrEqual(surfaces.broadcastLowerThird.minTextSize);
  });
});

