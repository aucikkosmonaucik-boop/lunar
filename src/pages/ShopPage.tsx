import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { products, categories } from '../data/products';
import { SortOption } from '../types';
import ProductCard from '../components/ui/ProductCard';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Polecane' },
  { value: 'price-asc', label: 'Cena: rosnąco' },
  { value: 'price-desc', label: 'Cena: malejąco' },
  { value: 'rating', label: 'Najlepiej oceniane' },
  { value: 'newest', label: 'Najnowsze' },
];

const ShopPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Wszystkie');
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

    if (category !== 'Wszystkie') {
      list = list.filter(p => p.category === category);
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
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs text-lunar-purple-light font-semibold uppercase tracking-widest mb-2">Kolekcja</p>
          <h1 className="text-4xl font-black">
            Nasz <span className="gradient-text">Sklep</span>
          </h1>
          <p className="text-lunar-muted mt-2">{filtered.length} produktów</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lunar-muted" />
            <input
              id="shop-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj produktów..."
              className="w-full pl-11 pr-4 py-3 rounded-xl glass border border-lunar-border focus:border-lunar-purple/50 bg-transparent text-lunar-text placeholder:text-lunar-muted outline-none transition-all duration-200 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-lunar-muted hover:text-lunar-text">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lunar-muted pointer-events-none" />
            <select
              id="shop-sort"
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="pl-11 pr-8 py-3 rounded-xl glass border border-lunar-border bg-lunar-card text-lunar-text text-sm outline-none focus:border-lunar-purple/50 transition-all duration-200 cursor-pointer appearance-none min-w-[180px]"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value} className="bg-lunar-card">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-${cat}`}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                category === cat
                  ? 'bg-lunar-purple border-lunar-purple text-white'
                  : 'glass border-lunar-border text-lunar-muted hover:border-lunar-purple/40 hover:text-lunar-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-16 h-16 text-lunar-border mb-4" />
            <h3 className="text-xl font-semibold text-lunar-text mb-2">Brak wyników</h3>
            <p className="text-lunar-muted text-sm">Spróbuj zmienić filtry lub wyszukiwane słowo.</p>
            <button onClick={() => { setSearch(''); setCategory('Wszystkie'); }} className="mt-4 text-sm text-lunar-purple-light hover:underline">
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
