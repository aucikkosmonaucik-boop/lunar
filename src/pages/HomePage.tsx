import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Star } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ui/ProductCard';

const HomePage: React.FC = () => {
  const featured = products.filter(p => p.badge).slice(0, 4);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 stars-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-lunar-bg via-lunar-bg/80 to-lunar-bg" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lunar-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lunar-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-lunar-purple/30 text-xs text-lunar-purple-light mb-8 font-medium">
            <Zap className="w-3.5 h-3.5" />
            Nowa kolekcja już dostępna
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            <span className="text-lunar-text">Odkryj</span>
            <br />
            <span className="gradient-text">Kosmiczne</span>
            <br />
            <span className="text-lunar-text">Zakupy</span>
          </h1>

          <p className="text-lunar-muted text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Najlepsze produkty w cenach, które cię zaskoczą. Darmowa dostawa od 200 zł. Zwroty do 30 dni.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sklep"
              id="hero-shop-btn"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl btn-shimmer text-white font-bold text-lg hover:scale-105 transition-transform duration-200 group"
            >
              Odkryj Sklep
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sklep"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-lunar-purple/30 text-lunar-text font-semibold text-lg hover:border-lunar-purple/60 transition-all duration-200"
            >
              Zobacz nowości
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: '2500+', label: 'Produktów' },
              { value: '98%', label: 'Zadowolonych klientów' },
              { value: '24h', label: 'Szybka dostawa' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black gradient-text">{stat.value}</p>
                <p className="text-xs text-lunar-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-lunar-muted opacity-60">
          <div className="w-0.5 h-8 bg-gradient-to-b from-transparent to-lunar-purple rounded-full animate-pulse" />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Bezpłatna dostawa', desc: 'Dla zamówień powyżej 200 zł', color: 'text-lunar-purple-light' },
              { icon: Shield, title: 'Bezpieczne zakupy', desc: 'Szyfrowane płatności SSL', color: 'text-lunar-gold' },
              { icon: Star, title: 'Gwarancja jakości', desc: 'Zwrot do 30 dni bez pytań', color: 'text-green-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass rounded-2xl p-6 border border-lunar-border flex items-center gap-4 hover:border-lunar-purple/30 transition-all duration-300">
                <div className={`p-3 rounded-xl bg-lunar-border ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lunar-text">{title}</h3>
                  <p className="text-sm text-lunar-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-lunar-purple-light font-semibold uppercase tracking-widest mb-2">Polecane</p>
              <h2 className="text-3xl font-black text-lunar-text">
                Hity <span className="gradient-text">Sprzedaży</span>
              </h2>
            </div>
            <Link
              to="/sklep"
              className="hidden sm:flex items-center gap-2 text-sm text-lunar-muted hover:text-lunar-purple-light transition-colors group"
            >
              Zobacz wszystkie
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link to="/sklep" className="inline-flex items-center gap-2 text-sm text-lunar-purple-light hover:underline">
              Zobacz wszystkie produkty <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden glass border border-lunar-purple/20 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-lunar-purple/10 via-transparent to-lunar-gold/10" />
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-lunar-purple/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-lunar-gold/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black mb-4">
                <span className="gradient-text">-30% na pierwsze</span>
                <br />
                <span className="text-lunar-text">zamówienie</span>
              </h2>
              <p className="text-lunar-muted mb-8 max-w-lg mx-auto">
                Zarejestruj się i odbierz kod rabatowy na swoje pierwsze zamówienie.
              </p>
              <Link
                to="/sklep"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl btn-shimmer text-white font-bold text-lg hover:scale-105 transition-transform"
              >
                Skorzystaj teraz <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
