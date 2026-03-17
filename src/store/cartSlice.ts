import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, Product } from '../../types';

const STORAGE_KEY = 'gz_cart';

const loadCart = (): CartState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...JSON.parse(raw), isOpen: false } : { items: [], isOpen: false };
  } catch { return { items: [], isOpen: false }; }
};

const saveCart = (state: CartState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
      saveCart(state);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
      saveCart(state);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(i => i.product.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.product.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCart(state);
    },
    clearCart(state) { state.items = []; saveCart(state); },
    toggleCart(state) { state.isOpen = !state.isOpen; },
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
