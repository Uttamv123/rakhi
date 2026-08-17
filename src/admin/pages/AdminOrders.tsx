import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllOrders } from '../adminService';
import { Order } from '../../types';
import { Search, Filter, ChevronRight, RefreshCw } from 'lucide-react';
import { StatusBadge, PageLoader } from './AdminDashboard';

const ALL_STATUSES = ['all', 'ordered', 'assembled', 'dispatched', 'out-for-delivery', 'delivered'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    adminGetAllOrders().then(o => { setOrders(o); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let res = orders;
    if (statusFilter !== 'all') res = res.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.shipping?.senderName || '').toLowerCase().includes(q) ||
        (o.shipping?.senderEmail || '').toLowerCase().includes(q) ||
        (o.shipping?.recipientName || '').toLowerCase().includes(q)
      );
    }
    return res;
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, name, email…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === s ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Order ID','Customer','Email','Date','Items','Amount','Status',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">{o.shipping?.senderName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{o.shipping?.senderEmail || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{o.items?.length || 0}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-300 whitespace-nowrap">£{(o.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-600"><ChevronRight className="w-4 h-4" /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600 text-sm">
                    {orders.length === 0 ? 'No orders found.' : 'No orders match your filters.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
