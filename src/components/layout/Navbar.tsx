import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Zap, ChevronDown, LogOut, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { toggleCart } from '../../store/cartSlice';
import { logout } from '../../store/authSlice';
import { setSearch } from '../../store/productsSlice';
import { toast } from 'sonner';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useAppSelector(s => s.cart);
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      dispatch(setSearch(searchVal));
      navigate('/products');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/products?category=phones', label: 'Phones' },
    { to: '/products?category=laptops', label: 'Laptops' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0f0f11]/90 backdrop-blur-xl border-b border-surface-border' : 'bg-transparent'
      }`}>
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Tech<span className="text-brand-400">Cart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
              >
                <Search size={18} />
              </button>

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-400">{user?.name[0]}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 card py-1 shadow-xl z-50">
                      <div className="px-3 py-2 border-b border-surface-border">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                      >
                        <Package size={14} /> My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                        >
                          <Zap size={14} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-xs px-3 py-2">
                  <User size={14} /> Sign In
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-surface-border py-4 space-y-1 animate-fade-in">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl animate-slide-up"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search gadgets, brands, categories..."
                className="w-full pl-12 pr-4 py-4 bg-surface-card border border-surface-border rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 text-base shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-center text-xs text-zinc-600 mt-3">Press Enter to search • Esc to close</p>
          </form>
        </div>
      )}
    </>
  );
}
