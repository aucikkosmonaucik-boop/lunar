import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  Tag, 
  Check, 
  AlertCircle,
  X,
  Gift
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const FREE_SHIPPING_THRESHOLD = 50;

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCanceledNotice, setShowCanceledNotice] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // Check for canceled param in URL
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setShowCanceledNotice(true);
      // Clean query param from URL without page reload
      searchParams.delete('canceled');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Calculations
  const discountAmount = appliedPromo ? (totalPrice * appliedPromo.discountPct) / 100 : 0;
  const priceAfterDiscount = Math.max(0, totalPrice - discountAmount);
  const isFreeShipping = priceAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : 10;
  const grandTotal = priceAfterDiscount + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - priceAfterDiscount);
  const progressPct = Math.min((priceAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'LUNAR10' || code === 'WELCOME10') {
      setAppliedPromo({ code, discountPct: 10 });
      setPromoCode('');
    } else if (code === 'VIP15') {
      setAppliedPromo({ code, discountPct: 15 });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "LUNAR10"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handleStripeCheckout = async () => {
    setIsCheckingOut(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: user?.email,
          discountCode: appliedPromo?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not initiate Stripe checkout');
      }

      if (data.url) {
        // Redirect directly to Stripe Hosted Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Missing Stripe checkout URL');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
      setIsCheckingOut(false);
    }
  };

  /* ─── Empty State ─────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#FAF8F5] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white border border-[#EAE3D9] p-8 md:p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#FAF6F0] border border-[#E8DFD3] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9 text-[#8C7E70] stroke-[1.2]" />
          </div>

          <p className="text-[10px] text-[#C1A98F] font-bold uppercase tracking-[0.35em] mb-2">
            Your Selection
          </p>

          <h2
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl text-[#1A1A1A] uppercase font-light tracking-wide mb-3"
          >
            Your Bag is Empty
          </h2>

          <div className="w-10 h-[1px] bg-[#C1A98F] mx-auto mb-5" />

          <p className="text-gray-500 text-[13px] leading-relaxed mb-8 max-w-sm mx-auto font-light">
            Discover our curated collection of handcrafted jewelry and fine fragrance pieces.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-3 w-full bg-[#1A1A1A] text-white text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#333333] transition-colors duration-200 mb-6 font-medium group"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Category Links */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
              Popular Collections
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Rings', to: '/shop?category=rings' },
                { label: 'Necklaces', to: '/shop?category=necklaces' },
                { label: 'Ready to Ship', to: '/shop?tag=ready-to-ship' },
                { label: 'Earrings', to: '/shop?category=earrings' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[11px] uppercase tracking-wider text-gray-600 bg-gray-50 hover:bg-[#FAF6F0] hover:text-black px-3 py-1.5 border border-gray-200 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Active Cart ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FDFCFA] pb-24">
      {/* Top Banner Notice if Payment was Canceled */}
      {showCanceledNotice && (
        <div className="bg-[#FFF8F0] border-b border-[#F5DFC8] py-3 px-4 animate-fade-in">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[12px] text-[#8A532B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Checkout was not completed. Your items are safe in your bag.</span>
            </div>
            <button
              onClick={() => setShowCanceledNotice(false)}
              className="text-gray-400 hover:text-gray-700 p-1"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* ── Breadcrumb & Page Header ─────────────────── */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-light">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black font-medium">Shopping Bag</span>
          </div>

          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wider uppercase font-light mb-3"
          >
            Shopping Bag
          </h1>

          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-3" />

          <p className="text-gray-500 text-[12px] uppercase tracking-[0.25em] font-light">
            {totalItems} {totalItems === 1 ? 'Handcrafted Item' : 'Handcrafted Items'}
          </p>
        </div>

        {/* ── Main Layout: Items Left, Order Summary Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">
          
          {/* ── Left Column: Free Shipping Bar & Items List ── */}
          <div className="space-y-6">
            
            {/* Free Shipping Progress Indicator */}
            <div className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-none shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C1A98F]" />
                  <span className="text-[12px] font-medium tracking-wider uppercase text-[#1A1A1A]">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-semibold">Free Express Shipping Unlocked!</span>
                    ) : (
                      <span>
                        Add <span className="font-semibold text-black">€{remainingForFreeShipping.toFixed(2)}</span> more for Free Delivery
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-400">
                  Threshold: €{FREE_SHIPPING_THRESHOLD}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 bg-[#F0EBE3] overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    isFreeShipping ? 'bg-emerald-600' : 'bg-[#1A1A1A]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Items Container */}
            <div className="bg-white border border-[#EAE3D9]">
              {/* Header Titles */}
              <div className="hidden sm:grid grid-cols-12 px-6 py-4 border-b border-[#F0EBE3] text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F0EBE3]">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-4 sm:p-6 transition-colors hover:bg-[#FAF8F5]/50 group"
                  >
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-2 items-center">
                      
                      {/* Product Info (Col 1-6) */}
                      <div className="w-full sm:col-span-6 flex gap-4 items-center">
                        {/* Thumbnail */}
                        <Link
                          to={`/product/${item.product.id}`}
                          className="shrink-0 w-24 h-28 sm:w-24 sm:h-28 bg-[#FAF6F0] border border-[#EAE3D9] overflow-hidden relative block"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        {/* Title, Category, Features */}
                        <div className="flex-1 min-w-0">
                          {item.product.category && (
                            <span className="text-[9px] text-[#C1A98F] font-bold uppercase tracking-[0.25em] block mb-1">
                              {item.product.category}
                            </span>
                          )}

                          <Link
                            to={`/product/${item.product.id}`}
                            className="hover:text-gray-600 transition-colors"
                          >
                            <h3
                              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                              className="text-lg sm:text-xl font-medium text-[#1A1A1A] leading-snug truncate"
                            >
                              {item.product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500 font-light">
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              In Stock
                            </span>
                            <span>•</span>
                            <span>Handmade</span>
                          </div>

                          {/* Mobile-only unit price */}
                          <div className="sm:hidden mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Unit: €{item.product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Unit Price (Col 7-8) */}
                      <div className="hidden sm:block sm:col-span-2 text-center">
                        <span className="text-sm font-light text-[#1A1A1A]">
                          €{item.product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls (Col 9-10) */}
                      <div className="w-full sm:w-auto sm:col-span-2 flex items-center justify-between sm:justify-center">
                        <span className="sm:hidden text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Quantity:
                        </span>
                        <div className="inline-flex items-center border border-[#D5CCC1] bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-[#FAF6F0] disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-9 text-center text-xs font-semibold text-[#1A1A1A] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.product.stock ? item.quantity >= item.product.stock : false}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-[#FAF6F0] disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total & Remove (Col 11-12) */}
                      <div className="w-full sm:w-auto sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-left sm:text-right">
                          <span className="sm:hidden text-xs text-gray-500 uppercase tracking-wider block">
                            Subtotal:
                          </span>
                          <span className="text-base font-medium text-[#1A1A1A]">
                            €{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-medium text-[#1A1A1A] hover:text-[#C1A98F] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={clearCart}
                  className="text-[11px] uppercase tracking-[0.25em] font-medium text-gray-400 hover:text-rose-600 transition-colors"
                >
                  Clear Shopping Bag
                </button>
              </div>
            </div>

            {/* Gift Message & Packaging Guarantee Banner */}
            <div className="bg-[#FAF6F0] border border-[#E8DFD3] p-4 sm:p-5 flex items-start gap-4">
              <Gift className="w-5 h-5 text-[#C1A98F] shrink-0 mt-0.5" />
              <div className="text-[12px] text-gray-700 leading-relaxed font-light">
                <span className="font-semibold text-black uppercase tracking-wider text-[11px] block mb-0.5">
                  Complimentary Luxury Gift Packaging
                </span>
                Every Lunar piece arrives nestled in our signature embossed jewelry box, tied with satin ribbon and including a certificate of authenticity.
              </div>
            </div>

          </div>

          {/* ── Right Column: Sticky Order Summary & Stripe Checkout ── */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-[#EAE3D9] p-6 sm:p-8 shadow-xs">
              
              <div className="flex items-center justify-between pb-5 border-b border-[#F0EBE3] mb-6">
                <h2 className="text-[13px] uppercase tracking-[0.3em] font-semibold text-[#1A1A1A]">
                  Order Summary
                </h2>
                <span className="text-[11px] text-gray-400 tracking-wider">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-3.5 text-[13px] text-gray-600 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-light">Items Subtotal</span>
                  <span className="font-medium text-[#1A1A1A]">€{totalPrice.toFixed(2)}</span>
                </div>

                {/* Promo Code Applied Row */}
                {appliedPromo && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Discount ({appliedPromo.code} -{appliedPromo.discountPct}%)</span>
                    </span>
                    <span className="font-medium">-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-light">Insured Shipping</span>
                    <span className="text-[10px] text-gray-400 font-light">2–4 business days</span>
                  </div>
                  <span className={`font-medium ${isFreeShipping ? 'text-emerald-700' : 'text-[#1A1A1A]'}`}>
                    {isFreeShipping ? 'FREE' : `€${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                  <span>Sales Tax / VAT</span>
                  <span>Included</span>
                </div>
              </div>

              {/* Promo Code Accordion */}
              <div className="border-t border-[#F0EBE3] pt-4 mb-6">
                {!appliedPromo ? (
                  <div>
                    {!isPromoOpen ? (
                      <button
                        onClick={() => setIsPromoOpen(true)}
                        className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#C1A98F] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Have a Promo Code?</span>
                      </button>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Code (e.g. LUNAR10)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs uppercase tracking-wider border border-[#D5CCC1] focus:outline-none focus:border-black bg-[#FAF8F5]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-[11px] text-rose-500 mt-1.5 font-light">{promoError}</p>
                        )}
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code {appliedPromo.code} applied!</span>
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-[11px] text-gray-500 hover:text-rose-600 uppercase tracking-wider font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="border-t border-[#EAE3D9] pt-5 mb-6">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[12px] uppercase tracking-[0.25em] font-semibold text-[#1A1A1A] block">
                      Estimated Total
                    </span>
                    <span className="text-[10px] text-gray-400 tracking-wider">EUR currency</span>
                  </div>
                  <div className="text-right">
                    <span
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                      className="text-3xl sm:text-4xl font-light text-[#1A1A1A] tracking-tight"
                    >
                      €{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-none mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Stripe Checkout CTA Button */}
              <button
                id="stripe-checkout-btn"
                onClick={handleStripeCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white py-4 px-6 text-[12px] uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#C1A98F]" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Payment Methods Badges */}
              <div className="mt-5 pt-5 border-t border-[#F0EBE3] text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
                  Guaranteed Safe & Secure Checkout via Stripe
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-gray-500">
                  {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'BLIK', 'Klarna'].map((badge) => (
                    <span
                      key={badge}
                      className="text-[10px] font-medium tracking-wider px-2.5 py-1 bg-[#FAF8F5] border border-[#EAE3D9] text-[#4A4A4A]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="mt-6 pt-5 border-t border-[#F0EBE3] space-y-3 text-[11px] text-gray-500 font-light">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#C1A98F] shrink-0" />
                  <span>256-Bit SSL Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#C1A98F] shrink-0" />
                  <span>Free tracked shipping on orders over €50</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#C1A98F] shrink-0" />
                  <span>30-Day Hassle-Free Return Policy</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
