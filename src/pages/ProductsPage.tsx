import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setFilters, setCategory, setSearch, setPage, resetFilters } from '../store/productsSlice';
import { Category, SortOption } from '../types';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { BRANDS, CATEGORIES } from '../data/products';

const ITEMS_PER_PAGE = 8;

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { filtered, filters } = useAppSelector(s => s.products);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);

  useEffect(() => {
    const cat = searchParams.get('category') as Category | null;
    if (cat) dispatch(setCategory(cat));
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((filters.page - 1) * ITEMS_PER_PAGE, filters.page * ITEMS_PER_PAGE);

  const handleBrandToggle = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    dispatch(setFilters({ brands: updated }));
  };

  const handlePriceApply = () => {
    dispatch(setFilters({ priceRange }));
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.brands.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 5000,
    filters.search !== '',
  ].filter(Boolean).length;

  return (
    <div className="pt-20 pb-20">
      <div className="page-container">
        {/* Header */}
        <div className="py-8 border-b border-surface-border mb-8">
          <h1 className="font-display font-bold text-4xl text-white mb-2">All Products</h1>
          <p className="text-zinc-500">{filtered.length} gadgets available</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { dispatch(resetFilters()); setPriceRange([0, 3000]); }}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2 block">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => dispatch(setSearch(e.target.value))}
                  placeholder="Search products..."
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3 block">Category</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => dispatch(setCategory('all'))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.category === 'all'
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-xs">{useAppSelector(s => s.products.items.length)}</span>
                </button>
                {CATEGORIES.map(({ id, label, count }) => (
                  <button
                    key={id}
                    onClick={() => dispatch(setCategory(id as Category))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      filters.category === id
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-surface-hover'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3 block">Price Range</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-white">${priceRange[0]}</span>
                  <span className="font-mono text-white">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full"
                />
                <button onClick={handlePriceApply} className="btn-secondary text-xs py-1.5 w-full">
                  Apply Range
                </button>
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3 block">Brand</label>
              <div className="space-y-2">
                {BRANDS.map(brand => (
                  <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-3.5 h-3.5 rounded accent-brand-500"
                    />
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden btn-secondary text-xs gap-1.5"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="badge bg-brand-500 text-white ml-1">{activeFilterCount}</span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-zinc-500 hidden sm:block">{filtered.length} results</span>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={e => dispatch(setFilters({ sortBy: e.target.value as SortOption }))}
                    className="input text-xs py-2 pr-8 appearance-none cursor-pointer"
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(filters.category !== 'all' || filters.brands.length > 0 || filters.search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category !== 'all' && (
                  <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                    {CATEGORIES.find(c => c.id === filters.category)?.label}
                    <button onClick={() => dispatch(setCategory('all'))}><X size={10} /></button>
                  </span>
                )}
                {filters.brands.map(brand => (
                  <span key={brand} className="badge bg-surface-hover text-zinc-300 border border-surface-border flex items-center gap-1">
                    {brand}
                    <button onClick={() => handleBrandToggle(brand)}><X size={10} /></button>
                  </span>
                ))}
                {filters.search && (
                  <span className="badge bg-surface-hover text-zinc-300 border border-surface-border flex items-center gap-1">
                    "{filters.search}"
                    <button onClick={() => dispatch(setSearch(''))}><X size={10} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center">
                  <Search size={24} className="text-zinc-600" />
                </div>
                <div>
                  <p className="font-medium text-white">No products found</p>
                  <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters</p>
                </div>
                <button onClick={() => { dispatch(resetFilters()); setPriceRange([0, 3000]); }} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination page={filters.page} totalPages={totalPages} onChange={p => dispatch(setPage(p))} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 z-50 bg-surface-card border-l border-surface-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-white">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><X size={18} className="text-zinc-400" /></button>
            </div>
            {/* Categories */}
            <div className="space-y-1.5 mb-6">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Category</p>
              <button
                onClick={() => { dispatch(setCategory('all')); setFiltersOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === 'all' ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-400 hover:text-white hover:bg-surface-hover'}`}
              >
                All Products
              </button>
              {CATEGORIES.map(({ id, label }) => (
                <button key={id} onClick={() => { dispatch(setCategory(id as Category)); setFiltersOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === id ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-400 hover:text-white hover:bg-surface-hover'}`}>
                  {label}
                </button>
              ))}
            </div>
            {/* Brands */}
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">Brand</p>
              {BRANDS.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer py-1.5">
                  <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => handleBrandToggle(brand)} className="accent-brand-500" />
                  <span className="text-sm text-zinc-400">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
