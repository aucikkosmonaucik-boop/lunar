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
  Gift,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  Home,
  Globe,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Coins
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useLoyalty } from '../hooks/useLoyalty';

const FREE_SHIPPING_THRESHOLD = 50;

const COUNTRIES = [
  { code: 'PL', name: 'Polska (Poland)' },
  { code: 'IE', name: 'Ireland' },
  { code: 'DE', name: 'Deutschland (Germany)' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'España (Spain)' },
  { code: 'IT', name: 'Italia (Italy)' },
  { code: 'NL', name: 'Nederland (Netherlands)' },
  { code: 'AT', name: 'Österreich (Austria)' },
  { code: 'BE', name: 'Belgique / België' },
  { code: 'CH', name: 'Schweiz / Suisse' },
  { code: 'SE', name: 'Sverige (Sweden)' },
  { code: 'NO', name: 'Norge (Norway)' },
  { code: 'DK', name: 'Danmark (Denmark)' },
  { code: 'FI', name: 'Suomi (Finland)' },
  { code: 'CZ', name: 'Česká republika' },
  { code: 'SK', name: 'Slovensko' },
  { code: 'HU', name: 'Magyarország' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
];

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, login } = useAuth();
  const { loyaltyPoints, userCoupons, calculatePointsToEarn } = useLoyalty();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCanceledNotice, setShowCanceledNotice] = useState(false);

  // Promo code / Loyalty Coupon state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPct?: number;
    discountAmount?: number;
    isLoyaltyCoupon?: boolean;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isLoyaltyCouponsOpen, setIsLoyaltyCouponsOpen] = useState(false);

  // Mandatory Shipping Address form state
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('PL');

  // Account options for unauthenticated users: 'guest' | 'create_account'
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'create_account'>('guest');
  const [accountPassword, setAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Validation error state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Auto-fill form when logged in
  useEffect(() => {
    if (user) {
      if (user.name && !shippingName) setShippingName(user.name);
      if (user.email && !shippingEmail) setShippingEmail(user.email);
      if (user.phone && !shippingPhone) setShippingPhone(user.phone);
      if (user.street && !shippingStreet) setShippingStreet(user.street);
      if (user.postalCode && !shippingPostalCode) setShippingPostalCode(user.postalCode);
      if (user.city && !shippingCity) setShippingCity(user.city);
      if (user.country && !shippingCountry) setShippingCountry(user.country);
    }
  }, [user]);

  // Check for canceled param in URL
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setShowCanceledNotice(true);
      searchParams.delete('canceled');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Calculations with Loyalty discount support
  const discountAmount = appliedPromo
    ? appliedPromo.discountAmount !== undefined && appliedPromo.discountAmount !== null && appliedPromo.discountAmount > 0
      ? Math.min(totalPrice, appliedPromo.discountAmount)
      : (totalPrice * (appliedPromo.discountPct || 0)) / 100
    : 0;

  const priceAfterDiscount = Math.max(0, totalPrice - discountAmount);
  const isFreeShipping = priceAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : 10;
  const grandTotal = priceAfterDiscount + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - priceAfterDiscount);
  const progressPct = Math.min((priceAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const pointsToEarn = calculatePointsToEarn(grandTotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // 1. Check in user's active loyalty wallet first
    const userCouponsMatching = userCoupons.find(c => c.code.toUpperCase() === code && !c.isUsed);
    if (userCouponsMatching) {
      setAppliedPromo({
        code: userCouponsMatching.code,
        discountPct: userCouponsMatching.discountType === 'PERCENTAGE' ? userCouponsMatching.discountValue : undefined,
        discountAmount: userCouponsMatching.discountType === 'FIXED' ? userCouponsMatching.discountValue : undefined,
        isLoyaltyCoupon: true,
      });
      setPromoCode('');
      return;
    }

    // 2. Try API validation
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({
          code: data.code,
          discountPct: data.discountPct || undefined,
          discountAmount: data.discountAmount || undefined,
          isLoyaltyCoupon: data.isLoyaltyCoupon,
        });
        setPromoCode('');
        return;
      } else {
        setPromoError(data.message || 'Nieprawidłowy lub nieaktywny kod rabatowy');
        return;
      }
    } catch {
      // Fallback local check
      if (code === 'LUNAR10' || code === 'WELCOME10') {
        setAppliedPromo({ code, discountPct: 10 });
        setPromoCode('');
      } else if (code === 'VIP15') {
        setAppliedPromo({ code, discountPct: 15 });
        setPromoCode('');
      } else {
        setPromoError('Nieprawidłowy kod. Spróbuj "LUNAR10"');
      }
    }
  };

  const handleApplyUserCoupon = (coupon: any) => {
    setAppliedPromo({
      code: coupon.code,
      discountPct: coupon.discountType === 'PERCENTAGE' ? coupon.discountValue : undefined,
      discountAmount: coupon.discountType === 'FIXED' ? coupon.discountValue : undefined,
      isLoyaltyCoupon: true,
    });
    setPromoError(null);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  // Real-time form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!shippingName.trim()) {
      errors.name = 'Full name is required';
    }

    if (!shippingEmail.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingEmail.trim())) {
      errors.email = 'Please enter a valid email address (e.g. jane@example.com)';
    }

    if (!shippingPhone.trim()) {
      errors.phone = 'Phone number is required for delivery';
    } else if (shippingPhone.trim().replace(/\D/g, '').length < 7) {
      errors.phone = 'Please enter a valid phone number (min. 7 digits)';
    }

    if (!shippingStreet.trim()) {
      errors.street = 'Street address is required';
    }

    if (!shippingPostalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }

    if (!shippingCity.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingCountry.trim()) {
      errors.country = 'Please select a delivery country';
    }

    if (!user && checkoutMode === 'create_account') {
      if (!accountPassword) {
        errors.password = 'Please enter a password for your new account';
      } else if (accountPassword.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const section = document.getElementById('shipping-address-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return false;
    }

    return true;
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'name') setShippingName(value);
    if (field === 'email') setShippingEmail(value);
    if (field === 'phone') setShippingPhone(value);
    if (field === 'street') setShippingStreet(value);
    if (field === 'postalCode') setShippingPostalCode(value);
    if (field === 'city') setShippingCity(value);
    if (field === 'country') setShippingCountry(value);
    if (field === 'password') setAccountPassword(value);

    if (hasAttemptedSubmit && formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleStripeCheckout = async () => {
    setHasAttemptedSubmit(true);
    setError(null);

    const isValid = validateForm();
    if (!isValid) {
      setError('Please fill in all required shipping address fields before proceeding to payment.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: shippingEmail.trim() || user?.email,
          discountCode: appliedPromo?.code,
          shippingAddress: {
            name: shippingName.trim(),
            email: shippingEmail.trim(),
            phone: shippingPhone.trim(),
            street: shippingStreet.trim(),
            city: shippingCity.trim(),
            postalCode: shippingPostalCode.trim(),
            country: shippingCountry.trim(),
          },
          accountOption: {
            createAccount: !user && checkoutMode === 'create_account',
            password: accountPassword,
            saveAddressToProfile,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate the payment process.');
      }

      if (data.user) {
        login(data.user);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No Stripe session URL received.');
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
            Your Bag
          </p>

          <h2
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl text-[#1A1A1A] uppercase font-light tracking-wide mb-3"
          >
            Your bag is empty
          </h2>

          <div className="w-10 h-[1px] bg-[#C1A98F] mx-auto mb-5" />

          <p className="text-gray-500 text-[13px] leading-relaxed mb-8 max-w-sm mx-auto font-light">
            Discover our unique collection of handcrafted jewellery and luxury accessories by Lunar.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-3 w-full bg-[#1A1A1A] text-white text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#333333] transition-colors duration-200 mb-6 font-medium group"
          >
            <span>Browse the Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
              Popular Categories
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Rings', to: '/shop?category=rings' },
                { label: 'Necklaces', to: '/shop?category=necklaces' },
                { label: 'Earrings', to: '/shop?category=earrings' },
                { label: 'Ready to Ship', to: '/shop?tag=ready-to-ship' },
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

  /* ─── Active Cart & Checkout ───────────────────── */
  return (
    <div className="min-h-screen bg-[#FDFCFA] pb-24">
      {/* Top Banner Notice if Payment was Canceled */}
      {showCanceledNotice && (
        <div className="bg-[#FFF8F0] border-b border-[#F5DFC8] py-3 px-4 animate-fade-in">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[12px] text-[#8A532B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Payment was cancelled. Your items are still safely waiting in your bag.</span>
            </div>
            <button
              onClick={() => setShowCanceledNotice(false)}
              className="text-gray-400 hover:text-gray-700 p-1"
              aria-label="Dismiss notification"
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
            <span className="text-black font-medium">Bag & Delivery</span>
          </div>

          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wider uppercase font-light mb-3"
          >
            Bag & Checkout
          </h1>

          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-3" />

          <p className="text-gray-500 text-[12px] uppercase tracking-[0.25em] font-light">
            {totalItems} {totalItems === 1 ? 'item in bag' : 'items in bag'}
          </p>
        </div>

        {/* ── Main Layout: Content Left, Sticky Summary Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_440px] gap-8 lg:gap-12 items-start">
          
          {/* ── Left Column: Items List & Mandatory Shipping Address ── */}
          <div className="space-y-8">
            
            {/* Free Shipping Progress Indicator */}
            <div className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-none shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C1A98F]" />
                  <span className="text-[12px] font-medium tracking-wider uppercase text-[#1A1A1A]">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-semibold">Free Insured Delivery Unlocked!</span>
                    ) : (
                      <span>
                        Add <span className="font-semibold text-black">€{remainingForFreeShipping.toFixed(2)}</span> more for free delivery
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

            {/* Step 1: Items in Cart Container */}
            <div className="bg-white border border-[#EAE3D9]">
              <div className="px-6 py-4 border-b border-[#F0EBE3] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-[12px] uppercase tracking-[0.25em] font-semibold text-[#1A1A1A]">
                    Selected Items
                  </h2>
                </div>
                <span className="text-[11px] text-gray-400 font-light">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
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
                        <Link
                          to={`/product/${item.product.id}`}
                          className="shrink-0 w-20 h-24 sm:w-20 sm:h-24 bg-[#FAF6F0] border border-[#EAE3D9] overflow-hidden relative block"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          {item.product.category && (
                            <span className="text-[9px] text-[#C1A98F] font-bold uppercase tracking-[0.25em] block mb-0.5">
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

                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 font-light">
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              In Stock
                            </span>
                            <span>•</span>
                            <span>Handcrafted</span>
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
                          Qty:
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
                          <span className="w-8 text-center text-xs font-semibold text-[#1A1A1A] select-none">
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
              <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#EAE3D9] flex items-center justify-between">
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
                  Clear Bag
                </button>
              </div>
            </div>

            {/* ── Step 2: Mandatory Shipping & Recipient Details Form ── */}
            <div id="shipping-address-section" className="bg-white border border-[#EAE3D9] shadow-xs">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#F0EBE3] flex items-center justify-between bg-[#FCFAF7]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-semibold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h2 className="text-[13px] uppercase tracking-[0.25em] font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C1A98F]" />
                      <span>Shipping & Recipient Details</span>
                    </h2>
                    <span className="text-[10px] text-amber-800 font-light uppercase tracking-wider block mt-0.5">
                      * Required fields for delivery
                    </span>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="font-medium hidden sm:inline">Signed in: {user.name || user.email}</span>
                    <span className="font-medium sm:hidden">Signed in</span>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">

                {/* ── Account Option Selection (For Unauthenticated Users) ── */}
                {!user ? (
                  <div className="space-y-3 pb-6 border-b border-[#F0EBE3]">
                    <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#1A1A1A] block">
                      Choose how to place your order:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option 1: Guest Checkout */}
                      <label
                        className={`relative border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          checkoutMode === 'guest'
                            ? 'border-[#1A1A1A] bg-[#FAF8F5] shadow-xs'
                            : 'border-[#EAE3D9] hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="checkoutMode"
                              value="guest"
                              checked={checkoutMode === 'guest'}
                              onChange={() => setCheckoutMode('guest')}
                              className="accent-[#1A1A1A]"
                            />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                              Guest Checkout
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 font-medium">Guest</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-light pl-5 leading-relaxed">
                          Quick checkout without creating a password. Confirmation and tracking will be sent to your email.
                        </p>
                      </label>

                      {/* Option 2: Register & Checkout */}
                      <label
                        className={`relative border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          checkoutMode === 'create_account'
                            ? 'border-[#C1A98F] bg-[#FAF6F0] shadow-xs ring-1 ring-[#C1A98F]'
                            : 'border-[#EAE3D9] hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="checkoutMode"
                              value="create_account"
                              checked={checkoutMode === 'create_account'}
                              onChange={() => setCheckoutMode('create_account')}
                              className="accent-[#C1A98F]"
                            />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                              <span>Create account with order</span>
                              <Sparkles className="w-3 h-3 text-[#C1A98F]" />
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-[#FAF0E4] text-[#8A532B] font-medium">Recommended</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-light pl-5 leading-relaxed">
                          Automatically create a Lunar account, track your delivery online, and save your address for future orders.
                        </p>
                      </label>
                    </div>

                    {/* Returning Customer Quick Login Link */}
                    <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Already have a Lunar account?</span>
                      <Link
                        to="/login?redirect=/cart"
                        className="text-[#1A1A1A] font-medium hover:text-[#C1A98F] transition-colors underline underline-offset-4"
                      >
                        Sign in to load your details →
                      </Link>
                    </div>

                    {/* Password Input for Account Creation */}
                    {checkoutMode === 'create_account' && (
                      <div className="mt-4 p-4 bg-[#FAF6F0] border border-[#E8DFD3] animate-fade-in space-y-2">
                        <label className="block text-[11px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">
                          Create a password for your new account *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={accountPassword}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            placeholder="Enter password (minimum 6 characters)"
                            className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                              formErrors.password ? 'border-rose-500 focus:ring-rose-200' : 'border-[#D5CCC1] focus:border-black'
                            } focus:outline-none pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formErrors.password ? (
                          <p className="text-[11px] text-rose-600 font-light flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{formErrors.password}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-500 font-light">
                            This password will be used to sign in and view your order history.
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                ) : (
                  /* Logged-in user address sync option */
                  <div className="pb-4 border-b border-[#F0EBE3] flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={saveAddressToProfile}
                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                        className="accent-[#1A1A1A] w-4 h-4 rounded-none"
                      />
                      <span>Save / update this address as default in my Lunar profile</span>
                    </label>
                  </div>
                )}

                {/* ── Address Fields Form ── */}
                <div className="space-y-4">
                  
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        Recipient Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={shippingName}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          placeholder="e.g. Jane Smith"
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                            formErrors.name ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                          } focus:outline-none transition-colors`}
                        />
                        <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.name && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        Email Address for Notifications *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={shippingEmail}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="e.g. jane.smith@example.com"
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                            formErrors.email ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                          } focus:outline-none transition-colors`}
                        />
                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.email && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        Phone Number for Courier *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={shippingPhone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="+353 87 123 4567"
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                            formErrors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                          } focus:outline-none transition-colors`}
                        />
                        <Phone className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.phone && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        Delivery Country *
                      </label>
                      <div className="relative">
                        <select
                          value={shippingCountry}
                          onChange={(e) => handleFieldChange('country', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black focus:bg-white focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <Globe className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {formErrors.country && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.country}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Street Address */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                      Street Address & House / Flat No. *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={shippingStreet}
                        onChange={(e) => handleFieldChange('street', e.target.value)}
                        placeholder="e.g. 15 Grafton Street, Apt 4"
                        className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                          formErrors.street ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                        } focus:outline-none transition-colors`}
                      />
                      <Home className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.street && (
                      <span className="text-[10px] text-rose-600 font-light mt-1 block">
                        {formErrors.street}
                      </span>
                    )}
                  </div>

                  {/* Row 4: Postal Code & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingPostalCode}
                        onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                        placeholder="e.g. D02 XY45"
                        className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                          formErrors.postalCode ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                        } focus:outline-none transition-colors`}
                      />
                      {formErrors.postalCode && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.postalCode}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] font-medium text-gray-600 mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        placeholder="e.g. Dublin"
                        className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border ${
                          formErrors.city ? 'border-rose-500 bg-rose-50/30' : 'border-[#D5CCC1] focus:border-black focus:bg-white'
                        } focus:outline-none transition-colors`}
                      />
                      {formErrors.city && (
                        <span className="text-[10px] text-rose-600 font-light mt-1 block">
                          {formErrors.city}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Gift Message & Packaging Guarantee Banner */}
            <div className="bg-[#FAF6F0] border border-[#E8DFD3] p-4 sm:p-5 flex items-start gap-4">
              <Gift className="w-5 h-5 text-[#C1A98F] shrink-0 mt-0.5" />
              <div className="text-[12px] text-gray-700 leading-relaxed font-light">
                <span className="font-semibold text-black uppercase tracking-wider text-[11px] block mb-0.5">
                  Complimentary Luxury Gift Packaging
                </span>
                Every Lunar piece is presented in an elegant embossed jewellery box tied with a satin ribbon, along with a certificate of authenticity.
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
                  <span className="font-light">Subtotal</span>
                  <span className="font-medium text-[#1A1A1A]">€{totalPrice.toFixed(2)}</span>
                </div>

                {/* Promo Code Applied Row */}
                {appliedPromo && (
                  <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/70 p-2.5 rounded border border-emerald-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Zniżka ({appliedPromo.code}{' '}
                        {appliedPromo.discountPct
                          ? `-${appliedPromo.discountPct}%`
                          : appliedPromo.discountAmount
                          ? `-${appliedPromo.discountAmount.toFixed(2)}€`
                          : ''})
                      </span>
                    </span>
                    <span className="font-bold">-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Loyalty Points to be Earned */}
                <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded text-amber-950">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#D4AF37]" />
                    <div className="text-xs">
                      <span className="font-semibold block">LUNAR Club Punkty:</span>
                      {user && (
                        <span className="text-[10px] text-gray-500">Saldo: {loyaltyPoints} pkt</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">
                    +{pointsToEarn} PKT
                  </span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-light">Insured Delivery</span>
                    <span className="text-[10px] text-gray-400 font-light">2–4 business days</span>
                  </div>
                  <span className={`font-medium ${isFreeShipping ? 'text-emerald-700 font-semibold' : 'text-[#1A1A1A]'}`}>
                    {isFreeShipping ? 'FREE' : `€${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                  <span>VAT</span>
                  <span>Included</span>
                </div>
              </div>

              {/* Shipping Address Status Badge */}
              <div className="border-t border-[#F0EBE3] pt-4 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-light">Delivery address:</span>
                  {shippingStreet && shippingCity && shippingPostalCode ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Filled ({shippingCity})</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium text-[11px]">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Promo Code & Loyalty Coupons Accordion */}
              <div className="border-t border-[#F0EBE3] pt-4 mb-6">
                {!appliedPromo ? (
                  <div className="space-y-3">
                    {/* User Loyalty Coupons Available */}
                    {user && userCoupons.filter(c => !c.isUsed).length > 0 && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Masz {userCoupons.filter(c => !c.isUsed).length} kupon(y) w portfelu:
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsLoyaltyCouponsOpen(!isLoyaltyCouponsOpen)}
                            className="text-[10px] uppercase tracking-wider font-bold text-black underline"
                          >
                            {isLoyaltyCouponsOpen ? 'Ukryj' : 'Wybierz kupon'}
                          </button>
                        </div>

                        {isLoyaltyCouponsOpen && (
                          <div className="space-y-1.5 pt-1">
                            {userCoupons.filter(c => !c.isUsed).map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleApplyUserCoupon(c)}
                                className="w-full text-left p-2 bg-white border border-amber-200 hover:border-black rounded flex items-center justify-between text-xs transition-colors"
                              >
                                <span className="font-mono font-bold text-black">{c.code}</span>
                                <span className="font-bold text-green-700">
                                  {c.discountType === 'PERCENTAGE' ? `-${c.discountValue}%` : `-${c.discountValue.toFixed(2)}€`}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!isPromoOpen ? (
                      <button
                        onClick={() => setIsPromoOpen(true)}
                        className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#C1A98F] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Masz kod rabatowy? Wpisz tutaj</span>
                      </button>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Wpisz kod (np. LUNAR10)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs uppercase tracking-wider border border-[#D5CCC1] focus:outline-none focus:border-black bg-[#FAF8F5]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
                          >
                            Zastosuj
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
                      <span>Kupon {appliedPromo.code} aktywny!</span>
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-[11px] text-gray-500 hover:text-rose-600 uppercase tracking-wider font-semibold"
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="border-t border-[#EAE3D9] pt-5 mb-6">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[12px] uppercase tracking-[0.25em] font-semibold text-[#1A1A1A] block">
                      Total Due
                    </span>
                    <span className="text-[10px] text-gray-400 tracking-wider">Currency: EUR</span>
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
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-none mb-4 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Stripe Checkout CTA Button */}
              <button
                id="stripe-checkout-btn"
                onClick={handleStripeCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white py-4 px-6 text-[12px] uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#C1A98F]" />
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Payment Methods Badges */}
              <div className="mt-5 pt-5 border-t border-[#F0EBE3] text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
                  Secure Encrypted Payment via Stripe
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-gray-500">
                  {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'BLIK', 'Klarna'].map((badge) => (
                    <span
                      key={badge}
                      className="text-[10px] font-medium tracking-wider px-2 py-0.5 bg-[#FAF8F5] border border-[#EAE3D9] text-[#4A4A4A]"
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
                  <span>256-Bit SSL encryption and buyer protection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#C1A98F] shrink-0" />
                  <span>Insured tracked courier delivery</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#C1A98F] shrink-0" />
                  <span>30-day free returns on all orders</span>
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
