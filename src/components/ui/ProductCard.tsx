import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isSoldOut = (product.stock !== undefined && product.stock <= 0) || product.badge === 'SOLD OUT' || product.isAvailable === false;
  const favorited = isFavorite(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-[#EDE6DF] p-4 flex flex-col justify-between h-full shadow-2xs hover:border-[#C1A98F]/50 hover:shadow-md transition-all duration-200">
      {/* Top Image Container */}
      <div>
        <div className="relative w-full aspect-[4/5] bg-[#FAF7F5] rounded-xl overflow-hidden mb-4">
          <Link to={`/product/${product.id}`} className="block w-full h-full cursor-pointer">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
            />
          </Link>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 pointer-events-none">
            <Link 
              to={`/product/${product.id}`}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#1a1a1a] shadow-md hover:bg-[#c1a98f] hover:text-white transition-all pointer-events-auto"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product);
              }}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all pointer-events-auto"
              aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className="w-4 h-4 transition-colors duration-200"
                style={{
                  stroke: favorited ? '#e11d48' : '#1a1a1a',
                  fill: favorited ? '#e11d48' : 'none',
                }}
              />
            </button>
          </div>

          {/* Favorite indicator — always visible if favorited */}
          {favorited && (
            <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm pointer-events-none">
              <Heart className="w-3.5 h-3.5" style={{ stroke: '#e11d48', fill: '#e11d48' }} />
            </div>
          )}

          {/* Badges */}
          {product.badge && (
            <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider pointer-events-none shadow-xs
              ${product.badge === 'SOLD OUT' ? 'bg-gray-200 text-gray-700' : 'bg-[#1a1a1a] text-[#C1A98F]'}`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-medium">Lunar Exclusive</p>
          
          {/* Title with guaranteed fixed 2-line height */}
          <Link 
            to={`/product/${product.id}`}
            className="h-10 flex items-center justify-center text-xs font-bold text-[#1a1a1a] hover:text-[#8c6d4f] transition-colors uppercase tracking-wider line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </Link>

          {/* Rating Stars snippet */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating || 5)
                      ? 'text-[#D4AF37] fill-[#D4AF37]'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#1a1a1a]">
              {(product.rating || 5.0).toFixed(1)}
            </span>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <span className="text-[10px] text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area: Price & Action */}
      <div className="flex flex-col items-center pt-2 border-t border-gray-100/80">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-bold text-[#1a1a1a] tracking-wider">
            {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through tracking-wider">
              {product.originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={isSoldOut}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 text-[11px] uppercase tracking-widest font-bold
            ${isSoldOut 
              ? 'border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'bg-[#FAF7F5] hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-[#C1A98F] border border-[#EDE6DF] hover:border-[#1a1a1a]'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
