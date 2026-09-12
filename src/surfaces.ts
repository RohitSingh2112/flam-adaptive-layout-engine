/**
 * Surface Profiles & Constraints
 *
 * Defines surface environments and their physical / human-factor constraints:
 * viewing distance, touch target thresholds, minimum legible typography,
 * safe areas, and aspect ratios.
 */

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ViewingDistance = 'near' | 'arm' | 'far';

export interface SurfaceProfile {
  id: string;
  name: string;
  description: string;
  category: 'mobile' | 'broadcast' | 'kiosk' | 'desktop' | 'custom';
  width: number;
  height: number;
  safeArea: SafeArea;
  minTapTarget: number;        // Minimum interactive target dimension (e.g. 44px on iOS, 60px on kiosk)
  minTextSize: number;         // Enforced font size floor for legibility (e.g. 32px on broadcast TV)
  viewingDistance: ViewingDistance; // 'near' (phones), 'arm' (kiosks/monitors), 'far' (living room TV / digital billboard)
  touchOnly: boolean;          // Whether the interface is exclusively touch-driven
  deviceFrame?: 'iphone' | 'tv' | 'kiosk' | 'tablet' | 'banner' | 'custom';
}

/**
 * Standard Surface Profiles required by the assignment and real-world ad deployment surfaces.
 */
export const defaultSurfaces: Record<string, SurfaceProfile> = {
  // 1. Mobile Interstitial: Tall portrait, handheld touch
  mobileInterstitial: {
    id: 'mobileInterstitial',
    name: 'Mobile Interstitial',
    description: 'Tall portrait 9:16 mobile full-screen ad. Strict touch safety and bottom thumb-zone.',
    category: 'mobile',
    width: 360,
    height: 640,
    safeArea: { top: 40, right: 16, bottom: 28, left: 16 },
    minTapTarget: 48,
    minTextSize: 14,
    viewingDistance: 'near',
    touchOnly: true,
    deviceFrame: 'iphone',
  },

  // 2. Mobile Landscape: Wide mobile layout, two-column visual + copy balance
  mobileLandscape: {
    id: 'mobileLandscape',
    name: 'Mobile Landscape',
    description: 'Horizontal smartphone view. Space split between visual showcase and action panel.',
    category: 'mobile',
    width: 640,
    height: 360,
    safeArea: { top: 20, right: 36, bottom: 20, left: 36 },
    minTapTarget: 44,
    minTextSize: 13,
    viewingDistance: 'near',
    touchOnly: true,
    deviceFrame: 'iphone',
  },

  // 3. Broadcast Lower-Third: Ultra-wide 16:2 format, living-room viewing distance
  broadcastLowerThird: {
    id: 'broadcastLowerThird',
    name: 'Broadcast Lower-Third',
    description: 'Wide overlay bar for streaming/TV. High viewing distance requires large legible text (32px+).',
    category: 'broadcast',
    width: 1920,
    height: 250,
    safeArea: { top: 24, right: 80, bottom: 24, left: 80 },
    minTapTarget: 36,
    minTextSize: 32, // Hard constraint for far viewing distance
    viewingDistance: 'far',
    touchOnly: false,
    deviceFrame: 'tv',
  },

  // 4. Retail Kiosk: 1:1 Square high-density interactive kiosk
  retailKiosk: {
    id: 'retailKiosk',
    name: 'Retail Kiosk Screen',
    description: 'High-res square kiosk display. Large touch targets (60px+) for public accessibility.',
    category: 'kiosk',
    width: 1080,
    height: 1080,
    safeArea: { top: 60, right: 60, bottom: 60, left: 60 },
    minTapTarget: 64, // Big touch targets for public kiosks
    minTextSize: 22,
    viewingDistance: 'arm',
    touchOnly: true,
    deviceFrame: 'kiosk',
  },

  // 5. Cramped Micro-Banner (Demonstrates Priority-Based Degradation)
  crampedBanner: {
    id: 'crampedBanner',
    name: 'Cramped Banner (Stress Test)',
    description: 'Intentionally constrained space to demonstrate graceful degradation (branding drops first).',
    category: 'desktop',
    width: 400,
    height: 120,
    safeArea: { top: 8, right: 12, bottom: 8, left: 12 },
    minTapTarget: 36,
    minTextSize: 12,
    viewingDistance: 'near',
    touchOnly: false,
    deviceFrame: 'banner',
  },
};

/**
 * Validates a surface profile.
 */
export function validateSurface(profile: SurfaceProfile): void {
  if (profile.width <= 0 || profile.height <= 0) {
    throw new Error(`[SurfaceError] Invalid dimensions (${profile.width}x${profile.height}). Dimensions must be positive numbers.`);
  }
  const horizSafe = profile.safeArea.left + profile.safeArea.right;
  const vertSafe = profile.safeArea.top + profile.safeArea.bottom;

  if (horizSafe >= profile.width) {
    throw new Error(`[SurfaceError] Total horizontal safe area (${horizSafe}px) exceeds surface width (${profile.width}px).`);
  }
  if (vertSafe >= profile.height) {
    throw new Error(`[SurfaceError] Total vertical safe area (${vertSafe}px) exceeds surface height (${profile.height}px).`);
  }
}
