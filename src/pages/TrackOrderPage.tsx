import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { getCarrierById } from '../data/carriers';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions?: string;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  shippingCountry: string;
  shippingStreet?: string;
  shippingPostalCode?: string;
  status: string; // "Pending" | "Processing" | "Paid" | "Shipped" | "Delivered" | "Cancelled"
  paymentStatus: string;
  carrier?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || searchParams.get('order') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialTracking = searchParams.get('tracking') || searchParams.get('trackingNumber') || '';

  const [searchMode, setSearchMode] = useState<'order' | 'tracking'>(initialTracking ? 'tracking' : 'order');
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [trackingNumberInput, setTrackingNumberInput] = useState(initialTracking);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const performSearch = async (ordNum?: string, mail?: string, trackNum?: string) => {
    const oNum = ordNum !== undefined ? ordNum : orderNumberInput;
    const em = mail !== undefined ? mail : emailInput;
    const trk = trackNum !== undefined ? trackNum : trackingNumberInput;

    if (searchMode === 'tracking' || trk) {
      if (!trk.trim()) {
        setError('Please enter a valid tracking number.');
        return;
      }
    } else {
      if (!oNum.trim()) {
        setError('Please enter your order reference number (e.g. LUNAR-...).');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let queryUrl = '';
      if (searchMode === 'tracking' || trk.trim()) {
        queryUrl = `/api/orders/list?trackingNumber=${encodeURIComponent(trk.trim())}`;
      } else {
        queryUrl = `/api/orders/list?orderNumber=${encodeURIComponent(oNum.trim())}${
          em.trim() ? `&email=${encodeURIComponent(em.trim())}` : ''
        }`;
      }

      const response = await fetch(queryUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No order found with the provided information.');
      }

      if (data.order) {
        setOrder(data.order);
      } else {
        throw new Error('Order details could not be retrieved.');
      }
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Failed to search order tracking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTracking) {
      performSearch(undefined, undefined, initialTracking);
    } else if (initialOrderNumber) {
      performSearch(initialOrderNumber, initialEmail, undefined);
    }
  }, []);

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Determine active step (0: Placed, 1: Processing/Paid, 2: Shipped, 3: Delivered)
  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'paid' || s === 'processing') return 1;
    return 0;
  };

  const carrierData = order ? getCarrierById(order.carrier) : null;
  const effectiveTrackingUrl =
    order?.trackingUrl ||
    (order?.trackingNumber && carrierData ? carrierData.getTrackingUrl(order.trackingNumber) : '');

  const stepIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full mb-4 text-[#C1A98F]">
            <Truck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#C1A98F] font-bold mb-2">
            Shipment Logistics &amp; Telemetry
          </p>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl text-[#1A1A1A] uppercase font-light tracking-wide mb-3"
          >
            Track Your Parcel
          </h1>
          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-light leading-relaxed max-w-lg mx-auto">
            Real-time status updates for orders dispatched via <strong>An Post</strong>, <strong>DPD Ireland</strong>, <strong>GLS Ireland</strong>, <strong>UPS</strong>, and <strong>FedEx</strong>.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-[#EAE3D9] p-6 sm:p-8 shadow-xs mb-10">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#F0EBE3] mb-6">
            <button
              type="button"
              onClick={() => {
                setSearchMode('order');
                setError(null);
              }}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors relative mr-8 ${
                searchMode === 'order'
                  ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Search by Order Number
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('tracking');
                setError(null);
              }}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors relative ${
                searchMode === 'tracking'
                  ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Search by Courier Waybill #
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              performSearch();
            }}
            className="space-y-4"
          >
            {searchMode === 'order' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                    Order Reference *
                  </label>
                  <input
                    type="text"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    placeholder="e.g. LUNAR-89214-342"
                    className="w-full px-3.5 py-3 text-xs bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                    Billing / Recipient Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full px-3.5 py-3 text-xs bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                  Courier Tracking Number / Waybill *
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. 1198547382IE, 08123456789012, 1Z999999..., 7948239..."
                  className="w-full px-3.5 py-3 text-xs bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {loading ? (
                  <span>Locating Shipment...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Shipment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Results Card */}
        {order && (
          <div className="bg-white border border-[#EAE3D9] shadow-sm animate-fade-in divide-y divide-[#F0EBE3]">
            
            {/* Header / Summary Bar */}
            <div className="p-6 sm:p-8 bg-[#FCFAF7] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-serif text-2xl text-[#1A1A1A] font-semibold">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded border ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : order.status === 'Shipped'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {order.shippingCity && ` • Destination: ${order.shippingCity}, ${order.shippingCountry}`}
                </p>
              </div>

              {/* Courier Quick Info */}
              <div className="flex flex-col md:items-end">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">
                  Delivery Partner
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1A1A1A]">
                    {order.carrierName || 'An Post (Ireland)'}
                  </span>
                  {carrierData && (
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${carrierData.badgeColor}`}>
                      {carrierData.shortName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Stepper / Progress Timeline */}
            <div className="p-6 sm:p-8">
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gray-500 mb-8">
                Fulfillment Timeline
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                <div
                  className="hidden sm:block absolute top-1/2 left-0 h-0.5 bg-[#1A1A1A] -translate-y-1/2 z-0 transition-all duration-700"
                  style={{ width: `${(stepIndex / 3) * 100}%` }}
                />

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                  
                  {/* Step 1 */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        stepIndex >= 0
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-[#1A1A1A]">
                        Order Placed
                      </span>
                      <span className="text-[10px] text-gray-400">Payment confirmed</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        stepIndex >= 1
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {stepIndex > 1 ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-[#1A1A1A]">
                        Atelier Inspection
                      </span>
                      <span className="text-[10px] text-gray-400">Polishing &amp; packaging</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        stepIndex >= 2
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {stepIndex > 2 ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-[#1A1A1A]">
                        Dispatched with Courier
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {order.carrierName || 'Courier partner'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        stepIndex >= 3
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-[#1A1A1A]">
                        Delivered
                      </span>
                      <span className="text-[10px] text-gray-400">Direct signature</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tracking & Carrier Action Box */}
            <div className="p-6 sm:p-8 bg-[#FAF8F5]">
              {order.trackingNumber ? (
                <div className="bg-white border border-[#EAE3D9] p-6 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C6D4F]">
                        Live Tracking Waybill
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 font-light">
                        Carrier: <strong>{order.carrierName || 'Courier'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-[#1A1A1A] tracking-wider bg-[#FAF8F5] px-3 py-1 border border-dashed border-[#C1A98F]">
                        {order.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingNumber!)}
                        className="p-2 text-gray-500 hover:text-black border border-gray-200 hover:border-black rounded transition-colors cursor-pointer"
                        title="Copy tracking number"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2">
                      ✦ Estimated Delivery Window: <strong>{order.estimatedDelivery || carrierData?.estimatedDelivery || '1 – 3 Business Days'}</strong>
                    </p>
                  </div>

                  {effectiveTrackingUrl && (
                    <a
                      href={effectiveTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black text-xs uppercase tracking-[0.2em] font-bold rounded-xs transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow"
                    >
                      <span>Track with {carrierData?.shortName || 'Carrier'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF6F0] border border-[#E8DFD3] p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#C1A98F] shrink-0" />
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold text-black uppercase tracking-wider block mb-0.5">
                        Tracking Number Pending
                      </span>
                      Your order is being hand-crafted and packaged at our atelier. Once handed over to {order.carrierName || 'the courier'}, your live tracking number will appear here and will be emailed to you.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items & Destination Details */}
            <div className="p-6 sm:p-8">
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gray-500 mb-6">
                Shipment Contents ({order.items?.length || 0} items)
              </h3>

              <div className="space-y-4">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-[#FAF8F5] border border-[#EAE3D9] rounded-xs overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif text-sm text-[#1A1A1A] font-semibold tracking-wide">
                        {item.name}
                      </h4>
                      {item.selectedOptions && (
                        <p className="text-[11px] text-[#8C6D4F]">{item.selectedOptions}</p>
                      )}
                      <p className="text-[11px] text-gray-400">
                        Qty: {item.quantity} • €{(Number(item.price) || 0).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">
                      €{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>All shipments are 100% insured against loss or damage.</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Amount Paid</span>
                  <span className="font-serif text-xl font-bold text-[#1A1A1A]">€{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Assistance / Support Concierge Box */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 font-light">
            Need help with your delivery or have special courier instructions? Contact our Concierge at{' '}
            <a href="mailto:contact@mylunar.shop" className="text-[#8C6D4F] underline hover:text-black">
              contact@mylunar.shop
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default TrackOrderPage;
