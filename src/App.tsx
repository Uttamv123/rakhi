/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Truck, 
  User, 
  ArrowRight, 
  Star, 
  Sparkles, 
  Package, 
  Lock, 
  Trash2, 
  Minus, 
  Plus, 
  Gift, 
  Mail, 
  HelpCircle,
  Clock,
  Heart,
  Share2,
  Bookmark,
  MapPin,
  FileText,
  Database
} from 'lucide-react';

import AgeVerificationModal from './components/AgeVerificationModal';
import CustomizeCrateBuilder from './components/CustomizeCrateBuilder';
import CheckoutDrawer from './components/CheckoutDrawer';
import OrderTracker from './components/OrderTracker';
import PersonalizeCardModal from './components/PersonalizeCardModal';
import DbControlCenter from './components/DbControlCenter';
import UserProfileDrawer from './components/UserProfileDrawer';

import { HERO_IMAGES, RELATION_IMAGES, PANTRY_IMAGES, PRE_CURATED_GIFTS, STANDALONE_THREADS } from './data';
import { CartItem, Order, SimulatedEmail, StandaloneThreadItem } from './types';
import { dbService } from './dbService';
import { isFirebaseConfigured } from './firebase';
import { useCurrency } from './context/CurrencyContext';

export default function App() {
  const { currency, setCurrency, formatPrice, convertPrice, currentCurrencyConfig, CURRENCIES } = useCurrency();
  const [isVerified, setIsVerified] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCrateBuilder, setShowCrateBuilder] = useState(false);
  const [crateBuilderInitialFilter, setCrateBuilderInitialFilter] = useState<'all' | 'brother' | 'kids' | 'bhaiya-bhabhi'>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Real-time card personalization state
  const [personalizingGift, setPersonalizingGift] = useState<CartItem | null>(null);
  const [editingCardItem, setEditingCardItem] = useState<CartItem | null>(null);
  
  // Standalone threads filter state
  const [selectedThreadTab, setSelectedThreadTab] = useState<'all' | 'normal' | 'premium'>('all');
  
  // Orders registry
  const [orders, setOrders] = useState<Order[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  // Countdown States
  const [countdown, setCountdown] = useState({ days: '38', hours: '22', minutes: '06', seconds: '01' });

  // Database Connection Panel state
  const [showDbControl, setShowDbControl] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  // Initialize and load from dbService
  useEffect(() => {
    // Sync auth state
    const unsubscribeAuth = dbService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      // Load cart for this user
      dbService.getCart(user.uid).then((savedCart) => {
        if (savedCart && savedCart.length > 0) {
          setCart(savedCart);
        }
      });
    });

    // Subscribe to real-time orders
    const unsubscribeOrders = dbService.subscribeToOrders((fetchedOrders) => {
      if (fetchedOrders.length === 0) {
        // Seed default order
        const demoOrderId = 'RC-2026-102941';
        const timestamp = new Date(Date.now() - 3600000).toLocaleString(); // 1 hour ago
        const demoOrder: Order = {
          id: demoOrderId,
          createdAt: timestamp,
          items: [
            {
              id: 'demo-item-1',
              type: 'pre-curated',
              title: 'The Traditional Mithai Crate',
              price: 38.00,
              image: PANTRY_IMAGES.sweets,
              description: 'A luxurious combination pairing a premium 24K Gold-Plated Ganesha Rakhi thread with a fresh 250g box of hand-rolled Silver Kaju Katli and Saffron Laddus.',
              details: {
                crateBoxName: 'Heritage Pine Wood Crate',
                rakhiName: '24K Gold Ganesha Thread',
                treatsNames: ['Artisanal Silver Kaju Katli (250g)', 'Saffron Motichoor Delight (250g)'],
                card: {
                  templateId: 'mandala-royal',
                  toName: 'Beloved Brother Rahul',
                  fromName: 'Priya Sharma',
                  message: 'Wishing you a very Happy Raksha Bandhan! Even though we are oceans apart, this Ganesha Rakhi carries all my protective thoughts and sweet memories. Enjoy the laddoos!'
                }
              },
              quantity: 1
            }
          ],
          shipping: {
            senderName: 'Priya Sharma',
            senderEmail: 'priya@gmail.com',
            recipientName: 'Rahul Sharma',
            recipientPhone: '+44 7911 123456',
            addressLine1: 'Flat 12, Westway Apartments',
            addressLine2: 'Kensington',
            city: 'London',
            postcode: 'W8 4PT',
            country: 'United Kingdom',
            deliveryDate: '2026-08-27'
          },
          paymentMethod: 'stripe',
          amount: 41.99,
          status: 'assembled',
          timeline: [
            { status: 'ordered', timestamp: '10:15 AM', title: 'Order Received', description: 'Gifting request validated and secured.', completed: true },
            { status: 'assembled', timestamp: '11:02 AM', title: 'Crate Customization', description: 'Gifts hand-assembled with wood wool padding.', completed: true },
            { status: 'dispatched', timestamp: '--', title: 'Dispatched to London Courier Hub', description: 'Handed over to Royal Mail Express Gifting.', completed: false },
            { status: 'out-for-delivery', timestamp: '--', title: 'Out for Local Delivery', description: 'Courier carrying the crate to recipient\'s door.', completed: false },
            { status: 'delivered', timestamp: '--', title: 'Delivered Successfully', description: 'The traditional thread tied and celebratory sweets shared.', completed: false }
          ]
        };
        dbService.saveOrder(demoOrder);
        setOrders([demoOrder]);
      } else {
        // Sort orders by id or date descending
        setOrders(fetchedOrders);
      }
    });

    const demoOrderId = 'RC-2026-102941';
    const demoEmail1: SimulatedEmail = {
      id: 'demo-email-1',
      orderId: demoOrderId,
      subject: `Order Confirmed: Rakhi Crate Gift #${demoOrderId} Registered`,
      sentAt: '10:15 AM',
      bodyHtml: `
        <div style="font-family: sans-serif; background-color: #fff8f7; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #6e000a; overflow: hidden; padding: 24px;">
            <h2 style="color: #6e000a; text-align: center; font-family: Georgia, serif;">Order Confirmed</h2>
            <p style="text-align: center; font-size: 13px;">Your custom gifting reservation has been registered under invoice <strong>${demoOrderId}</strong>.</p>
            <div style="background-color: #F5F2ED; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 12px;">
              <strong>Recipient:</strong> Rahul Sharma<br/>
              <strong>UK Address:</strong> Kensington, London, W8 4PT<br/>
              <strong>Requested Delivery:</strong> 2026-08-27
            </div>
            <p style="font-size: 11px; color: #888; text-align: center; margin-top: 20px;">Secure checkout powered by Stripe Gateway.</p>
          </div>
        </div>
      `,
      read: true
    };

    const demoEmail2: SimulatedEmail = {
      id: 'demo-email-2',
      orderId: demoOrderId,
      subject: `Assembled & Polished: Crate #${demoOrderId} has been Handcrafted`,
      sentAt: '11:02 AM',
      bodyHtml: `
        <div style="font-family: sans-serif; background-color: #fff8f7; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #6e000a; overflow: hidden; padding: 24px;">
            <h2 style="color: #735c00; text-align: center; font-family: Georgia, serif;">Hand-Assembled with Love</h2>
            <p style="text-align: center; font-size: 13px;">Priya, our team in London has finished assembling your <strong>Heritage Pine Wood Crate</strong> with fresh Silver Kaju Katli, Laddus, and your custom letter card! Ready for Royal Mail collection.</p>
            <p style="font-size: 11px; color: #888; text-align: center; margin-top: 20px;">Rakhi Crate Support team.</p>
          </div>
        </div>
      `,
      read: false
    };

    setEmails([demoEmail1, demoEmail2]);

    return () => {
      unsubscribeAuth();
      unsubscribeOrders();
    };
  }, []);

  // Countdown timer calculation
  useEffect(() => {
    const targetDate = new Date('August 28, 2026 00:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({
          days: d.toString(),
          hours: h < 10 ? '0' + h : h.toString(),
          minutes: m < 10 ? '0' + m : m.toString(),
          seconds: s < 10 ? '0' + s : s.toString()
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cart helper functions
  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const exists = prevCart.find((i) => i.id === item.id);
      const next = exists 
        ? prevCart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prevCart, item];
      dbService.saveCart(next, currentUser?.uid);
      return next;
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string, amount: number) => {
    setCart((prevCart) => {
      const next = prevCart.map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + amount;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0);
      dbService.saveCart(next, currentUser?.uid);
      return next;
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => {
      const next = prevCart.filter((item) => item.id !== id);
      dbService.saveCart(next, currentUser?.uid);
      return next;
    });
  };

  // Helper to clear local order cache during testing
  const handleClearLocalCache = () => {
    localStorage.removeItem('rakhi_crate_orders');
    localStorage.removeItem('rakhi_crate_cart');
    setCart([]);
    // Reload defaults
    window.location.reload();
  };

  // Checkout hook completion
  const handleOrderCompleted = (newOrder: Order) => {
    dbService.saveOrder(newOrder);
    setOrders((prev) => [...prev.filter(o => o.id !== newOrder.id), newOrder]);
    
    // Clear cart in DB
    dbService.saveCart([], currentUser?.uid);
    setCart([]);
    
    // Auto trigger first email
    const firstEmail: SimulatedEmail = {
      id: `email-${Date.now()}`,
      orderId: newOrder.id,
      subject: `Order Confirmed: Rakhi Crate Gift #${newOrder.id} Registered`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bodyHtml: `
        <div style="font-family: sans-serif; background-color: #fff8f7; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #6e000a; overflow: hidden; padding: 24px;">
            <h2 style="color: #6e000a; text-align: center; font-family: Georgia, serif;">Gifting Order Registered</h2>
            <p style="text-align: center; font-size: 13px;">Thank you! Your custom gift basket has been secured. Our designers in London are preparing the packaging.</p>
            <div style="background-color: #F5F2ED; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 12px;">
              <strong>Recipient:</strong> ${newOrder.shipping.recipientName}<br/>
              <strong>UK Address:</strong> ${newOrder.shipping.addressLine1}, ${newOrder.shipping.city}<br/>
              <strong>Requested Delivery Date:</strong> ${newOrder.shipping.deliveryDate}
            </div>
            <p style="font-size: 11px; color: #888; text-align: center; margin-top: 20px;">Rakhi Crate Ltd. London Operations.</p>
          </div>
        </div>
      `,
      read: false
    };

    setEmails((prev) => [...prev, firstEmail]);

    // Close checkout and open tracker modal
    setShowCheckout(false);
    setShowTracker(true);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedTimeline = o.timeline.map(t => {
          if (t.status === status) {
            return { ...t, completed: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          }
          return t;
        });
        return { ...o, status, timeline: updatedTimeline };
      }
      return o;
    }));
  };

  const addSimulatedEmail = (orderId: string, email: SimulatedEmail) => {
    setEmails(prev => [...prev, email]);
  };

  const markEmailRead = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read: true } : e));
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-site-bg text-charcoal-text min-h-screen relative font-sans">
      
      {/* Age Verification Overlay Gate */}
      <AgeVerificationModal onVerified={() => setIsVerified(true)} />

      {/* FIXED TOP NAVIGATION */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] h-20 flex items-center border-b border-stone-100">
        <div className="flex justify-between items-center px-margin-mobile md:px-gutter max-w-container-max mx-auto w-full">
          
          <div className="flex items-center gap-10">
            <a className="font-serif text-2xl font-black italic text-primary tracking-tight" href="#">
              RAKHI CRATE
            </a>
            <nav className="hidden md:flex gap-8">
              <button 
                onClick={() => setShowCrateBuilder(true)} 
                className="text-primary border-b-2 border-primary pb-1 font-bold text-xs uppercase tracking-widest cursor-pointer"
              >
                Crate Customizer
              </button>
              <a href="#pre-curated-racks" className="text-stone-600 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
                Festive Hampers
              </a>
              <a href="#threads-gallery" className="text-stone-600 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
                Sacred Threads
              </a>
              <a href="#festive-pantry-rack" className="text-stone-600 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
                Gourmet Sweets
              </a>
              <button 
                onClick={() => setShowTracker(true)}
                className="text-stone-600 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-hidden"
              >
                Shipment Tracker
                <span className="w-2 h-2 rounded-full bg-primary block animate-pulse" />
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {/* Dynamic Currency Hub Selector */}
            <div className="relative inline-block text-left" title="Select Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="appearance-none bg-stone-50 hover:bg-stone-100 px-3 py-2 pr-8 rounded-lg border border-stone-200 text-stone-600 font-mono text-xs font-bold transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary/40"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%234a4a4a' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' class='lucide lucide-chevron-down' viewBox='0 0 24 24'><path d='m6 9 6 6 6-6'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px'
                }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <button 
              onClick={() => setShowTracker(true)}
              className="text-stone-600 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-hidden"
            >
              <Truck className="w-5 h-5 text-primary" />
              <span className="hidden sm:inline text-xs font-bold font-mono">UK Courier</span>
            </button>
            
            <button 
              onClick={() => setShowProfile(true)}
              className="text-stone-600 hover:text-primary transition-colors cursor-pointer relative flex items-center gap-1 bg-stone-50 hover:bg-stone-100 p-2 rounded-lg border border-stone-200/50"
              title="Customer Profile & Order History"
              id="customer-profile-btn"
            >
              <User className="w-5 h-5" />
              {currentUser && !currentUser.isAnonymous && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              )}
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-lg transition-all text-primary cursor-pointer border border-primary/20"
              id="open-cart-btn"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">{cartTotalItems}</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <main className="pt-20">
        <section className="relative h-[85vh] min-h-[580px] flex items-center overflow-hidden bg-warm-cream">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary-gold/20 via-transparent to-transparent" />
          </div>
          
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid md:grid-cols-2 gap-10 items-center relative z-10 w-full">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full shadow-sm">
                <Truck className="w-4 h-4 text-primary animate-bounce" />
                <span className="font-bold text-[10px] uppercase tracking-widest font-mono">UK Delivery Only</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight">
                Send love to UK from <span className="italic font-normal font-serif">anywhere</span> in the world
              </h1>
              
              <p className="text-charcoal-text/80 text-sm md:text-base leading-relaxed max-w-lg font-sans">
                Celebrate the bond with our premium Rakhi collection &amp; curated festive hampers. Authentically hand-woven threads, freshly sealed traditional sweets, and custom printed calligraphy message cards, delivered exclusively to any doorstep across England, Scotland, and Wales.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => setShowCrateBuilder(true)}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  Customize Crate Option <Sparkles className="w-4 h-4 text-white" />
                </button>
                <a 
                  href="#pre-curated-racks"
                  className="border border-primary text-primary px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all text-center flex items-center justify-center"
                >
                  View All Gifts
                </a>
              </div>
            </div>

            {/* High-fidelity hero image matching screenshot perfectly */}
            <div className="hidden md:block relative">
              <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 aspect-[1.37] bg-white border border-primary/10">
                <img 
                  alt="Celebrate the bond, premium rakhi collection" 
                  className="w-full h-full object-cover object-left" 
                  src={HERO_IMAGES.mainPlate}
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-gold/20 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITION GRID */}
        <section className="py-16 bg-white border-y border-stone-100">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              
              <div className="flex flex-col items-center text-center p-6 space-y-2">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">public</span>
                <h3 className="font-serif text-lg font-black italic text-primary">Global Access</h3>
                <p className="text-xs text-charcoal-text/80 max-w-xs leading-relaxed font-sans">
                  Seamless ordering from India, USA, Canada, Australia, or anywhere you call home. Secure currency checkouts.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 space-y-2 bg-warm-cream rounded-2xl shadow-md scale-105 border border-primary/20 relative">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">local_shipping</span>
                <h3 className="font-serif text-lg font-black italic text-primary">UK Exclusive Soul</h3>
                <p className="text-xs text-charcoal-text/80 max-w-xs leading-relaxed font-sans">
                  We specialize in UK distribution centers. Rapid 24-48h courier dispatch ensuring sweets stay exceptionally fresh.
                </p>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-bold uppercase px-3 py-1 rounded-full font-mono tracking-wider">
                  Operational Hub
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-6 space-y-2">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">auto_awesome</span>
                <h3 className="font-serif text-lg font-black italic text-primary">Artisanal Quality</h3>
                <p className="text-xs text-charcoal-text/80 max-w-xs leading-relaxed font-sans">
                  Handpicked threads decorated with American diamonds and sandalwood beads. Authentically packed.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SHOP BY RELATION (CRATES LINKED TO CUSTOMIZER) */}
        <section className="py-20 bg-site-bg" id="relation-crates">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest block font-mono">The Perfect Bond</span>
                <h2 className="font-serif text-3xl font-black italic text-primary mt-1">Shop Rakhi by Relation</h2>
              </div>
              <button 
                onClick={() => {
                  setCrateBuilderInitialFilter('all');
                  setShowCrateBuilder(true);
                }}
                className="text-primary hover:underline font-bold text-xs uppercase tracking-widest flex items-center gap-1 font-mono cursor-pointer"
              >
                Custom Design Crate <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Brother Crate */}
              <div 
                onClick={() => {
                  setCrateBuilderInitialFilter('brother');
                  setShowCrateBuilder(true);
                }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-primary/40 cursor-pointer"
              >
                <div className="aspect-[1.37] overflow-hidden bg-warm-cream">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt="For Brother Collection" 
                    src={RELATION_IMAGES.brother}
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-serif text-lg font-black italic text-charcoal-text">For Brother</h4>
                  <p className="text-charcoal-text/70 text-xs mt-1 mb-4">Timeless designs for a lifelong bond.</p>
                  <span className="inline-block text-primary border-b border-primary/30 group-hover:border-primary pb-0.5 font-bold text-xs uppercase tracking-widest transition-all">
                    Launch Crate Builder
                  </span>
                </div>
              </div>

              {/* Kids Crate */}
              <div 
                onClick={() => {
                  setCrateBuilderInitialFilter('kids');
                  setShowCrateBuilder(true);
                }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-primary/40 cursor-pointer"
              >
                <div className="aspect-[1.37] overflow-hidden bg-warm-cream">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt="For Kids Collection" 
                    src={RELATION_IMAGES.kids}
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-serif text-lg font-black italic text-charcoal-text">For Kids</h4>
                  <p className="text-charcoal-text/70 text-xs mt-1 mb-4">Cartoon &amp; playful threads for little ones.</p>
                  <span className="inline-block text-primary border-b border-primary/30 group-hover:border-primary pb-0.5 font-bold text-xs uppercase tracking-widest transition-all">
                    Launch Crate Builder
                  </span>
                </div>
              </div>

              {/* Bhaiya Bhabhi Couple Crate */}
              <div 
                onClick={() => {
                  setCrateBuilderInitialFilter('bhaiya-bhabhi');
                  setShowCrateBuilder(true);
                }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-primary/40 cursor-pointer"
              >
                <div className="aspect-[1.37] overflow-hidden bg-warm-cream">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt="For Bhaiya Bhabhi couple collection" 
                    src={RELATION_IMAGES.couple}
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-serif text-lg font-black italic text-charcoal-text">For Bhaiya Bhabhi</h4>
                  <p className="text-charcoal-text/70 text-xs mt-1 mb-4">Elegant sets for the cherished couple.</p>
                  <span className="inline-block text-primary border-b border-primary/30 group-hover:border-primary pb-0.5 font-bold text-xs uppercase tracking-widest transition-all">
                    Launch Crate Builder
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRE-CURATED CRATES SHELF (FOR FAST SHOPPING) */}
        <section className="py-20 bg-[#F5F2EB]" id="pre-curated-racks">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-primary text-xs font-bold uppercase tracking-widest font-mono">Bespoke Pre-Curated Hampers</span>
              <h2 className="font-serif text-4xl font-black italic text-primary mt-1">Ready-to-Ship Signature Crates</h2>
              <p className="text-xs text-charcoal-text/80 leading-relaxed mt-2 font-sans">
                Short on time? These curated master baskets pair our most requested sacred threads with artisanal silver-coated sweets and dry fruits, packaged for immediate Royal Mail shipment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PRE_CURATED_GIFTS.map((gift) => (
                <div 
                  key={gift.id}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-warm-cream overflow-hidden">
                    <img src={gift.image} alt={gift.name} className="w-full h-full object-cover hover:scale-[1.03] transition-all" />
                    {gift.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md font-mono">
                        {gift.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-serif text-base font-black italic text-charcoal-text leading-tight">{gift.name}</h3>
                        <span className="font-mono text-base font-bold text-primary shrink-0 font-sans">{formatPrice(gift.price)}</span>
                      </div>
                      <p className="text-xs text-charcoal-text/70 leading-relaxed line-clamp-3 font-sans">{gift.description}</p>
                    </div>

                    <div className="border-t border-dashed border-stone-200/60 pt-4 mt-4 space-y-3">
                      <div className="space-y-1 text-[10px] text-charcoal-text/50 uppercase tracking-wider font-mono">
                        <div className="flex justify-between font-medium">
                          <span>Thread:</span>
                          <span className="text-charcoal-text font-bold">{gift.rakhiName}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Treats:</span>
                          <span className="text-charcoal-text font-bold">{gift.sweetsName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPersonalizingGift({
                            id: `${gift.id}-${Date.now()}`,
                            type: 'pre-curated',
                            title: gift.name,
                            price: gift.price,
                            image: gift.image,
                            description: gift.description,
                            details: {
                              crateBoxName: 'Signature Crate',
                              rakhiName: gift.rakhiName,
                              treatsNames: [gift.sweetsName],
                              card: {
                                templateId: 'mandala-royal',
                                toName: '',
                                fromName: '',
                                message: 'Wishing you a magical and blessed Raksha Bandhan filled with sweetness and beautiful memories!'
                              }
                            },
                            quantity: 1
                          });
                        }}
                        className="w-full bg-primary text-white hover:bg-primary/90 transition-all py-3 rounded-lg text-xs font-bold uppercase tracking-widest border border-primary/20 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        Personalize &amp; Add <Sparkles className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SACRED THREADS GALLERY */}
        <section className="py-20 bg-warm-cream/30 border-t border-stone-200/60" id="threads-gallery">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-12 max-w-2xl mx-auto space-y-3">
              <span className="text-primary text-xs font-bold uppercase tracking-widest font-mono">Artisanal Sibling Protection</span>
              <h2 className="font-serif text-4xl font-black italic text-primary">Sacred Threads Gallery</h2>
              <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                Explore our dedicated range of hand-woven sacred threads, ranging from single traditional protection amulets to premium curated gift bundles complete with gourmet sweets and lucky brass keepsakes.
              </p>

              {/* Filtering tabs */}
              <div className="flex flex-wrap justify-center gap-2 pt-6 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedThreadTab('all')}
                  className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedThreadTab === 'all'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  All Threads ({STANDALONE_THREADS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreadTab('normal')}
                  className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedThreadTab === 'normal'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Normal Threads ({formatPrice(3.49)} - {formatPrice(5.99)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreadTab('premium')}
                  className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedThreadTab === 'premium'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Premium Sets ({formatPrice(14.99)} - {formatPrice(23.50)})
                </button>
              </div>
            </div>

            {/* Threads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {STANDALONE_THREADS.filter(t => selectedThreadTab === 'all' || t.type === selectedThreadTab).map((thread) => (
                <div
                  key={thread.id}
                  className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Badge */}
                  <div className="relative aspect-[4/3] bg-warm-cream overflow-hidden group border-b border-stone-100">
                    <img
                      src={thread.image}
                      alt={thread.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md font-mono shadow-sm ${
                        thread.type === 'premium' ? 'bg-primary text-white' : 'bg-stone-800 text-white'
                      }`}>
                        {thread.type === 'premium' ? 'Premium Set' : 'Normal Thread'}
                      </span>
                      {thread.badge && (
                        <span className="bg-[#E6C687] text-stone-900 font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded-md font-mono shadow-sm">
                          {thread.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-base font-black italic text-charcoal-text leading-tight">{thread.name}</h3>
                        <span className="font-mono text-base font-black text-primary shrink-0">{formatPrice(thread.price)}</span>
                      </div>
                      <p className="text-xs text-charcoal-text/75 leading-relaxed font-sans">{thread.description}</p>
                    </div>

                    {/* Materials & Composition details */}
                    <div className="bg-warm-cream/40 p-3 rounded-lg border border-stone-200/50 space-y-1">
                      <span className="font-bold text-primary uppercase text-[8px] tracking-wider block">Craftsmanship &amp; Materials</span>
                      <p className="italic text-stone-600 text-[10px] leading-relaxed font-sans">{thread.madeOf}</p>
                    </div>

                    {/* Pack Inclusions list */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-mono">What's Included:</span>
                      <ul className="text-[10px] text-charcoal-text/80 space-y-1 font-sans">
                        {thread.whatsIncluded.map((incl, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                            <span>{incl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const cartItem: CartItem = {
                            id: `${thread.id}-${Date.now()}`,
                            type: 'standalone-thread',
                            title: thread.name,
                            price: thread.price,
                            image: thread.image,
                            description: thread.description,
                            details: {
                              rakhiName: thread.name,
                              crateBoxName: thread.type === 'premium' ? 'Premium Presentation Box' : 'Complimentary Velvet Pouch',
                              treatsNames: thread.type === 'premium' ? ['Complimentary 100g Fresh Sweets/Chocolates Included'] : undefined,
                              card: {
                                templateId: 'mandala-royal',
                                toName: '',
                                fromName: '',
                                message: 'Wishing you a magical and blessed Raksha Bandhan filled with sweetness and beautiful memories!'
                              }
                            },
                            quantity: 1
                          };
                          handleAddToCart(cartItem);
                        }}
                        className="border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all font-bold uppercase tracking-wider py-2.5 rounded-lg text-center cursor-pointer"
                      >
                        Quick Add
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPersonalizingGift({
                            id: `${thread.id}-${Date.now()}`,
                            type: 'standalone-thread',
                            title: thread.name,
                            price: thread.price,
                            image: thread.image,
                            description: thread.description,
                            details: {
                              rakhiName: thread.name,
                              crateBoxName: thread.type === 'premium' ? 'Premium Presentation Box' : 'Complimentary Velvet Pouch',
                              treatsNames: thread.type === 'premium' ? ['Complimentary 100g Fresh Sweets/Chocolates Included'] : undefined,
                              card: {
                                templateId: 'mandala-royal',
                                toName: '',
                                fromName: '',
                                message: 'Wishing you a magical and blessed Raksha Bandhan filled with sweetness and beautiful memories!'
                              }
                            },
                            quantity: 1
                          });
                        }}
                        className="bg-primary text-white hover:bg-primary/95 transition-all font-bold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Personalize <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ASYMMETRIC FEATURED GRID (THE FESTIVE PANTRY) */}
        <section className="py-20 bg-site-bg border-t border-stone-100" id="festive-pantry-rack">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="font-serif text-4xl font-black italic text-primary">The Festive Pantry</h2>
              <p className="text-xs text-charcoal-text/80 mt-2 leading-relaxed font-sans">
                Curated combinations that pair the sacred threads with the UK's favorite traditional Indian festive indulgences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Large Feature: Sweets */}
              <div className="md:col-span-8 group relative rounded-2xl overflow-hidden shadow-sm bg-white border border-stone-100">
                <div className="grid md:grid-cols-2 h-full">
                  <div className="relative overflow-hidden h-64 md:h-full bg-warm-cream">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="Traditional sweets and Rakhi thread platters" 
                      src={PANTRY_IMAGES.sweets}
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-primary text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full font-mono">
                        Local UK Dispatch
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col justify-center space-y-4">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest font-mono">Bestseller Range</span>
                    <h3 className="font-serif text-xl font-black italic text-charcoal-text">Rakhi with Traditional Sweets</h3>
                    <p className="text-xs text-charcoal-text/70 leading-relaxed font-sans">
                      Freshly prepared artisanal Mithai (Laddoos, Kaju Katli) sealed in protective nitrogen-flushed packages. Delivered within 24-48 hours across the UK. Taste the authentic flavors of home.
                    </p>
                    <div>
                      <button 
                        onClick={() => setShowCrateBuilder(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        Customize Sweets Crate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Features */}
              <div className="md:col-span-4 flex flex-col gap-8">
                
                {/* Dry Fruits */}
                <div 
                  onClick={() => setShowCrateBuilder(true)}
                  className="flex-1 group relative rounded-2xl overflow-hidden shadow-sm bg-white border border-stone-100 p-4 flex flex-col justify-between cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="h-40 overflow-hidden rounded-xl bg-warm-cream">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="Gourmet nuts and roasted cashews" 
                      src={PANTRY_IMAGES.dryFruits}
                    />
                  </div>
                  <div className="text-center pt-4">
                    <h4 className="font-serif text-sm font-black italic text-charcoal-text">With Roasted Dry Fruits</h4>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest font-mono mt-1 block">View Range</span>
                  </div>
                </div>

                {/* Chocolates */}
                <div 
                  onClick={() => setShowCrateBuilder(true)}
                  className="flex-1 group relative rounded-2xl overflow-hidden shadow-sm bg-white border border-stone-100 p-4 flex flex-col justify-between cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="h-40 overflow-hidden rounded-xl bg-warm-cream">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="Rich artisanal chocolate clusters" 
                      src={PANTRY_IMAGES.chocolates}
                    />
                  </div>
                  <div className="text-center pt-4">
                    <h4 className="font-serif text-sm font-black italic text-charcoal-text">With Artisanal Chocolates</h4>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest font-mono mt-1 block">View Range</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* NARRATIVE BRAND STORY SECTION */}
        <section className="py-20 bg-white overflow-hidden border-t border-stone-100">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              <div className="relative">
                <div className="relative z-10 aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-stone-100 bg-warm-cream">
                  <img 
                    alt="Brother and sister emotional celebration" 
                    className="w-full h-full object-cover" 
                    src={HERO_IMAGES.storyCouple}
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary-gold/10 rounded-full blur-3xl -z-10 animate-pulse" />
              </div>

              <div className="space-y-6 md:pl-6">
                <span className="text-primary text-xs font-bold uppercase tracking-widest block font-mono">Our Heritage &amp; Mission</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-black italic text-primary leading-tight">Celebrate the Eternal Bond</h2>
                
                <p className="text-sm text-charcoal-text/80 leading-relaxed font-sans">
                  At Rakhi Crate, we believe the ritual of Raksha Bandhan is more than just a passing tradition—it is a timeless promise of protection, commitment, and love that transcends physical borders.
                </p>
                <p className="text-xs text-charcoal-text/70 leading-relaxed font-sans">
                  Every customized crate we curate is a tribute to this sacred sister-brother connection. From hand-crafted premium zari threads to premium sweets prepared by heritage confectioners in India, we ensure that even if you are thousands of miles away, your protective prayers arrive safely, beautifully packed with heart.
                </p>
                
                <div className="pt-2">
                  <button 
                    onClick={() => setShowCrateBuilder(true)}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Personalize a Gift Crate Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRADITION & HERITAGE CARDS SECTION */}
        <section className="py-20 bg-site-bg border-t border-stone-100">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-primary text-xs font-bold uppercase tracking-widest font-mono">Deeply Rooted Culture</span>
              <h2 className="font-serif text-4xl font-black italic text-primary mt-1">Tradition &amp; Heritage</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              
              <div className="p-6 rounded-2xl bg-[#F5F2EB] border border-stone-200/50 space-y-3 hover:border-primary/30 transition-all">
                <h3 className="font-serif text-base font-black italic text-primary">What is Rakhi?</h3>
                <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                  The Rakhi is a sacred colored thread, traditionally made of fine silk strands and decorated with beads or metallic dials, that represents a sister's love and protective prayers for her brother's longevity and health.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5F2EB] border border-stone-200/50 space-y-3 hover:border-primary/30 transition-all">
                <h3 className="font-serif text-base font-black italic text-primary">The Celebration</h3>
                <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                  Observing the "Bond of Protection," sisters apply kumkum, tie the thread on wrists, perform aarti, and feed sweets, while brothers pledge lifelong support and gift custom hampers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5F2EB] border border-stone-200/50 space-y-3 hover:border-primary/30 transition-all">
                <h3 className="font-serif text-base font-black italic text-primary">The Core Value</h3>
                <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                  Deeply valued as an unbreakable symbol of commitment, mutual trust, loyalty, and unconditional sibling care defining families in Indian culture across international borders.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5F2EB] border border-stone-200/50 space-y-3 hover:border-primary/30 transition-all">
                <h3 className="font-serif text-base font-black italic text-primary">The Timing</h3>
                <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                  Raksha Bandhan is observed on Shravana Purnima, the full moon day of the holy Hindu month of Shravana. For the year 2026, the festival falls on Friday, August 28.
                </p>
              </div>

            </div>

            {/* HIGH-FIDELITY COUNTDOWN TIMER TO RAKSHA BANDHAN 2026 */}
            <div className="relative bg-primary text-white rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-xl border border-primary/20">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black italic text-secondary-gold tracking-tight">Raksha Bandhan 2026</h3>
                  <p className="text-xs text-white/90 mt-1 font-sans">
                    Mark your calendar for <strong className="text-secondary-gold font-mono font-bold">August 28, 2026</strong>. Custom orders for London courier dispatch close soon!
                  </p>
                </div>

                {/* Counter blocks */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-black/25 backdrop-blur-md border border-white/10 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex items-center justify-center mb-2">
                      <span className="font-serif text-3xl sm:text-4xl font-black italic text-secondary-gold tracking-tight">{countdown.days}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Days</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-black/25 backdrop-blur-md border border-white/10 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex items-center justify-center mb-2">
                      <span className="font-serif text-3xl sm:text-4xl font-black italic text-secondary-gold tracking-tight">{countdown.hours}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Hours</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-black/25 backdrop-blur-md border border-white/10 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex items-center justify-center mb-2">
                      <span className="font-serif text-3xl sm:text-4xl font-black italic text-secondary-gold tracking-tight">{countdown.minutes}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Mins</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-black/25 backdrop-blur-md border border-white/20 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex items-center justify-center mb-2 border-primary/40">
                      <span className="font-serif text-3xl sm:text-4xl font-black italic text-secondary-gold tracking-tight">{countdown.seconds}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Secs</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>



        {/* CUSTOMER REVIEWS (VOICE OF OUR CRATE FAMILY) */}
        <section className="py-20 bg-site-bg border-t border-stone-100">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-stone-200/60 flex-1" />
              <h2 className="font-serif text-3xl font-black italic text-primary px-4 whitespace-nowrap">Voice of our Crate Family</h2>
              <div className="h-px bg-stone-200/60 flex-1" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-2xl relative border border-stone-100 space-y-4 shadow-sm">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary stroke-[0]" />)}
                </div>
                <p className="text-xs text-charcoal-text/85 leading-relaxed italic font-sans">
                  "I recently ordered a custom pine box for my brother Rahul in Manchester. He was amazed at how fresh the Kaju Katli tasted and how beautiful the gold Ganesha thread was. Royal Mail delivered it exactly on our requested date."
                </p>
                <div>
                  <span className="font-bold text-xs text-primary block">Annie S.</span>
                  <span className="text-[10px] text-charcoal-text/40 font-mono">14 July • Verified Buyer</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl relative border border-primary/30 space-y-4 shadow-md">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary stroke-[0]" />)}
                </div>
                <p className="text-xs text-charcoal-text/85 leading-relaxed italic font-sans">
                  "The interactive preview is fantastic! Seeing the custom Ganesha card print layout in real-time made me feel confident. The emails triggered on each transit checkpoint were so comforting."
                </p>
                <div>
                  <span className="font-bold text-xs text-primary block">Anjali K.</span>
                  <span className="text-[10px] text-charcoal-text/40 font-mono">14 July • NRI Sibling</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl relative border border-stone-100 space-y-4 shadow-sm">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary stroke-[0]" />)}
                </div>
                <p className="text-xs text-charcoal-text/85 leading-relaxed italic font-sans">
                  "Incredibly premium packaging! The wood wool bedding and envelope wax stamp feels so royal. Much higher quality than standard cardboard courier mailers. Highly recommended for international NRIs."
                </p>
                <div>
                  <span className="font-bold text-xs text-primary block">Bhumi R.</span>
                  <span className="text-[10px] text-charcoal-text/40 font-mono">14 July • Verified Buyer</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* NEWSLETTER CAPTURE */}
        <section className="bg-primary py-16 text-white text-center relative overflow-hidden border-t border-primary/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C4A484_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10 space-y-6">
            <h2 className="font-serif text-4xl font-black italic text-secondary-gold">The Festival is Approaching</h2>
            <p className="text-sm text-white/95 max-w-lg mx-auto font-sans">
              Join the RAKHI CRATE community of over 12,000 global NRI siblings for early access to custom wooden crates, priority dispatch slots, and courier delivery alerts.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert("Wonderful! You've registered for VIP express dispatch updates."); }} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                className="flex-1 bg-black/15 border border-white/20 rounded-lg px-4 py-3 text-xs text-white placeholder-white/60 focus:bg-black/25 focus:outline-none focus:ring-1 focus:ring-secondary-gold font-mono"
                placeholder="Enter your email address" 
                type="email"
                required
              />
              <button 
                type="submit"
                className="bg-white text-primary px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-stone-100 transition-all cursor-pointer shadow-sm"
              >
                Sign Up
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-stone-100 text-charcoal-text">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-margin-mobile md:px-gutter py-12 max-w-container-max mx-auto text-xs">
          
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-black italic text-primary">RAKHI CRATE</h3>
            <p className="text-charcoal-text/75 leading-relaxed font-sans">
              Premium festive gifting hand-assembled with heart and cultural heritage, delivered exclusively within the United Kingdom.
            </p>
            <div className="flex gap-3">
              <button className="text-charcoal-text/70 hover:text-primary transition-colors p-2 rounded-lg bg-warm-cream border border-stone-100 cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="text-charcoal-text/70 hover:text-primary transition-colors p-2 rounded-lg bg-warm-cream border border-stone-100 cursor-pointer">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-primary uppercase tracking-widest font-sans">Collections</h4>
            <ul className="space-y-2 text-charcoal-text/75 font-mono text-[11px]">
              <li><button onClick={() => setShowCrateBuilder(true)} className="hover:text-primary transition-colors cursor-pointer text-left">Crate Customizer</button></li>
              <li><a href="#pre-curated-racks" className="hover:text-primary transition-colors">Festive Hampers</a></li>
              <li><a href="#festive-pantry-rack" className="hover:text-primary transition-colors">Traditional Sweets</a></li>
              <li><a href="#relation-crates" className="hover:text-primary transition-colors">Browse by Sibling Relation</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-primary uppercase tracking-widest font-sans">Customer Support</h4>
            <ul className="space-y-2 text-charcoal-text/75 font-mono text-[11px]">
              <li><a href="#" className="hover:text-primary transition-colors">Delivery Policy</a></li>
              <li><button onClick={() => setShowTracker(true)} className="hover:text-primary transition-colors cursor-pointer text-left bg-transparent border-none outline-hidden">Track Shipment Route</button></li>
              <li><a href="#" className="hover:text-primary transition-colors">PayPal &amp; Stripe Sandboxes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Our Story &amp; Artisans</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-primary uppercase tracking-widest font-sans">UK Delivery Focus</h4>
            <p className="text-charcoal-text/75 leading-relaxed font-sans">
              We operate central logistics directly inside the UK, servicing all addresses across England, Wales, Scotland, and Northern Ireland.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-primary font-bold uppercase tracking-widest text-[10px] font-mono">
              <MapPin className="w-4 h-4" /> Local UK Operations
            </div>
          </div>

        </div>

        <div className="border-t border-stone-100 py-6 px-margin-mobile md:px-gutter max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-charcoal-text/50 font-mono">
          <p>© 2026 Rakhi Crate Ltd. Premium Festive Gifting. UK Delivery Only. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE CUSTOMIZER CRATE BUILDER MODAL */}
      <AnimatePresence>
        {showCrateBuilder && (
          <CustomizeCrateBuilder 
            onCrateAdded={handleAddToCart}
            onClose={() => setShowCrateBuilder(false)}
            initialRelationFilter={crateBuilderInitialFilter}
          />
        )}
      </AnimatePresence>

      {/* SECURE CHECKOUT DRAWER */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutDrawer 
            cart={cart}
            onClose={() => setShowCheckout(false)}
            onOrderCompleted={handleOrderCompleted}
            onClearCart={() => setCart([])}
            userEmail={currentUser?.email || undefined}
            userId={currentUser?.uid || undefined}
          />
        )}
      </AnimatePresence>

      {/* FLOATING CART SIDE OVER PANEL */}
      <AnimatePresence>
        {isCartOpen && (
          <div id="cart-sidebar-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end text-charcoal-text">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer" onClick={() => setIsCartOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-100"
            >
              {/* Header */}
              <div className="p-6 bg-warm-cream flex justify-between items-center shrink-0 border-b border-stone-200/60">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-black italic text-primary">Your Gift Basket</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-stone-300" />
                    <p className="text-xs text-stone-400 italic">Your basket is empty.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); setShowCrateBuilder(true); }}
                      className="text-xs font-bold text-primary underline uppercase tracking-widest cursor-pointer font-mono"
                    >
                      Design a custom crate now
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-warm-cream/50 border border-stone-200/60 flex gap-3 relative shadow-xs">
                      <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-stone-200" />
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-serif text-xs font-black italic text-primary truncate">{item.title}</h4>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-stone-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-charcoal-text/70 line-clamp-2 leading-relaxed font-sans">{item.description}</p>
                        
                        {/* Selected configuration detail badge */}
                        {item.details && (
                          <div className="bg-white p-2.5 rounded-lg text-[9px] text-charcoal-text/80 space-y-0.5 border border-stone-200/60 font-mono">
                            {item.details.rakhiName && <div>• Thread: <span className="font-semibold text-charcoal-text">{item.details.rakhiName}</span></div>}
                            {item.details.treatsNames && item.details.treatsNames.length > 0 && (
                              <div className="truncate">• Treats: <span className="font-semibold text-charcoal-text">{item.details.treatsNames.join(', ')}</span></div>
                            )}
                            {item.details.card && (
                              <div className="pt-1.5 border-t border-dashed border-stone-100 mt-1 flex justify-between items-center">
                                <span className="text-primary font-black uppercase text-[8px] tracking-wider flex items-center gap-1">
                                  <FileText className="w-2.5 h-2.5 text-primary" /> Gift Card Added
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingCardItem(item)}
                                  className="text-[9px] text-primary hover:underline font-bold"
                                >
                                  Edit Message
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-mono text-xs font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                          
                          <div className="flex items-center border border-stone-200 bg-white rounded-lg">
                            <button onClick={() => handleUpdateCartQty(item.id, -1)} className="p-1 hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-primary">{item.quantity}</span>
                            <button onClick={() => handleUpdateCartQty(item.id, 1)} className="p-1 hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout CTA */}
              {cart.length > 0 && (
                <div className="p-6 bg-warm-cream border-t border-stone-200/60 space-y-4 shrink-0 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-charcoal-text/60 font-bold uppercase tracking-widest">Subtotal:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); setShowCheckout(true); }}
                    className="w-full bg-primary text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    Secure Checkout <Lock className="w-3.5 h-3.5 text-white" />
                  </button>
                  <p className="text-[10px] text-center text-charcoal-text/50 leading-normal font-sans">
                    Free shipping on orders over {formatPrice(45)}. Duty is fully pre-cleared for UK ports.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CARD PERSONALIZATION OVERLAYS */}
      <AnimatePresence>
        {personalizingGift && (
          <PersonalizeCardModal
            initialCard={personalizingGift.details?.card}
            onClose={() => setPersonalizingGift(null)}
            onSave={(updatedCard) => {
              const completeItem = {
                ...personalizingGift,
                details: {
                  ...personalizingGift.details,
                  card: updatedCard
                }
              };
              handleAddToCart(completeItem);
              setPersonalizingGift(null);
            }}
          />
        )}

        {editingCardItem && (
          <PersonalizeCardModal
            initialCard={editingCardItem.details?.card}
            onClose={() => setEditingCardItem(null)}
            title="Edit Gift Card Message"
            onSave={(updatedCard) => {
              setCart((prev) => 
                prev.map((item) => 
                  item.id === editingCardItem.id 
                    ? { ...item, details: { ...item.details, card: updatedCard } }
                    : item
                )
              );
              setEditingCardItem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* CUSTOMER PROFILE & ORDER HISTORY DRAWER */}
      <UserProfileDrawer 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        currentUser={currentUser}
        orders={orders}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* COURIER LOGISTICS & SHIPMENT TRACKER */}
      <OrderTracker 
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
        orders={orders}
        onUpdateOrderStatus={updateOrderStatus}
        onAddSimulatedEmail={addSimulatedEmail}
        emails={emails}
        onMarkEmailRead={markEmailRead}
      />

    </div>
  );
}

// Inline X Icon as Lucide-React helper
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
