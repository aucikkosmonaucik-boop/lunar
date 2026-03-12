import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products, categories } from '../data/products';
import type { SortOption } from '../types';
import ProductCard from '../components/ui/ProductCard';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'New Arrivals' },
];

const ShopPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('featured');

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

    if (category !== 'All') {
      list = list.filter(p => p.category.toLowerCase().includes(category.toLowerCase().replace(' ', '-')));
    }

    switch (sort) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating':     return list.sort((a, b) => b.rating - a.rating);
      case 'newest':     return list.reverse();
      default:           return list;
    }
  }, [search, category, sort]);

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-16 text-center">
          <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.3em] mb-4">Collection</p>
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] mb-6">
            Our <span className="font-bold">Boutique</span>
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto mb-6"></div>
          <p className="text-wonders-muted text-xs uppercase tracking-widest">{filtered.length} products found</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
          {/* Category pills */}
          <div className="flex flex-wrap gap-4 flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] uppercase tracking-widest font-bold pb-1 transition-all duration-200 border-b-2 ${
                  category === cat
                    ? 'border-wonders-gold text-wonders-dark'
                    : 'border-transparent text-wonders-muted hover:text-wonders-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-wonders-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-xs border-b border-wonders-border bg-transparent text-wonders-dark placeholder:text-wonders-muted outline-none focus:border-wonders-gold transition-all duration-200"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="pl-4 pr-10 py-2 text-[10px] uppercase tracking-widest font-bold border border-wonders-border bg-white text-wonders-dark outline-none focus:border-wonders-gold transition-all duration-200 cursor-pointer appearance-none min-w-[160px]"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-wonders-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Search className="w-12 h-12 text-wonders-border mb-6" />
            <h3 className="text-lg font-light uppercase tracking-widest text-wonders-dark mb-4">No results found</h3>
            <p className="text-wonders-muted text-xs tracking-widest">Try adjusting your filters or search keywords.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-8 text-[10px] uppercase tracking-widest font-bold border-b border-wonders-gold pb-1 text-wonders-dark">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
