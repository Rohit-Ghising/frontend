import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../lib/api';
import { normalizeCartPayload } from '../utils/cart';
import type { CartState, CartItem, EsewaPayload, PaymentRecord, Product } from '../types';
import { logout } from './authSlice';
import type { RootState } from '.';

interface CheckoutResponse {
  cart: any;
  order?: any;
  message?: string;
  payment?: PaymentRecord | null;
  esewa?: EsewaPayload | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  loading: false,
  error: null,
};

const withCart = (state: CartState, payload: ReturnType<typeof normalizeCartPayload>) => {
  state.id = payload.id;
  state.items = payload.items;
  state.totalItems = payload.totalItems;
  state.totalPrice = payload.totalPrice;
};

const computeTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: Number(items.reduce((sum, item) => sum + item.totalPrice, 0)),
});

const buildLocalCartPayload = (state: CartState, items: CartItem[]) => {
  const { totalItems, totalPrice } = computeTotals(items);
  return {
    id: state.id,
    items,
    totalItems,
    totalPrice,
  };
};

const addLocalItem = (state: CartState, product: Product, quantity: number) => {
  const items = state.items.map((item) => ({ ...item }));
  const idx = items.findIndex((item) => item.product.id === product.id);
  const unitPrice = Number(product.price ?? 0);

  if (idx >= 0) {
    const existing = items[idx];
    const newQuantity = existing.quantity + quantity;
    items[idx] = {
      ...existing,
      quantity: newQuantity,
      totalPrice: Number(unitPrice * newQuantity),
    };
  } else {
    const newItem: CartItem = {
      id: -Date.now() - items.length,
      product,
      quantity,
      totalPrice: Number(unitPrice * quantity),
    };
    items.push(newItem);
  }

  return buildLocalCartPayload(state, items);
};

const updateLocalItem = (state: CartState, itemId: number, quantity: number) => {
  const existingItem = state.items.find((item) => item.id === itemId);
  if (!existingItem) {
    return null;
  }

  const items = state.items.map((item) => ({ ...item }));
  const idx = items.findIndex((item) => item.id === itemId);
  if (quantity <= 0) {
    items.splice(idx, 1);
  } else {
    const unitPrice = Number(items[idx].product.price ?? 0);
    items[idx] = {
      ...items[idx],
      quantity,
      totalPrice: Number(unitPrice * quantity),
    };
  }

  return buildLocalCartPayload(state, items);
};

const removeLocalItem = (state: CartState, itemId: number) => {
  const exists = state.items.some((item) => item.id === itemId);
  if (!exists) {
    return null;
  }
  const items = state.items.filter((item) => item.id !== itemId);
  return buildLocalCartPayload(state, items);
};

const findProductFromState = (state: RootState, productId: number): Product | undefined => {
  return state.products.items.find((product) => Number(product.id) === productId);
};

export const fetchCart = createAsyncThunk<ReturnType<typeof normalizeCartPayload>, void, { rejectValue: any }>(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/cart/');
      return normalizeCartPayload(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to load cart' });
    }
  },
);

export type AddToCartPayload = {
  productId: number;
  quantity?: number;
  product?: Product;
};

export const addToCart = createAsyncThunk<
  ReturnType<typeof normalizeCartPayload>,
  AddToCartPayload,
  { rejectValue: any; state: RootState }
>(
  'cart/addToCart',
  async ({ productId, quantity = 1, product }, { rejectWithValue, getState }) => {
    const state = getState();
    if (!state.auth.token) {
      const resolved = product ?? findProductFromState(state, productId);
      if (!resolved) {
        return rejectWithValue({ error: 'Unable to add item to cart' });
      }
      return addLocalItem(state.cart, resolved, quantity);
    }

    try {
      const response = await apiClient.post('/api/cart/add/', {
        product_id: productId,
        quantity,
      });
      return normalizeCartPayload(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to add item' });
    }
  },
);

export const updateCartItem = createAsyncThunk<
  ReturnType<typeof normalizeCartPayload>,
  { id: number; quantity: number },
  { rejectValue: any; state: RootState }
>(
  'cart/updateCartItem',
  async ({ id, quantity }, { rejectWithValue, getState }) => {
    const state = getState();
    if (!state.auth.token) {
      const payload = updateLocalItem(state.cart, id, quantity);
      if (!payload) {
        return rejectWithValue({ error: 'Cart item not found' });
      }
      return payload;
    }

    try {
      const response = await apiClient.put(`/api/cart/update/${id}/`, { quantity });
      return normalizeCartPayload(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to update quantity' });
    }
  },
);

export const removeCartItem = createAsyncThunk<
  ReturnType<typeof normalizeCartPayload>,
  number,
  { rejectValue: any; state: RootState }
>(
  'cart/removeCartItem',
  async (id, { rejectWithValue, getState }) => {
    const state = getState();
    if (!state.auth.token) {
      const payload = removeLocalItem(state.cart, id);
      if (!payload) {
        return rejectWithValue({ error: 'Cart item not found' });
      }
      return payload;
    }

    try {
      const response = await apiClient.delete(`/cart/cart/remove/${id}/`);
      return normalizeCartPayload(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to remove item' });
    }
  },
);

export const clearCart = createAsyncThunk<
  ReturnType<typeof normalizeCartPayload>,
  void,
  { rejectValue: any; state: RootState }
>(
  'cart/clearCart',
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    if (!state.auth.token) {
      return buildLocalCartPayload(state.cart, []);
    }

    try {
      const response = await apiClient.post('/cart/cart/clear/');
      return normalizeCartPayload(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to clear cart' });
    }
  },
);

export const checkoutCart = createAsyncThunk<
  CheckoutResponse,
  void,
  { rejectValue: any; state: RootState }
>(
  '/api/cart/checkoutCart',
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    if (!state.auth.token) {
      return rejectWithValue({ error: 'Please log in to complete checkout' });
    }

    try {
      const response = await apiClient.post('/api/cart/checkout/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to checkout' });
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        withCart(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Failed to load cart';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        withCart(state, action.payload);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        withCart(state, action.payload);
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        withCart(state, action.payload);
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        withCart(state, action.payload);
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        const cartPayload = normalizeCartPayload(action.payload.cart ?? {});
        withCart(state, cartPayload);
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.id = undefined;
        state.isOpen = false;
        state.loading = false;
        state.error = null;
      })
      .addMatcher(
        (action) =>
          [addToCart, updateCartItem, removeCartItem, clearCart, checkoutCart].some((thunk) =>
            thunk.rejected.match(action),
          ),
        (state, action) => {
          const payload = 'payload' in action ? action.payload : undefined;
          state.error = payload ? JSON.stringify(payload) : 'Cart operation failed';
        },
      );
  },
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
