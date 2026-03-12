import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/sklep?category=jewelry', label: 'Jewelry By Agatha G.' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* Announcement Bar */}
      <div className="bg-[#fcdde5] py-2 overflow-hidden">
        <div className="text-center text-[11px] text-gray-800 font-medium tracking-wide">
          Darmowa dostawa od 50$ &gt;&gt;
        </div>
      </div>

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8 flex items-center justify-between">
        {/* Left: Mobile Menu Trigger / Partners (desktop) */}
        <div className="flex-1 flex items-center gap-4">
          <button
            className="md:hidden p-2 text-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link to="/" className="flex flex-col items-center group">
            <span className="font-serif text-3xl md:text-[44px] tracking-widest text-[#1a1a1a] uppercase leading-[0.8] pb-1">Lunar</span>
            <span className="text-[12px] md:text-[14px] tracking-[0.5em] md:tracking-[0.8em] text-[#1a1a1a] pr-[calc(-0.5em)] md:pr-[calc(-0.8em)] mt-1">2026</span>
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex-1 flex items-center justify-end gap-5">
           {/* Search input - desktop */}
           <div className="hidden lg:flex items-center gap-2 mr-2">
             <span className="text-sm text-gray-400 font-light">Szukaj</span>
             <Search className="w-[18px] h-[18px] text-gray-800 stroke-[1.2]" />
           </div>
          {/* Icons - mobile/tablet */}
          <button className="lg:hidden text-gray-800 hover:text-black transition-colors block">
            <Search className="w-5 h-5 stroke-[1.2]" />
          </button>
          
          <button className="text-gray-800 hover:text-black transition-colors block">
            <User className="w-[20px] h-[20px] stroke-[1.2]" />
          </button>
          <button className="text-gray-800 hover:text-black transition-colors hidden sm:block">
            <Heart className="w-[20px] h-[20px] stroke-[1.2]" />
          </button>
          <Link to="/koszyk" className="flex items-center gap-2 group relative text-gray-800 hover:text-black transition-colors">
            <ShoppingBag className="w-[20px] h-[20px] stroke-[1.2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Navigation - Desktop Only */}
      <nav className="hidden md:block pb-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] tracking-wide text-gray-800 hover:text-black transition-colors flex flex-col items-center group`}
            >
              <span>{link.label}</span>
              <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-b border-gray-100 py-4 px-6 gap-2 animate-fade-in shadow-md">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm tracking-wide py-2 border-b border-gray-50 text-gray-800 hover:text-black"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
