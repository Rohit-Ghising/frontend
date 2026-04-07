import { Fragment, useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchOrders, updateOrderStatus } from '../../store/ordersSlice';
import { OrderStatus } from '../../types';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { toast } from 'sonner';
import { formatUsdToNpr } from '../../utils/currency';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];

export default function AdminOrders() {
  const dispatch = useAppDispatch();
  const { items: orders, loading } = useAppSelector((s) => s.orders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filtered = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
    toast.success(`Order ${orderId} status updated to ${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Orders</h2>
        <p className="text-zinc-500 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID..."
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="input pr-8 appearance-none cursor-pointer"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading orders…</div>
          ) : (
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Order', 'Cart', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((order) => (
                <Fragment key={order.id}>
                  <tr
                    className="hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-white">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">#{order.cartId ?? '—'}</p>
                      <p className="text-xs text-zinc-500">Items: {order.items.length}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map(({ product }) => (
                          <img
                            key={product.id}
                            src={product.images[0]}
                            alt={product.name}
                            className="w-7 h-7 rounded-md border-2 border-surface-card object-cover"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-7 h-7 rounded-md border-2 border-surface-card bg-surface-hover flex items-center justify-center text-[10px] text-zinc-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                  <span className="font-mono font-bold text-white">{formatUsdToNpr(order.totalPrice)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="input text-xs py-1.5 pr-7 appearance-none cursor-pointer"
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-surface-hover/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Order Items</p>
                            <div className="space-y-2">
                              {order.items.map(({ product, quantity }) => (
                                <div key={product.id} className="flex items-center gap-2">
                                  <img src={product.images[0]} alt={product.name} className="w-8 h-8 rounded-md object-cover" />
                                  <span className="text-zinc-300 flex-1 line-clamp-1">{product.name}</span>
                                  <span className="text-zinc-500">×{quantity}</span>
                                  <span className="text-white font-mono">{formatUsdToNpr(product.price * quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Order Details</p>
                            <div className="text-zinc-300 space-y-0.5">
                              <p>Cart ID: {order.cartId ?? '—'}</p>
                              <p>Items: {order.items.length}</p>
                              <p>Status: {order.status}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          )}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
