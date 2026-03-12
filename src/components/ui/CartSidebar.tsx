import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose }) => {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col glass border-l border-lunar-border transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-lunar-border">
          <h2 className="text-lg font-bold gradient-text flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-lunar-purple-light" />
            Koszyk
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-lunar-muted hover:text-lunar-text hover:bg-lunar-border transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-lunar-border" />
              <p className="text-lunar-muted">Twój koszyk jest pusty</p>
              <button
                onClick={onClose}
                className="text-sm text-lunar-purple-light hover:underline"
              >
                Kontynuuj zakupy
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-4 p-3 rounded-xl bg-lunar-card border border-lunar-border">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/produkt/${item.product.id}`}
                    onClick={onClose}
                    className="text-sm font-medium text-lunar-text hover:text-lunar-purple-light line-clamp-1 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-lunar-purple-light font-bold text-sm mt-1">
                    {(item.product.price * item.quantity).toLocaleString('pl-PL')} zł
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-lg bg-lunar-border text-lunar-muted hover:text-lunar-text transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 rounded-lg bg-lunar-border text-lunar-muted hover:text-lunar-text transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 rounded-lg text-lunar-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-lunar-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lunar-muted">Łącznie:</span>
              <span className="text-xl font-bold gradient-text">{totalPrice.toLocaleString('pl-PL')} zł</span>
            </div>
            <Link
              to="/koszyk"
              onClick={onClose}
              className="block w-full text-center py-3 px-6 rounded-xl btn-shimmer text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              Przejdź do koszyka
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
