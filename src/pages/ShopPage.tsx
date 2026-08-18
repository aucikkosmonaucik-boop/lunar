import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { categories } from '../data/products';
import type { SortOption } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'New Arrivals' },
];

const ShopPage: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
  }, [search, category, sort, activeTag]);

  const pageTitle = activeTag === 'ready-to-ship'
    ? 'Ready To Ship'
    : activeTag === 'new-arrivals'
    ? 'Latest Arrivals'
    : category !== 'All'
    ? category
    : 'Our Boutique';

  return (
    <div className="pt-24 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-14 text-center">
          <p className="text-[11px] text-[#c1a98f] font-semibold uppercase tracking-[0.35em] mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c1a98f]" />
            Lunar Collection
            <Sparkles className="w-3.5 h-3.5 text-[#c1a98f]" />
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1a1a1a] tracking-[0.15em] mb-4 uppercase">
            {pageTitle}
          </h1>
          <div className="w-16 h-[1px] bg-[#c1a98f] mx-auto mb-4"></div>
          <p className="text-[#757575] text-xs uppercase tracking-[0.2em]">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} available
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between border-b border-gray-100 pb-6">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 sm:gap-4 flex-1 justify-center md:justify-start">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[11px] uppercase tracking-[0.2em] font-medium px-3 py-1.5 transition-all duration-200 border-b-2 ${
                  category === cat && !activeTag
                    ? 'border-[#1a1a1a] text-[#1a1a1a] font-bold'
                    : 'border-transparent text-[#757575] hover:text-[#1a1a1a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full md:w-auto items-center">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#757575]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search pieces..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 bg-white text-[#1a1a1a] placeholder:text-[#757575] outline-none focus:border-[#c1a98f] transition-all duration-200 rounded-none"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="pl-4 pr-10 py-2 text-[11px] uppercase tracking-widest font-medium border border-gray-200 bg-white text-[#1a1a1a] outline-none focus:border-[#c1a98f] transition-all duration-200 cursor-pointer appearance-none min-w-[170px]"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#757575] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-[#faf8f5] p-8 border border-[#eae5de]">
            <Search className="w-10 h-10 text-[#c1a98f] mb-4" />
            <h3 className="text-lg font-serif uppercase tracking-[0.2em] text-[#1a1a1a] mb-2">No pieces found</h3>
            <p className="text-[#757575] text-xs tracking-widest max-w-sm mb-6">
              We couldn't find any products matching your selection. Try clearing filters or searching for something else.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setActiveTag(null);
                setSearchParams({});
              }}
              className="text-[11px] uppercase tracking-widest font-bold border-b-2 border-[#1a1a1a] pb-1 text-[#1a1a1a] hover:text-[#c1a98f] hover:border-[#c1a98f] transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
