import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../../data/products';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const results = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6); // Limit results

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // In a real app we might navigate to a dedicated search page
      // Here we will just close the overlay if they hit enter on a result
      // or we can route to the shop with a search param
      onClose();
      // Optional: navigate(`/sklep?search=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (id: string) => {
    onClose();
    navigate(`/produkt/${id}`);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
      {/* Top Search Bar Area */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 relative flex items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-4">
            <Search className="w-6 h-6 text-gray-400 stroke-[1.5]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for jewelry, collections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-2xl md:text-4xl font-light text-black placeholder-gray-300 outline-none bg-transparent font-serif italic"
            />
          </form>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black hover:rotate-90 transition-all duration-300 ml-4"
          >
            <X className="w-8 h-8 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:px-8 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {query.trim() === '' ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-xl font-serif italic mb-4">What are you looking for?</p>
              <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest">
                <button onClick={() => setQuery('gold')} className="hover:text-black transition-colors">Gold</button>
                <button onClick={() => setQuery('silver')} className="hover:text-black transition-colors">Silver</button>
                <button onClick={() => setQuery('diamond')} className="hover:text-black transition-colors">Diamond</button>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-200 pb-4">
                Products ({results.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {results.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="group cursor-pointer flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square bg-white mb-4 overflow-hidden rounded-sm border border-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 px-2 line-clamp-1">{product.name}</span>
                    <span className="text-xs text-gray-500">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl font-serif italic">No results found for "{query}"</p>
              <p className="text-sm mt-4 uppercase tracking-widest">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
