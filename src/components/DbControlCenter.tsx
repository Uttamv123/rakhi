import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  X, 
  Settings, 
  FileCode, 
  RefreshCw, 
  Layers, 
  Key, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';
import { Order } from '../types';

interface DbControlCenterProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onClearLocalCache: () => void;
}

export default function DbControlCenter({ orders, isOpen, onClose, onClearLocalCache }: DbControlCenterProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'env' | 'schema' | 'aws'>('status');

  const envVars = [
    { name: 'VITE_FIREBASE_API_KEY', desc: 'Secure web API credential key' },
    { name: 'VITE_FIREBASE_AUTH_DOMAIN', desc: 'Authentication handler domain' },
    { name: 'VITE_FIREBASE_PROJECT_ID', desc: 'Cloud Firestore unique project ID' },
    { name: 'VITE_FIREBASE_STORAGE_BUCKET', desc: 'Storage bucket url' },
    { name: 'VITE_FIREBASE_MESSAGING_SENDER_ID', desc: 'Push messaging sender sender key' },
    { name: 'VITE_FIREBASE_APP_ID', desc: 'Registered Web Application App ID' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Sidebar Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-black italic tracking-wide">Architecture Control Center</h2>
                  <p className="text-[10px] text-white/80 font-mono">Backend Data & Cloud Engine</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Sub-Header Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 font-mono text-[10px] uppercase tracking-wider font-bold">
              <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'status' ? 'border-primary text-primary bg-white' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                Sync Status
              </button>
              <button 
                onClick={() => setActiveTab('env')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'env' ? 'border-primary text-primary bg-white' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                Firebase Keys
              </button>
              <button 
                onClick={() => setActiveTab('schema')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'schema' ? 'border-primary text-primary bg-white' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                Collections Schema
              </button>
              <button 
                onClick={() => setActiveTab('aws')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'aws' ? 'border-primary text-primary bg-white' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                AWS & Custom APIs
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeTab === 'status' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-5 rounded-xl border ${isFirebaseConfigured ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-amber-50/50 border-amber-200/60'} flex gap-4 items-start`}>
                    <div className={`p-2.5 rounded-lg shrink-0 ${isFirebaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <Server className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-sm font-black italic text-stone-900">
                        {isFirebaseConfigured ? 'Connected to Live Cloud Firestore' : 'Running in Sandbox Offline Demo'}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        {isFirebaseConfigured 
                          ? 'Your application is connected to a live Google Firebase cloud database. All checkout orders, user carts, and state sync across devices in real-time!'
                          : 'Due to sandboxed environment security parameters, live Firestore is offline. The system is operating in a resilient client-side offline mode. Orders and personalized cards are saved to localStorage instantly.'}
                      </p>
                      
                      <div className="pt-2 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'} inline-block`} />
                        <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                          {isFirebaseConfigured ? 'Cloud Synced' : 'Local Storage Cache'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synchronized Metrics */}
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                      <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block">Synced Orders</span>
                      <span className="text-2xl font-bold text-primary">{orders.length}</span>
                      <span className="text-[9px] text-stone-400 block">Orders stored securely</span>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                      <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block">Live Tables</span>
                      <span className="text-2xl font-bold text-primary">2</span>
                      <span className="text-[9px] text-stone-400 block">"orders" & "carts" active</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-serif text-xs font-black italic text-stone-800">Local Testing Tools</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                      Clear cache during testing to trigger pristine mock deliveries and simulation states.
                    </p>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your local database cache? This will reset all simulated orders.')) {
                          onClearLocalCache();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200/80 rounded-lg text-xs font-bold font-mono text-stone-700 transition-colors border border-stone-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-stone-600" /> Clear Local Order Database
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'env' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex gap-3">
                    <Key className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-xs font-black italic text-stone-900">How to Connect Your Real Database</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        You can connect this application to your own custom Firebase account. Copy these environment variables, and paste them in the <strong>Settings & Secrets Menu</strong> in Google AI Studio:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    {envVars.map((v, i) => (
                      <div key={i} className="p-3 bg-stone-950 text-stone-200 rounded-lg space-y-1 border border-stone-800 shadow-inner">
                        <div className="flex justify-between items-center">
                          <span className="text-amber-400 font-bold">{v.name}</span>
                          <span className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold">Ready</span>
                        </div>
                        <p className="text-[10px] text-stone-400 italic font-sans">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="space-y-5 font-mono text-[11px]">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex gap-3">
                    <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-xs font-black italic text-stone-900">Strict Non-Relational NoSQL Schema</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        Firestore database collections are organized with simple, fast JSON structures for optimal web speed.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-800 font-bold uppercase text-[10px] tracking-wider">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        Collection: <span>orders</span>
                      </div>
                      <pre className="p-3.5 bg-stone-50 border border-stone-200/60 rounded-xl text-[10px] text-stone-700 overflow-x-auto leading-relaxed">
{`{
  id: "RC-2026-928401", // string (key)
  createdAt: "2026-07-20 10:15 AM",
  amount: 41.99, // number
  paymentMethod: "stripe", // 'stripe' | 'paypal'
  status: "ordered", // shipping tracking enum
  items: [
    {
      id: "silver-mahabali",
      type: "standalone-thread",
      title: "Sterling Silver Veer Bajrang",
      price: 14.99,
      quantity: 1
    }
  ],
  shipping: {
    recipientName: "Rahul Sharma",
    postcode: "W8 4PT",
    city: "London"
  }
}`}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-800 font-bold uppercase text-[10px] tracking-wider">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        Collection: <span>carts</span>
                      </div>
                      <pre className="p-3.5 bg-stone-50 border border-stone-200/60 rounded-xl text-[10px] text-stone-700 overflow-x-auto leading-relaxed">
{`{
  id: "userId_string", // document key
  updatedAt: "2026-07-20T11:42:00Z",
  cart: [
    {
      id: "custom-crate-id",
      type: "custom-crate",
      price: 45.00,
      quantity: 1
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'aws' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex gap-3.5">
                    <Award className="w-6 h-6 text-emerald-700 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-xs font-black italic text-stone-900">Custom API & AWS Portability</h4>
                      <p className="text-xs text-stone-700 leading-relaxed font-sans">
                        <strong>Your database architecture is fully customizable and not permanent.</strong> We engineered the database layer using an abstract service model in <code>src/dbService.ts</code>.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-4 font-sans text-xs text-stone-700 leading-relaxed">
                    <h5 className="font-serif text-xs font-black italic text-stone-800 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-primary" /> Why this is AWS / MongoDB ready:
                    </h5>
                    
                    <ul className="space-y-3 list-disc pl-4 text-stone-600 leading-relaxed">
                      <li>
                        <strong>Standardized Interface:</strong> All components fetch data through <code>dbService.saveOrder</code> and <code>dbService.getCart</code> rather than interacting with Firestore SDK commands directly.
                      </li>
                      <li>
                        <strong>Zero UI Rewriting:</strong> When you migrate to AWS (using DocumentDB, DynamoDB, MongoDB, or AWS Lambdas), you simply rewrite the fetch statements inside <code>src/dbService.ts</code> to trigger standard REST API requests.
                      </li>
                      <li>
                        <strong>Secure Gateway:</strong> For payments (Stripe, Paypal) and orders, keeping the business logic inside the unified service handles secret key protections perfectly.
                      </li>
                    </ul>
                    
                    <div className="bg-white p-3.5 rounded-lg border border-stone-200 text-[10px] text-stone-500 font-mono">
                      <span>✓ Ready for AWS MongoDB, AWS Amplify, Postgres, or SQL.</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-200 font-mono text-[10px] text-center text-stone-400 shrink-0">
              Rakhi Crate Architecture Control Center • Powered by Gemini Engine
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
