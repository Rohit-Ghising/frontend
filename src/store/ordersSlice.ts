import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../lib/api';
import { normalizeProduct } from '../utils/products';
import type { Order, OrderStatus, CartItem } from '../../types';
import { logout } from './authSlice';

const normalizeOrderItem = (item: any): CartItem | null => {
  if (!item) return null;
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unit_price ?? 0);
  const totalPrice = Number(item.total_price ?? unitPrice * quantity);

  return {
    id: Number(item.id ?? 0),
    product: normalizeProduct(item.product),
    quantity,
    totalPrice,
  };
};

export const normalizeOrder = (raw: any): Order => ({
  id: raw.id,
  cartId: raw.cart_id,
  totalPrice: Number(raw.total_price ?? 0),
  status: (raw.status as OrderStatus) ?? 'pending',
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  items: Array.isArray(raw.items)
    ? raw.items.map(normalizeOrderItem).filter((item): item is CartItem => Boolean(item))
    : [],
});

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: any }>(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/orders/');
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(normalizeOrder);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to load orders' });
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.items.unshift(action.payload);
    },
    updateOrderStatus(state, action: PayloadAction<{ id: number; status: OrderStatus }>) {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Failed to load orders';
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
