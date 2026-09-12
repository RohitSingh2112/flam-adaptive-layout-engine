/**
 * Simple, Clean Declarative Ad Spec
 */

export interface AdElement {
  id: string;
  type: 'text' | 'image' | 'button';
  role: 'headline' | 'hero' | 'cta' | 'logo' | 'price';
  priority: 1 | 2 | 3; // 1 = Critical, 2 = Secondary, 3 = Can drop first
  content?: string;   // For text and button label
  src?: string;       // For images
  aspectRatio?: number; // width / height for images
}

export interface AdSpec {
  id: string;
  title: string;
  elements: AdElement[];
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

// Single declarative ad spec defined once
export const defaultAdSpec: AdSpec = defineAd({
  id: 'flam-audio',
  title: 'Flam Spatial One XR Headphones',
  elements: [
    {
      id: 'logo',
      type: 'image',
      role: 'logo',
      priority: 3, // Dropped first if space is tight
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=140&q=80',
      aspectRatio: 3.2,
    },
    {
      id: 'headline',
      type: 'text',
      role: 'headline',
      priority: 1, // Critical
      content: 'Spatial Audio for the XR Frontier',
    },
    {
      id: 'product-image',
      type: 'image',
      role: 'hero',
      priority: 1, // Critical
      src: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 1.1,
    },
    {
      id: 'price',
      type: 'text',
      role: 'price',
      priority: 2, // Secondary
      content: '$299 • Free Shipping',
    },
    {
      id: 'cta',
      type: 'button',
      role: 'cta',
      priority: 1, // Critical
      content: 'Experience Now',
    },
  ],
});
