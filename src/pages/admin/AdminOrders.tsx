import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { updateOrderStatus } from '../../store/ordersSlice';
import { OrderStatus } from '../../types';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { toast } from 'sonner';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const dispatch = useAppDispatch();
  const { items: orders } = useAppSelector(s => s.orders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
    toast.success(`Order ${orderId} status updated to ${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Orders</h2>
        <p className="text-zinc-500 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="input pr-8 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...ALL_STATUSES] as const).map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterStatus === s
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'bg-surface-hover text-zinc-500 border border-surface-border hover:text-white'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map(order => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-white">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                      <p className="text-xs text-zinc-500">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
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
                      <span className="font-mono font-bold text-white">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="input text-xs py-1.5 pr-7 appearance-none cursor-pointer"
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s} className="capitalize">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expand`}>
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
                                  <span className="text-white font-mono">${(product.price * quantity).toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Shipping Details</p>
                            <div className="text-zinc-300 space-y-0.5">
                              <p>{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                              <p>{order.shippingAddress.phone}</p>
                            </div>
                            <p className="text-zinc-500 text-xs mt-3">
                              Payment: <span className="text-zinc-300">{order.paymentMethod}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
