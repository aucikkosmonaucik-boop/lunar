import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const shipping = totalPrice >= 200 ? 0 : 15;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-24 h-24 text-lunar-border mb-6" />
        <h2 className="text-2xl font-bold text-lunar-text mb-3">Twój koszyk jest pusty</h2>
        <p className="text-lunar-muted mb-8">Wygląda na to, że nie masz jeszcze żadnych produktów w koszyku.</p>
        <Link
          to="/sklep"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl btn-shimmer text-white font-semibold hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do sklepu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black">
              Twój <span className="gradient-text">Koszyk</span>
            </h1>
            <p className="text-lunar-muted mt-1">{totalItems} {totalItems === 1 ? 'produkt' : 'produktów'}</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm text-lunar-muted hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
            Wyczyść koszyk
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product.id} className="glass rounded-2xl border border-lunar-border p-5 flex gap-5 hover:border-lunar-purple/30 transition-all duration-300">
                <Link to={`/produkt/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-lunar-muted mb-1">{item.product.category}</p>
                      <Link to={`/produkt/${item.product.id}`}>
                        <h3 className="font-semibold text-lunar-text hover:text-lunar-purple-light transition-colors line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 rounded-lg text-lunar-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Qty */}
                    <div className="flex items-center gap-2 glass border border-lunar-border rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-lunar-muted hover:text-lunar-text transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 text-lunar-muted hover:text-lunar-text transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-right">
                      <p className="font-bold text-lunar-text">
                        {(item.product.price * item.quantity).toLocaleString('pl-PL')} zł
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-lunar-muted">{item.product.price.toLocaleString('pl-PL')} zł / szt.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/sklep"
              className="inline-flex items-center gap-2 text-sm text-lunar-muted hover:text-lunar-purple-light transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" /> Kontynuuj zakupy
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl border border-lunar-border p-6 sticky top-24">
              <h2 className="text-lg font-bold text-lunar-text mb-6">Podsumowanie</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-lunar-muted">Produkty ({totalItems})</span>
                  <span className="text-lunar-text">{totalPrice.toLocaleString('pl-PL')} zł</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-lunar-muted">Dostawa</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-lunar-text'}>
                    {shipping === 0 ? 'Bezpłatna' : `${shipping} zł`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-lunar-muted border-t border-lunar-border pt-2">
                    Dodaj jeszcze {(200 - totalPrice).toLocaleString('pl-PL')} zł, aby uzyskać darmową dostawę
                  </p>
                )}
              </div>

              <div className="border-t border-lunar-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-lunar-text">Razem</span>
                  <span className="text-2xl font-black gradient-text">{grandTotal.toLocaleString('pl-PL')} zł</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <input
                  placeholder="Kod rabatowy"
                  className="flex-1 px-3 py-2 text-sm rounded-lg glass border border-lunar-border text-lunar-text placeholder:text-lunar-muted outline-none focus:border-lunar-purple/50 bg-transparent"
                />
                <button className="px-4 py-2 text-sm rounded-lg border border-lunar-purple/40 text-lunar-purple-light hover:bg-lunar-purple/10 transition-colors">
                  OK
                </button>
              </div>

              <button
                id="checkout-btn"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl btn-shimmer text-white font-bold hover:scale-[1.02] transition-transform duration-200"
              >
                Przejdź do płatności
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-lunar-muted text-center mt-4">
                🔒 Bezpieczna płatność SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
