import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '../../hooks/useAuth';
import FavoritesDrawer from '../ui/FavoritesDrawer';

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const [favOpen, setFavOpen] = useState(false);
  const location = useLocation();
  const { totalItems: favCount } = useFavorites();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/sklep?category=jewelry', label: 'Jewelry By Agatha G.' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* Announcement Bar */}
      <div className="bg-[#fcdde5] py-2 overflow-hidden">
        <div className="text-center text-[13px] md:text-[14px] text-gray-900 font-medium tracking-wide">
          Darmowa dostawa od 50$ &gt;&gt;
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between relative min-h-[140px]">
        
        {/* Left: Mobile Menu */}
        <div className="w-full md:w-auto flex justify-between items-center md:hidden mb-4">
          <button className="p-2 text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} className="text-[#1a1a1a]">
              <Search className="w-6 h-6 stroke-[1.2]" />
            </button>
            <Link to="/koszyk" className="relative">
              <ShoppingBag className="w-6 h-6 stroke-[1.2]" />
               {totalItems > 0 && (
                 <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                   {totalItems}
                 </span>
               )}
            </Link>
          </div>
        </div>

        {/* Center: Logo and Desktop Nav */}
        <div className="flex flex-col items-center justify-center w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:top-6">
          <Link to="/" className="flex flex-col items-center group mb-6">
            <span className="font-serif text-5xl md:text-[64px] tracking-widest text-[#1a1a1a] uppercase leading-[0.8] pb-1">Lunar</span>
            <span className="text-[14px] md:text-[18px] tracking-[0.5em] md:tracking-[0.8em] text-[#1a1a1a] pr-[calc(-0.5em)] md:pr-[calc(-0.8em)] mt-3">2026</span>
          </Link>
          
          {/* Desktop Main Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group`}
              >
                <span>{link.label}</span>
                <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Icons (Desktop) */}
        <div className="hidden md:flex items-center justify-end gap-6 ml-auto w-full md:w-auto mt-4 md:mt-0 md:absolute md:right-12 md:top-12">
           <button 
             onClick={() => setSearchOpen(true)}
             className="flex items-center gap-2 mr-2 cursor-pointer hover:text-gray-600 transition-colors text-[#1a1a1a]"
           >
             <span className="text-base font-light font-serif uppercase tracking-widest mr-1">Search</span>
             <Search className="w-[22px] h-[22px] stroke-[1.2]" />
           </button>
          {user ? (
            <div className="relative group flex items-center gap-4">
              <span className="text-sm font-medium mr-2">{user.name || user.email}</span>
              <button
                onClick={logout}
                className="text-xs text-wonders-accent hover:text-red-500 uppercase tracking-widest"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <Link
              to="/logowanie"
              className="text-[#1a1a1a] hover:text-gray-600 transition-colors"
              aria-label="Konto"
            >
              <User className="w-[24px] h-[24px] stroke-[1.2]" />
            </Link>
          )}
          <button
            onClick={() => setFavOpen(true)}
            className="relative text-[#1a1a1a] hover:text-gray-600 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-[24px] h-[24px] stroke-[1.2]" />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-black rounded-full text-[11px] flex items-center justify-center text-white font-bold">
                {favCount}
              </span>
            )}
          </button>
          <Link to="/koszyk" className="flex items-center gap-2 group relative text-[#1a1a1a] hover:text-gray-600 transition-colors">
            <ShoppingBag className="w-[24px] h-[24px] stroke-[1.2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-black rounded-full text-[11px] flex items-center justify-center text-white font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-b border-gray-100 py-4 px-6 gap-4 animate-fade-in shadow-md">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-base tracking-widest uppercase font-medium py-2 border-b border-gray-50 text-[#1a1a1a]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Full Screen Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />



      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={favOpen} onClose={() => setFavOpen(false)} />
    </header>
  );
};

export default Navbar;
