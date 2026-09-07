import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, ShieldCheck, AlertTriangle, Loader2, MapPin, User, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

interface VerifiedSession {
  id: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  shippingPhone?: string;
  amountTotal: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
}

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('payment_intent_id');
  const isDemo = searchParams.get('demo') === 'true';
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<VerifiedSession | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  useEffect(() => {
    // Clear cart immediately upon reaching success page
    clearCart();

    if (!sessionId && !paymentIntentId) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        let url = '';
        if (paymentIntentId) {
          url = `/api/stripe/verify-payment-intent?payment_intent_id=${encodeURIComponent(paymentIntentId)}`;
        } else if (sessionId) {
          const addressParam = searchParams.get('address');
          url = `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}${
            addressParam ? `&address=${encodeURIComponent(addressParam)}` : ''
          }`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify payment.');
        }

        if (data.demoMode || isDemo) {
          setDemoNotice(true);
        }

        if (data.session) {
          setSessionData(data.session);
        } else if (data.order) {
          setSessionData({
            id: data.order.id || data.order.orderNumber,
            paymentStatus: data.order.paymentStatus || data.order.status || 'Paid',
            customerEmail: data.order.customerEmail,
            customerName: data.order.customerName,
            shippingPhone: data.order.shippingPhone,
            amountTotal: data.order.total,
            currency: data.order.currency || 'EUR',
            shippingAddress: data.order.shippingAddress,
          });
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentIntentId, clearCart, isDemo, searchParams]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] dark:bg-[#121212] flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1A98F] mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#1A1A1A] dark:text-[#F5F5F5] font-medium">
          Verifying Payment & Order...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121212] py-12 md:py-20 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        
        {/* Error banner if verification had issues */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 p-4 mb-6 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Note
              </span>
              {error}. If your payment was processed, your order has been registered.
            </div>
          </div>
        )}

        {/* Demo Mode Alert if keys not yet configured */}
        {demoNotice && (
          <div className="bg-[#FFF8F0] dark:bg-[#25201B] border border-[#F5DFC8] dark:border-[#5C4533] text-[#8A532B] dark:text-[#E8BF96] p-4 mb-6 text-xs flex items-start gap-3 rounded-none">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Test Order / Demo Mode
              </span>
              Order placed in Stripe demo mode. All shipping details have been successfully processed.
            </div>
          </div>
        )}

        {/* Main Success Card */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-8 sm:p-12 text-center shadow-xs transition-colors duration-200">
          
          {/* Check Icon */}
          <div className="w-20 h-20 rounded-full bg-[#FAF6F0] dark:bg-[#252525] border border-[#E8DFD3] dark:border-[#2E2E2E] flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>

          <p className="text-[10px] text-[#C1A98F] font-bold uppercase tracking-[0.35em] mb-2">
            Order Confirmed
          </p>

          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl text-[#1A1A1A] dark:text-[#F5F5F5] uppercase font-light tracking-wide mb-3"
          >
            Thank You for Shopping
          </h1>

          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-6" />

          <p className="text-gray-600 dark:text-[#AAAAAA] text-sm font-light leading-relaxed max-w-md mx-auto mb-8">
            Your payment has been successfully authorised. We are preparing your Lunar jewellery with the highest attention to every detail of craftsmanship.
          </p>

          {/* Account Creation Welcome Alert if logged in */}
          {user && (
            <div className="mb-6 p-4 bg-[#FAF6F0] dark:bg-[#252525] border border-[#E8DFD3] dark:border-[#2E2E2E] text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700 dark:text-[#AAAAAA]">
                <span className="font-semibold text-black dark:text-white uppercase tracking-wider block mb-0.5">
                  Lunar Account Active
                </span>
                You are signed in as <span className="font-medium text-black dark:text-white">{user.email}</span>. You can track your orders and edit your address in your account dashboard.
              </div>
            </div>
          )}

          {/* Details Box */}
          <div className="bg-[#FAF8F5] dark:bg-[#161616] border border-[#EAE3D9] dark:border-[#2E2E2E] p-6 text-left space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D9] dark:border-[#2E2E2E] gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#888888] block font-medium">
                  Reference Number
                </span>
                <span className="text-xs font-mono font-medium text-[#1A1A1A] dark:text-[#F5F5F5] break-all">
                  {sessionId ? (sessionId.length > 25 ? `${sessionId.slice(0, 22)}...` : sessionId) : `ORD-${Date.now().toString().slice(-6)}`}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#888888] block font-medium">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Paid & Confirmed
                </span>
              </div>
            </div>

            {sessionData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                {sessionData.customerEmail && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#888888] block mb-0.5">
                      Confirmation Sent To
                    </span>
                    <span className="font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">{sessionData.customerEmail}</span>
                  </div>
                )}

                {sessionData.amountTotal && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#888888] block mb-0.5">
                      Total Amount
                    </span>
                    <span className="font-semibold text-base text-[#1A1A1A] dark:text-[#F5F5F5]">
                      €{sessionData.amountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {(sessionData.shippingAddress || sessionData.customerName) && (
                  <div className="sm:col-span-2 pt-3 border-t border-[#EAE3D9] dark:border-[#2E2E2E] space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#888888] block mb-1">
                      Courier Delivery Address
                    </span>
                    {sessionData.customerName && (
                      <div className="font-medium text-[#1A1A1A] dark:text-[#F5F5F5] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C1A98F]" />
                        <span>{sessionData.customerName}</span>
                      </div>
                    )}
                    {sessionData.shippingAddress && (
                      <div className="text-gray-700 dark:text-[#AAAAAA] flex items-start gap-1.5 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C1A98F] shrink-0 mt-0.5" />
                        <span>
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
                    {(sessionData.shippingPhone || sessionData.shippingAddress?.phone) && (
                      <div className="text-gray-600 dark:text-[#888888] text-[11px] flex items-center gap-1.5 pt-0.5">
                        <Phone className="w-3 h-3 text-[#C1A98F]" />
                        <span>Tel: {sessionData.shippingPhone || sessionData.shippingAddress?.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery & Assurance Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#2E2E2E] flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F5F5F5] block">
                  Delivery Time
                </span>
                <span className="text-[11px] text-gray-500 dark:text-[#AAAAAA] font-light">2–4 business days</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#2E2E2E] flex items-start gap-3">
              <Package className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F5F5F5] block">
                  Packaging
                </span>
                <span className="text-[11px] text-gray-500 dark:text-[#AAAAAA] font-light">Jewellery box included</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#2E2E2E] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F5F5F5] block">
                  Guarantee
                </span>
                <span className="text-[11px] text-gray-500 dark:text-[#AAAAAA] font-light">30-day returns</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/track-order?orderNumber=${encodeURIComponent(sessionData?.id || sessionId || '')}&email=${encodeURIComponent(sessionData?.customerEmail || '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1A1A] dark:bg-[#C1A98F] text-white dark:text-[#121212] text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-black transition-all font-semibold shadow"
            >
              <Truck className="w-4 h-4" />
              <span>Track Shipment</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-[#1A1A1A] dark:border-[#C1A98F] text-[#1A1A1A] dark:text-[#F5F5F5] dark:hover:text-[#C1A98F] text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#FAF6F0] dark:hover:bg-[#252525] transition-colors font-medium group"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {user && (
              <Link
                to="/account"
                className="w-full sm:w-auto inline-flex items-center justify-center text-[12px] uppercase tracking-[0.25em] py-4 px-8 border border-gray-300 dark:border-[#444444] text-gray-700 dark:text-[#AAAAAA] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors font-medium"
              >
                My Account
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
