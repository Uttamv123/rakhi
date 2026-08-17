import React, { useEffect, useState } from 'react';
import { adminGetAllOrders } from '../adminService';
import { Order } from '../../types';
import { PageLoader } from './AdminDashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAllOrders().then(o => { setOrders(o); setLoading(false); });
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter(o => o.status !== 'cancelled').length : 0;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  // Revenue by day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), revenue: 0, orders: 0 };
  });
  orders.forEach(o => {
    try {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const idx = last14.findIndex(x => x.date === key);
      if (idx !== -1 && o.status !== 'cancelled') {
        last14[idx].revenue += o.amount || 0;
        last14[idx].orders += 1;
      }
    } catch { /* ignore */ }
  });

  // Status breakdown
  const statusData = ['ordered','assembled','dispatched','out-for-delivery','delivered','cancelled'].map(s => ({
    name: s, count: orders.filter(o => o.status === s).length,
  }));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Based on real order data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `£${totalRevenue.toFixed(2)}`, color: 'text-emerald-400' },
          { label: 'Total Orders', value: orders.length, color: 'text-blue-400' },
          { label: 'Avg Order Value', value: `£${avgOrderValue.toFixed(2)}`, color: 'text-amber-400' },
          { label: 'Delivery Rate', value: orders.length > 0 ? `${Math.round(delivered / orders.length * 100)}%` : '—', color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue over time */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Revenue — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={last14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} formatter={(v: any) => `£${Number(v).toFixed(2)}`} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by status bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Orders by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Total Orders', orders.length],
            ['Delivered', delivered],
            ['Cancelled', cancelled],
            ['Pending / In Progress', orders.length - delivered - cancelled],
          ].map(([k, v]) => (
            <div key={String(k)} className="bg-gray-800 rounded-xl p-3 flex justify-between">
              <span className="text-gray-400">{k}</span>
              <span className="text-white font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
