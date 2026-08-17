import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllOrders } from '../adminService';
import { Order } from '../../types';
import { ShoppingCart, TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  ordered: '#6b7280', assembled: '#d97706', dispatched: '#2563eb',
  'out-for-delivery': '#7c3aed', delivered: '#059669', cancelled: '#dc2626',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminGetAllOrders().then(o => { setOrders(o); setLoading(false); });
  }, []);

  const total = orders.length;
  const byStatus = (s: string) => orders.filter(o => o.status === s).length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.amount || 0), 0);

  const statusCounts = [
    { label: 'New / Ordered', count: byStatus('ordered'), color: 'bg-gray-500', icon: ShoppingCart },
    { label: 'Assembled', count: byStatus('assembled'), color: 'bg-amber-500', icon: Package },
    { label: 'Dispatched', count: byStatus('dispatched'), color: 'bg-blue-500', icon: Package },
    { label: 'Out for Delivery', count: byStatus('out-for-delivery'), color: 'bg-violet-500', icon: Package },
    { label: 'Delivered', count: byStatus('delivered'), color: 'bg-emerald-500', icon: CheckCircle },
  ];

  // Orders by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return { date: key, orders: 0, revenue: 0 };
  });
  orders.forEach(o => {
    try {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const idx = last7.findIndex(x => x.date === key);
      if (idx !== -1) { last7[idx].orders++; last7[idx].revenue += o.amount || 0; }
    } catch { /* ignore */ }
  });

  // Pie data
  const pieData = Object.entries(STATUS_COLORS).map(([status, color]) => ({
    name: status, value: byStatus(status), color,
  })).filter(d => d.value > 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={total} icon={ShoppingCart} color="bg-blue-600" />
        <StatCard label="Total Revenue" value={`£${revenue.toFixed(2)}`} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard label="Pending" value={byStatus('ordered')} icon={Clock} color="bg-amber-600" />
        <StatCard label="Delivered" value={byStatus('delivered')} icon={CheckCircle} color="bg-green-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Orders (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#b91c1c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Orders by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statusCounts.map(({ label, count, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{count}</div>
            <div className="text-gray-500 text-[11px] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">Recent Orders</h3>
          <button onClick={() => navigate('/admin/orders')} className="text-red-400 text-xs hover:text-red-300 cursor-pointer font-mono">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              {['Order ID','Customer','Date','Amount','Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.slice(0, 8).map(o => (
                <tr key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{o.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">{o.shipping?.senderName || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-300">£{(o.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-gray-500 text-xs mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ordered: 'bg-gray-700 text-gray-300',
    assembled: 'bg-amber-900 text-amber-300',
    dispatched: 'bg-blue-900 text-blue-300',
    'out-for-delivery': 'bg-violet-900 text-violet-300',
    delivered: 'bg-emerald-900 text-emerald-300',
    cancelled: 'bg-red-900 text-red-300',
  };
  const cls = map[status] || 'bg-gray-700 text-gray-300';
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${cls}`}>
      {status}
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
    </div>
  );
}
