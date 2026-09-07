import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    subtext: 'Bangles, tennis & cuffs',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Perfumes',
    to: '/shop?category=perfumes',
    subtext: 'Haute parfumerie (Women & Men)',
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

interface SearchMenuBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchMenuBox: React.FC<SearchMenuBoxProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  // Filter products when typing in search input
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
      .slice(0, 6);
  }, [query]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleNavigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleProductClick = (id: string) => {
    handleNavigate(`/product/${id}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Larger Lunar Style Rectangle Popover Box */}
      <div
        ref={containerRef}
        className="z-50 bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-[#2E2E2E] shadow-2xl shadow-black/25 dark:shadow-black/70 animate-fade-in text-[#111111] dark:text-[#F5F5F5] fixed top-[90px] md:top-[125px] left-3 right-3 md:left-auto md:right-8 lg:right-14 w-auto md:w-[660px] lg:w-[720px] max-w-[95vw] rounded-none"
        style={{
          maxHeight: 'calc(88vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Hairline */}
        <div className="h-[3px] bg-gradient-to-r from-[#C1A98F]/40 via-[#C1A98F] to-[#C1A98F]/40 w-full shrink-0" />

        {/* Upward Pointer Arrow (Desktop only, pointing towards the SEARCH button) */}
        <div className="hidden md:block absolute -top-[7px] right-[270px] lg:right-[290px] w-3.5 h-3.5 bg-white dark:bg-[#1E1E1E] border-t border-l border-gray-300 dark:border-[#2E2E2E] rotate-45 z-10" />

        {/* 1. Header & Search Input Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-[#2E2E2E] bg-[#FAF9F6] dark:bg-[#181818]">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#252525] border-2 border-gray-200 dark:border-[#2E2E2E] focus-within:border-[#C1A98F] focus-within:shadow-md transition-all">
              <Search className="w-5 h-5 text-gray-500 dark:text-[#AAAAAA] stroke-[2] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search jewelry, perfumes, collections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-base sm:text-lg font-serif italic text-black dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none tracking-wide"
              />
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333333] rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 text-gray-400 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#252525] hover:border-gray-300 dark:hover:border-[#2E2E2E] border border-transparent transition-all duration-300 shrink-0 cursor-pointer"
              aria-label="Close search menu"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </form>
        </div>

        {/* 2. Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* A. If user typed a search query -> Show Live Product Results */}
          {query.trim() !== '' ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-[#2E2E2E]">
                <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-gray-800 dark:text-[#F5F5F5]">
                  Search Results ({searchResults.length})
                </span>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-sans font-semibold uppercase tracking-wider text-[#8C6D4F] dark:text-[#C1A98F] hover:text-black dark:hover:text-white hover:underline cursor-pointer transition-colors"
                >
                  Back to Categories
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="p-3 flex items-center gap-4 cursor-pointer group bg-white dark:bg-[#252525] hover:bg-[#FAF6F0] dark:hover:bg-[#2c2c2c] border border-gray-200 dark:border-[#2E2E2E] hover:border-[#C1A98F] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-14 h-14 shrink-0 overflow-hidden bg-gray-100 dark:bg-[#181818] border border-gray-200 dark:border-[#2E2E2E]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-[#F5F5F5] group-hover:text-[#8C6D4F] dark:group-hover:text-[#C1A98F] transition-colors truncate">
                          {product.name}
                        </p>
                        <p className="text-xs font-serif uppercase tracking-widest text-gray-600 dark:text-[#AAAAAA] mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5] font-serif block">
                          {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#8C6D4F] dark:text-[#C1A98F] tracking-wider group-hover:underline flex items-center gap-0.5 justify-end mt-0.5">
                          <span>View piece</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full py-3.5 bg-black dark:bg-[#C1A98F] text-white dark:text-[#121212] text-xs font-sans font-bold uppercase tracking-[0.2em] hover:bg-[#8C6D4F] dark:hover:bg-[#D4AF37] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Explore all results for "{query}" in Shop</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-600 dark:text-[#AAAAAA]">
                  <p className="font-serif italic text-lg text-gray-900 dark:text-[#F5F5F5] mb-2">
                    No matching pieces found for "{query}"
                  </p>
                  <p className="text-xs font-sans uppercase tracking-wider text-gray-500 dark:text-[#888888] mb-5">
                    Try searching for gold, silver, rings, earrings, or perfumes
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="px-5 py-2 text-xs font-sans font-bold uppercase tracking-widest bg-black dark:bg-[#C1A98F] text-white dark:text-[#121212] hover:bg-[#8C6D4F] transition-colors shadow-xs cursor-pointer"
                  >
                    View All Categories
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* B. Default view -> Prominent Category Rectangles */
            <>
              {/* Categories Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#2E2E2E]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C1A98F]" />
                  <span className="text-xs sm:text-[13px] font-sans font-bold uppercase tracking-[0.25em] text-[#111111] dark:text-[#F5F5F5]">
                    Menu Categories
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('/shop')}
                  className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#8C6D4F] dark:text-[#C1A98F] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
                >
                  <span>Shop All Pieces</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Category Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {siteCategories.map((cat) => (
                  <div
                    key={cat.label}
                    onClick={() => handleNavigate(cat.to)}
                    className="group relative flex items-center gap-4 p-3.5 sm:p-4 bg-white dark:bg-[#252525] hover:bg-[#FCFAF7] dark:hover:bg-[#2e2e2e] border border-gray-200 dark:border-[#2E2E2E] hover:border-[#C1A98F] shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Category Photo Thumbnail */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden bg-gray-100 dark:bg-[#181818] border border-gray-200 dark:border-[#2E2E2E]">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Category Name & Subtext */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-gray-900 dark:text-[#F5F5F5] group-hover:text-[#8C6D4F] dark:group-hover:text-[#C1A98F] transition-colors truncate">
                          {cat.label}
                        </span>
                        {cat.badge && (
                          <span className="text-[9px] font-sans font-extrabold px-1.5 py-0.5 bg-[#111111] dark:bg-[#C1A98F] text-white dark:text-black tracking-widest uppercase">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#AAAAAA] mt-1 line-clamp-1">
                        {cat.subtext}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8C6D4F] dark:group-hover:text-[#C1A98F] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>

              {/* C. Quick Links Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/app')}
                  className="py-2.5 px-3 bg-gray-50 dark:bg-[#252525] hover:bg-white dark:hover:bg-[#2e2e2e] border border-gray-200 dark:border-[#2E2E2E] hover:border-[#C1A98F] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#8C6D4F] dark:text-[#C1A98F] group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-gray-900 dark:text-[#F5F5F5] group-hover:text-black dark:group-hover:text-white">
                    Mobile App
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/track-order')}
                  className="py-2.5 px-3 bg-gray-50 dark:bg-[#252525] hover:bg-white dark:hover:bg-[#2e2e2e] border border-gray-200 dark:border-[#2E2E2E] hover:border-[#C1A98F] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4 text-[#8C6D4F] dark:text-[#C1A98F] group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-gray-900 dark:text-[#F5F5F5] group-hover:text-black dark:group-hover:text-white">
                    Track Order
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/contact')}
                  className="py-2.5 px-3 bg-gray-50 dark:bg-[#252525] hover:bg-white dark:hover:bg-[#2e2e2e] border border-gray-200 dark:border-[#2E2E2E] hover:border-[#C1A98F] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-[#8C6D4F] dark:text-[#C1A98F] group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-gray-900 dark:text-[#F5F5F5] group-hover:text-black dark:group-hover:text-white">
                    Contact
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 3. Footer Bar */}
        <div className="px-6 py-3.5 bg-[#FAF9F6] dark:bg-[#181818] border-t border-gray-200 dark:border-[#2E2E2E] flex items-center justify-between text-xs text-gray-600 dark:text-[#AAAAAA] font-serif italic">
          <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 dark:text-[#888888] font-medium">
            Free luxury delivery on orders over 50€
          </span>
          <button
            type="button"
            onClick={() => handleNavigate('/shop')}
            className="font-sans text-[10px] uppercase tracking-widest font-bold text-black dark:text-[#C1A98F] hover:text-[#8C6D4F] transition-colors cursor-pointer"
          >
            All Collections &rarr;
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchMenuBox;
