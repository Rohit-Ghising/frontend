import type { Category } from '../types';

export const CATEGORY_META: Record<Category, { label: string; icon: string }> = {
  phones: { label: 'Phones', icon: '📱' },
  laptops: { label: 'Laptops', icon: '💻' },
  headphones: { label: 'Headphones', icon: '🎧' },
  smartwatches: { label: 'Smartwatches', icon: '⌚' },
  accessories: { label: 'Accessories', icon: '🧵' },
  fashion: { label: 'Fashion', icon: '👗' },
  books: { label: 'Books', icon: '📚' },
  home: { label: 'Home', icon: '🏡' },
  toys: { label: 'Toys', icon: '🧸' },
};
