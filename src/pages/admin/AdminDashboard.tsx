import { useAppSelector } from '../../hooks/useAppStore';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { items: products } = useAppSelector(s => s.products);
  const { items: orders } = useAppSelector(s => s.orders);
  const { user } = useAppSelector(s => s.auth);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock <= 10).length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', change: '+12.5%' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', change: '+3' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', change: `${pendingOrders} pending` },
    { label: 'Low Stock', value: lowStock, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', change: 'Need restock' },
  ];

  const recentOrders = orders.slice(0, 5);
  const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white">
          Welcome back, {user?.name} 👋
        </h2>
        <p className="text-zinc-500 mt-1 text-sm">Here's what's happening in your store today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUpRight size={12} /> {change}
              </span>
            </div>
            <p className="font-display font-bold text-2xl text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <h3 className="font-display font-semibold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-hover transition-colors">
                <div>
                  <p className="text-sm font-mono font-medium text-white">{order.id}</p>
                  <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-bold text-white">${order.total.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <h3 className="font-display font-semibold text-white">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-hover transition-colors">
                <span className="text-xs font-mono text-zinc-600 w-4">{i + 1}</span>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-9 h-9 rounded-lg object-cover border border-surface-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.brand} · {product.reviewCount.toLocaleString()} reviews</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${product.price.toLocaleString()}</p>
                  <p className={`text-xs ${product.stock <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
