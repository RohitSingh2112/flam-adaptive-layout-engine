/**
 * Declarative Ad Specification Types & Validator
 *
 * Defines an ad's content, layout intent, semantic roles, and degradation priorities
 * independently of any specific surface or device profile.
 */

export type ElementRole =
  | 'primary'      // Main message / headline
  | 'hero'         // Key product visual
  | 'action'       // Call to action button
  | 'branding'     // Sponsor or brand logo
  | 'secondary'    // Subtitle or price tag
  | 'badge'        // Special offer / discount chip
  | 'disclaimer';  // Legal / terms text

export type ElementType = 'text' | 'image' | 'button';

export type PriorityLevel = 1 | 2 | 3;
// Priority 1: Critical (Must be preserved if at all possible, e.g. headline, hero, CTA)
// Priority 2: High value (Price, subtitle, badge - will shrink or simplify before dropping)
// Priority 3: Supplemental (Logo, branding, disclaimers - first to drop under constrained space)

export interface SizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // width / height
  preferredFlex?: number; // 0 to 1 flex priority
}

export interface BaseAdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: PriorityLevel;
  constraints?: SizeConstraints;
}

export interface TextAdElement extends BaseAdElement {
  type: 'text';
  content: string;
  maxLines?: number;
  fontStyle?: 'serif' | 'sans' | 'mono';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  minFontSize?: number;
  idealFontSize?: number;
}

export interface ImageAdElement extends BaseAdElement {
  type: 'image';
  src: string;
  alt: string;
  aspectRatio: number; // e.g. 1.0 (square), 1.5 (landscape), 0.8 (portrait)
  objectFit?: 'contain' | 'cover';
  accentGlow?: string;
}

export interface ButtonAdElement extends BaseAdElement {
  type: 'button';
  label: string;
  actionUrl?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: string;
}

export type AdElement = TextAdElement | ImageAdElement | ButtonAdElement;

export interface AdSpec {
  id: string;
  name: string;
  category?: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardBackground: string;
    textColor: string;
    mutedTextColor: string;
  };
  elements: AdElement[];
}

/**
 * Validates and freezes an Ad Specification.
 * Enforces compile-time and runtime integrity (no duplicate IDs, sensible priorities).
 */
export function defineAd(spec: AdSpec): AdSpec {
  const seenIds = new Set<string>();
  
  if (!spec.elements || spec.elements.length === 0) {
    throw new Error(`[AdSpecError] Ad "${spec.id}" must contain at least one element.`);
  }

  for (const element of spec.elements) {
    if (!element.id || element.id.trim() === '') {
      throw new Error(`[AdSpecError] Ad elements must have a non-empty string "id".`);
    }
    if (seenIds.has(element.id)) {
      throw new Error(`[AdSpecError] Duplicate element ID detected: "${element.id}". IDs must be unique.`);
    }
    seenIds.add(element.id);

    if (element.priority < 1 || element.priority > 3) {
      throw new Error(`[AdSpecError] Element "${element.id}" has invalid priority ${element.priority}. Must be 1, 2, or 3.`);
    }

    if (element.type === 'text') {
      const textElem = element as TextAdElement;
      if (!textElem.content) {
        throw new Error(`[AdSpecError] Text element "${element.id}" must contain string content.`);
      }
    } else if (element.type === 'image') {
      const imgElem = element as ImageAdElement;
      if (!imgElem.src || typeof imgElem.aspectRatio !== 'number') {
        throw new Error(`[AdSpecError] Image element "${element.id}" requires valid src and numeric aspectRatio.`);
      }
    } else if (element.type === 'button') {
      const btnElem = element as ButtonAdElement;
      if (!btnElem.label) {
        throw new Error(`[AdSpecError] Button element "${element.id}" requires a label.`);
      }
    }
  }

  return Object.freeze({ ...spec, elements: [...spec.elements] });
}

/**
 * Default realistic product ad: "Flam Spatial Audio Pro"
 * Realistic product ad with headline, hero image, price, CTA, and branding.
 */
export const defaultAdSpec: AdSpec = defineAd({
  id: 'flam-audio-pro',
  name: 'Flam Spatial One — Holographic Sound',
  category: 'Next-Gen Audio Hardware',
  theme: {
    primaryColor: '#6366f1',
    accentColor: '#10b981',
    backgroundColor: '#090d16',
    cardBackground: '#131b2e',
    textColor: '#f8fafc',
    mutedTextColor: '#94a3b8',
  },
  elements: [
    {
      id: 'logo',
      type: 'image',
      role: 'branding',
      priority: 3,
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=160&q=80',
      alt: 'FLAM Audio Labs',
      aspectRatio: 3.5, // Wide pill logo
      constraints: {
        minWidth: 80,
        maxWidth: 160,
        minHeight: 22,
        maxHeight: 40,
      }
    },
    {
      id: 'headline',
      type: 'text',
      role: 'primary',
      priority: 1,
      content: 'Spatial Audio for the XR Frontier',
      fontWeight: 'bold',
      idealFontSize: 30,
      minFontSize: 16,
      constraints: {
        minHeight: 30,
        maxHeight: 110,
      }
    },
    {
      id: 'product-image',
      type: 'image',
      role: 'hero',
      priority: 1,
      src: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      alt: 'Flam Spatial One XR Headphones',
      aspectRatio: 1.15,
      accentGlow: '#6366f1',
      constraints: {
        minWidth: 90,
        minHeight: 70,
        preferredFlex: 1,
      }
    },
    {
      id: 'price',
      type: 'text',
      role: 'secondary',
      priority: 2,
      content: '$299 • Free Shipping',
      fontWeight: 'semibold',
      idealFontSize: 18,
      minFontSize: 13,
      constraints: {
        minHeight: 20,
        maxHeight: 36,
      }
    },
    {
      id: 'cta',
      type: 'button',
      role: 'action',
      priority: 1, // Core conversion element
      label: 'Experience Now',
      actionUrl: 'https://flam.ai/spatial-one',
      variant: 'primary',
      constraints: {
        minWidth: 120,
        minHeight: 40,
        maxHeight: 56,
      }
    },
  ],
});
