import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Truck, RotateCcw, Shield } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === id);
  const related = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 4);

  if (!product) {
    return (
      <div className="pt-32 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-light uppercase tracking-widest text-wonders-dark mb-8">Product Not Found</h2>
        <Link to="/sklep" className="text-wonders-gold hover:underline flex items-center gap-2 text-xs uppercase tracking-widest font-bold font-montserrat">
          <ArrowLeft className="w-4 h-4" /> Back to Boutique
        </Link>
      </div>
    );
  }

  const isSoldOut = product.stock === 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-wonders-muted mb-12">
          <button onClick={() => navigate(-1)} className="hover:text-wonders-dark transition-colors">Back</button>
          <span>/</span>
          <Link to="/sklep" className="hover:text-wonders-dark transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-wonders-dark truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden border border-wonders-border rounded-sm">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
            />
            {product.badge && (
              <span className={`absolute top-6 left-6 text-[10px] font-bold px-4 py-1 uppercase tracking-widest
                ${product.badge === 'SOLD OUT' ? 'bg-gray-100 text-gray-500' : 'bg-wonders-dark text-white'}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col pt-4">
            <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.3em] mb-4">Collection</p>
            <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.1em] text-wonders-dark mb-6 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-8">
              <span className="text-2xl font-bold text-wonders-dark tracking-wider">
                {product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
              {product.originalPrice && (
                <span className="ml-4 text-lg text-wonders-muted line-through tracking-wider">
                  {product.originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-wonders-muted text-sm leading-relaxed mb-10 max-w-xl">
              {product.description}
            </p>

            {/* Features/Details */}
            <div className="space-y-4 mb-10">
              {product.features.map(f => (
                <div key={f} className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-wonders-dark font-medium">
                  <span className="w-1.5 h-1.5 bg-wonders-gold rounded-full"></span>
                  {f}
                </div>
              ))}
            </div>

            {/* Qty + Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
              <div className="flex items-center gap-6 border border-wonders-border rounded-full px-6 py-3">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))} 
                  className="text-wonders-muted hover:text-wonders-dark transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-wonders-dark">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock || 100, q + 1))}
                  disabled={product.stock > 0 && qty >= product.stock}
                  className="text-wonders-muted hover:text-wonders-dark transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                id="product-add-to-cart"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex-1 w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-12 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300
                  ${added 
                    ? 'bg-green-600 text-white' 
                    : isSoldOut 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-wonders-dark text-white hover:bg-wonders-gold'}`}
              >
                {added ? (
                  <><Check className="w-4 h-4" /> Added to Bag</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> {isSoldOut ? 'Sold Out' : 'Add to Bag'}</>
                )}
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-t border-wonders-border">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: RotateCcw, label: '30-Day Returns' },
                { icon: Shield, label: 'Quality Guarantee' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center sm:items-start gap-2">
                  <Icon className="w-5 h-5 text-wonders-gold stroke-[1.5]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-wonders-dark">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="pt-24 border-t border-wonders-border">
            <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-wonders-dark mb-12 text-center">
              You May Also <span className="font-bold">Like</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
