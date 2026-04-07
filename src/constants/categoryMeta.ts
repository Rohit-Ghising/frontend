import {
  BookOpen,
  Gamepad2,
  Headphones,
  Home,
  Laptop2,
  Package,
  Shirt,
  Smartphone,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../types';

type CategoryMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  phones: {
    label: 'Phones',
    description: 'Flagship cameras, foldables, and everyday powerhouses.',
    icon: Smartphone,
  },
  laptops: {
    label: 'Laptops',
    description: 'Performance machines for work, play, and creative flow.',
    icon: Laptop2,
  },
  headphones: {
    label: 'Headphones',
    description: 'Noise-cancelling audio built for focus and travel.',
    icon: Headphones,
  },
  smartwatches: {
    label: 'Smartwatches',
    description: 'Health tracking and instant updates on your wrist.',
    icon: Watch,
  },
  accessories: {
    label: 'Accessories',
    description: 'The small upgrades that complete every setup.',
    icon: Package,
  },
  fashion: {
    label: 'Fashion',
    description: 'Wearable picks with a sharper tech-forward look.',
    icon: Shirt,
  },
  books: {
    label: 'Books',
    description: 'Reading essentials for learning, gifting, and downtime.',
    icon: BookOpen,
  },
  home: {
    label: 'Home',
    description: 'Smart home essentials that streamline daily routines.',
    icon: Home,
  },
  toys: {
    label: 'Toys',
    description: 'Fun, interactive picks for playtime and gifting.',
    icon: Gamepad2,
  },
};
