import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  X, 
  RotateCcw, 
  Filter, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  Grid2X2, 
  Square,
  Sliders
} from 'lucide-react';
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'1-col' | '2-col'>('2-col');

  // Derive filter state directly from URL params
  const catParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');
  const tagParam = searchParams.get('tag');
  const sortParam = searchParams.get('sort');

  const category = useMemo(() => {
    if (!catParam) return 'All';
    const matched = categories.find(c => c.toLowerCase().replace(/[\s-]/g, '') === catParam.toLowerCase().replace(/[\s-]/g, ''));
    if (matched) return matched;
    if (catParam.toLowerCase() === 'perfumes') return 'Perfumes Women';
    if (catParam.toLowerCase() === 'jewelry') return 'Jewelry';
    return 'All';
  }, [catParam]);

  const activeTag = tagParam || null;

  const sort: SortOption = useMemo(() => {
    if (filterParam === 'new' || filterParam === 'latest' || sortParam === 'newest') return 'newest';
    if (sortParam && ['featured', 'newest', 'price-asc', 'price-desc', 'rating'].includes(sortParam)) {
      return sortParam as SortOption;
    }
    return 'featured';
  }, [filterParam, sortParam]);

  const handleCategoryChange = (cat: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat.toLowerCase().replace(/\s+/g, '-'));
    }
    nextParams.delete('tag');
    setSearchParams(nextParams);
  };

  const handleTagChange = (tag: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (activeTag === tag) {
      nextParams.delete('tag');
    } else {
      nextParams.set('tag', tag);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (newSort: SortOption) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSort === 'featured') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', newSort);
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearch('');
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
    <div className="pt-16 sm:pt-24 pb-20 sm:pb-24 px-3 sm:px-6 lg:px-8 min-h-screen bg-[#FCFBF9]">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-10 text-center">
          <p className="text-[10px] sm:text-[11px] text-[#c1a98f] font-semibold uppercase tracking-[0.35em] mb-1.5 sm:mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c1a98f]" />
            Lunar Catalog
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c1a98f]" />
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a] tracking-[0.12em] mb-2 sm:mb-3 uppercase">
            {pageTitle}
          </h1>
          <div className="w-10 sm:w-12 h-[1.5px] bg-[#c1a98f] mx-auto mb-2 sm:mb-3"></div>
          <p className="text-[#757575] text-[11px] sm:text-xs uppercase tracking-[0.2em]">
            {filtered.length} {filtered.length === 1 ? 'exceptional piece' : 'exceptional pieces'} available
          </p>
        </div>

        {/* ======================================================== */}
        {/* MOBILE CONTROLS: Quick Horizontal Category Chips Bar      */}
        {/* ======================================================== */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-3 px-3">
            {categories.map((cat) => {
              const isSelected = category === cat && !activeTag;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white shadow-sm border border-[#1a1a1a]'
                      : 'bg-white text-gray-700 hover:bg-[#FAF7F5] border border-[#EDE6DF]'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#C1A98F] text-black'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE CONTROLS BAR: Dropdowns, View Switcher & Filter    */}
        {/* ======================================================== */}
        <div className="lg:hidden mb-5 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#EDE6DF] shadow-xs flex flex-wrap items-center gap-2">
          
          {/* 1. Category Dropdown Selector */}
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs font-semibold uppercase tracking-wider bg-[#FAF7F5] border border-[#EDE6DF] text-[#1a1a1a] rounded-xl outline-none focus:border-[#c1a98f] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Categories ({products.length})</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({categoryCounts[cat] || 0})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          </div>

          {/* 2. Sort Dropdown */}
          <div className="relative flex-1 min-w-[120px]">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full pl-3 pr-8 py-2 text-xs font-semibold uppercase tracking-wider bg-[#FAF7F5] border border-[#EDE6DF] text-[#1a1a1a] rounded-xl outline-none focus:border-[#c1a98f] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          </div>

          {/* 3. View Mode Toggle (1-Col vs 2-Col) */}
          <div className="flex items-center bg-[#FAF7F5] p-1 rounded-xl border border-[#EDE6DF]">
            <button
              onClick={() => setViewMode('1-col')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === '1-col'
                  ? 'bg-[#1a1a1a] text-[#C1A98F] shadow-xs'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
              title="Full Width 1-Column View"
              aria-label="1 Column View"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('2-col')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === '2-col'
                  ? 'bg-[#1a1a1a] text-[#C1A98F] shadow-xs'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
              title="Compact 2-Column Grid View"
              aria-label="2 Columns View"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
          </div>

          {/* 4. Filter Drawer Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
              isAnyFilterActive
                ? 'bg-[#C1A98F] text-black border-[#C1A98F]'
                : 'bg-[#FAF7F5] hover:bg-white text-gray-700 border-[#EDE6DF]'
            }`}
            title="Open Filters & Search"
            aria-label="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

        </div>

        {/* ======================================================== */}
        {/* MOBILE SLIDE-OVER FILTER DRAWER / MODAL                   */}
        {/* ======================================================== */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            <div 
              className="fixed inset-0"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            
            <div className="relative bg-white rounded-t-3xl border-t border-[#EDE6DF] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10 animate-slide-up">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#EDE6DF] flex items-center justify-between bg-[#FAF7F5]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#8c6d4f]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1a1a1a]">
                    Filters & Catalog
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. Search Box */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-2">
                    Search Catalog
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Find rings, necklaces, perfumes..."
                      className="w-full pl-8 pr-7 py-2.5 text-xs bg-[#FAF7F5] border border-gray-200 text-[#1a1a1a] placeholder:text-gray-400 rounded-xl outline-none focus:border-[#c1a98f] focus:bg-white transition-all"
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

                {/* 2. Curated Filters */}
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-2.5">
                    Curated Collections
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {curatedCollections.map(col => {
                      const isSelected = activeTag === col.tag;
                      return (
                        <button
                          key={col.tag}
                          onClick={() => handleTagChange(col.tag)}
                          className={`flex items-center justify-between p-3 rounded-xl text-xs uppercase tracking-wider transition-all border ${
                            isSelected
                              ? 'bg-[#1a1a1a] text-[#C1A98F] border-[#1a1a1a] font-bold shadow-xs'
                              : 'bg-[#FAF7F5] text-gray-700 border-[#EDE6DF] hover:border-gray-300'
                          }`}
                        >
                          <span className="truncate">{col.label}</span>
                          {col.badge && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-[#C1A98F] text-black' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {col.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. All Categories Quick Grid */}
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-2.5">
                    Categories
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => {
                      const isSelected = category === cat && !activeTag;
                      const count = categoryCounts[cat] || 0;
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border ${
                            isSelected
                              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] font-bold shadow-xs'
                              : 'bg-white text-gray-700 border-[#EDE6DF] hover:bg-[#FAF7F5]'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          <span className="text-[10px] text-gray-400">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Reset Filters */}
                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-red-700 border border-red-200 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}

              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-[#EDE6DF] bg-white">
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full py-3.5 bg-[#1a1a1a] hover:bg-black text-[#C1A98F] rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Show {filtered.length} Pieces</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Main Two-Column Layout (Sidebar Left for Desktop + Products Grid) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* ======================================================== */}
          {/* DESKTOP LEFT SIDEBAR                                     */}
          {/* ======================================================== */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-7">
            
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
            <div className="bg-white p-5 rounded-2xl border border-[#EDE6DF] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDE6DF]">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#1a1a1a]">
                  Categories
                </span>
                <span className="text-[10px] text-[#8c6d4f] font-semibold bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#EDE6DF]">
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left rounded-xl text-xs tracking-wider uppercase transition-all duration-300 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#1a1a1a] text-white font-bold shadow-sm pl-4'
                          : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-[#FAF6F3] hover:pl-4 border border-transparent hover:border-[#EDE6DF]'
                      }`}
                    >
                      {/* Left luxury gold accent bar indicator on hover and active */}
                      <span 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${
                          isSelected ? 'h-3/5 bg-[#C1A98F]' : 'h-0 group-hover:h-3/5 bg-[#C1A98F]'
                        }`} 
                      />

                      <span className="flex items-center gap-2.5 truncate z-10 transition-transform duration-300">
                        {isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C1A98F] shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#C1A98F]/50 shrink-0 transition-colors" />
                        )}
                        <span className="truncate">{cat}</span>
                      </span>
                      
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all duration-300 z-10 ${
                          isSelected
                            ? 'bg-[#C1A98F]/20 text-[#C1A98F] font-bold'
                            : 'text-gray-400 group-hover:text-[#8c6d4f] group-hover:bg-[#C1A98F]/15 group-hover:font-semibold'
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
            <div className="bg-white p-5 rounded-2xl border border-[#EDE6DF] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDE6DF]">
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left rounded-xl text-xs tracking-wider uppercase transition-all duration-300 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#C1A98F] text-black font-bold shadow-sm'
                          : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-[#FAF6F3] hover:pl-4 border border-transparent hover:border-[#EDE6DF]'
                      }`}
                    >
                      <span 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${
                          isSelected ? 'h-3/5 bg-black' : 'h-0 group-hover:h-3/5 bg-[#C1A98F]'
                        }`} 
                      />

                      <span className="flex items-center gap-2.5">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-black shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#C1A98F] shrink-0 transition-colors" />
                        )}
                        <span>{col.label}</span>
                      </span>
                      {col.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                          isSelected 
                            ? 'bg-black text-white' 
                            : 'bg-[#FAF7F5] border border-[#EDE6DF] text-gray-500 group-hover:border-[#C1A98F]/40 group-hover:text-[#8c6d4f]'
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
                  onChange={e => handleSortChange(e.target.value as SortOption)}
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
          {/* MAIN CONTENT (Product Grid - Full Width / Responsive)    */}
          {/* ======================================================== */}
          <main className="flex-1 min-w-0 w-full">
            
            {/* Top Toolbar / Active Tags Summary */}
            <div className="bg-white px-3.5 sm:px-5 py-3 rounded-xl border border-[#EDE6DF] shadow-xs mb-5 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
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

            {/* Products Grid: Responsive according to viewMode on mobile */}
            {filtered.length > 0 ? (
              <div className={`grid ${
                viewMode === '1-col'
                  ? 'grid-cols-1 gap-5'
                  : 'grid-cols-2 gap-2.5 sm:gap-6'
              } lg:grid-cols-2 xl:grid-cols-3 items-stretch`}>
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE6DF] shadow-xs">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[#FAF7F5] flex items-center justify-center text-[#c1a98f] mb-4">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif uppercase tracking-[0.15em] text-[#1a1a1a] mb-2 font-bold">
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
