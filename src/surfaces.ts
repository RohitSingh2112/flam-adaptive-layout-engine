/**
 * Standard Surface Screen Sizes
 * Exactly matching the assignment specification and reference images.
 */

export interface SurfaceScreen {
  id: string;
  name: string;
  width: number;
  height: number;
  previewScale: number; // Suggested scale percentage to fit nicely in grid
  templateCandidate: string;
  score: number;
  candidatesCount: string;
}

export const screenSizes: SurfaceScreen[] = [
  {
    id: 'square',
    name: 'Square',
    width: 1080,
    height: 1080,
    previewScale: 0.37,
    templateCandidate: 'text-dominant',
    score: 0.952,
    candidatesCount: '4/4',
  },
  {
    id: 'story',
    name: 'Portrait / Story',
    width: 1080,
    height: 1920,
    previewScale: 0.21,
    templateCandidate: 'text-dominant',
    score: 0.952,
    candidatesCount: '3/3',
  },
  {
    id: 'landscape',
    name: 'Landscape',
    width: 1200,
    height: 628,
    previewScale: 0.33,
    templateCandidate: 'text-dominant',
    score: 0.952,
    candidatesCount: '3/3',
  },
  {
    id: 'medium-rectangle',
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    previewScale: 1.0,
    templateCandidate: 'text-dominant',
    score: 0.732,
    candidatesCount: '2/3',
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    width: 728,
    height: 90,
    previewScale: 0.55,
    templateCandidate: 'stacked',
    score: 0.945,
    candidatesCount: '1/2',
  },
  {
    id: 'wide-billboard',
    name: 'Wide Billboard',
    width: 1920,
    height: 540,
    previewScale: 0.21,
    templateCandidate: 'text-dominant',
    score: 0.952,
    candidatesCount: '2/2',
  },
];
