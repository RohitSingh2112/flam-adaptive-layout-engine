/**
 * Declarative Ad Spec & Content Options
 * Theme: Black, Blue, and White
 */

export interface AdElement {
  id: string;
  type: 'text' | 'image' | 'button';
  role: 'headline' | 'description' | 'hero' | 'cta' | 'logo' | 'price';
  priority: 1 | 2 | 3;
  content?: string;
  src?: string;
  aspectRatio?: number;
}

export interface AdSpec {
  id: string;
  title: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  elements: AdElement[];
}

export interface AdContentConfig {
  headline: string;
  description: string;
  price: string;
  ctaText: string;
  heroImage: string;
  logoImage: string;
  primaryColor: string;
  accentColor: string;
}

export const defaultContentConfig: AdContentConfig = {
  headline: 'Spatial Audio for the XR Frontier',
  description: 'Experience studio-quality audio with our next-gen wireless hardware. Active noise cancellation, 36-hour battery, and seamless spatial tracking.',
  price: '$299 • Free Express Shipping',
  ctaText: 'Experience Now',
  heroImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
  logoImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=140&q=80',
  primaryColor: '#000000', // Deep Black
  accentColor: '#2563eb',  // Vibrant Blue
};

export function createAdSpec(config: AdContentConfig): AdSpec {
  return {
    id: 'flam-audio',
    title: config.headline,
    theme: {
      primaryColor: config.primaryColor,
      accentColor: config.accentColor,
    },
    elements: [
      {
        id: 'logo',
        type: 'image',
        role: 'logo',
        priority: 3,
        src: config.logoImage,
        aspectRatio: 3.2,
      },
      {
        id: 'headline',
        type: 'text',
        role: 'headline',
        priority: 1,
        content: config.headline,
      },
      {
        id: 'description',
        type: 'text',
        role: 'description',
        priority: 2,
        content: config.description,
      },
      {
        id: 'product-image',
        type: 'image',
        role: 'hero',
        priority: 1,
        src: config.heroImage,
        aspectRatio: 1.1,
      },
      {
        id: 'price',
        type: 'text',
        role: 'price',
        priority: 2,
        content: config.price,
      },
      {
        id: 'cta',
        type: 'button',
        role: 'cta',
        priority: 1,
        content: config.ctaText,
      },
    ],
  };
}

export function defineAd(spec: AdSpec): AdSpec {
  if (!spec.elements || spec.elements.length === 0) {
    throw new Error('Ad must contain at least one element');
  }
  const ids = new Set<string>();
  for (const el of spec.elements) {
    if (ids.has(el.id)) {
      throw new Error(`Duplicate element ID: ${el.id}`);
    }
    ids.add(el.id);
  }
  return spec;
}

export const defaultAdSpec = createAdSpec(defaultContentConfig);
