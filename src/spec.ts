/**
 * Ad Spec & Content Model
 */

export interface AdContent {
  brandName: string;
  headline: string;
  description: string;
  ctaText: string;
  heroImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  focalPointX: number; // 0 - 1
  focalPointY: number; // 0 - 1
}

export const defaultContent: AdContent = {
  brandName: 'SonicWave',
  headline: 'Premium Sound, Zero Compromise',
  description: 'Experience studio-quality audio with our new wireless earbuds. Active noise cancellation, 36-hour battery, and seamless connectivity.',
  ctaText: 'Shop Now',
  heroImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  primaryColor: '#0f172a',
  secondaryColor: '#e94560',
  focalPointX: 0.45,
  focalPointY: 0.50,
};
