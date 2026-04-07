import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Headphones,
  Shield,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setCategory } from '../store/productsSlice';
import ProductCard from '../components/product/ProductCard';
import type { Category } from '../types';
import { CATEGORY_META } from '../constants/categoryMeta';
import { formatUsdToNpr } from '../utils/currency';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products } = useAppSelector((s) => s.products);

  const featured = products.filter((product) => product.featured);
  const trending = products.filter((product) => product.trending);
  const heroProduct = featured[0] ?? trending[0] ?? products[0];
  const heroCards = products.filter((product) => product.id !== heroProduct?.id).slice(0, 2);
  const editorialPicks = (featured.length > 0 ? featured : products).slice(0, 4);
  const trendingPicks = (trending.length > 0 ? trending : products).slice(0, 6);
  const topBrands = Array.from(new Set(products.map((product) => product.brand))).slice(0, 5);

  const productCountByCategory = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});

  const handleCategory = (category: Category) => {
    dispatch(setCategory(category));
    navigate(`/products?category=${category}`);
  };

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <section className="page-container relative">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="section-label mb-6">
              <Zap size={14} /> Curated gadgets, better decisions
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              A sharper way to shop for
              <span className="bg-gradient-to-r from-brand-200 via-brand-300 to-white bg-clip-text text-transparent">
                {' '}premium tech
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              GadgetZone brings together trusted launches, professional presentation, and a smoother buying flow so every product feels easier to evaluate and faster to buy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="btn-primary">
                Shop the collection <ArrowRight size={16} />
              </Link>
              <button onClick={() => handleCategory('phones')} className="btn-secondary">
                Browse flagship phones
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { value: `${products.length}+`, label: 'Curated products' },
                { value: `${topBrands.length}+`, label: 'Trusted brands' },
                { value: '4.9', label: 'Store rating' },
              ].map(({ value, label }) => (
                <div key={label} className="surface-panel-soft px-5 py-4">
                  <p className="font-display text-2xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>Popular brands:</span>
              {topBrands.map((brand) => (
                <span key={brand} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-300">
                  {brand}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="surface-panel noise relative overflow-hidden p-4 sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_30%)]" />
              <div className="relative z-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                {heroProduct ? (
                  <Link
                    to={`/products/${heroProduct.id}`}
                    className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/40"
                  >
                    <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                      {heroProduct.trending && (
                        <span className="badge bg-amber-400/90 text-slate-950">
                          <TrendingUp size={11} /> Trending
                        </span>
                      )}
                      {heroProduct.isNew && (
                        <span className="badge bg-brand-400 text-slate-950">Just in</span>
                      )}
                    </div>
                    <img
                      src={heroProduct.images[0]}
                      alt={heroProduct.name}
                      className="h-[26rem] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
                        {heroProduct.brand}
                      </p>
                      <h2 className="mt-3 max-w-sm font-display text-3xl font-bold text-white">
                        {heroProduct.name}
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                        {heroProduct.shortDescription}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Starts at</p>
                          <p className="mt-1 font-display text-2xl font-bold text-white">
                            {formatUsdToNpr(heroProduct.price)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-200 transition-transform group-hover:translate-x-1">
                          View product <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex min-h-[26rem] items-center justify-center rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center text-slate-500">
                    Product highlights will appear here once the catalog loads.
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {heroCards.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className={`surface-panel-soft group overflow-hidden border-white/10 p-4 transition-all hover:-translate-y-1 hover:border-white/20 ${
                        index === 0 ? 'animate-float' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-24 w-24 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            {product.brand}
                          </p>
                          <h3 className="mt-2 font-display text-lg font-semibold text-white">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                            {product.shortDescription}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="font-display text-xl font-bold text-white">
                              {formatUsdToNpr(product.price)}
                            </span>
                            <span className="text-sm font-medium text-brand-200">Open</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <div className="surface-panel-soft p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Shopping advantages
                    </p>
                    <div className="mt-4 space-y-4">
                      {[
                        { icon: Truck, label: 'Fast delivery', copy: 'Quick dispatch on core categories.' },
                        { icon: Shield, label: 'Protected checkout', copy: 'Clear pricing and dependable order flow.' },
                        { icon: Headphones, label: 'Responsive help', copy: 'Support that stays close to the purchase.' },
                      ].map(({ icon: Icon, label, copy }) => (
                        <div key={label} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                            <Icon size={17} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{label}</p>
                            <p className="mt-1 text-sm text-slate-500">{copy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container mt-16">
        <div className="surface-panel-soft grid gap-6 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, label: 'Free shipping', sub: `Orders from ${formatUsdToNpr(99)}` },
            { icon: Shield, label: 'Warranty support', sub: 'Coverage on eligible products' },
            { icon: Headphones, label: 'Human support', sub: 'Help before and after checkout' },
            { icon: Star, label: 'Verified favorites', sub: 'High-rated products highlighted first' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] text-brand-300">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-medium text-white">{label}</p>
                <p className="mt-1 text-sm text-slate-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container mt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="section-label mb-4">Explore by category</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Find the right setup faster
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
              Browse neatly grouped collections with clearer descriptions and more helpful product counts.
            </p>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-medium text-brand-200 transition-colors hover:text-white sm:inline-flex">
            View full catalog <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(CATEGORY_META) as Category[]).map((id) => {
            const meta = CATEGORY_META[id];
            const Icon = meta.icon;

            return (
              <button
                key={id}
                onClick={() => handleCategory(id)}
                className="surface-panel-soft group text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.04]"
              >
                <div className="p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-300 transition-transform duration-300 group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-white">{meta.label}</h3>
                      <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
                        {meta.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-300">
                      {productCountByCategory[id] ?? 0}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="page-container mt-20">
        <div className="surface-panel overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="section-label mb-4">Design best practices</p>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                A cleaner storefront improves confidence before checkout.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Clear hierarchy, stronger product imagery, focused actions, and better spacing all reduce friction and help customers compare faster.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Clear hierarchy',
                  copy: 'Pricing, trust signals, and product actions stay visible and easy to scan.',
                },
                {
                  title: 'Interactive browsing',
                  copy: 'Better cards, richer discovery surfaces, and cleaner filter flow make exploration smoother.',
                },
                {
                  title: 'Consistent polish',
                  copy: 'Shared surfaces, typography, and motion keep the experience professional from page to page.',
                },
              ].map(({ title, copy }) => (
                <div key={title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-display text-xl font-semibold text-white">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container mt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="section-label mb-4">Editor's picks</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Handpicked products with stronger presentation
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
              A more premium card layout makes the standout products feel like standouts at first glance.
            </p>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-medium text-brand-200 transition-colors hover:text-white sm:inline-flex">
            See everything <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {editorialPicks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-container mt-20">
        <div className="surface-panel relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.14),transparent_58%)] lg:block" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-label mb-4">Limited offer</p>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Upgrade your setup with products customers already trust.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                Stronger visuals and clearer pricing make promotions feel more intentional without overwhelming the page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="btn-accent">
                Shop the sale <ArrowRight size={16} />
              </Link>
              <button onClick={() => handleCategory('laptops')} className="btn-secondary">
                View laptop deals
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container mt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="section-label mb-4">
              <TrendingUp size={14} /> Trending now
            </p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Popular products with a more interactive browsing flow
            </h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-medium text-brand-200 transition-colors hover:text-white sm:inline-flex">
            Browse all products <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="surface-panel-soft p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Why this section feels better
            </p>
            <div className="mt-5 space-y-5">
              {[
                'Stronger product cards create better contrast between imagery, copy, and price.',
                'The page uses clearer editorial sections so featured and trending content feel distinct.',
                'Calls to action are simpler and repeated consistently without becoming noisy.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-300" />
                  <p className="text-sm leading-7 text-slate-400">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {trendingPicks.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
