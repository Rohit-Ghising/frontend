import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, FilterState, Category } from '../../types';
import { products as initialProducts } from '../data/products';

interface ProductsState {
  items: Product[];
  filtered: Product[];
  filters: FilterState;
  loading: boolean;
  selectedProduct: Product | null;
}

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
  if (filters.category !== 'all') result = result.filter(p => p.category === filters.category);
  if (filters.search) result = result.filter(p =>
    p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    p.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase()))
  );
  if (filters.brands.length > 0) result = result.filter(p => filters.brands.includes(p.brand));
  result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
  switch (filters.sortBy) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    case 'popular': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
    case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
  }
  return result;
};

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: initialProducts,
    filtered: initialProducts,
    filters: initialFilters,
    loading: false,
    selectedProduct: null,
  } as ProductsState,
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
      state.filters = initialFilters;
      state.filtered = state.items;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
      state.filtered = applyFilters(state.items, state.filters);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      state.filtered = applyFilters(state.items, state.filters);
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
      state.filtered = applyFilters(state.items, state.filters);
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
  },
});

export const { setFilters, setCategory, setSearch, setPage, resetFilters, addProduct, updateProduct, deleteProduct, setSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
