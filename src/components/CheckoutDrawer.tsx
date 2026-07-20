/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  DollarSign
} from 'lucide-react';
import { CartItem, ShippingDetails, Order } from '../types';

interface CheckoutDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
  onClearCart: () => void;
  userEmail?: string;
}

export default function CheckoutDrawer({ cart, onClose, onOrderCompleted, onClearCart, userEmail }: CheckoutDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Processing, 4: Receipt
  
  // Shipping form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState(userEmail || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-27'); // Day before Raksha Bandhan

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  
  // Stripe Card state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // PayPal state
  const [paypalAuthorized, setPaypalAuthorized] = useState(false);
  const [showPaypalPopup, setShowPaypalPopup] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');
  const [paypalAuthorizing, setPaypalAuthorizing] = useState(false);

  // Errors
  const [error, setError] = useState('');

  // Generated Order Details
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cartTotal > 45 ? 0 : 3.99;
  const grandTotal = cartTotal + shippingFee;

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces every 4 digits
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (value: string) => {
    // Format expiry date as MM/YY
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const validateShipping = () => {
    if (!senderName || !senderEmail || !recipientName || !recipientPhone || !addressLine1 || !city || !postcode) {
      setError('Please fill in all required shipping and sender fields.');
      return false;
    }
    // Check postcode structure roughly
    const postClean = postcode.trim().toUpperCase();
    if (postClean.length < 5) {
      setError('Please provide a valid UK Postcode (e.g. SW1A 1AA, M1 1AE).');
      return false;
    }
    setError('');
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'stripe') {
      if (!cardName || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setError('Please provide valid Stripe credit card details.');
        return false;
      }
    } else {
      if (!paypalAuthorized) {
        setError('Please click the PayPal button to authorize your PayPal wallet.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleProcessCheckout = async () => {
    if (!validatePayment()) return;

    setStep(3); // Enter Processing mode

    // Simulated network delays for payment gateways
    setTimeout(() => {
      const orderId = `RC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toLocaleString();
      
      const newOrder: Order = {
        id: orderId,
        createdAt: timestamp,
        items: [...cart],
        shipping: {
          senderName,
          senderEmail,
          recipientName,
          recipientPhone,
          addressLine1,
          addressLine2,
          city,
          postcode,
          country,
          deliveryDate
        },
        paymentMethod,
        amount: grandTotal,
        status: 'ordered',
        timeline: [
          { status: 'ordered', timestamp, title: 'Order Received', description: 'Gifting request validated and secured.', completed: true },
          { status: 'assembled', timestamp: '--', title: 'Crate Customization', description: 'Gifts hand-assembled with wood wool padding.', completed: false },
          { status: 'dispatched', timestamp: '--', title: 'Dispatched to London Courier Hub', description: 'Handed over to Royal Mail Express Gifting.', completed: false },
          { status: 'out-for-delivery', timestamp: '--', title: 'Out for Local Delivery', description: 'Courier carrying the crate to recipient\'s door.', completed: false },
          { status: 'delivered', timestamp: '--', title: 'Delivered Successfully', description: 'The traditional thread tied and celebratory sweets shared.', completed: false }
        ]
      };

      setGeneratedOrder(newOrder);
      onOrderCompleted(newOrder);
      onClearCart();
      setStep(4); // Receipt screen
    }, 3000);
  };

  // PayPal popup handshakes
  const handlePayPalAuthorize = () => {
    setError('');
    setShowPaypalPopup(true);
  };

  const submitPayPalMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalEmail || !paypalPassword) {
      alert("Please fill in PayPal Sandbox accounts credentials.");
      return;
    }
    setPaypalAuthorizing(true);
    setTimeout(() => {
      setPaypalAuthorized(true);
      setShowPaypalPopup(false);
      setPaypalAuthorizing(false);
    }, 1800);
  };

  // Detect card network logo
  const getCardLogo = () => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'MasterCard';
    if (cardNumber.startsWith('3')) return 'Amex';
    return 'Credit Card';
  };

  return (
    <div id="checkout-sidebar-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-100 text-charcoal-text"
      >
        {/* Header */}
        <div className="p-6 bg-warm-cream text-charcoal-text flex justify-between items-center shrink-0 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl font-black italic text-primary tracking-tight">Secure Global Checkout</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
            id="close-checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator bar (1/2/3/4) */}
        {step !== 3 && step !== 4 && (
          <div className="flex bg-warm-cream/50 border-b border-stone-100 text-[10px] uppercase font-bold tracking-widest text-charcoal-text/50 shrink-0">
            <div className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${step === 1 ? 'border-primary text-primary bg-white' : 'border-transparent'}`}>
              <Truck className="w-3.5 h-3.5" /> 1. Shipping
            </div>
            <div className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${step === 2 ? 'border-primary text-primary bg-white' : 'border-transparent'}`}>
              <CreditCard className="w-3.5 h-3.5" /> 2. Secure Payment
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Shipping Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif text-xl font-black italic text-primary">Recipient Gifting Address (United Kingdom)</h3>
                <p className="text-xs text-charcoal-text/70 font-sans leading-normal">Your premium crate is shipped out of our regional center in London to any UK address.</p>
              </div>

              {/* Recipient inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Recipient Phone Number (For UK Courier Alerts) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +44 7911 123456"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">UK Postcode *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SW1A 1AA"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Street Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House Number, Building Name, Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Street Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Locality, State or County"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream"
                  />
                </div>
              </div>

              <div className="border-b border-stone-100 pb-2 pt-4">
                <h3 className="font-serif text-xl font-black italic text-primary">Your Details (Sender)</h3>
                <p className="text-xs text-charcoal-text/70 font-sans">We send your tracking, billing invoice, and dispatch email updates here.</p>
              </div>

              {/* Sender inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@gmail.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream font-mono"
                  />
                </div>
              </div>

              {/* Delivery Date Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1">Requested Delivery Date (Approximate) *</label>
                <input
                  type="date"
                  required
                  min="2026-08-15"
                  max="2026-09-05"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream font-mono"
                />
                <span className="text-[10px] text-primary mt-1.5 block font-sans">
                  * Note: Raksha Bandhan is on August 28, 2026. We recommend selecting August 26 or 27 for perfect arrival!
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Secure Payment Options */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="font-serif text-xl font-black italic text-primary">Select International Gateway</h3>
                <p className="text-xs text-charcoal-text/70 font-sans">All transactions are fully PCI-DSS compliant and encrypted via SSL.</p>
              </div>

              {/* Toggle Stripe / PayPal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'stripe'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10 text-primary'
                      : 'border-stone-200 hover:border-stone-300 bg-warm-cream text-charcoal-text/50'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-charcoal-text">Stripe Checkout</span>
                  <span className="text-[9px] text-charcoal-text/40 font-mono">Visa, MasterCard, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10 text-primary'
                      : 'border-stone-200 hover:border-stone-300 bg-warm-cream text-charcoal-text/50'
                  }`}
                >
                  <DollarSign className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-charcoal-text">PayPal Wallet</span>
                  <span className="text-[9px] text-charcoal-text/40 font-mono">Fast secure authorization</span>
                </button>
              </div>

              {/* PAYMENT METHOD 1: Stripe Card Input */}
              {paymentMethod === 'stripe' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-warm-cream p-4 rounded-xl border border-stone-200/60 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                    <span className="text-[10px] font-bold uppercase text-primary tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3 text-primary" /> Secure Credit Card (Stripe)
                    </span>
                    <span className="text-[10px] font-bold text-primary font-mono uppercase bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20">
                      {getCardLogo()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-charcoal-text/70 mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-200/60 bg-white text-charcoal-text rounded-lg text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-charcoal-text/70 mb-1">Card Number *</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-200/60 bg-white text-charcoal-text rounded-lg text-xs focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-charcoal-text/70 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full text-center px-3 py-2.5 border border-stone-200/60 bg-white text-charcoal-text rounded-lg text-xs focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-charcoal-text/70 mb-1">CVC / CVV *</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center px-3 py-2.5 border border-stone-200/60 bg-white text-charcoal-text rounded-lg text-xs focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PAYMENT METHOD 2: PayPal */}
              {paymentMethod === 'paypal' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-warm-cream p-6 rounded-xl border border-stone-200/60 text-center space-y-4 shadow-xs"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black italic text-lg text-primary">PayPal Direct Gifting Check</h4>
                    <p className="text-xs text-charcoal-text/70 mt-1 leading-relaxed font-sans">
                      Click below to log in safely inside a secure simulated sandbox. No real funds are transferred during developer preview mode.
                    </p>
                  </div>

                  {!paypalAuthorized ? (
                    <button
                      type="button"
                      onClick={handlePayPalAuthorize}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Authorize PayPal Express
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg inline-flex items-center gap-2 font-semibold font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PayPal Wallet Authorized successfully!
                    </div>
                  )}
                </motion.div>
              )}

              {/* Security Badge Info */}
              <div className="bg-warm-cream p-4 rounded-xl border border-stone-200/60 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-charcoal-text/80 leading-relaxed font-sans">
                  <span className="font-bold block text-emerald-700">Double-Layer Secure Encryption</span>
                  Your payment details are processed instantly without being saved on this container. Secured by bank-grade 256-bit SSL handshakes.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Secure Processing Overlay */}
          {step === 3 && (
            <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
              {/* Spinner */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-black italic text-primary">Securing Sandbox Connection...</h3>
                <p className="text-xs text-charcoal-text/70 max-w-xs mx-auto animate-pulse font-sans">
                  Encrypting payload, communicating with international banks, assembling your gift crate order ticket...
                </p>
              </div>

              <div className="p-3 bg-warm-cream border border-stone-200/60 rounded-lg max-w-xs flex items-center gap-2 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] text-charcoal-text/80 font-mono">Securing SSL key index handshake...</span>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmed Order Receipt */}
          {step === 4 && generatedOrder && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 text-center py-6 font-sans"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mb-2">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-3xl font-black italic text-emerald-600">Crate Gift Secured!</h3>
                <p className="text-xs text-charcoal-text/70">Your order has been registered in our London operations registry.</p>
              </div>

              {/* Receipt Ticket Box */}
              <div className="bg-warm-cream border-2 border-dashed border-stone-300 rounded-2xl p-5 shadow-sm text-left space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/50 rounded-none flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-charcoal-text/20" />
                </div>
                
                <div className="border-b border-stone-200/80 pb-3">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-widest block font-mono">Receipt Reference</span>
                  <span className="text-lg font-bold text-charcoal-text font-mono tracking-tight">{generatedOrder.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-text/50 block font-bold font-mono">Recipient</span>
                    <span className="font-semibold text-charcoal-text">{generatedOrder.shipping.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-text/50 block font-bold font-mono">Destination</span>
                    <span className="font-semibold text-charcoal-text truncate block">{generatedOrder.shipping.city}, UK</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-text/50 block font-bold font-mono">Delivery Promise</span>
                    <span className="font-semibold text-primary font-mono">{generatedOrder.shipping.deliveryDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-text/50 block font-bold font-mono">Amount Paid</span>
                    <span className="font-semibold text-primary font-mono font-bold">£{generatedOrder.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-stone-200/50 text-[10px] text-charcoal-text/85 leading-relaxed">
                  <span className="font-bold block text-primary font-sans">Automated Notification Simulator Active</span>
                  We've initiated the real-time tracking pipeline! Switch over to the <span className="font-bold underline text-primary">Order Tracker</span> to watch your package assemble, ship, and trigger emails.
                </div>
              </div>

              {/* Direct Track Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer font-mono"
              >
                Return to Shop &amp; Track Gift <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Bottom Cart Bill Panel (Step 1 & 2) */}
        {step !== 3 && step !== 4 && (
          <div className="p-6 bg-warm-cream border-t border-stone-100 space-y-4 shrink-0 rounded-none">
            <div className="space-y-1.5 text-xs text-charcoal-text/80 font-sans">
              <div className="flex justify-between">
                <span>Gift Items Total ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span className="font-mono">£{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Royal Mail Express Shipping:</span>
                <span className="font-mono">{shippingFee === 0 ? "FREE" : `£${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>UK Customs Duty &amp; Duties:</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-dashed border-stone-200/60">
                <span>Grand Total:</span>
                <span className="font-mono text-lg text-primary">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div>
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => { if (validateShipping()) setStep(2); }}
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse font-mono"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-stone-200 bg-white text-charcoal-text py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    Back to Address
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessCheckout}
                    className="bg-primary text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Pay £{grandTotal.toFixed(2)} <Lock className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* PAYPAL POPUP MODAL SIMULATION */}
      <AnimatePresence>
        {showPaypalPopup && (
          <div id="paypal-sandbox-popup" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Dark modal overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaypalPopup(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-t-4 border-primary p-6 relative z-10 text-left border border-stone-100"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-4 font-sans">
                <span className="font-serif italic font-black text-primary text-xl">PayPal Sandbox</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-lg uppercase font-mono">Developer Mode</span>
              </div>

              <form onSubmit={submitPayPalMockLogin} className="space-y-4">
                <p className="text-xs text-charcoal-text/80 leading-relaxed font-sans">
                  Log in to your PayPal developer sandbox account to authorize this gift transaction of <span className="font-bold text-primary">£{grandTotal.toFixed(2)}</span>.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-charcoal-text/50 uppercase mb-1 font-mono">Sandbox Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. buyer-test@paypal.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-warm-cream text-charcoal-text text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-charcoal-text/50 uppercase mb-1 font-mono">Sandbox Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-warm-cream text-charcoal-text text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="bg-warm-cream border border-stone-100 p-2.5 rounded-lg text-[10px] text-primary leading-normal font-sans">
                  💡 Tip: Enter any demo credentials (e.g. <strong>test@paypal.com</strong> / <strong>test1234</strong>) to simulate a high-speed authorization hook!
                </div>

                <div className="flex justify-end gap-2 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setShowPaypalPopup(false)}
                    className="px-4 py-2 text-xs font-semibold text-charcoal-text/50 hover:text-charcoal-text hover:bg-stone-50 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paypalAuthorizing}
                    className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {paypalAuthorizing ? "Authorizing..." : "Agree & Continue"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
