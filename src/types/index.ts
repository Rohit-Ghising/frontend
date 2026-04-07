export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  shortDescription: string;
  specs: Record<string, string>;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export type Category =
  | 'phones'
  | 'laptops'
  | 'headphones'
  | 'smartwatches'
  | 'accessories'
  | 'fashion'
  | 'books'
  | 'home'
  | 'toys';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Order {
  id: number;
  cartId?: number;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface PaymentRecord {
  id: number;
  method: string;
  transaction_uuid: string;
  amount: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface EsewaPayload {
  payment_url: string;
  product_code: string;
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names?: string;
  signature?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface FilterState {
  category: Category | 'all';
  priceRange: [number, number];
  brands: string[];
  sortBy: SortOption;
  search: string;
  page: number;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface CartState {
  id?: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
