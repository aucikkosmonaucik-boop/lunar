import React from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../hooks/useCart';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromFavorites, totalItems } = useFavorites();
  const { addToCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-[101] w-full sm:w-[420px] bg-[#f5eeeb] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-10 pb-6 border-b border-gray-200">
          <Link to="/" onClick={onClose} className="flex flex-col">
            <img src="/logo.png" alt="my Lunar.ie" className="h-16 object-contain" />
          </Link>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onClose}
              className="p-2 text-[#1a1a1a] hover:text-gray-500 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-4">
          <Heart className="w-4 h-4 stroke-[1.5] text-[#1a1a1a]" />
          <span className="text-[12px] uppercase tracking-[0.35em] font-medium text-[#1a1a1a]">
            Wishlist
          </span>
          {totalItems > 0 && (
            <span className="ml-auto text-[11px] tracking-[0.2em] text-gray-400">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mx-8 border-b border-gray-200 mb-2" />

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-16">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center">
                <Heart className="w-7 h-7 stroke-[1] text-gray-300" />
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.25em] text-[#1a1a1a] font-medium mb-2">
                  Your wishlist is empty
                </p>
                <p className="text-[12px] text-gray-400 font-light tracking-wide">
                  Save pieces you love to come back to them.
                </p>
              </div>
              <Link
                to="/shop?category=jewelry"
                onClick={onClose}
                className="mt-2 text-[11px] uppercase tracking-[0.3em] font-medium text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map(product => (
                <div key={product.id} className="flex gap-4 group">
                  {/* Image */}
                  <Link to={`/product/${product.id}`} onClick={onClose} className="shrink-0">
                    <div className="w-20 h-24 bg-gray-100 overflow-hidden border border-gray-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <Link
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="text-[12px] uppercase tracking-[0.15em] font-medium text-[#1a1a1a] hover:text-gray-500 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[13px] font-light text-gray-500 mt-1 tracking-wide">
                        {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => { addToCart(product, 1); }}
                        disabled={product.stock === 0}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1a1a1a] text-white px-4 py-2 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                      </button>
                      <button
                        onClick={() => removeFromFavorites(product.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="px-8 pb-8 pt-4 text-center text-[10px] uppercase tracking-[0.2em] text-gray-400 border-t border-gray-100 mt-auto">
          Your wishlist is saved for this session
        </p>
      </div>
    </>
  );
};

export default FavoritesDrawer;
