import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../adminService';
import { Order } from '../../types';
import { ArrowLeft, CheckCircle, Circle, AlertCircle, ChevronDown } from 'lucide-react';
import { StatusBadge, PageLoader } from './AdminDashboard';

const STATUS_FLOW: Order['status'][] = ['ordered', 'assembled', 'dispatched', 'out-for-delivery', 'delivered'];

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    adminGetAllOrders().then(orders => {
      const found = orders.find(o => o.id === orderId);
      setOrder(found || null);
      setLoading(false);
    });
  }, [orderId]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return;
    setShowStatusMenu(false);
    setUpdating(true); setError(''); setSuccess('');
    try {
      await adminUpdateOrderStatus(order.userId || 'guest', order.id, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      setSuccess(`Status updated to "${newStatus}" successfully.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return (
    <div className="text-center py-20 text-gray-500">
      <AlertCircle className="w-10 h-10 mx-auto mb-3" />
      <p>Order not found.</p>
      <button onClick={() => navigate('/admin/orders')} className="mt-4 text-red-400 underline text-sm cursor-pointer">Back to orders</button>
    </div>
  );

  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate('/admin/orders')} className="text-gray-500 hover:text-white cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white font-mono">{order.id}</h1>
          <p className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {error && <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm flex gap-2 items-center"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex gap-2 items-center"><CheckCircle className="w-4 h-4 shrink-0" />{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Customer info */}
        <Card title="Customer Information">
          <Row label="Sender Name" value={order.shipping?.senderName} />
          <Row label="Sender Email" value={order.shipping?.senderEmail} />
          <Row label="Recipient Name" value={order.shipping?.recipientName} />
          <Row label="Recipient Phone" value={order.shipping?.recipientPhone} />
          <Row label="Address" value={[order.shipping?.addressLine1, order.shipping?.addressLine2, order.shipping?.city, order.shipping?.postcode, order.shipping?.country].filter(Boolean).join(', ')} />
          <Row label="Delivery Date" value={order.shipping?.deliveryDate} />
        </Card>

        {/* Payment info */}
        <Card title="Payment Information">
          <Row label="Amount" value={`£${(order.amount || 0).toFixed(2)}`} mono />
          <Row label="Payment Method" value={order.paymentMethod} />
          <Row label="Order Created" value={order.createdAt} />
          {(order as any).razorpayOrderId && <Row label="Razorpay Order ID" value={(order as any).razorpayOrderId} mono />}
          {(order as any).razorpayPaymentId && <Row label="Razorpay Payment ID" value={(order as any).razorpayPaymentId} mono />}
        </Card>

      </div>

      {/* Order Items */}
      <Card title="Order Items">
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
              {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-gray-700 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{item.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white text-sm font-mono">£{(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-gray-500 text-xs">×{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-gray-800 flex justify-between">
          <span className="text-gray-400 text-sm font-bold">Total</span>
          <span className="text-white font-bold font-mono">£{(order.amount || 0).toFixed(2)}</span>
        </div>
      </Card>

      {/* Status Timeline */}
      <Card title="Order Timeline">
        <div className="space-y-4">
          {STATUS_FLOW.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  done ? 'bg-emerald-600 border-emerald-600' : 'border-gray-700 bg-gray-900'
                }`}>
                  {done && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${active ? 'text-emerald-400' : done ? 'text-white' : 'text-gray-600'}`}>{s}</p>
                  {order.timeline?.find(t => t.status === s) && (
                    <p className="text-gray-600 text-xs">{order.timeline.find(t => t.status === s)?.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Status Update */}
      <Card title="Update Order Status">
        <p className="text-gray-500 text-xs mb-4">Current status: <StatusBadge status={order.status} /></p>
        <div className="relative inline-block">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors"
          >
            {updating ? 'Updating…' : 'Change Status'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
              {[...STATUS_FLOW, 'cancelled' as Order['status']].map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2 ${
                    s === order.status ? 'text-emerald-400 font-bold' : 'text-gray-300'
                  }`}>
                  {s === order.status && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span className="capitalize">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <h3 className="text-white font-semibold text-sm border-b border-gray-800 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-300 text-right truncate ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}
