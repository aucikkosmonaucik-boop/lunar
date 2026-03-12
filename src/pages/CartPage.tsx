import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, X, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const FREE_SHIPPING_THRESHOLD = 50;

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 10;
  const grandTotal = totalPrice + shipping;
  const progressPct = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  /* ─── Empty State ─────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="pt-32 px-4 min-h-screen flex flex-col items-center justify-center text-center bg-white">
        <div className="w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center mb-8">
          <ShoppingBag className="w-8 h-8 text-gray-300 stroke-[1]" />
        </div>
        <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.35em] mb-4">Your Selection</p>
        <h2 className="font-serif text-3xl tracking-widest text-[#1a1a1a] uppercase mb-4 font-light">
          Your Bag is Empty
        </h2>
        <div className="w-10 h-[1px] bg-gray-200 mx-auto mb-6" />
        <p className="text-gray-400 text-[12px] uppercase tracking-widest font-light mb-12">
          Explore our collection and add pieces you love.
        </p>
        <Link
          to="/sklep"
          className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.35em] py-4 px-10 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Explore Collection
        </Link>
      </div>
    );
  }

  /* ─── Cart ────────────────────────────────────── */
  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-16 text-center">
          <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.35em] mb-4">Your Selection</p>
          <h1 className="font-serif text-5xl md:text-6xl tracking-widest text-[#1a1a1a] uppercase font-light mb-5">
            Shopping Bag
          </h1>
          <div className="w-10 h-[1px] bg-wonders-gold mx-auto mb-4" />
          <p className="text-gray-400 text-[11px] uppercase tracking-widest">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* ── Items List ─────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Column labels */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-8 pb-4 border-b border-gray-100 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-medium">
              <span>Product</span>
              <span className="text-center w-28">Quantity</span>
              <span className="text-right w-24">Total</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div
                  key={item.product.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-6 sm:gap-8 py-8 items-center group"
                >
                  {/* Product info */}
                  <div className="flex gap-6 items-start">
                    {/* Image */}
                    <Link
                      to={`/produkt/${item.product.id}`}
                      className="shrink-0 w-28 h-36 bg-[#f5eeeb] overflow-hidden border border-gray-100"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex flex-col justify-between h-36 py-1">
                      <div>
                        <p className="text-[9px] text-wonders-gold font-bold uppercase tracking-[0.3em] mb-1">
                          {item.product.category}
                        </p>
                        <Link to={`/produkt/${item.product.id}`}>
                          <h3 className="text-[14px] font-medium text-[#1a1a1a] uppercase tracking-wider hover:text-gray-500 transition-colors leading-snug mb-2">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-[12px] text-gray-400 font-light leading-relaxed line-clamp-2 max-w-xs">
                          {item.product.description}
                        </p>
                      </div>

                      {/* Unit price + remove */}
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-gray-400 tracking-wide">
                          {item.product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / ea
                        </span>
                        <span className="text-gray-200">·</span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-red-400 transition-colors font-medium"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center justify-start sm:justify-center w-full sm:w-28">
                    <div className="flex items-center gap-4 border border-gray-200 px-4 py-2.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-[#1a1a1a] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-[13px] font-medium text-[#1a1a1a] select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="text-gray-400 hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-left sm:text-right w-full sm:w-24">
                    <p className="text-[15px] font-medium text-[#1a1a1a] tracking-wide">
                      {(item.product.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <Link
                to="/sklep"
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-medium text-[#1a1a1a] hover:text-gray-500 transition-colors border-b border-[#1a1a1a] pb-0.5 hover:border-gray-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Keep Exploring
              </Link>
              <button
                onClick={clearCart}
                className="text-[10px] uppercase tracking-[0.25em] font-medium text-gray-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* ── Order Summary ───────────────────────── */}
          <div className="lg:col-span-1 sticky top-32">
            <div className="bg-[#f5eeeb] border border-[#e8ddd8] p-8">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-[#1a1a1a] font-medium mb-8">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-[#ddd0c8]">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-start gap-2">
                    <span className="text-[11px] text-gray-500 font-light tracking-wide line-clamp-1 flex-1">
                      {item.product.name}
                      {item.quantity > 1 && (
                        <span className="text-gray-400 ml-1">× {item.quantity}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#1a1a1a] font-medium tracking-wide shrink-0">
                      {(item.product.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal + Shipping */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#1a1a1a] font-medium">
                    {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-gray-500">Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-[#1a1a1a] font-medium'}>
                    {shipping === 0 ? 'Free' : shipping.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {shipping > 0 && (
                <div className="mb-6">
                  <div className="h-[2px] w-full bg-[#ddd0c8] rounded-full mb-2">
                    <div
                      className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 tracking-wide">
                    Add{' '}
                    <span className="text-[#1a1a1a] font-medium">
                      {remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>{' '}
                    more for free delivery
                  </p>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-[#ddd0c8] pt-5 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a] font-medium">Total</span>
                  <span className="text-[22px] font-light text-[#1a1a1a] tracking-wider">
                    {grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                id="checkout-btn"
                className="w-full bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.35em] py-4 hover:bg-gray-800 transition-colors duration-200 mb-5 font-medium flex items-center justify-center gap-3"
              >
                Checkout Securely <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-2 pt-5 border-t border-[#ddd0c8]">
                {[
                  { icon: Shield, label: 'SSL Secure' },
                  { icon: Truck, label: 'Free Ship.' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                    <span className="text-[8px] uppercase tracking-[0.15em] text-gray-400 font-medium leading-tight">
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
