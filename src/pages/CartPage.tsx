import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, X, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const FREE_SHIPPING_THRESHOLD = 50;

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 10;
      const grandTotal = totalPrice + shipping;

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: grandTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Coud not process order');
      }

      // Success! Clear cart and go to account
      clearCart();
      navigate('/account?tab=orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 10;
  const grandTotal = totalPrice + shipping;
  const progressPct = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  /* ─── Empty State ─────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-12 text-center bg-white px-4">
        <div className="w-24 h-24 rounded-full border border-gray-200 flex items-center justify-center mb-10">
          <ShoppingBag className="w-10 h-10 text-gray-300 stroke-[1]" />
        </div>
        <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.4em] mb-5">Your Selection</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-5xl tracking-widest text-[#1a1a1a] uppercase mb-5 font-light">
          Your Bag is Empty
        </h2>
        <div className="w-10 h-[1px] bg-gray-200 mx-auto mb-6" />
        <p className="text-gray-400 text-sm uppercase tracking-widest font-light mb-14">
          Explore our collection and add pieces you love.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.4em] py-5 px-12 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Collection
        </Link>
      </div>
    );
  }

  /* ─── Cart ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── Page Header ──────────────────────────── */}
        <div className="mb-20 text-center">
          <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.4em] mb-5">Your Selection</p>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-6xl md:text-7xl tracking-widest text-[#1a1a1a] uppercase font-light mb-6"
          >
            Shopping Bag
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto mb-5" />
          <p className="text-gray-400 text-[13px] uppercase tracking-widest">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20 items-start">

          {/* ── Items List ─────────────────────────── */}
          <div>
            {/* Column labels */}
            <div className="hidden sm:flex justify-between pb-5 border-b border-gray-100 text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium">
              <span>Product</span>
              <div className="flex gap-16 pr-2">
                <span>Qty</span>
                <span>Total</span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.product.id} className="flex flex-col sm:flex-row gap-8 py-12 group">

                  {/* Image — BIG */}
                  <Link
                    to={`/produkt/${item.product.id}`}
                    className="shrink-0 w-full sm:w-48 aspect-[3/4] bg-[#f5eeeb] overflow-hidden border border-gray-100 block"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  {/* Info + Controls */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    {/* Top: category + name + description */}
                    <div className="mb-6">
                      <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.35em] mb-2">
                        {item.product.category}
                      </p>
                      <Link to={`/produkt/${item.product.id}`}>
                        <h3
                          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                          className="text-3xl text-[#1a1a1a] uppercase tracking-wide hover:text-gray-500 transition-colors leading-tight mb-4 font-light"
                        >
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-[14px] text-gray-400 font-light leading-relaxed max-w-md">
                        {item.product.description}
                      </p>
                    </div>

                    {/* Bottom: price per ea + qty + total + remove */}
                    <div className="flex flex-wrap items-end justify-between gap-6">
                      {/* Unit price */}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Price per item</p>
                        <p className="text-[18px] font-light text-[#1a1a1a] tracking-wide">
                          {item.product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>

                      {/* Qty + Total + Remove */}
                      <div className="flex items-end gap-8">
                        {/* Quantity */}
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">Qty</p>
                          <div className="flex items-center gap-5 border border-gray-200 px-5 py-3">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="text-gray-400 hover:text-[#1a1a1a] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-[16px] font-medium text-[#1a1a1a] select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="text-gray-400 hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Total</p>
                          <p className="text-[22px] font-light text-[#1a1a1a] tracking-wide">
                            {(item.product.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-red-400 transition-colors font-medium mb-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <Link
                to="/shop"
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-medium text-[#1a1a1a] hover:text-gray-500 transition-colors border-b border-[#1a1a1a] pb-0.5 hover:border-gray-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Keep Exploring
              </Link>
              <button
                onClick={clearCart}
                className="text-[11px] uppercase tracking-[0.3em] font-medium text-gray-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* ── Order Summary ───────────────────────── */}
          <div className="sticky top-32">
            <div className="bg-[#f5eeeb] border border-[#e8ddd8] p-10">

              <h2 className="text-[12px] uppercase tracking-[0.4em] text-[#1a1a1a] font-medium mb-8">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="space-y-3 mb-8 pb-8 border-b border-[#ddd0c8]">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-start gap-3">
                    <span className="text-[12px] text-gray-500 font-light tracking-wide line-clamp-1 flex-1">
                      {item.product.name}
                      {item.quantity > 1 && (
                        <span className="text-gray-400 ml-1">× {item.quantity}</span>
                      )}
                    </span>
                    <span className="text-[12px] text-[#1a1a1a] font-medium tracking-wide shrink-0">
                      {(item.product.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal + Shipping */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[12px] uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#1a1a1a] font-medium">
                    {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] uppercase tracking-widest">
                  <span className="text-gray-500">Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-[#1a1a1a] font-medium'}>
                    {shipping === 0 ? 'Free' : shipping.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {shipping > 0 && (
                <div className="mb-8">
                  <div className="h-[2px] w-full bg-[#ddd0c8] rounded-full mb-3">
                    <div
                      className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 tracking-wide">
                    Add{' '}
                    <span className="text-[#1a1a1a] font-medium">
                      {remaining.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                    </span>{' '}
                    more for free delivery
                  </p>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-[#ddd0c8] pt-6 mb-10">
                <div className="flex justify-between items-baseline">
                  <span className="text-[12px] uppercase tracking-[0.3em] text-[#1a1a1a] font-medium">Total</span>
                  <span
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    className="text-4xl font-light text-[#1a1a1a]"
                  >
                    {grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-[10px] uppercase tracking-wider mb-4 text-center">
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                id="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.4em] py-5 hover:bg-gray-800 transition-colors duration-200 mb-6 font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>Checkout Securely <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#ddd0c8]">
                {[
                  { icon: Shield, label: 'SSL Secure' },
                  { icon: Truck, label: 'Free Ship.' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <Icon className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                    <span className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-medium leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
