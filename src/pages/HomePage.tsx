import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import AppDownloadSection from '../components/ui/AppDownloadSection';
import HeroSlider from '../components/ui/HeroSlider';

const HomePage: React.FC = () => {
  const { products } = useProducts();

  const featuredChains = useMemo(() => {
    const chains = products.filter(
      (p) =>
        p.category === 'necklaces' ||
        p.category === 'bracelets' ||
        p.tags?.some((t) => ['necklace', 'bracelets', 'chains', 'jewelry'].includes(t.toLowerCase()))
    );
    if (chains.length >= 4) {
      return chains.slice(0, 4);
    }
    const jewelry = products.filter((p) => !p.category.startsWith('perfumes'));
    return jewelry.slice(0, 4);
  }, [products]);

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Left-Sliding Hero Banner */}
      <HeroSlider />

      {/* Featured Chains Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a] mb-6">Featured Chains</h2>
          <div className="w-20 h-[1px] bg-gray-300 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredChains.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Secondary Image Block */}
      <section className="grid grid-cols-1 md:grid-cols-2 bg-[#f5f5f5]">
        <div className="h-[50vh] md:h-[70vh]">
          <img 
            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1200" 
            alt="Woman modeling necklace" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-center p-12 md:p-24 text-center">
          <h2 className="text-4xl md:text-6xl font-serif italic text-gray-900 mb-6">Timeless Beauty</h2>
          <p className="text-gray-600 mb-10 max-w-md text-base md:text-lg leading-relaxed overflow-hidden">
            Crafted for the modern aesthetic, our pieces are designed to be worn every day and cherished forever. Explore delicate chains, bold statements, and everything in between.
          </p>
          <Link 
            to="/shop" 
            className="text-sm md:text-base font-medium uppercase tracking-widest pb-1 border-b-2 border-black hover:text-gray-500 hover:border-gray-500 transition-colors"
          >
            Explore All Collection
          </Link>
        </div>
      </section>

      {/* Lunar Mobile App Download & Experience Section */}
      <AppDownloadSection />
    </div>
  );
};

export default HomePage;
