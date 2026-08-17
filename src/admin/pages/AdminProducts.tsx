import React, { useEffect, useState } from 'react';
import { adminGetAllProducts } from '../adminService';
import { Search, Package, RefreshCw } from 'lucide-react';
import { PageLoader } from './AdminDashboard';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminGetAllProducts().then(p => { setProducts(p); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products from catalog</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" />
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            {products.length === 0
              ? 'No products found. Ensure VITE_API_BASE_URL is set and the /products endpoint is available.'
              : 'No products match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div key={p.id || i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors">
              {p.image && (
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-white font-semibold text-sm truncate">{p.name || 'Unnamed'}</h3>
                {p.price !== undefined && (
                  <p className="text-emerald-400 font-mono text-sm font-bold">£{Number(p.price).toFixed(2)}</p>
                )}
                {p.category && (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                    {p.category}
                  </span>
                )}
                {p.description && (
                  <p className="text-gray-500 text-xs line-clamp-2">{p.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
