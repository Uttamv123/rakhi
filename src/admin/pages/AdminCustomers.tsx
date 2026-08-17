import React, { useEffect, useState } from 'react';
import { adminGetAllCustomers, AdminCustomer } from '../adminService';
import { Search, Users, RefreshCw } from 'lucide-react';
import { PageLoader } from './AdminDashboard';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminGetAllCustomers().then(c => { setCustomers(c); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c =>
    !search || c.email.toLowerCase().includes(search.toLowerCase()) || c.uid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} unique customers</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email or customer ID…"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" />
      </div>

      {loading ? <PageLoader /> : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-800">
                  {['Customer ID','Email','Orders','Total Spend','Last Order'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.uid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[160px] truncate">{c.uid}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 font-bold">{c.orderCount}</td>
                      <td className="px-4 py-3 text-sm font-mono text-emerald-400">£{c.totalSpend.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
