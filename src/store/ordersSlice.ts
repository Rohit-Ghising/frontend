import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types';
import { mockOrders } from '../data/products';

interface OrdersState {
  items: Order[];
  loading: boolean;
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: mockOrders, loading: false } as OrdersState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.items.unshift(action.payload);
    },
    updateOrderStatus(state, action: PayloadAction<{ id: string; status: OrderStatus }>) {
      const order = state.items.find(o => o.id === action.payload.id);
      if (order) { order.status = action.payload.status; order.updatedAt = new Date().toISOString(); }
    },
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
