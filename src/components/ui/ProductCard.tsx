import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isSoldOut = product.stock === 0;
  const favorited = isFavorite(product.id);

  return (
    <div className="group flex flex-col items-center text-center animate-fade-in mb-8">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-gray-50 mb-6 overflow-hidden border border-wonders-border rounded-sm">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link 
            to={`/product/${product.id}`}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-wonders-dark shadow-sm hover:bg-wonders-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => toggleFavorite(product)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
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
          <div className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Heart className="w-3.5 h-3.5" style={{ stroke: '#e11d48', fill: '#e11d48' }} />
          </div>
        )}

        {/* Labels */}
        {product.badge && (
          <span className={`absolute top-4 left-4 text-[9px] font-bold px-3 py-1 uppercase tracking-widest
            ${product.badge === 'SOLD OUT' ? 'bg-gray-100 text-gray-500' : 'bg-wonders-dark text-white'}`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-center px-2">
        <p className="text-[10px] text-wonders-muted uppercase tracking-[0.2em] mb-2 font-medium">by Lunar</p>
        <Link 
          to={`/product/${product.id}`}
          className="text-xs font-semibold text-wonders-dark hover:text-wonders-gold transition-colors mb-3 uppercase tracking-wider line-clamp-2 max-w-[180px]"
        >
          {product.name}
        </Link>
        <p className="text-xs font-bold text-wonders-gold tracking-[0.2em] mb-6">
          {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={isSoldOut}
          className={`group/btn flex items-center gap-3 px-8 py-3 rounded-full border transition-all duration-300 text-[10px] uppercase tracking-widest font-bold
            ${isSoldOut 
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'border-wonders-gold text-wonders-gold hover:bg-wonders-gold hover:text-white'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
