import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  ShoppingBag, 
  Package, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  History,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { dbService } from '../dbService';
import { Order, CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  orders: Order[];
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
}

export default function UserProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  orders,
  onAddToCart,
  onOpenCart
}: UserProfileDrawerProps) {
  const { formatPrice } = useCurrency();
  // Auth view: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter orders to only display the ones corresponding to this user
  const userOrders = orders.filter((order) => {
    if (!currentUser) return false;
    // Guest or logged-in users both can match orders by uid or senderEmail
    const emailMatch = currentUser.email && order.shipping?.senderEmail && 
      order.shipping.senderEmail.toLowerCase() === currentUser.email.toLowerCase();
    const uidMatch = order.userId === currentUser.uid;
    return uidMatch || emailMatch;
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all email and password fields.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        await dbService.signInWithEmail(email, password);
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          setSuccess(null);
          setEmail('');
          setPassword('');
        }, 1500);
      } else {
        await dbService.signUpWithEmail(email, password);
        setSuccess('Account created and registered successfully!');
        setTimeout(() => {
          setSuccess(null);
          setEmail('');
          setPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await dbService.signOut();
      setSuccess('Signed out successfully.');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderAll = (order: Order) => {
    order.items.forEach((item) => {
      onAddToCart({
        ...item,
        id: `${item.id}-reorder-${Date.now()}` // Generate new dynamic ID
      });
    });
    onClose();
    setTimeout(() => {
      onOpenCart();
    }, 400);
  };

  const handleReorderItem = (item: CartItem) => {
    onAddToCart({
      ...item,
      id: `${item.id}-reorder-${Date.now()}`
    });
    onClose();
    setTimeout(() => {
      onOpenCart();
    }, 400);
  };

  const isGuest = !currentUser || currentUser.isAnonymous;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            className="relative w-full max-w-md bg-site-bg h-full shadow-2xl flex flex-col z-10 border-l border-stone-200"
          >
            {/* Drawer Header */}
            <div className="p-6 bg-primary text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-black italic tracking-wide">Customer Profile</h2>
                  <p className="text-[10px] text-white/80 font-mono uppercase tracking-widest">
                    {isGuest ? 'Guest Session' : 'Verified Member'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Feedback messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200/60 rounded-xl flex gap-3 text-red-800 text-xs items-start leading-relaxed animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl flex gap-3 text-emerald-800 text-xs items-start leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* AUTH BLOCK (Show login form if guest) */}
              {isGuest ? (
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-black italic text-primary flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Customer Account'}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed font-sans">
                      {authMode === 'signin' 
                        ? 'Access your saved address book, real-time shipment map, and complete order history instantly.' 
                        : 'Register an account to sync custom Rakhi crates, earn festive rewards, and track shipping.'}
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-3 pt-2">
                    {/* Email Input */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 font-mono">Email Address</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.name@example.co.uk"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden font-sans text-stone-800"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 font-mono">Password</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden font-sans text-stone-800"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Validating Security...</span>
                      ) : (
                        <>
                          <span>{authMode === 'signin' ? 'Sign In Securely' : 'Register Account'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Toggle Mode */}
                  <div className="pt-2 text-center border-t border-stone-100 mt-2">
                    <button 
                      onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      className="text-primary hover:underline text-[11px] font-bold font-mono uppercase tracking-wide flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      {authMode === 'signin' ? (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>New here? Create an Account</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" />
                          <span>Already have an account? Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* PROFILE CARD (Logged In User) */
                <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block">
                        Festive Crate Club
                      </span>
                      <h4 className="font-serif font-black italic text-stone-900 truncate text-sm">{currentUser.email}</h4>
                      <p className="text-[10px] text-stone-500 font-mono truncate">ID: {currentUser.uid}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cloud Sync Enabled</span>
                    </div>
                    
                    <button 
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* PAST ORDER HISTORY SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-black italic text-stone-900 flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-primary" /> Past Festive Orders
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-stone-500 px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-full">
                    {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100 text-stone-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-black italic text-stone-800 text-xs">No Orders Found</h4>
                      <p className="text-[11px] text-stone-500 max-w-[240px] mx-auto leading-relaxed">
                        Create and order a beautiful custom Rakhi wood box or pre-curated festive hamper to start your gifting legacy!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => {
                      // Format date gracefully
                      const orderDate = order.createdAt;
                      
                      // Tracking status styles
                      const statusMap = {
                        ordered: { label: 'Secured', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
                        assembled: { label: 'Assembled', bg: 'bg-amber-50 text-amber-800 border-amber-200/80' },
                        dispatched: { label: 'Dispatched', bg: 'bg-sky-50 text-sky-800 border-sky-200/80' },
                        'out-for-delivery': { label: 'Out for Delivery', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80' },
                        delivered: { label: 'Tied & Delivered', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' }
                      };

                      const currentStatus = statusMap[order.status] || { label: order.status, bg: 'bg-stone-100 text-stone-700 border-stone-200' };

                      return (
                        <div 
                          key={order.id} 
                          className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden"
                        >
                          {/* Order Header */}
                          <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center font-mono">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-bold">Order ID</span>
                              <span className="text-[11px] text-stone-800 font-bold">{order.id}</span>
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${currentStatus.bg}`}>
                              {currentStatus.label}
                            </span>
                          </div>

                          {/* Order items list */}
                          <div className="p-4 space-y-3.5 divide-y divide-stone-100">
                            {order.items.map((item, index) => (
                              <div key={item.id} className={`flex gap-3.5 items-start ${index > 0 ? 'pt-3.5' : ''}`}>
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-100 bg-stone-50 shrink-0 relative">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center scale-90 border border-white">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <h5 className="font-serif font-black italic text-xs text-stone-800 truncate leading-snug">
                                    {item.title}
                                  </h5>
                                  <p className="text-[10px] text-stone-500 font-sans line-clamp-1">
                                    {item.description}
                                  </p>
                                  
                                  {/* Custom details line */}
                                  {(item.details?.rakhiName || item.details?.crateBoxName) && (
                                    <p className="text-[9px] text-stone-400 font-mono bg-stone-50 border border-stone-200/40 px-1.5 py-0.5 rounded-md inline-block max-w-full truncate">
                                      {item.details.crateBoxName && `${item.details.crateBoxName}`}
                                      {item.details.rakhiName && ` • ${item.details.rakhiName}`}
                                    </p>
                                  )}

                                  {/* Individual quick add button */}
                                  <div className="pt-1 flex justify-between items-center">
                                    <span className="font-mono text-xs font-bold text-stone-700">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                    <button 
                                      onClick={() => handleReorderItem(item)}
                                      className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase text-primary hover:underline cursor-pointer"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" /> Buy Again
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer Actions */}
                          <div className="p-4 bg-stone-50/50 border-t border-stone-100 flex justify-between items-center flex-wrap gap-3">
                            <div className="font-mono text-[10px] text-stone-500">
                              <span>Sent to <strong>{order.shipping.recipientName}</strong>, {order.shipping.city}</span>
                              <span className="block text-[9px] text-stone-400">{orderDate}</span>
                            </div>

                            <button 
                              onClick={() => handleReorderAll(order)}
                              className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-all hover:scale-103 cursor-pointer shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Reorder Entire Crate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-200 font-mono text-[9px] text-center text-stone-400 shrink-0">
              Rakhi Crate • Handcrafted Hampers for UK Delivery
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
