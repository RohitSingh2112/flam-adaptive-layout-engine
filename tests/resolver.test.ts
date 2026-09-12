import { describe, it, expect } from 'vitest';
import { defaultContent } from '../src/spec';
import { screenSizes } from '../src/surfaces';
import { resolveAdLayout } from '../src/resolver';

describe('Multi-Surface Layout Resolver', () => {
  it('resolves all 6 target screen sizes with zero errors', () => {
    for (const screen of screenSizes) {
      const layout = resolveAdLayout(defaultContent, screen);
      expect(layout).toBeDefined();
      expect(layout.screenId).toBe(screen.id);
      expect(layout.width).toBe(screen.width);
      expect(layout.height).toBe(screen.height);
      expect(layout.cta.isVisible).toBe(true);
      expect(layout.headline.isVisible).toBe(true);
    }
  });

  it('correctly uses stacked template for Leaderboard (728x90)', () => {
    const leaderboard = screenSizes.find(s => s.id === 'leaderboard')!;
    const layout = resolveAdLayout(defaultContent, leaderboard);
    expect(layout.template).toBe('stacked');
    expect(layout.hero.isVisible).toBe(true);
    // Description is dropped on thin banner to prevent overflow
    expect(layout.description.isVisible).toBe(false);
  });

  it('correctly places text-dominant template on Square (1080x1080)', () => {
    const square = screenSizes.find(s => s.id === 'square')!;
    const layout = resolveAdLayout(defaultContent, square);
    expect(layout.template).toBe('text-dominant');
    expect(layout.description.isVisible).toBe(true);
    expect(layout.brand.isVisible).toBe(true);
  });
});
