import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface VerifiedSession {
  id: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
}

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true';
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<VerifiedSession | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  useEffect(() => {
    // Clear cart immediately upon reaching success page
    clearCart();

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not verify payment session');
        }

        if (data.demoMode || isDemo) {
          setDemoNotice(true);
        }

        if (data.session) {
          setSessionData(data.session);
        } else if (data.order) {
          setSessionData({
            id: data.order.id,
            paymentStatus: data.order.status,
            customerEmail: data.order.customerEmail,
            customerName: data.order.customerName,
            amountTotal: data.order.total,
            currency: data.order.currency || 'EUR',
            shippingAddress: data.order.shippingAddress,
          });
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, isDemo]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1A98F] mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#1A1A1A] font-medium">
          Verifying Payment with Stripe...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Error banner if verification had issues */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 mb-6 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Notice
              </span>
              {error}. If you completed checkout on Stripe, your order was received.
            </div>
          </div>
        )}

        {/* Demo Mode Alert if keys not yet configured */}
        {demoNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 mb-6 text-xs flex items-start gap-3 rounded-none">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Stripe Test / Demonstration Order
              </span>
              This order was placed in Stripe Demo mode because `STRIPE_SECRET_KEY` is not yet configured in your `.env` file. You can add your Stripe keys anytime in `.env` to receive real payments.
            </div>
          </div>
        )}

        {/* Main Success Card */}
        <div className="bg-white border border-[#EAE3D9] p-8 sm:p-12 text-center shadow-xs">
          
          {/* Check Icon */}
          <div className="w-20 h-20 rounded-full bg-[#FAF6F0] border border-[#E8DFD3] flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>

          <p className="text-[10px] text-[#C1A98F] font-bold uppercase tracking-[0.35em] mb-2">
            Payment Confirmed
          </p>

          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl text-[#1A1A1A] uppercase font-light tracking-wide mb-3"
          >
            Thank You For Your Order
          </h1>

          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-6" />

          <p className="text-gray-600 text-sm font-light leading-relaxed max-w-md mx-auto mb-8">
            Your purchase has been securely processed via Stripe. We are preparing your jewelry pieces with utmost care and artisan craftsmanship.
          </p>

          {/* Details Box */}
          <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-6 text-left space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D9] gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block font-medium">
                  Order Reference
                </span>
                <span className="text-xs font-mono font-medium text-[#1A1A1A] break-all">
                  {sessionId ? (sessionId.length > 25 ? `${sessionId.slice(0, 22)}...` : sessionId) : `ORD-${Date.now().toString().slice(-6)}`}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block font-medium">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Paid & Confirmed
                </span>
              </div>
            </div>

            {sessionData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                {sessionData.customerEmail && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Confirmation Sent To
                    </span>
                    <span className="font-medium text-[#1A1A1A]">{sessionData.customerEmail}</span>
                  </div>
                )}

                {sessionData.amountTotal && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Total Paid
                    </span>
                    <span className="font-semibold text-base text-[#1A1A1A]">
                      €{sessionData.amountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {sessionData.shippingAddress && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#EAE3D9]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Delivery Destination
                    </span>
                    <span className="text-gray-700">
                      {[
                        sessionData.shippingAddress.line1,
                        sessionData.shippingAddress.city,
                        sessionData.shippingAddress.postal_code,
                        sessionData.shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery & Assurance Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Delivery
                </span>
                <span className="text-[11px] text-gray-500 font-light">2–4 business days</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <Package className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Packaging
                </span>
                <span className="text-[11px] text-gray-500 font-light">Luxury gift box</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Warranty
                </span>
                <span className="text-[11px] text-gray-500 font-light">30-day return policy</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1A1A1A] text-white text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#333333] transition-colors font-medium group"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/account?tab=orders"
              className="w-full sm:w-auto inline-flex items-center justify-center text-[12px] uppercase tracking-[0.25em] py-4 px-8 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors font-medium"
            >
              View Order History
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
