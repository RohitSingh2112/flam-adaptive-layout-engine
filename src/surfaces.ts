/**
 * Surface Profiles
 * Defines real constraints per surface: dimensions, safe area, touch target, and min text size.
 */

export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  safeArea: { top: number; right: number; bottom: number; left: number };
  minTapTarget: number;
  minTextSize: number;
  viewingDistance: 'near' | 'far';
  touchOnly: boolean;
}

export const surfaces: Record<string, SurfaceProfile> = {
  mobilePortrait: {
    id: 'mobilePortrait',
    name: 'Mobile Portrait',
    width: 320,
    height: 480,
    safeArea: { top: 20, right: 16, bottom: 20, left: 16 },
    minTapTarget: 44,
    minTextSize: 14,
    viewingDistance: 'near',
    touchOnly: true,
  },
  mobileLandscape: {
    id: 'mobileLandscape',
    name: 'Mobile Landscape',
    width: 640,
    height: 360,
    safeArea: { top: 16, right: 24, bottom: 16, left: 24 },
    minTapTarget: 44,
    minTextSize: 13,
    viewingDistance: 'near',
    touchOnly: true,
  },
  broadcastLowerThird: {
    id: 'broadcastLowerThird',
    name: 'Broadcast Lower-Third',
    width: 1920,
    height: 250,
    safeArea: { top: 20, right: 60, bottom: 20, left: 60 },
    minTapTarget: 36,
    minTextSize: 28, // Hard constraint for far viewing distance
    viewingDistance: 'far',
    touchOnly: false,
  },
  retailKiosk: {
    id: 'retailKiosk',
    name: 'Retail Kiosk Screen',
    width: 1080,
    height: 1080,
    safeArea: { top: 40, right: 40, bottom: 40, left: 40 },
    minTapTarget: 60, // Large touch targets for kiosks
    minTextSize: 20,
    viewingDistance: 'near',
    touchOnly: true,
  },
  crampedBanner: {
    id: 'crampedBanner',
    name: 'Cramped Banner (Degradation Demo)',
    width: 380,
    height: 110,
    safeArea: { top: 8, right: 12, bottom: 8, left: 12 },
    minTapTarget: 32,
    minTextSize: 12,
    viewingDistance: 'near',
    touchOnly: false,
  },
};
