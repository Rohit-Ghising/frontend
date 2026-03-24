import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppStore';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';

export default function OrdersPage() {
  const { items: orders } = useAppSelector((s) => s.orders);
  const userOrders = orders;

  return (
    <div className="pt-20 pb-20">
      <div className="page-container">
        <div className="py-8">
          <h1 className="font-display font-bold text-4xl text-white mb-2">My Orders</h1>
          <p className="text-zinc-500">{userOrders.length} order{userOrders.length !== 1 ? 's' : ''}</p>
        </div>

        {userOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-zinc-600" />
            </div>
            <h2 className="font-display font-semibold text-xl text-white mb-3">No orders yet</h2>
            <p className="text-zinc-500 mb-8">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map(order => (
              <div key={order.id} className="card p-5 hover:border-zinc-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-white">{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="font-bold text-white text-lg">${order.totalPrice.toFixed(2)}</span>
                </div>

                {/* Items preview */}
                <div className="flex gap-3 mb-4">
                  {order.items.slice(0, 4).map(({ product }) => (
                    <img
                      key={product.id}
                      src={product.images[0]}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-surface-border"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-14 h-14 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center">
                      <span className="text-xs text-zinc-500">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    <span className="font-medium text-zinc-400">Items:</span>{' '}
                    {order.items.length}
                  </div>

                  {/* Order timeline */}
                  <div className="flex items-center gap-1">
                    {(['pending', 'processing', 'shipped', 'delivered'] as const).map((s, i) => {
                      const normalizedStatus: string = order.status === 'completed' ? 'delivered' : order.status;
                      const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                      const currentIdx = statusOrder.indexOf(normalizedStatus as typeof statusOrder[number]);
                      const stepIdx = statusOrder.indexOf(s);
                      return (
                        <div
                          key={s}
                          className={`flex items-center ${i < 3 ? 'gap-1' : ''}`}
                        >
                          <div className={`w-2 h-2 rounded-full transition-colors ${
                            stepIdx <= currentIdx ? 'bg-brand-500' : 'bg-surface-border'
                          }`} />
                          {i < 3 && (
                            <div className={`w-6 h-px ${stepIdx < currentIdx ? 'bg-brand-500' : 'bg-surface-border'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
