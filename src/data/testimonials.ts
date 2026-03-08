// src/data/testimonials.ts

import productsData from './products.json';
import partnersData from './partners.json';
import personsData from './persons.json';
import testimonialsData from './testimonials.json';

export type Product = {
  product_id: string;
  name: string;
  category: string;
  variant_name: string | null;
  partner_ids: string[];
  platform: string | null;
  url: string;
  description_short: string;
  status: string;
};

export type Partner = {
  partner_id: string;
  name: string;
  relationship_type: string;
  logo_url: string;
  website_url: string;
  description_short: string;
  priority: number;
};

export type Person = {
  person_id: string;
  name: string;
  designation: string;
  company: string;
  partner_id: string | null;
  linkedin_url: string;
  other_link: string;
  headshot_url: string;
  relationship_type: string;
};

export type RawTestimonial = {
  testimonial_id: string;
  person_id: string | null;
  product_ids: string[];
  partner_ids: string[];
  scope: 'brand' | 'product';
  audience_type: 'partner' | 'attendee' | 'client' | 'collaborator' | 'generic';
  source_type: 'text' | 'video' | 'image' | 'tweet' | 'email' | 'blog';
  source_url: string | null;
  image_url: string | null;
  image_alt: string | null;
  quote_short: string;
  quote_long: string;
  rating: number | null;
  language: string;
  date: string;
  priority: 'hero' | 'high' | 'normal' | 'low';
  is_published: boolean;
  internal_notes: string;
};

export type ResolvedTestimonial = RawTestimonial & {
  person?: Person;
  products: Product[];
  partners: Partner[];
};

const products = productsData as Product[];
const partners = partnersData as Partner[];
const persons = personsData as unknown as Person[];
const rawTestimonials = testimonialsData as RawTestimonial[];

const PRIORITY_ORDER: Record<RawTestimonial['priority'], number> = {
  hero: 1,
  high: 2,
  normal: 3,
  low: 4,
};

const resolvedTestimonials: ResolvedTestimonial[] = rawTestimonials
  .filter((t) => t.is_published)
  .map((t) => {
    const person = t.person_id != null ? persons.find((p) => p.person_id === t.person_id) : undefined;

    const productObjs = products.filter((p) => t.product_ids.includes(p.product_id));

    const partnerObjs = partners.filter((pt) => (t.partner_ids || []).includes(pt.partner_id));

    return {
      ...t,
      person,
      products: productObjs,
      partners: partnerObjs,
    };
  })
  .sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority];
    const pb = PRIORITY_ORDER[b.priority];
    if (pa !== pb) return pa - pb;
    if (a.date && b.date) return a.date < b.date ? 1 : -1; // newest first
    return 0;
  });

/**
 * Get testimonials for a specific product.
 * - If productId is provided: all testimonials where product_ids includes it.
 * - If productId is NOT provided: brand-level testimonials (scope === 'brand').
 */
export function getTestimonialsForProduct(productId?: string): ResolvedTestimonial[] {
  if (productId) {
    return resolvedTestimonials.filter((t) => t.product_ids.includes(productId));
  }

  // Default: homepage / brand testimonials
  return resolvedTestimonials.filter((t) => t.scope === 'brand');
}

// Optional exports if needed elsewhere later
export { products, partners, persons, resolvedTestimonials };
