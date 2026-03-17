import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, TrendingUp, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setCategory } from '../store/productsSlice';
import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../data/products';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products } = useAppSelector(s => s.products);

  const featured = products.filter(p => p.featured);
  const trending = products.filter(p => p.trending);

  const handleCategory = (cat: string) => {
    dispatch(setCategory(cat as any));
    navigate('/products');
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-[#0f0f11] to-[#0f0f11]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="page-container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
                <Zap size={12} /> New arrivals just dropped
              </div>

              <h1 className="font-display font-bold text-5xl lg:text-7xl text-white leading-[1.05] mb-6">
                Next-Gen<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                  Gadgets
                </span><br />
                Await You
              </h1>

              <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-md">
                Discover the latest in cutting-edge technology. From flagship phones to pro laptops — everything you need to stay ahead.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary text-base px-6 py-3">
                  Shop Now <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => handleCategory('phones')}
                  className="btn-secondary text-base px-6 py-3"
                >
                  View Phones
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-surface-border">
                {[
                  { value: '500+', label: 'Products' },
                  { value: '50K+', label: 'Customers' },
                  { value: '4.9★', label: 'Rating' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-display font-bold text-2xl text-white">{value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero product showcase */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px]">
                {featured.slice(0, 3).map((product, i) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className={`absolute card overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 ${
                      i === 0 ? 'w-64 h-80 top-0 left-8 z-30' :
                      i === 1 ? 'w-52 h-64 top-24 right-0 z-20' :
                      'w-44 h-52 bottom-0 left-0 z-10'
                    }`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-xs font-semibold font-display line-clamp-1">{product.name}</p>
                      <p className="text-brand-400 text-xs font-mono">${product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-surface-border bg-surface-card/30 py-6">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'On orders over $99' },
              { icon: Shield, label: '2-Year Warranty', sub: 'On all products' },
              { icon: Zap, label: 'Fast Delivery', sub: '2-3 business days' },
              { icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-zinc-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl text-white">Shop by Category</h2>
              <p className="text-zinc-500 mt-1">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ id, label, icon, count }) => (
              <button
                key={id}
                onClick={() => handleCategory(id)}
                className="group card p-5 text-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <p className="font-display font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-zinc-600 mt-1">{count} items</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface-card/20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl text-white">Featured Products</h2>
              <p className="text-zinc-500 mt-1">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="py-12">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 to-brand-700 border border-brand-700/50 p-10 lg:p-16">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <span className="badge bg-white/10 text-white border border-white/20 mb-3">Limited Time</span>
                <h2 className="font-display font-bold text-3xl lg:text-5xl text-white mb-3">
                  Up to 30% Off<br />Premium Gadgets
                </h2>
                <p className="text-brand-200 max-w-md">
                  Don't miss out on exclusive deals on the latest smartphones, laptops, and accessories.
                </p>
              </div>
              <Link to="/products" className="btn-accent text-base px-8 py-4 whitespace-nowrap shadow-2xl shadow-orange-500/20">
                Shop the Sale <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Trending Now</span>
              </div>
              <h2 className="font-display font-bold text-3xl text-white">Most Popular</h2>
            </div>
            <Link to="/products" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              See all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.slice(0, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
