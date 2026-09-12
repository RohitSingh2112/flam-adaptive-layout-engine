/**
 * Standard Surface Screen Sizes
 * Exactly 6 standard aspect ratios requested.
 */

export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  safeArea: { top: number; right: number; bottom: number; left: number };
  minTapTarget: number;
  minTextSize: number;
  viewingDistance: 'near' | 'far';
  touchOnly: boolean;
}

export const surfaces: Record<string, SurfaceProfile> = {
  widescreenLandscape: {
    id: 'widescreenLandscape',
    name: 'Widescreen Landscape',
    aspectRatioLabel: '16:9',
    width: 1920,
    height: 1080,
    safeArea: { top: 48, right: 64, bottom: 48, left: 64 },
    minTapTarget: 44,
    minTextSize: 26,
    viewingDistance: 'far',
    touchOnly: false,
  },
  fullVerticalStories: {
    id: 'fullVerticalStories',
    name: 'Full Vertical / Stories',
    aspectRatioLabel: '9:16',
    width: 1080,
    height: 1920,
    safeArea: { top: 64, right: 48, bottom: 64, left: 48 },
    minTapTarget: 56,
    minTextSize: 22,
    viewingDistance: 'near',
    touchOnly: true,
  },
  universalSquare: {
    id: 'universalSquare',
    name: 'Universal Square',
    aspectRatioLabel: '1:1',
    width: 1080,
    height: 1080,
    safeArea: { top: 48, right: 48, bottom: 48, left: 48 },
    minTapTarget: 52,
    minTextSize: 20,
    viewingDistance: 'near',
    touchOnly: true,
  },
  standardPortrait: {
    id: 'standardPortrait',
    name: 'Standard Portrait',
    aspectRatioLabel: '4:5',
    width: 1080,
    height: 1350,
    safeArea: { top: 50, right: 44, bottom: 50, left: 44 },
    minTapTarget: 50,
    minTextSize: 20,
    viewingDistance: 'near',
    touchOnly: true,
  },
  presentationLandscape: {
    id: 'presentationLandscape',
    name: 'Presentation Landscape',
    aspectRatioLabel: '4:3',
    width: 1024,
    height: 768,
    safeArea: { top: 36, right: 40, bottom: 36, left: 40 },
    minTapTarget: 44,
    minTextSize: 18,
    viewingDistance: 'near',
    touchOnly: false,
  },
  classicPhotoPortrait: {
    id: 'classicPhotoPortrait',
    name: 'Classic Photo Portrait',
    aspectRatioLabel: '3:4',
    width: 1200,
    height: 1600,
    safeArea: { top: 56, right: 48, bottom: 56, left: 48 },
    minTapTarget: 52,
    minTextSize: 22,
    viewingDistance: 'near',
    touchOnly: true,
  },
};
