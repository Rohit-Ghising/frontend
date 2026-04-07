import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { CATEGORY_META } from '../../constants/categoryMeta';
import { toggleCart } from '../../store/cartSlice';
import { logout } from '../../store/authSlice';
import { setSearch } from '../../store/productsSlice';
import { toast } from 'sonner';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/products?category=phones', label: 'Phones' },
  { to: '/products?category=laptops', label: 'Laptops' },
];

const quickSearches = ['iPhone', 'Galaxy', 'Gaming laptop', 'Wireless audio'];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useAppSelector((s) => s.cart);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const productSearch = useAppSelector((s) => s.products.filters.search);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setSearchVal(productSearch);
  }, [productSearch]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    const shouldLockScroll = searchOpen || mobileOpen;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen && !mobileOpen && !userMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, searchOpen, userMenuOpen]);

  const goToSearch = (query: string) => {
    dispatch(setSearch(query.trim()));
    navigate('/products');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    goToSearch(searchVal);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActiveLink = (to: string) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }
    if (to === '/') {
      return location.pathname === '/';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 pt-3">
        <div className="page-container">
          <div
            className={`surface-panel transition-all duration-300 ${
              scrolled
                ? 'border-white/16 bg-[#081120]/92 shadow-[0_30px_90px_rgba(2,6,23,0.55)]'
                : 'border-white/10 bg-[#081120]/78'
            }`}
          >
            <div className="flex h-20 items-center justify-between px-4 sm:px-5 lg:px-6">
              <div className="flex items-center gap-6">
                <Link to="/" className="group flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-105">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold tracking-tight text-white">
                      Gadget<span className="text-brand-300">Zone</span>
                    </p>
                    <p className="hidden text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:block">
                      Curated tech picks
                    </p>
                  </div>
                </Link>

                <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 lg:flex">
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isActiveLink(to)
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <form
                  onSubmit={handleSearch}
                  className="hidden items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition-colors focus-within:border-brand-400/40 xl:flex"
                >
                  <Search size={16} className="text-slate-500" />
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(event) => setSearchVal(event.target.value)}
                    placeholder="Search products, brands, or categories"
                    className="w-64 bg-transparent px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </form>

                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white xl:hidden"
                  aria-label="Open search"
                >
                  <Search size={18} />
                </button>

                <button
                  onClick={() => dispatch(toggleCart())}
                  className="relative flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 text-sm font-medium text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <ShoppingCart size={17} />
                  <span className="hidden sm:block">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-slate-950">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                {isAuthenticated ? (
                  <div ref={userMenuRef} className="relative hidden sm:block">
                    <button
                      onClick={() => setUserMenuOpen((open) => !open)}
                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-bold text-brand-200">
                        {(user?.name?.charAt(0) || 'U').toUpperCase()}
                      </div>
                      <div className="hidden text-left lg:block">
                        <p className="max-w-[9rem] truncate text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500">Account</p>
                      </div>
                      <ChevronDown size={15} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="surface-panel absolute right-0 top-full mt-3 w-60 overflow-hidden p-2">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-sm font-semibold text-white">{user?.name}</p>
                          <p className="truncate text-xs text-slate-500">{user?.email}</p>
                        </div>

                        <div className="mt-2 space-y-1">
                          <Link
                            to="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
                          >
                            <Package size={15} /> My Orders
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
                            >
                              <Zap size={15} /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="hidden sm:inline-flex btn-primary">
                    <User size={15} /> Sign In
                  </Link>
                )}

                <button
                  onClick={() => setMobileOpen((open) => !open)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:hidden"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {mobileOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-2 lg:hidden">
                <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(event) => setSearchVal(event.target.value)}
                      placeholder="Search your next upgrade"
                      className="input pl-10"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-4">
                    Go
                  </button>
                </form>

                <div className="space-y-2">
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                        isActiveLink(to)
                          ? 'bg-white text-slate-900'
                          : 'border border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {!isAuthenticated && (
                  <div className="mt-4">
                    <Link to="/login" className="btn-primary w-full">
                      <User size={15} /> Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[#020617]/90 px-4 pt-28 backdrop-blur-xl"
          onClick={() => setSearchOpen(false)}
        >
          <div onClick={(event) => event.stopPropagation()} className="page-container">
            <div className="surface-panel mx-auto max-w-4xl animate-slide-up p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="section-label mb-3">Smart Search</p>
                  <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                    Find the right gadget faster
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  value={searchVal}
                  onChange={(event) => setSearchVal(event.target.value)}
                  placeholder="Search gadgets, brands, or categories"
                  className="input w-full rounded-[1.35rem] py-4 pl-12 pr-28 text-base"
                />
                <button type="submit" className="btn-primary absolute bottom-2 right-2 top-2 px-5">
                  Search
                </button>
              </form>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="mb-3 text-sm font-semibold text-white">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchVal(term);
                          goToSearch(term);
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition-all hover:border-brand-400/30 hover:bg-brand-400/10 hover:text-white"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-white">Browse categories</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(CATEGORY_META).slice(0, 6).map(([id, meta]) => {
                      const Icon = meta.icon;

                      return (
                        <Link
                          key={id}
                          to={`/products?category=${id}`}
                          onClick={() => setSearchOpen(false)}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-semibold text-white">{meta.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{meta.description}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                Press Enter to search. Press Esc to close.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
