import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ui/ProductCard';

const HomePage: React.FC = () => {
  const news = products.slice(0, 6);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center px-4 sm:px-12 md:px-24">
        <div className="max-w-4xl animate-fade-in pl-4 sm:pl-12">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-wonders-gold leading-tight mb-8">
            Welcome to the world of <span className="font-bold text-wonders-dark">My Wonders.</span>
          </h1>
          <blockquote className="text-2xl sm:text-4xl font-serif italic text-wonders-muted mb-4 leading-relaxed max-w-2xl">
            "Perfumes Are the Most Powerful Form of Memories"
          </blockquote>
          <cite className="text-sm uppercase tracking-widest text-wonders-muted block mb-12">
            — Jean-Paul Guerlain
          </cite>
          
          <Link
            to="/sklep"
            className="btn-outline inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Announcements Bar 2 */}
      <div className="bg-white border-y border-wonders-border py-4 overflow-hidden">
        <div className="flex md:justify-center gap-12 text-[10px] uppercase tracking-[0.2em] text-wonders-dark font-bold">
          <span>Free delivery from $50!</span>
          <span>Secure Payments</span>
          <span>Fast Shipping</span>
          <span className="hidden sm:inline">Free delivery from $50!</span>
        </div>
      </div>

      {/* New Arrivals Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">New Arrivals</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-12">
            {news.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link 
              to="/sklep" 
              className="text-xs uppercase tracking-[0.3em] font-bold border-b-2 border-wonders-gold pb-2 hover:text-wonders-gold transition-colors"
            >
              Discover More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories / Info */}
      <section className="py-24 px-4 border-t border-wonders-border bg-gray-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="reveal active">
            <h3 className="font-serif text-4xl italic mb-6">Experience the Essence</h3>
            <p className="text-wonders-muted leading-relaxed mb-8 max-w-md">
              Our curated collection of scents and jewelry is designed to evoke memories and celebrate the beauty of the present moment. Discover your signature style with My Wonders.
            </p>
            <Link to="/sklep" className="btn-primary inline-block">Explore Collections</Link>
          </div>
          <div className="aspect-[4/3] rounded-sm overflow-hidden glass border border-wonders-border shadow-sm">
             <img src="https://images.unsplash.com/photo-1583209814683-c023dd2f3bb3?auto=format&fit=crop&q=80&w=1200" alt="Luxury Perfumes" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
