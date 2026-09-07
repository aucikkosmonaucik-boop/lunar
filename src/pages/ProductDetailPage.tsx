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
      <div className="pt-10 sm:pt-16 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-medium uppercase tracking-widest text-wonders-dark mb-8">Product Not Found</h2>
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
    <div className="pt-4 sm:pt-8 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-white dark:bg-[#121212] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-wonders-muted dark:text-[#AAAAAA] mb-6 sm:mb-10">
          <button onClick={() => navigate(-1)} className="hover:text-wonders-dark dark:hover:text-[#F5F5F5] transition-colors">Back</button>
          <span>/</span>
          <Link to="/shop" className="hover:text-wonders-dark dark:hover:text-[#F5F5F5] transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-wonders-dark dark:text-[#F5F5F5] truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 sm:mb-24">
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
                        ? 'border-black dark:border-[#C1A98F] ring-1 ring-black dark:ring-[#C1A98F] shadow-md'
                        : 'border-gray-200 dark:border-[#2E2E2E] opacity-70 hover:opacity-100'
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
              className="relative flex-1 aspect-[4/5] bg-gray-50 dark:bg-[#1E1E1E] overflow-hidden border border-wonders-border dark:border-[#2E2E2E] rounded-sm group select-none touch-pan-y overscroll-x-none"
            >
              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
              />

              {product.badge && (
                <span className={`absolute top-6 left-6 text-[10px] font-bold px-4 py-1 uppercase tracking-widest shadow
                  ${product.badge === 'SOLD OUT' ? 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400' : product.badge === 'SALE' ? 'bg-red-600 text-white' : 'bg-wonders-dark dark:bg-[#C1A98F] text-white dark:text-black'}`}>
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
              <p className="text-[14px] text-wonders-gold dark:text-[#C1A98F] font-bold uppercase tracking-[0.3em]">
                {product.category}
              </p>
              {product.stock > 0 && (
                <span className="text-[11px] font-bold text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-green-200 dark:border-emerald-800/60">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-medium uppercase tracking-[0.1em] text-wonders-dark dark:text-[#F5F5F5] mb-3 leading-tight font-serif">
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
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-wonders-dark dark:text-[#F5F5F5] group-hover:text-wonders-gold dark:group-hover:text-[#C1A98F] transition-colors">
                {currentRating.toFixed(1)}
              </span>
              <span className="text-xs text-wonders-muted dark:text-[#AAAAAA] group-hover:text-[#1A1A1A] dark:group-hover:text-white group-hover:underline">
                ({currentReviewCount} {currentReviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </a>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-wonders-dark dark:text-[#F5F5F5] tracking-wider">
                {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-wonders-muted dark:text-[#777777] line-through tracking-wider">
                    {product.originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800/60 uppercase tracking-wider">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Loyalty Points Banner */}
            <div className="mb-8 p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-[#252018] dark:via-[#1E1E1E] dark:to-[#252018] border border-amber-200/80 dark:border-amber-900/40 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-[#332B20] border border-amber-300 dark:border-amber-700/50 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5F5F5]">
                    Earn +{pointsToEarn} pts with LUNAR Club
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-[#AAAAAA]">
                    Redeem points for exclusive discount vouchers in your account
                  </p>
                </div>
              </div>
              <Link
                to="/account"
                className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] dark:text-[#C1A98F] hover:text-[#D4AF37] underline whitespace-nowrap self-end sm:self-auto"
              >
                View Rewards
              </Link>
            </div>

            {/* Description */}
            <p className="text-wonders-muted dark:text-[#AAAAAA] text-base leading-relaxed mb-8 max-w-xl whitespace-pre-line">
              {product.description}
            </p>

            {/* Features/Details */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3 mb-10">
                {product.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[13px] uppercase tracking-widest text-wonders-dark dark:text-[#F5F5F5] font-medium">
                    <span className="w-1.5 h-1.5 bg-wonders-gold dark:bg-[#C1A98F] rounded-full"></span>
                    {f}
                  </div>
                ))}
              </div>
            )}

            {/* Qty + Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-12">
              <div className="flex items-center justify-between sm:justify-center gap-6 border border-wonders-border dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] rounded-full px-6 py-3 shrink-0">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))} 
                  disabled={isSoldOut || qty <= 1}
                  className="text-wonders-muted dark:text-[#AAAAAA] hover:text-wonders-dark dark:hover:text-[#F5F5F5] transition-colors disabled:opacity-30 cursor-pointer p-1"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-wonders-dark dark:text-[#F5F5F5]">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock || 100, q + 1))}
                  disabled={isSoldOut || (product.stock > 0 && qty >= product.stock)}
                  className="text-wonders-muted dark:text-[#AAAAAA] hover:text-wonders-dark dark:hover:text-[#F5F5F5] transition-colors disabled:opacity-30 cursor-pointer p-1"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:flex-1">
                <button
                  id="product-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-8 sm:px-12 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 cursor-pointer
                    ${added 
                      ? 'bg-green-600 text-white' 
                      : isSoldOut 
                        ? 'bg-gray-100 dark:bg-[#252525] text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                        : 'bg-wonders-dark dark:bg-[#C1A98F] text-white dark:text-black hover:bg-wonders-gold dark:hover:bg-[#d6beab]'}`}
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
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-wonders-border dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-[#1a1a1a] dark:text-[#F5F5F5] flex items-center justify-center hover:border-red-300 dark:hover:border-red-400/50 transition-all duration-300 shrink-0 cursor-pointer"
                aria-label={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className="w-5 h-5 transition-all duration-300"
                  style={{
                    stroke: isFavorite(product.id) ? '#e11d48' : 'currentColor',
                    fill: isFavorite(product.id) ? '#e11d48' : 'none',
                  }}
                />
              </button>
              </div>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-t border-wonders-border dark:border-[#2E2E2E]">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: RotateCcw, label: '30-Day Returns' },
                { icon: Shield, label: 'Quality Guarantee' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center sm:items-start gap-2">
                  <Icon className="w-5 h-5 text-wonders-gold dark:text-[#C1A98F] stroke-[1.5]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-wonders-dark dark:text-[#F5F5F5]">{label}</span>
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
          <section className="pt-24 border-t border-wonders-border dark:border-[#2E2E2E]">
            <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-wonders-dark dark:text-[#F5F5F5] mb-12 text-center">
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
