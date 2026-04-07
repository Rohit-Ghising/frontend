import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../lib/api';
import { normalizeProduct } from '../utils/products';
import type { Product, FilterState, Category } from '../types';

const initialFilters: FilterState = {
  category: 'all',
  priceRange: [0, 5000],
  brands: [],
  sortBy: 'newest',
  search: '',
  page: 1,
};

const applyFilters = (products: Product[], filters: FilterState): Product[] => {
  let result = [...products];
  if (filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.tags.some((t) => t.toLowerCase().includes(searchTerm)),
    );
  }
  if (filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.brand));
  }
  result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return result;
};

interface ProductsState {
  items: Product[];
  filtered: Product[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  filtered: [],
  filters: initialFilters,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: any }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/products/list/');
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(normalizeProduct);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Unable to load products' });
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FilterState>>) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
      state.filtered = applyFilters(state.items, state.filters);
    },
    setCategory(state, action: PayloadAction<Category | 'all'>) {
      state.filters.category = action.payload;
      state.filters.page = 1;
      state.filtered = applyFilters(state.items, state.filters);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
      state.filtered = applyFilters(state.items, state.filters);
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    resetFilters(state) {
      state.filters = { ...initialFilters };
      state.filtered = applyFilters(state.items, state.filters);
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
      state.filtered = applyFilters(state.items, state.filters);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
      state.filtered = applyFilters(state.items, state.filters);
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.filtered = applyFilters(state.items, state.filters);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.filtered = applyFilters(action.payload, state.filters);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Failed to load products';
      });
  },
});

export const {
  setFilters,
  setCategory,
  setSearch,
  setPage,
  resetFilters,
  addProduct,
  updateProduct,
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
