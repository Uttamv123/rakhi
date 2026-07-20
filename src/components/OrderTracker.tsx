/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Clock, 
  MapPin, 
  Mail, 
  Sparkles, 
  Package, 
  Truck, 
  CheckCircle, 
  Settings, 
  ChevronRight, 
  MessageSquare,
  Gift,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Order, SimulatedEmail } from '../types';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: Order['status']) => void;
  onAddSimulatedEmail: (orderId: string, email: SimulatedEmail) => void;
  emails: SimulatedEmail[];
  onMarkEmailRead: (emailId: string) => void;
}

export default function OrderTracker({ 
  orders, 
  onUpdateOrderStatus, 
  onAddSimulatedEmail,
  emails, 
  onMarkEmailRead 
}: OrderTrackerProps) {
  const [searchId, setSearchId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'emails'>('timeline');
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [searchError, setSearchError] = useState('');

  // Auto select the latest order on mount or list update
  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[orders.length - 1]);
      setSearchId(orders[orders.length - 1].id);
    }
  }, [orders, selectedOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSelectedOrder(null);
    setSelectedEmail(null);

    const query = searchId.trim().toUpperCase();
    if (!query) {
      setSearchError('Please enter an Order ID.');
      return;
    }

    const found = orders.find(o => o.id.toUpperCase() === query);
    if (found) {
      setSelectedOrder(found);
    } else {
      setSearchError(`Reference ${query} not found in current sandbox registry. Ensure checkout is complete!`);
    }
  };

  // Helper to trigger automated status updates and send a beautiful email simulation
  const advanceStatus = (nextStatus: Order['status']) => {
    if (!selectedOrder) return;
    
    // Update order in main state
    onUpdateOrderStatus(selectedOrder.id, nextStatus);

    // Get updated order from parent triggers
    const updatedTimeline = selectedOrder.timeline.map(t => {
      if (t.status === nextStatus) {
        return { ...t, completed: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return t;
    });

    const mockOrder = {
      ...selectedOrder,
      status: nextStatus,
      timeline: updatedTimeline
    };

    setSelectedOrder(mockOrder);

    // Generate automated email based on new state
    const emailSubject = getEmailSubject(nextStatus, selectedOrder.id);
    const emailHtml = generateEmailHtml(nextStatus, mockOrder);

    const newEmail: SimulatedEmail = {
      id: `email-${Date.now()}`,
      orderId: selectedOrder.id,
      subject: emailSubject,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bodyHtml: emailHtml,
      read: false
    };

    onAddSimulatedEmail(selectedOrder.id, newEmail);
    // Set to view email list
    setSelectedEmail(newEmail);
    setActiveSubTab('emails');
  };

  const getEmailSubject = (status: Order['status'], orderId: string) => {
    switch (status) {
      case 'ordered':
        return `Order Confirmed: Rakhi Crate Gift #${orderId} Registered`;
      case 'assembled':
        return `Assembled & Polished: Crate #${orderId} has been Handcrafted`;
      case 'dispatched':
        return `Shipped! Your Gift Crate #${orderId} is on its way via Royal Mail`;
      case 'out-for-delivery':
        return `Out for Delivery: Sibling Love arriving today! #${orderId}`;
      case 'delivered':
        return `Delivered: Celebration Complete for Order #${orderId}! ❤️`;
    }
  };

  const generateEmailHtml = (status: Order['status'], order: Order) => {
    const formattedAmount = `£${order.amount.toFixed(2)}`;
    const cardMsg = order.items[0]?.details?.card;
    const itemsDescription = order.items.map(item => `
      <div style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
        <div>
          <strong style="color: #6e000a;">${item.title}</strong> x${item.quantity}
          <div style="font-size: 11px; color: #555; margin-top: 4px;">
            ${item.details.crateBoxName ? `Box: ${item.details.crateBoxName}` : ''}
            ${item.details.rakhiName ? `<br/>Thread: ${item.details.rakhiName}` : ''}
            ${item.details.treatsNames && item.details.treatsNames.length > 0 ? `<br/>Treats: ${item.details.treatsNames.join(', ')}` : ''}
          </div>
        </div>
        <span style="font-family: monospace; font-weight: bold;">£${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const statusHeader = {
      ordered: { title: 'Order Confirmed', color: '#6e000a', text: 'Thank you! Your custom gift basket has been secured. Our designers in London are preparing the packaging.' },
      assembled: { title: 'Custom Assembled & Styled', color: '#735c00', text: 'Exceptional choice! Your custom crate has been hand-laid with organic wood wool, threads, and fresh delicacies.' },
      dispatched: { title: 'Dispatched with Courier', color: '#00247D', text: 'Fantastic news! Your cargo has left our central depot. Tracking information synced with Royal Mail Express.' },
      'out-for-delivery': { title: 'Out for Local Delivery', color: '#004990', text: 'Almost there! The courier vehicle is mapping out local postcodes. Estimated delivery by late afternoon.' },
      delivered: { title: 'Delivered Successfully!', color: '#115E59', text: 'Milestone reached! Sibling ties have been united, sweets unpacked, and celebratory moments created!' }
    }[status];

    return `
      <div style="font-family: 'Hanken Grotesk', system-ui, sans-serif; background-color: #fff8f7; padding: 20px; color: #1a1a1a;">
        <div style="max-width: 500px; margin: 0 auto; bg-color: #ffffff; background: #ffffff; border-radius: 12px; border: 2px solid #6e000a; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Banner -->
          <div style="background-color: #6e000a; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 1px;">RAKHI CRATE</h1>
            <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fed65b;">Premium UK Gifting Services</p>
          </div>

          <!-- Content Status -->
          <div style="padding: 24px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: ${statusHeader.color}; color: white; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                ${statusHeader.title}
              </span>
              <p style="font-size: 12px; color: #5a403e; margin-top: 12px; line-height: 1.6;">
                ${statusHeader.text}
              </p>
            </div>

            <!-- Recipient details -->
            <div style="background-color: #F5F2ED; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px;">
              <strong style="color: #6e000a; display: block; margin-bottom: 6px;">Shipment Destination:</strong>
              <strong>Recipient:</strong> ${order.shipping.recipientName}<br/>
              <strong>Address:</strong> ${order.shipping.addressLine1}, ${order.shipping.city}, ${order.shipping.postcode}<br/>
              <strong>Requested Delivery:</strong> ${order.shipping.deliveryDate}
            </div>

            <!-- Personal Letter Card Rendering -->
            ${cardMsg ? `
              <div style="border: 1px dashed #735c00; background-color: #FFFDF9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px;">
                <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #735c00; display: block; text-align: center; font-weight: bold; margin-bottom: 10px;">Letter Card Printed inside Box</span>
                <p style="margin: 0; font-weight: bold; color: #735c00;">To: ${cardMsg.toName}</p>
                <p style="font-style: italic; margin: 8px 0; color: #5a403e; line-height: 1.6;">"${cardMsg.message}"</p>
                <p style="margin: 0; text-align: right; font-weight: bold; color: #735c00;">With Love: ${cardMsg.fromName}</p>
              </div>
            ` : ''}

            <!-- Items summary -->
            <div style="margin-top: 20px;">
              <strong style="color: #6e000a; font-size: 13px; display: block; border-bottom: 2px solid #6e000a; padding-bottom: 4px;">Gift Basket Contents</strong>
              ${itemsDescription}
              <div style="text-align: right; margin-top: 10px; font-size: 14px; font-weight: bold; color: #6e000a;">
                Total Paid: ${formattedAmount}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888;">
              This is a secure developer simulated transaction update. For enquiries contact: sandbox@rakhicrate.co.uk
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return <Clock className="w-5 h-5 text-primary" />;
      case 'assembled': return <Package className="w-5 h-5 text-secondary-gold" />;
      case 'dispatched': return <Truck className="w-5 h-5 text-uk-badge-blue" />;
      case 'out-for-delivery': return <MapPin className="w-5 h-5 text-primary" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-teal-600" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 'border-[#C4A484]/30 text-[#C4A484] bg-[#C4A484]/5';
      case 'assembled': return 'border-[#C4A484]/40 text-[#C4A484] bg-[#C4A484]/10';
      case 'dispatched': return 'border-sky-500/30 text-sky-400 bg-sky-500/5';
      case 'out-for-delivery': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
      case 'delivered': return 'border-[#C4A484] text-[#C4A484] bg-[#C4A484]/20';
    }
  };

  const currentEmailList = selectedOrder 
    ? emails.filter(e => e.orderId === selectedOrder.id)
    : [];

  return (
    <section id="order-tracking-hub" className="py-20 bg-[#0F1115] border-t border-white/10 text-[#E5E1DA]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-[#C4A484] text-xs uppercase tracking-widest font-mono font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C4A484]" /> Real-Time Gift Tracker
          </span>
          <h2 className="font-serif text-4xl font-black italic text-[#C4A484] mt-1 tracking-tight">Live Shipment &amp; Email Hub</h2>
          <p className="text-xs text-[#E5E1DA]/70 max-w-lg mx-auto mt-2">
            Paste your Order ID reference below to view assembly checkpoints, transit maps, and read automated email alerts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E1DA]/40" />
              <input
                type="text"
                placeholder="Enter Reference (e.g. RC-2026-102941)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#1A1C20] border border-white/10 rounded-none text-xs text-[#E5E1DA] font-mono focus:border-[#C4A484] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#C4A484] text-black px-6 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-[#b59575] transition-all shadow-sm cursor-pointer"
            >
              Track
            </button>
          </form>
          
          {searchError && (
            <p className="text-xs text-red-400 mt-2 font-medium flex items-center gap-1 justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" /> {searchError}
            </p>
          )}

          {orders.length > 0 && !selectedOrder && (
            <div className="text-center mt-3">
              <span className="text-[10px] text-[#E5E1DA]/50 uppercase tracking-wider">Demo Orders Available in System:</span>
              <div className="flex gap-2 justify-center mt-1.5 flex-wrap">
                {orders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => { setSelectedOrder(o); setSearchId(o.id); setSearchError(''); }}
                    className="text-[10px] font-mono font-bold bg-[#1A1C20] px-2.5 py-1 border border-white/10 rounded-none text-[#C4A484] hover:bg-white/5 transition-all cursor-pointer"
                  >
                    {o.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active tracking board */}
        {selectedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 7 columns: Tracking display & Developer controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Order Info Plate */}
              <div className="bg-[#15171C] rounded-none p-6 border border-white/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-white/10 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#E5E1DA]/50 block">Reference Reference ID</span>
                    <h3 className="text-lg font-bold font-mono text-[#E5E1DA]">{selectedOrder.id}</h3>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#E5E1DA]/50 block text-left sm:text-right">Current Milestone</span>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-none border mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#E5E1DA]/50 block font-bold uppercase">Recipient Courier Address</span>
                    <p className="font-semibold text-[#E5E1DA] leading-relaxed">
                      {selectedOrder.shipping.recipientName}<br/>
                      {selectedOrder.shipping.addressLine1}<br/>
                      {selectedOrder.shipping.city}, {selectedOrder.shipping.postcode}<br/>
                      {selectedOrder.shipping.country}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-[#E5E1DA]/50 block font-bold uppercase">Estimated Arrival</span>
                      <p className="font-semibold text-[#C4A484] font-mono">{selectedOrder.shipping.deliveryDate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#E5E1DA]/50 block font-bold uppercase">Gateway Ledger</span>
                      <p className="font-semibold text-[#E5E1DA] capitalize">{selectedOrder.paymentMethod} (Sandbox Handshake)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Sandbox Controls */}
              <div className="bg-[#15171C] rounded-none p-6 border border-[#C4A484]/30 shadow-md relative">
                <div className="absolute top-4 right-4 text-[#C4A484] flex items-center gap-1 bg-[#C4A484]/10 px-2.5 py-1 rounded-none text-[9px] font-bold uppercase font-mono border border-[#C4A484]/20">
                  <Settings className="w-3 h-3 animate-spin" /> Interactive sandbox
                </div>
                
                <h4 className="font-serif font-black italic text-base text-[#C4A484] flex items-center gap-1.5 mb-1.5">
                  Gift Shipment State Simulator
                </h4>
                <p className="text-xs text-[#E5E1DA]/70 leading-relaxed max-w-md">
                  Since this is a simulated e-commerce application, click the states below to <strong>manually advance</strong> your gift's journey in real-time, instantly triggering email notification previews!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => advanceStatus('ordered')}
                    disabled={selectedOrder.status === 'ordered'}
                    className={`px-2 py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedOrder.status === 'ordered' 
                        ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#C4A484]' 
                        : 'bg-[#1A1C20] border-white/10 hover:bg-[#202227] hover:border-white/20 text-[#E5E1DA] hover:scale-[1.02]'
                    }`}
                  >
                    1. Order
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceStatus('assembled')}
                    disabled={selectedOrder.status === 'assembled'}
                    className={`px-2 py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedOrder.status === 'assembled' 
                        ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#C4A484]' 
                        : 'bg-[#1A1C20] border-white/10 hover:bg-[#202227] hover:border-white/20 text-[#E5E1DA] hover:scale-[1.02]'
                    }`}
                  >
                    2. Assemble
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceStatus('dispatched')}
                    disabled={selectedOrder.status === 'dispatched'}
                    className={`px-2 py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedOrder.status === 'dispatched' 
                        ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#C4A484]' 
                        : 'bg-[#1A1C20] border-white/10 hover:bg-[#202227] hover:border-white/20 text-[#E5E1DA] hover:scale-[1.02]'
                    }`}
                  >
                    3. Ship
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceStatus('out-for-delivery')}
                    disabled={selectedOrder.status === 'out-for-delivery'}
                    className={`px-2 py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedOrder.status === 'out-for-delivery' 
                        ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#C4A484]' 
                        : 'bg-[#1A1C20] border-white/10 hover:bg-[#202227] hover:border-white/20 text-[#E5E1DA] hover:scale-[1.02]'
                    }`}
                  >
                    4. Courier
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceStatus('delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    className={`px-2 py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                      selectedOrder.status === 'delivered' 
                        ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#C4A484]' 
                        : 'bg-[#1A1C20] border-white/10 hover:bg-[#202227] hover:border-white/20 text-[#E5E1DA] hover:scale-[1.02]'
                    }`}
                  >
                    5. Deliver
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT 5 columns: Tab interface (Timeline vs Emails) */}
            <div className="lg:col-span-5 bg-[#15171C] rounded-none border border-white/10 shadow-sm overflow-hidden flex flex-col h-[520px]">
              
              {/* Tab Selector */}
              <div className="flex border-b border-white/10 text-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('timeline')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                    activeSubTab === 'timeline' 
                      ? 'border-[#C4A484] text-[#C4A484] bg-[#1A1C20]' 
                      : 'border-transparent text-[#E5E1DA]/50 hover:text-[#C4A484]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Progress Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('emails')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border-b-2 relative cursor-pointer ${
                    activeSubTab === 'emails' 
                      ? 'border-[#C4A484] text-[#C4A484] bg-[#1A1C20]' 
                      : 'border-transparent text-[#E5E1DA]/50 hover:text-[#C4A484]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email Alerts
                  {currentEmailList.some(e => !e.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="flex-1 overflow-y-auto p-5">
                
                {/* SUB TAB 1: Live Timeline */}
                {activeSubTab === 'timeline' && (
                  <div className="relative pl-6 space-y-6 border-l border-white/10 ml-2 mt-2 text-left">
                    {selectedOrder.timeline.map((step, idx) => {
                      const isActive = selectedOrder.status === step.status;
                      const isComplete = step.completed || orders.length > 0; // Check completion
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Circle bullet node */}
                          <div className={`absolute -left-[31px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-[#C4A484] border-[#C4A484] text-black scale-110 shadow-md ring-4 ring-[#C4A484]/20' 
                              : step.completed 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-[#1A1C20] border-white/10 text-[#E5E1DA]/40'
                          }`}>
                            {isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            ) : step.completed ? (
                              <CheckCircle className="w-3.5 h-3.5 stroke-[3] text-white" />
                            ) : (
                              <span className="text-[9px] font-bold font-mono">{idx + 1}</span>
                            )}
                          </div>

                          {/* Detail text */}
                          <div>
                            <div className="flex justify-between items-baseline">
                              <h4 className={`text-xs font-bold uppercase tracking-wide ${isActive ? 'text-[#C4A484]' : 'text-[#E5E1DA]'}`}>
                                {step.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#E5E1DA]/50">{step.timestamp !== '--' ? step.timestamp : ''}</span>
                            </div>
                            <p className="text-xs text-[#E5E1DA]/70 mt-0.5 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUB TAB 2: Live Emails Simulator */}
                {activeSubTab === 'emails' && (
                  <div className="space-y-3 h-full flex flex-col text-left">
                    {!selectedEmail ? (
                      <div className="space-y-2 flex-1">
                        <span className="text-[10px] uppercase font-bold text-[#E5E1DA]/50 tracking-wider block border-b border-white/10 pb-1 font-mono">Alerts Inbox ({currentEmailList.length})</span>
                        
                        {currentEmailList.length === 0 ? (
                          <div className="text-center py-12 space-y-2">
                            <Mail className="w-8 h-8 text-[#E5E1DA]/30 mx-auto" />
                            <p className="text-xs text-[#E5E1DA]/60 italic">No automated notification alerts fired yet.</p>
                            <p className="text-[10px] text-[#C4A484]">💡 Click the <strong>Shipment Simulator</strong> states above to fire automated emails!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentEmailList.map((email) => (
                              <div
                                key={email.id}
                                onClick={() => { onMarkEmailRead(email.id); setSelectedEmail(email); }}
                                className={`p-3 rounded-none border text-left cursor-pointer transition-all ${
                                  email.read 
                                    ? 'bg-[#1A1C20] border-white/10 text-[#E5E1DA]/80 hover:bg-[#202227]' 
                                    : 'bg-[#C4A484]/5 border-[#C4A484] ring-1 ring-[#C4A484]/10 font-bold shadow-xs'
                                }`}
                              >
                                <div className="flex justify-between items-baseline gap-2">
                                  <span className="text-[9px] uppercase font-mono text-[#C4A484] flex items-center gap-1 font-bold">
                                    <MessageSquare className="w-2.5 h-2.5" /> Rakhi Crate Support
                                  </span>
                                  <span className="text-[9px] text-[#E5E1DA]/50 font-mono shrink-0">{email.sentAt}</span>
                                </div>
                                <h5 className="text-xs font-bold text-[#E5E1DA] truncate mt-1">{email.subject}</h5>
                                <p className="text-[10px] text-[#E5E1DA]/50 mt-0.5 line-clamp-1 font-sans">Secure sandbox updates detailing gift courier routes...</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* EMAIL PREVIEW BODY */
                      <div className="flex-1 flex flex-col h-full overflow-hidden text-left">
                        {/* Header toolbar */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedEmail(null)}
                            className="text-xs text-[#C4A484] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            ← Back to Inbox
                          </button>
                          <span className="text-[10px] text-[#E5E1DA]/50 font-mono">{selectedEmail.sentAt}</span>
                        </div>

                        {/* Interactive HTML Body */}
                        <div className="flex-1 overflow-y-auto bg-white border border-white/10 rounded-none p-1">
                          <div 
                            dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} 
                            className="scale-90 origin-top text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* Empty tracker state */
          <div className="bg-[#15171C] rounded-none p-8 border border-white/10 shadow-sm text-center max-w-lg mx-auto py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#C4A484]/10 flex items-center justify-center mx-auto text-[#C4A484]">
              <Gift className="w-8 h-8 text-[#C4A484]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-black italic text-[#C4A484]">No Active Shipment Queried</h3>
              <p className="text-xs text-[#E5E1DA]/70 mt-2 leading-relaxed">
                Complete a custom crate build, enter your recipient's United Kingdom shipping address, checkout using Stripe/PayPal sandbox inside the shop, and we'll automatically redirect you to view your tracker!
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
