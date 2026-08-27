import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, Sparkles, Smartphone, PackageCheck, Headphones, ArrowRight } from 'lucide-react';
import { products } from '../../data/products';

interface CategoryItem {
  label: string;
  to: string;
  subtext: string;
  badge?: string;
  image: string;
}

const siteCategories: CategoryItem[] = [
  {
    label: 'Latest Arrivals',
    to: '/shop?tag=new-arrivals',
    subtext: 'Seasonal drops & novelties',
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Earrings',
    to: '/shop?category=earrings',
    subtext: 'Studs, hoops & drops',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Rings',
    to: '/shop?category=rings',
    subtext: 'Solitaires, bands & stacking',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Necklaces',
    to: '/shop?category=necklaces',
    subtext: 'Chains, chokers & pendants',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Bracelets',
    to: '/shop?category=bracelets',
    subtext: 'Bangles, cuffs & tennis',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Perfumes',
    to: '/shop?category=perfumes',
    subtext: 'Women & men haute parfumerie',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Gift Sets',
    to: '/shop?category=sets',
    subtext: 'Curated luxury boxed sets',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Bridal',
    to: '/shop?category=bridal',
    subtext: 'Pearls & wedding jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=300',
  },
];

const quickSearchTags = [
  'Gold Plated',
  '925 Silver',
  'Diamond',
  'Perfumes',
  'Bestsellers',
  'Chains',
];

interface SearchMenuBoxProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'desktop' | 'mobile';
}

export const SearchMenuBox: React.FC<SearchMenuBoxProps> = ({
  isOpen,
  onClose,
  variant = 'desktop',
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Filter products when typing
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(trimmed) ||
          p.description?.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.tags?.some((t) => t.toLowerCase().includes(trimmed))
        );
      })
      .slice(0, 5);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Subtle backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Lunar Style Rectangle Popover Box */}
      <div
        ref={containerRef}
        className={`z-50 bg-white border border-gray-200 shadow-2xl shadow-black/15 animate-fade-in text-[#1a1a1a] ${
          variant === 'desktop'
            ? 'absolute top-full mt-3.5 left-1/2 -translate-x-1/2 w-[480px] md:w-[520px] max-w-[90vw]'
            : 'fixed top-[85px] left-4 right-4 max-w-[420px] mx-auto'
        }`}
        style={{
          maxHeight: 'calc(85vh - 50px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Gold Accent Hairline */}
        <div className="h-[2.5px] bg-gradient-to-r from-transparent via-[#C1A98F] to-transparent w-full" />

        {/* Upward Pointer Arrow (Desktop only, positioned under Search button) */}
        {variant === 'desktop' && (
          <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-t border-l border-gray-200 rotate-45 z-10" />
        )}

        {/* 1. Header & Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400 stroke-[1.8] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search jewelry, perfumes, collections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base font-serif italic text-black placeholder-gray-400 focus:outline-none tracking-wide"
            />
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-black transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-black hover:rotate-90 transition-all duration-300 ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </form>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* A. If user typed a search query -> Show Live Product Results */}
          {query.trim() !== '' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-gray-400">
                  Search Results ({searchResults.length})
                </span>
                <button
                  onClick={() => setQuery('')}
                  className="text-[10px] font-sans uppercase tracking-widest text-[#8C6D4F] hover:text-black transition-colors"
                >
                  View Categories
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-100">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="py-2.5 flex items-center gap-3 cursor-pointer group hover:bg-gray-50/70 px-2 -mx-2 transition-colors"
                    >
                      <div className="w-12 h-12 shrink-0 overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 group-hover:text-[#8C6D4F] transition-colors truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-serif uppercase tracking-widest text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-gray-900 font-serif">
                          {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-2.5 bg-black text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] hover:bg-[#8C6D4F] transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Explore all matching pieces</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p className="font-serif italic text-base mb-2">No matching pieces found for "{query}"</p>
                  <p className="text-[11px] font-sans uppercase tracking-wider text-gray-400 mb-4">
                    Try searching for gold, silver, necklace, or perfumes
                  </p>
                  <button
                    onClick={() => setQuery('')}
                    className="text-xs font-sans font-bold uppercase tracking-widest text-black underline underline-offset-4 hover:text-[#8C6D4F]"
                  >
                    Back to categories
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* B. Default view -> Lunar Categories Menu Rectangles */
            <>
              {/* Categories Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C1A98F]" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-gray-500">
                    Menu Categories
                  </span>
                </div>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#8C6D4F] hover:text-black transition-colors flex items-center gap-1 group"
                >
                  <span>Shop All</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Rectangular / Square Category Tiles (Lunar Style) */}
              <div className="grid grid-cols-2 gap-2.5">
                {siteCategories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.to}
                    onClick={onClose}
                    className="group relative flex items-center gap-2.5 p-2.5 bg-[#FAFAFA] hover:bg-white border border-gray-100 hover:border-[#C1A98F] transition-all duration-300 shadow-xs"
                  >
                    <div className="w-10 h-10 shrink-0 overflow-hidden bg-gray-200 border border-gray-100">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-[13px] tracking-[0.14em] uppercase text-[#1a1a1a] font-medium group-hover:text-black truncate">
                          {cat.label}
                        </span>
                        {cat.badge && (
                          <span className="text-[8px] font-sans font-bold px-1 py-0.2 bg-black text-white tracking-widest uppercase">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-sans tracking-wide block truncate">
                        {cat.subtext}
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#C1A98F] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>

              {/* Popular Searches / Tags */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-gray-400 block mb-2">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-black hover:text-white border border-gray-200/80 transition-all duration-200 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Site Quick Links in Lunar Style */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <Link
                  to="/app"
                  onClick={onClose}
                  className="py-1.5 px-2 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#C1A98F] transition-all flex flex-col items-center gap-1 group"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#8C6D4F] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-gray-800">
                    Mobile App
                  </span>
                </Link>
                <Link
                  to="/track-order"
                  onClick={onClose}
                  className="py-1.5 px-2 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#C1A98F] transition-all flex flex-col items-center gap-1 group"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-[#8C6D4F] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-gray-800">
                    Track Order
                  </span>
                </Link>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="py-1.5 px-2 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#C1A98F] transition-all flex flex-col items-center gap-1 group"
                >
                  <Headphones className="w-3.5 h-3.5 text-[#8C6D4F] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-gray-800">
                    Contact
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 3. Footer Bar */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-serif italic">
          <span>Free luxury delivery on orders over 50€</span>
          <Link
            to="/shop"
            onClick={onClose}
            className="font-sans text-[9px] uppercase tracking-widest font-bold text-black hover:text-[#8C6D4F] transition-colors"
          >
            All Collections &rarr;
          </Link>
        </div>
      </div>
    </>
  );
};

export default SearchMenuBox;
