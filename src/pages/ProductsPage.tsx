import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import {
  resetFilters,
  setCategory,
  setFilters,
  setPage,
  setSearch,
} from '../store/productsSlice';
import type { Category, SortOption } from '../types';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { CATEGORY_META } from '../constants/categoryMeta';
import { formatUsdToNpr } from '../utils/currency';

const ITEMS_PER_PAGE = 8;

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { items: products, filtered, filters } = useAppSelector((s) => s.products);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);

  const productMaxPrice = products.length > 0
    ? Math.max(3000, ...products.map((product) => Math.ceil(product.price / 100) * 100))
    : 3000;

  const brandList = Array.from(new Set(products.map((product) => product.brand))).sort();
  const categoryStats = (Object.keys(CATEGORY_META) as Category[]).map((id) => ({
    id,
    label: CATEGORY_META[id].label,
    description: CATEGORY_META[id].description,
    icon: CATEGORY_META[id].icon,
    count: products.filter((product) => product.category === id).length,
  }));

  useEffect(() => {
    const category = searchParams.get('category') as Category | null;
    dispatch(setCategory(category ?? 'all'));

    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timeout);
  }, [dispatch, productMaxPrice, searchParams]);

  useEffect(() => {
    setPriceRange([
      Math.min(filters.priceRange[0], productMaxPrice),
      Math.min(filters.priceRange[1], productMaxPrice),
    ]);
  }, [filters.priceRange, productMaxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (filters.page - 1) * ITEMS_PER_PAGE,
    filters.page * ITEMS_PER_PAGE,
  );

  const activeFilterCount = [
    filters.category !== 'all',
    filters.brands.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < productMaxPrice,
    filters.search !== '',
  ].filter(Boolean).length;

  const handleBrandToggle = (brand: string) => {
    const updatedBrands = filters.brands.includes(brand)
      ? filters.brands.filter((item) => item !== brand)
      : [...filters.brands, brand];
    dispatch(setFilters({ brands: updatedBrands }));
  };

  const handleClearAll = () => {
    dispatch(resetFilters());
    setPriceRange([0, productMaxPrice]);
  };

  const handlePriceApply = () => {
    dispatch(setFilters({ priceRange }));
  };

  const resultsWrapperClass = viewMode === 'grid'
    ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
    : 'space-y-4';

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="page-container">
        <div className="surface-panel overflow-hidden px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="section-label mb-4">Browse the catalog</p>
              <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
                A cleaner product grid with stronger discovery tools
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Search, sort, compare, and switch layouts without losing the polished storefront feel.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: `${filtered.length}`, label: 'Visible products' },
                { value: `${brandList.length}`, label: 'Available brands' },
                { value: `${activeFilterCount}`, label: 'Active filters' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-display text-2xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => dispatch(setSearch(event.target.value))}
                placeholder="Search products, brands, or tags"
                className="input pl-12"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setFiltersOpen(true)} className="btn-secondary lg:hidden">
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-brand-400 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    viewMode === 'grid' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    viewMode === 'list' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(event) => dispatch(setFilters({ sortBy: event.target.value as SortOption }))}
                  className="input appearance-none py-3 pr-10"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => dispatch(setCategory('all'))}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              filters.category === 'all'
                ? 'border-white bg-white text-slate-900'
                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/18 hover:text-white'
            }`}
          >
            All products
          </button>
          {categoryStats.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => dispatch(setCategory(id))}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                filters.category === id
                  ? 'border-brand-300/50 bg-brand-400/12 text-brand-200'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/18 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
              <span className="text-xs text-slate-500">{count}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="surface-panel-soft p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-white">Filters</h2>
                    <p className="mt-1 text-sm text-slate-500">Refine the catalog with fewer clicks.</p>
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={handleClearAll} className="text-xs font-medium text-brand-200 transition-colors hover:text-white">
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="surface-panel-soft p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Categories</p>
                <div className="space-y-2">
                  {categoryStats.map(({ id, label, icon: Icon, count }) => (
                    <button
                      key={id}
                      onClick={() => dispatch(setCategory(id))}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                        filters.category === id
                          ? 'bg-brand-400/12 text-brand-200'
                          : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{label}</span>
                      </span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-panel-soft p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Price range</p>
                <div className="flex items-center justify-between text-sm font-medium text-white">
                  <span>{formatUsdToNpr(priceRange[0])}</span>
                  <span>{formatUsdToNpr(priceRange[1])}</span>
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min={0}
                    max={productMaxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])}
                  />
                </div>
                <button onClick={handlePriceApply} className="btn-secondary mt-4 w-full">
                  Apply range
                </button>
              </div>

              <div className="surface-panel-soft p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Brands</p>
                <div className="space-y-3">
                  {brandList.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="h-4 w-4 rounded accent-brand-400"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {(filters.category !== 'all' || filters.brands.length > 0 || filters.search || filters.priceRange[1] < productMaxPrice) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <span className="badge border border-brand-400/20 bg-brand-400/10 text-brand-200">
                    {CATEGORY_META[filters.category].label}
                    <button onClick={() => dispatch(setCategory('all'))}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filters.brands.map((brand) => (
                  <span key={brand} className="badge border border-white/10 bg-white/[0.03] text-slate-300">
                    {brand}
                    <button onClick={() => handleBrandToggle(brand)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {filters.search && (
                  <span className="badge border border-white/10 bg-white/[0.03] text-slate-300">
                    {filters.search}
                    <button onClick={() => dispatch(setSearch(''))}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < productMaxPrice) && (
                  <span className="badge border border-white/10 bg-white/[0.03] text-slate-300">
                    {formatUsdToNpr(filters.priceRange[0])} - {formatUsdToNpr(filters.priceRange[1])}
                    <button onClick={() => dispatch(setFilters({ priceRange: [0, productMaxPrice] }))}>
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {filtered.length} result{filtered.length === 1 ? '' : 's'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {filters.category === 'all'
                    ? 'Showing all curated products'
                    : `Focused on ${CATEGORY_META[filters.category].label.toLowerCase()}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className={resultsWrapperClass}>
                {[...Array(viewMode === 'grid' ? 6 : 4)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="surface-panel-soft flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.03] text-slate-500">
                  <Search size={24} />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-white">No products match these filters</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Try a broader search, change the selected category, or clear the active filters to see more products.
                </p>
                <button onClick={handleClearAll} className="btn-primary mt-6">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={resultsWrapperClass}>
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} layout={viewMode} />
                  ))}
                </div>

                <div className="mt-10">
                  <Pagination
                    page={filters.page}
                    totalPages={totalPages}
                    onChange={(page) => dispatch(setPage(page))}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setFiltersOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-[#07101c] p-5 shadow-2xl shadow-slate-950/60 lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-semibold text-white">Filters</h3>
                <p className="mt-1 text-sm text-slate-500">Adjust discovery settings on mobile.</p>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="surface-panel-soft p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sort</p>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(event) => dispatch(setFilters({ sortBy: event.target.value as SortOption }))}
                    className="input appearance-none pr-10"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="surface-panel-soft p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Categories</p>
                <div className="space-y-2">
                  {categoryStats.map(({ id, label, icon: Icon, count }) => (
                    <button
                      key={id}
                      onClick={() => dispatch(setCategory(id))}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                        filters.category === id
                          ? 'bg-brand-400/12 text-brand-200'
                          : 'bg-white/[0.03] text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{label}</span>
                      </span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-panel-soft p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Price range</p>
                <div className="flex items-center justify-between text-sm text-white">
                  <span>{formatUsdToNpr(priceRange[0])}</span>
                  <span>{formatUsdToNpr(priceRange[1])}</span>
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min={0}
                    max={productMaxPrice}
                    step={50}
                    value={priceRange[1]}
                    onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])}
                  />
                </div>
                <button onClick={handlePriceApply} className="btn-secondary mt-4 w-full">
                  Apply range
                </button>
              </div>

              <div className="surface-panel-soft p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Brands</p>
                <div className="space-y-3">
                  {brandList.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="h-4 w-4 rounded accent-brand-400"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={handleClearAll} className="btn-secondary flex-1">
                Clear
              </button>
              <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1">
                View results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
