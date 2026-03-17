import { useState } from 'react';
import { Search, Shield, User } from 'lucide-react';
import { mockUsers } from '../../data/products';
import { useAppSelector } from '../../hooks/useAppStore';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const { items: orders } = useAppSelector(s => s.orders);

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getUserOrderCount = (userId: string) =>
    orders.filter(o => o.userId === userId).length;

  const getUserTotalSpent = (userId: string) =>
    orders.filter(o => o.userId === userId).reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Users</h2>
        <p className="text-zinc-500 text-sm mt-0.5">{mockUsers.length} registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: mockUsers.length, color: 'text-brand-400' },
          { label: 'Admin Users', value: mockUsers.filter(u => u.role === 'admin').length, color: 'text-purple-400' },
          { label: 'Regular Users', value: mockUsers.filter(u => u.role === 'user').length, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="input pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['User', 'Role', 'Orders', 'Total Spent', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map(user => {
                const orderCount = getUserOrderCount(user.id);
                const totalSpent = getUserTotalSpent(user.id);
                return (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-brand-400">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge border flex items-center gap-1 w-fit ${
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-white">{orderCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-green-400">${totalSpent.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
