import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone, Shield, Zap } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const shopLinks = [
    { label: 'All Products', to: '/products' },
    { label: 'Phones', to: '/products?category=phones' },
    { label: 'Laptops', to: '/products?category=laptops' },
    { label: 'Headphones', to: '/products?category=headphones' },
  ];

  const accountLinks = [
    { label: 'Sign In', to: '/login' },
    { label: 'My Orders', to: '/orders' },
    { label: 'Cart', to: '/cart' },
    { label: 'Checkout', to: '/checkout' },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-[#030712]/70">
      <div className="page-container pb-10 pt-0">
        <div className="surface-panel relative -mt-14 mb-12 overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_60%)] lg:block" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-label mb-4">
                <Shield size={14} /> Buy with confidence
              </p>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Premium gadgets, clearer choices, and support that actually responds.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                GadgetZone combines editorial curation, fast checkout, and reliable post-purchase help so shopping feels sharp from first click to delivery.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="btn-primary">
                Explore catalog <ArrowRight size={16} />
              </Link>
              <Link to="/orders" className="btn-secondary">
                Track your orders
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.75fr_0.75fr_0.9fr]">
          <div>
            <Link to="/" className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">
                  Gadget<span className="text-brand-300">Zone</span>
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Curated tech storefront
                </p>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Curated launches, trusted brands, and a cleaner shopping flow built for people who want premium tech without the clutter.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { value: '24h', label: 'Priority support' },
                { value: '2-3d', label: 'Fast delivery' },
                { value: '4.9', label: 'Average rating' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-display text-lg font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Shop</h4>
            <div className="mt-4 space-y-3">
              {shopLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="block text-sm text-slate-400 transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Account</h4>
            <div className="mt-4 space-y-3">
              {accountLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="block text-sm text-slate-400 transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Support</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="mailto:support@gadgetzone.store" className="flex items-start gap-3 transition-colors hover:text-white">
                <Mail size={16} className="mt-0.5 text-brand-300" />
                <span>support@gadgetzone.store</span>
              </a>
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 text-brand-300" />
                <span>Available daily for order and delivery help</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-brand-300" />
                <span>Kathmandu dispatch hub with nationwide delivery coverage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{year} GadgetZone. Premium gadgets with a cleaner shopping experience.</p>
          <p className="font-mono">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
