import { Link } from 'react-router-dom';
import { Zap, Twitter, Github, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-card/30 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
            <span className="font-display font-bold text-white text-lg">
              Tech<span className="text-brand-400">Cart</span>
            </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Your destination for the latest and greatest in technology. Premium gadgets, unbeatable prices.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Github, Instagram, Mail].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-surface-hover transition-all">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products', to: '/products' },
                { label: 'Phones', to: '/products?category=phones' },
                { label: 'Laptops', to: '/products?category=laptops' },
                { label: 'Headphones', to: '/products?category=headphones' },
                { label: 'Smart Watches', to: '/products?category=smartwatches' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'My Account', to: '/login' },
                { label: 'Orders', to: '/orders' },
                { label: 'Cart', to: '/cart' },
                { label: 'Wishlist', to: '#' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help Center', to: '#' },
                { label: 'Track Order', to: '#' },
                { label: 'Return Policy', to: '#' },
                { label: 'Privacy Policy', to: '#' },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-zinc-500 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-surface-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">© 2025 TechCart. All rights reserved.</p>
          <p className="text-xs text-zinc-600 font-mono">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
