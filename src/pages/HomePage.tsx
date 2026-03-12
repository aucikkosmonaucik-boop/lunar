import React from 'react';

import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const featuredChains = [
    { id: 1, name: 'Classic Gold Chain', price: '$120.00', image: 'https://images.unsplash.com/photo-1599643478514-4a888f802c61?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Silver Pendent Necklace', price: '$95.00', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Diamond Tennis Chain', price: '$850.00', image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&q=80&w=800' },
    { id: 4, name: 'Rose Gold Choker', price: '$150.00', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=2000" 
          alt="Elegant Woman with Jewelry" 
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-serif italic mb-6 shadow-sm leading-[0.9]">Discover True Elegance</h1>
          <p className="text-base md:text-xl uppercase tracking-widest mb-10 shadow-sm">The new collection by Agatha G.</p>
          <Link 
            to="/sklep?category=jewelry" 
            className="inline-block bg-white text-black px-12 py-5 text-sm uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors duration-300"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Featured Chains Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a] mb-6">Featured Chains</h2>
          <div className="w-20 h-[1px] bg-gray-300 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredChains.map((chain) => (
            <Link to="/sklep?category=jewelry" key={chain.id} className="group block">
              <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative">
                <img 
                  src={chain.image} 
                  alt={chain.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm md:text-base uppercase tracking-widest text-gray-900 mb-2 font-medium">{chain.name}</h3>
                <p className="text-base md:text-lg text-gray-500">{chain.price}</p>
              </div>
            </Link>
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
            to="/sklep?category=jewelry" 
            className="text-sm md:text-base font-medium uppercase tracking-widest pb-1 border-b-2 border-black hover:text-gray-500 hover:border-gray-500 transition-colors"
          >
            Explore Jewelry
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
