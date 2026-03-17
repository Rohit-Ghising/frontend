import { OrderStatus } from '../../types';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',  icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',        icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',  icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-500/10 text-green-400 border-green-500/20',     icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-500/10 text-red-400 border-red-500/20',           icon: XCircle },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color, icon: Icon } = statusConfig[status];
  return (
    <span className={`badge border ${color} flex items-center gap-1`}>
      <Icon size={10} /> {label}
    </span>
  );
}
