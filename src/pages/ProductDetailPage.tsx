import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Check, Package, Shield, RotateCcw, Plus, Minus, Truck } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === id);
  const related = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 4);

  if (!product) {
    return (
      <div className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-lunar-text mb-4">Produkt nie znaleziony</h2>
        <Link to="/sklep" className="text-lunar-purple-light hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Wróć do sklepu
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-lunar-muted mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-lunar-purple-light transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Wróć
          </button>
          <span>/</span>
          <Link to="/sklep" className="hover:text-lunar-purple-light transition-colors">Sklep</Link>
          <span>/</span>
          <span className="text-lunar-text line-clamp-1">{product.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative group">
            <div className="aspect-square rounded-3xl overflow-hidden glass border border-lunar-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lunar-card/40 via-transparent to-transparent" />
            </div>
            {product.badge && (
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full
                ${product.badge === 'BESTSELLER' ? 'bg-lunar-gold text-black' :
                  product.badge === 'NOWOŚĆ' ? 'bg-lunar-purple text-white' :
                  'bg-red-600 text-white'}`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-red-600/90 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-sm text-lunar-purple-light font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-lunar-text mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-lunar-gold fill-lunar-gold' : 'text-lunar-border'}`} />
                ))}
              </div>
              <span className="text-sm text-lunar-muted">{product.rating} ({product.reviewCount} opinii)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-black text-lunar-text">{product.price.toLocaleString('pl-PL')} zł</span>
              {product.originalPrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-lunar-muted line-through">{product.originalPrice} zł</span>
                  <span className="text-xs text-red-400 font-medium">Oszczędzasz {(product.originalPrice - product.price).toLocaleString('pl-PL')} zł</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-lunar-muted leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-lunar-text mb-3 uppercase tracking-wider">Cechy</h3>
              <ul className="space-y-2">
                {product.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-lunar-muted">
                    <Check className="w-4 h-4 text-lunar-purple-light shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 glass border border-lunar-border rounded-xl px-3 py-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-1 text-lunar-muted hover:text-lunar-text transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="p-1 text-lunar-muted hover:text-lunar-text transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                id="product-add-to-cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'btn-shimmer text-white hover:scale-[1.02]'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Dodano!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Dodaj do koszyka</>
                )}
              </button>
            </div>

            {/* Stock */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-lunar-gold text-sm mb-4">⚡ Tylko {product.stock} szt. w magazynie!</p>
            )}
            {product.stock === 0 && (
              <p className="text-red-400 text-sm mb-4">Brak w magazynie</p>
            )}

            {/* Assurances */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-lunar-border">
              {[
                { icon: Truck, label: 'Darmowa dostawa od 200 zł' },
                { icon: RotateCcw, label: 'Zwrot do 30 dni' },
                { icon: Shield, label: 'Gwarancja 2 lata' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-lunar-muted">
                  <Icon className="w-4 h-4 text-lunar-purple-light" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-8">
              Podobne <span className="gradient-text">produkty</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
