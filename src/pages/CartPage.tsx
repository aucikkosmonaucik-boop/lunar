import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const shipping = totalPrice >= 50 ? 0 : 10;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-32 px-4 min-h-screen flex flex-col items-center justify-center text-center bg-white">
        <ShoppingBag className="w-16 h-16 text-wonders-border mb-8 stroke-[1]" />
        <h2 className="text-2xl font-light uppercase tracking-widest text-wonders-dark mb-4">Your Bag is Empty</h2>
        <p className="text-wonders-muted text-xs uppercase tracking-widest mb-12">Capture your wonders and they will appear here.</p>
        <Link
          to="/sklep"
          className="btn-primary inline-flex items-center gap-3"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.3em] mb-4">Your Selection</p>
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] mb-6">
            Shopping <span className="font-bold">Bag</span>
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto mb-6"></div>
          <p className="text-wonders-muted text-xs uppercase tracking-widest">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-8">
            {items.map(item => (
              <div key={item.product.id} className="flex flex-col sm:flex-row gap-8 py-8 border-b border-wonders-border items-center sm:items-start group">
                <Link to={`/produkt/${item.product.id}`} className="shrink-0 w-32 aspect-[4/5] bg-gray-50 overflow-hidden border border-wonders-border rounded-sm">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="mb-4">
                    <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-widest mb-2">{item.product.category}</p>
                    <Link to={`/produkt/${item.product.id}`}>
                      <h3 className="text-sm font-semibold text-wonders-dark uppercase tracking-widest hover:text-wonders-gold transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-8 mt-auto">
                    {/* Qty */}
                    <div className="flex items-center gap-6 border border-wonders-border rounded-full px-4 py-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-wonders-muted hover:text-wonders-dark"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-wonders-dark">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="text-wonders-muted hover:text-wonders-dark disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right sm:min-w-[120px]">
                  <p className="text-sm font-bold text-wonders-dark tracking-widest">
                    {(item.product.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] text-wonders-muted uppercase tracking-widest mt-1">
                      {item.product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / ea
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-8">
              <Link
                to="/sklep"
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-wonders-dark border-b border-wonders-gold pb-1 hover:text-wonders-gold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Keep Exploring
              </Link>
              <button
                onClick={clearCart}
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-wonders-muted hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50/50 border border-wonders-border p-8 sticky top-32 rounded-sm">
              <h2 className="text-sm font-bold text-wonders-dark uppercase tracking-[0.2em] mb-10">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-wonders-muted">Subtotal</span>
                  <span className="text-wonders-dark font-bold">{totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span className="text-wonders-muted">Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : 'text-wonders-dark font-bold'}>
                    {shipping === 0 ? 'Complimentary' : shipping.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] text-wonders-muted uppercase tracking-widest pt-4 border-t border-wonders-border">
                    Add {(50 - totalPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-wonders-border pt-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-wonders-dark uppercase tracking-[0.2em]">Total</span>
                  <span className="text-xl font-bold text-wonders-gold tracking-widest">{grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>

              <button
                id="checkout-btn"
                className="w-full btn-primary py-4 text-xs uppercase tracking-[0.2em] mb-6"
              >
                Checkout Securely
              </button>

              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] text-wonders-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Secure SSL Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
