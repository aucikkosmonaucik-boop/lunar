import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Truck, RotateCcw, Shield, Heart, Coins, Image as ImageIcon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useLoyalty } from '../hooks/useLoyalty';
import ProductCard from '../components/ui/ProductCard';
import { ProductReviews } from '../components/ui/ProductReviews';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProductById, getProductBySlug } = useProducts();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { calculatePointsToEarn } = useLoyalty();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const product = id ? (getProductById(id) || getProductBySlug(id)) : undefined;

  const [currentRating, setCurrentRating] = useState(product?.rating || 5.0);
  const [currentReviewCount, setCurrentReviewCount] = useState(product?.reviewCount || 0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    setQty(1);
    if (product) {
      setCurrentRating(product.rating || 5.0);
      setCurrentReviewCount(product.reviewCount || 0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="pt-32 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-light uppercase tracking-widest text-wonders-dark mb-8">Product Not Found</h2>
        <Link to="/shop" className="text-wonders-gold hover:underline flex items-center gap-2 text-xs uppercase tracking-widest font-bold font-montserrat">
          <ArrowLeft className="w-4 h-4" /> Back to Boutique
        </Link>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = galleryImages[activeImageIndex] || product.image;
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  const isSoldOut = (product.stock !== undefined && product.stock <= 0) || product.badge === 'SOLD OUT' || product.isAvailable === false;
  const pointsToEarn = calculatePointsToEarn(product.price * qty);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only trigger if horizontal intent is clear and past threshold
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swiped left -> next image
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else {
        // Swiped right -> prev image
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-wonders-muted mb-12">
          <button onClick={() => navigate(-1)} className="hover:text-wonders-dark transition-colors">Back</button>
          <span>/</span>
          <Link to="/shop" className="hover:text-wonders-dark transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-wonders-dark truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Gallery Section */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails list if multiple images */}
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 md:w-20 md:h-24 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-black ring-1 ring-black shadow-md'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image Container with Mobile Swipe */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}
              className="relative flex-1 aspect-[4/5] bg-gray-50 overflow-hidden border border-wonders-border rounded-sm group select-none touch-pan-y overscroll-x-none"
            >
              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
              />

              {product.badge && (
                <span className={`absolute top-6 left-6 text-[10px] font-bold px-4 py-1 uppercase tracking-widest shadow
                  ${product.badge === 'SOLD OUT' ? 'bg-gray-100 text-gray-500' : product.badge === 'SALE' ? 'bg-red-600 text-white' : 'bg-wonders-dark text-white'}`}>
                  {product.badge}
                </span>
              )}

              {galleryImages.length > 1 && (
                <>
                  {/* Arrows for fast image navigation */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                    }}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                    }}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                    <ImageIcon className="w-3 h-3" />
                    <span>{activeImageIndex + 1} / {galleryImages.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col pt-4 lg:pt-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] text-wonders-gold font-bold uppercase tracking-[0.3em]">
                {product.category}
              </p>
              {product.stock > 0 && (
                <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded border border-green-200">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-light uppercase tracking-[0.1em] text-wonders-dark mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Star Rating Header & Review Link */}
            <a
              href="#reviews"
              className="inline-flex items-center gap-2.5 mb-6 group cursor-pointer w-fit"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(currentRating)
                        ? 'text-[#D4AF37] fill-[#D4AF37]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-wonders-dark group-hover:text-wonders-gold transition-colors">
                {currentRating.toFixed(1)}
              </span>
              <span className="text-xs text-wonders-muted group-hover:text-[#1A1A1A] group-hover:underline">
                ({currentReviewCount} {currentReviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </a>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-wonders-dark tracking-wider">
                {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-wonders-muted line-through tracking-wider">
                    {product.originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Loyalty Points Banner */}
            <div className="mb-8 p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border border-amber-200/80 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A]">
                    Earn +{pointsToEarn} pts with LUNAR Club
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Redeem points for exclusive discount vouchers in your account
                  </p>
                </div>
              </div>
              <Link
                to="/account"
                className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] hover:text-[#D4AF37] underline whitespace-nowrap ml-2"
              >
                View Rewards
              </Link>
            </div>

            {/* Description */}
            <p className="text-wonders-muted text-base leading-relaxed mb-8 max-w-xl whitespace-pre-line">
              {product.description}
            </p>

            {/* Features/Details */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3 mb-10">
                {product.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[13px] uppercase tracking-widest text-wonders-dark font-medium">
                    <span className="w-1.5 h-1.5 bg-wonders-gold rounded-full"></span>
                    {f}
                  </div>
                ))}
              </div>
            )}

            {/* Qty + Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
              <div className="flex items-center gap-6 border border-wonders-border rounded-full px-6 py-3">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))} 
                  disabled={isSoldOut || qty <= 1}
                  className="text-wonders-muted hover:text-wonders-dark transition-colors disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-wonders-dark">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock || 100, q + 1))}
                  disabled={isSoldOut || (product.stock > 0 && qty >= product.stock)}
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

              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(product)}
                className="w-14 h-14 rounded-full border border-wonders-border flex items-center justify-center hover:border-red-300 transition-all duration-300 shrink-0"
                aria-label={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className="w-5 h-5 transition-all duration-300"
                  style={{
                    stroke: isFavorite(product.id) ? '#e11d48' : '#1a1a1a',
                    fill: isFavorite(product.id) ? '#e11d48' : 'none',
                  }}
                />
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

        {/* Customer Reviews & Ratings Section */}
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          onReviewAdded={(newR, newC) => {
            setCurrentRating(newR);
            setCurrentReviewCount(newC);
          }}
        />

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
