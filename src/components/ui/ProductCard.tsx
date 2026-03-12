import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const badgeColors: Record<string, string> = {
  'BESTSELLER': 'bg-lunar-gold text-black',
  'NOWOŚĆ':     'bg-lunar-purple text-white',
  'WYPRZEDAŻ':  'bg-red-600 text-white',
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative glass rounded-2xl overflow-hidden border border-lunar-border hover:border-lunar-purple/40 transition-all duration-300 hover:-translate-y-1 hover:glow-purple">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-lunar-card">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lunar-card/80 via-transparent to-transparent" />

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-lunar-border text-lunar-text'}`}>
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-red-600/90 text-white">
            -{discount}%
          </span>
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            to={`/produkt/${product.id}`}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-lunar-purple transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-lunar-purple transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-lunar-muted mb-1">{product.category}</p>
        <Link to={`/produkt/${product.id}`}>
          <h3 className="font-semibold text-lunar-text hover:text-lunar-purple-light transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-lunar-gold fill-lunar-gold' : 'text-lunar-border'}`}
              />
            ))}
          </div>
          <span className="text-xs text-lunar-muted">({product.reviewCount})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-lunar-text">{product.price.toLocaleString('pl-PL')} zł</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-lunar-muted line-through">{product.originalPrice} zł</span>
            )}
          </div>
          <button
            id={`cart-btn-${product.id}`}
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`p-2 rounded-xl transition-all duration-200 ${
              inCart
                ? 'bg-lunar-purple text-white'
                : 'bg-lunar-border text-lunar-muted hover:bg-lunar-purple hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-lunar-gold mt-2">⚡ Tylko {product.stock} szt. w magazynie!</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-400 mt-2">Brak w magazynie</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
