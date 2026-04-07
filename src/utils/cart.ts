import { normalizeProduct } from './products';
import type { CartItem } from '../types';

export const normalizeCartItem = (raw: any): CartItem => ({
  id: raw.id,
  product: normalizeProduct(raw.product),
  quantity: raw.quantity ?? 0,
  totalPrice: Number(raw.total_price ?? raw.totalPrice ?? raw.quantity * (raw.product?.price ?? 0)),
});

export const normalizeCartPayload = (payload: any) => {
  const items: CartItem[] = Array.isArray(payload?.items)
    ? payload.items.map(normalizeCartItem)
    : [];
  return {
    id: payload?.id,
    items,
    totalItems: payload?.total_items ?? payload?.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: Number(
      payload?.total_price ?? payload?.totalPrice ?? items.reduce((sum, item) => sum + item.totalPrice, 0),
    ),
  };
};
