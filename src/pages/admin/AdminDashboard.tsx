import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppStore';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { formatUsdToNpr } from '../../utils/currency';

export default function AdminDashboard() {
  const { items: products } = useAppSelector((s) => s.products);
  const { items: orders } = useAppSelector((s) => s.orders);
  const { user } = useAppSelector((s) => s.auth);

  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const lowStock = products.filter((product) => product.stock <= 10).length;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatUsdToNpr(totalRevenue),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      change: '+12.5%',
    },
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
      change: '+3',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      change: `${pendingOrders} pending`,
    },
    {
      label: 'Low Stock',
      value: lowStock,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      change: 'Need restock',
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Welcome back, {user?.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Here is what is happening across the store right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUpRight size={12} /> {change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-border p-5">
            <h3 className="font-display font-semibold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-brand-400 transition-colors hover:text-brand-300">
              View all
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-white">{order.id}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-bold text-white">
                    {formatUsdToNpr(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-border p-5">
            <h3 className="font-display font-semibold text-white">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-brand-400 transition-colors hover:text-brand-300">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-hover"
              >
                <span className="w-4 font-mono text-xs text-zinc-600">{index + 1}</span>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-9 w-9 rounded-lg border border-surface-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-zinc-500">
                    {product.brand} · {product.reviewCount.toLocaleString()} reviews
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatUsdToNpr(product.price)}</p>
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
