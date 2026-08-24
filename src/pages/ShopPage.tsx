import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, X, RotateCcw, Filter, ChevronRight, Check } from 'lucide-react';
import { categories } from '../data/products';
import type { SortOption } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured Pieces' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const curatedCollections: { tag: string; label: string; badge?: string }[] = [
  { tag: 'new-arrivals', label: 'New Arrivals', badge: 'NEW' },
  { tag: 'ready-to-ship', label: 'Ready To Ship', badge: 'FAST' },
  { tag: 'bestseller', label: 'Bestsellers', badge: 'HOT' },
  { tag: 'sale', label: 'Sale & Offers', badge: 'SALE' },
];

const ShopPage: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const catParam = searchParams.get('category');
    const filterParam = searchParams.get('filter');
    const tagParam = searchParams.get('tag');
    const sortParam = searchParams.get('sort');

    if (catParam) {
      const matched = categories.find(c => c.toLowerCase().replace(/[\s-]/g, '') === catParam.toLowerCase().replace(/[\s-]/g, ''));
      if (matched) {
        setCategory(matched);
      } else if (catParam.toLowerCase() === 'perfumes') {
        setCategory('Perfumes Women');
      } else if (catParam.toLowerCase() === 'jewelry') {
        setCategory('Jewelry');
      } else if (catParam.toLowerCase() === 'all') {
        setCategory('All');
      }
    } else {
      setCategory('All');
    }

    if (tagParam) {
      setActiveTag(tagParam);
    } else {
      setActiveTag(null);
    }

    if (filterParam === 'new' || filterParam === 'latest' || sortParam === 'newest') {
      setSort('newest');
    } else if (sortParam) {
      setSort(sortParam as SortOption);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setActiveTag(null);
    if (cat === 'All') {
      searchParams.delete('category');
      searchParams.delete('tag');
    } else {
      searchParams.set('category', cat.toLowerCase().replace(/\s+/g, '-'));
      searchParams.delete('tag');
    }
    setSearchParams(searchParams);
  };

  const handleTagChange = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
      searchParams.delete('tag');
    } else {
      setActiveTag(tag);
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setActiveTag(null);
    setSort('featured');
    setSearchParams({});
  };

  // Helper count for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const cat of categories) {
      if (cat === 'All') continue;
      const normalized = cat.toLowerCase().replace(/\s+/g, '-');
      if (cat === 'Jewelry') {
        counts[cat] = products.filter(p => p.category === 'jewelry' || p.category === 'earrings' || p.category === 'rings' || p.category === 'necklaces' || p.category === 'bracelets' || p.category === 'bridal' || p.tags.includes('jewelry')).length;
      } else {
        counts[cat] = products.filter(p => p.category.toLowerCase().includes(normalized) || p.tags.some(t => t === normalized)).length;
      }
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeTag) {
      list = list.filter(p => p.tags.includes(activeTag) || p.badge?.toLowerCase().replace(/\s+/g, '-') === activeTag);
    } else if (category !== 'All') {
      const normalizedCat = category.toLowerCase().replace(/\s+/g, '-');
      if (category === 'Jewelry') {
        list = list.filter(p => p.category === 'jewelry' || p.category === 'earrings' || p.category === 'rings' || p.category === 'necklaces' || p.category === 'bracelets' || p.category === 'bridal' || p.tags.includes('jewelry'));
      } else {
        list = list.filter(p => p.category.toLowerCase().includes(normalizedCat) || p.tags.some(t => t === normalizedCat));
      }
    }

    switch (sort) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating':     return list.sort((a, b) => b.rating - a.rating);
      case 'newest':     return list.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
      default:           return list;
    }
  }, [products, search, category, sort, activeTag]);

  const pageTitle = activeTag === 'ready-to-ship'
    ? 'Ready To Ship'
    : activeTag === 'new-arrivals'
    ? 'Latest Arrivals'
    : activeTag === 'bestseller'
    ? 'Bestsellers'
    : activeTag === 'sale'
    ? 'Sale & Special Offers'
    : category !== 'All'
    ? category
    : 'Our Boutique Collection';

  const isAnyFilterActive = search.trim() !== '' || category !== 'All' || activeTag !== null || sort !== 'featured';

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-[#FCFBF9]">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          <p className="text-[11px] text-[#c1a98f] font-semibold uppercase tracking-[0.35em] mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c1a98f]" />
            Lunar Catalog
            <Sparkles className="w-3.5 h-3.5 text-[#c1a98f]" />
          </p>
          <h1 className="text-3xl md:text-5xl font-serif text-[#1a1a1a] tracking-[0.12em] mb-3 uppercase">
            {pageTitle}
          </h1>
          <div className="w-12 h-[1.5px] bg-[#c1a98f] mx-auto mb-3"></div>
          <p className="text-[#757575] text-xs uppercase tracking-[0.2em]">
            {filtered.length} {filtered.length === 1 ? 'exceptional piece' : 'exceptional pieces'} available
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#EDE6DF] shadow-xs">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a1a1a]"
          >
            <Filter className="w-4 h-4 text-[#8c6d4f]" />
            <span>Filters & Categories {isAnyFilterActive ? '• (Active)' : ''}</span>
          </button>
          
          <span className="text-xs text-gray-500 font-medium">
            {filtered.length} items
          </span>
        </div>

        {/* Main Two-Column Layout (Sidebar Left + Products Center) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR (Sticky on Desktop)                          */}
          {/* ======================================================== */}
          <aside className={`w-full lg:w-64 xl:w-72 shrink-0 space-y-7 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'} lg:sticky lg:top-24`}>
            
            {/* 1. Search Box */}
            <div className="bg-white p-4 rounded-xl border border-[#EDE6DF] shadow-xs">
              <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Find rings, perfumes..."
                  className="w-full pl-8 pr-7 py-2 text-xs bg-[#FAF7F5] border border-gray-200 text-[#1a1a1a] placeholder:text-gray-400 rounded-lg outline-none focus:border-[#c1a98f] focus:bg-white transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Vertical Categories Menu */}
            <div className="bg-white p-5 rounded-xl border border-[#EDE6DF] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#1a1a1a]">
                  Categories
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {categories.length}
                </span>
              </div>

              <div className="space-y-1">
                {categories.map(cat => {
                  const isSelected = category === cat && !activeTag;
                  const count = categoryCounts[cat] || 0;

                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs tracking-wider uppercase transition-all duration-200 group ${
                        isSelected
                          ? 'bg-[#1a1a1a] text-white font-bold shadow-xs'
                          : 'text-gray-600 hover:bg-[#FAF7F5] hover:text-[#1a1a1a]'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {isSelected && <Check className="w-3 h-3 text-[#c1a98f] shrink-0" />}
                        <span className="truncate">{cat}</span>
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-[#c1a98f]/30 text-[#c1a98f]'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Curated Collections / Badges */}
            <div className="bg-white p-5 rounded-xl border border-[#EDE6DF] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#1a1a1a]">
                  Curated Filters
                </span>
              </div>

              <div className="space-y-1.5">
                {curatedCollections.map(col => {
                  const isSelected = activeTag === col.tag;

                  return (
                    <button
                      key={col.tag}
                      onClick={() => handleTagChange(col.tag)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs tracking-wider uppercase transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#c1a98f] text-black font-bold shadow-xs'
                          : 'text-gray-600 hover:bg-[#FAF7F5] hover:text-[#1a1a1a]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="w-3 h-3 text-black shrink-0" />}
                        <span>{col.label}</span>
                      </span>
                      {col.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {col.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Sort Options */}
            <div className="bg-white p-5 rounded-xl border border-[#EDE6DF] shadow-xs">
              <label className="block text-[11px] uppercase tracking-[0.25em] font-bold text-[#1a1a1a] mb-3 pb-2 border-b border-gray-100">
                Sort Pieces
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs font-medium uppercase tracking-wider bg-[#FAF7F5] border border-gray-200 text-[#1a1a1a] rounded-lg outline-none focus:border-[#c1a98f] focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* 5. Clear All Filters Button */}
            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-red-700 border border-red-200 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}

          </aside>

          {/* ======================================================== */}
          {/* CENTER / MAIN CONTENT (Product Grid)                     */}
          {/* ======================================================== */}
          <main className="flex-1 min-w-0 w-full">
            
            {/* Top Toolbar / Active Tags Summary */}
            <div className="bg-white px-5 py-3.5 rounded-xl border border-[#EDE6DF] shadow-xs mb-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-semibold text-[#1a1a1a]">
                  {category !== 'All' ? category : 'All Collection'}
                </span>
                {activeTag && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-[#8c6d4f] capitalize">{activeTag.replace('-', ' ')}</span>
                  </>
                )}
                <span className="text-gray-400 ml-1">({filtered.length} items)</span>
              </div>

              {/* Active Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {category !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F5] border border-gray-200 text-gray-700 text-[11px] rounded-full">
                    <span>{category}</span>
                    <button onClick={() => handleCategoryChange('All')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeTag && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C1A98F]/20 border border-[#C1A98F]/40 text-[#8c6d4f] font-bold text-[11px] rounded-full">
                    <span>{activeTag.replace('-', ' ')}</span>
                    <button onClick={() => handleTagChange(activeTag)} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 text-[11px] rounded-full">
                    <span>"{search}"</span>
                    <button onClick={() => setSearch('')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white p-8 rounded-2xl border border-[#EDE6DF] shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F5] flex items-center justify-center text-[#c1a98f] mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif uppercase tracking-[0.15em] text-[#1a1a1a] mb-2 font-bold">
                  No pieces found
                </h3>
                <p className="text-gray-500 text-xs tracking-wider max-w-sm mb-6 leading-relaxed">
                  We couldn't find any jewelry or fragrance matching your active criteria. Try adjusting your search term or clearing filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#c1a98f] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All Products</span>
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};

export default ShopPage;
