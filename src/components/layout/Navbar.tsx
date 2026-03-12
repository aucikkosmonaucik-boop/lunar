import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/sklep?category=perfumes-women', label: "Women's Perfumes" },
    { to: '/sklep?category=perfumes-men', label: "Men's Perfumes" },
    { to: '/sklep?category=sets', label: 'Sets' },
    { to: '/sklep?category=jewelry', label: 'Jewelry by Ola' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Announcement Bar */}
      <div className="bg-white border-b border-wonders-border py-2 overflow-hidden">
        <div className="whitespace-nowrap flex animate-none md:justify-center gap-12 text-[10px] uppercase tracking-[0.2em] text-wonders-dark font-medium">
          <span className="inline-block px-4">New Scents Available Now!</span>
          <span className="hidden md:inline-block px-4">Free delivery from $50!</span>
          <span className="hidden xl:inline-block px-4">Secure Payments</span>
          <span className="xl:hidden inline-block px-4">New Scents Available Now!</span>
        </div>
      </div>

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between border-b border-wonders-border">
        {/* Left: Mobile Menu Trigger */}
        <button
          className="md:hidden p-2 text-wonders-dark"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center/Left: Logo */}
        <Link to="/" className="flex flex-col items-center group">
          <span className="font-serif text-3xl italic leading-none">My</span>
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold mt-[-4px]">Wonders</span>
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button className="p-2 text-wonders-dark hover:text-wonders-gold transition-colors block border-r border-wonders-border pr-4 sm:pr-8">
            <User className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button className="p-2 text-wonders-dark hover:text-wonders-gold transition-colors block border-r border-wonders-border pr-4 sm:pr-8">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>
          <Link to="/koszyk" className="flex items-center gap-2 group">
            <div className="relative p-2">
              <ShoppingBag className="w-5 h-5 text-wonders-dark group-hover:text-wonders-gold transition-colors stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-wonders-gold rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-[11px] uppercase tracking-widest font-bold">Cart</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation - Desktop Only */}
      <nav className="hidden md:block border-b border-wonders-border bg-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center h-12 gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${
                location.pathname === link.to ? 'text-wonders-gold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-b border-wonders-border py-4 px-6 gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs uppercase tracking-widest font-medium py-2 border-b border-gray-50"
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
