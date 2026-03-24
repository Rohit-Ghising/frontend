import type { Product, Category } from '../types';

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80';

const KNOWN_CATEGORIES: Category[] = [
  'phones',
  'laptops',
  'headphones',
  'smartwatches',
  'accessories',
  'fashion',
  'books',
  'home',
  'toys',
];

const createFallbackProduct = (): Product => ({
  id: 'unknown-product',
  name: 'Product unavailable',
  brand: 'Unknown',
  category: 'phones',
  price: 0,
  images: [DEFAULT_PRODUCT_IMAGE],
  description: 'This product is no longer available.',
  shortDescription: 'This product is no longer available.',
  specs: {},
  stock: 0,
  rating: 0,
  reviewCount: 0,
  tags: [],
  featured: false,
  trending: false,
  isNew: false,
  createdAt: new Date().toISOString(),
});

const ensureCategory = (value: string | undefined): Category => {
  if (value && KNOWN_CATEGORIES.includes(value as Category)) {
    return value as Category;
  }
  return 'phones';
};

const normalizeSpecs = (rawSpecs: any[]): Record<string, string> => {
  return rawSpecs.reduce<Record<string, string>>((acc, spec) => {
    if (spec?.key && spec?.value) {
      acc[spec.key] = spec.value;
    }
    return acc;
  }, {});
};

const normalizeTags = (rawTags: any[]): string[] => {
  return rawTags
    .map((tag) => tag?.value || tag?.key)
    .filter(Boolean);
};

export const normalizeProduct = (raw: any): Product => {
  if (!raw) {
    return createFallbackProduct();
  }

  const images = (raw.images ?? []).map((img: any) => img.image).filter(Boolean);
  const category = ensureCategory(raw.category);

  return {
    id: raw.id?.toString() ?? '',
    name: raw.name || 'Unnamed product',
    brand: raw.brand || 'Unknown',
    category,
    price: Number(raw?.discount_price ?? raw?.price ?? 0),
    originalPrice: raw?.discount_price ? Number(raw.price) : undefined,
    images: images.length ? images : [DEFAULT_PRODUCT_IMAGE],
    description: raw.description || '',
    shortDescription: raw.shortdescription || '',
    specs: normalizeSpecs(raw.specs ?? []),
    stock: raw.stock ?? 0,
    rating: Number(raw.rating ?? raw.stars ?? 4.5),
    reviewCount: Number(raw.review_count ?? 0),
    tags: normalizeTags(raw.tags ?? []),
    featured: Boolean(raw.featured),
    trending: Boolean(raw.trending),
    isNew: Boolean(raw.is_new),
    createdAt: raw.created_at ?? new Date().toISOString(),
  };
};
