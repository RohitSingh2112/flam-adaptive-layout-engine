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

  it('demonstrates priority-based degradation on cramped space (P3 logo drops cleanly)', () => {
    const crampedTestSurface: SurfaceProfile = {
      id: 'crampedTest',
      name: 'Cramped Test Surface',
      aspectRatioLabel: '3.5:1',
      width: 380,
      height: 110,
      safeArea: { top: 8, right: 12, bottom: 8, left: 12 },
      minTapTarget: 32,
      minTextSize: 12,
      viewingDistance: 'near',
      touchOnly: false,
    };
    const layout = resolveLayout(defaultAdSpec, crampedTestSurface);
    expect(layout.droppedElements.length).toBeGreaterThan(0);
    const droppedLogo = layout.droppedElements.find(d => d.id === 'logo');
    expect(droppedLogo).toBeDefined();
    expect(droppedLogo!.priority).toBe(3);
  });
});
