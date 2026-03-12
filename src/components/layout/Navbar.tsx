import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Moon, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartSidebar from '../ui/CartSidebar';

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Strona Główna' },
    { to: '/sklep', label: 'Sklep' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-lunar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Moon className="w-7 h-7 text-lunar-purple-light group-hover:text-lunar-gold transition-colors duration-300" />
                <div className="absolute inset-0 blur-sm bg-lunar-purple opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-full" />
              </div>
              <span className="text-xl font-bold gradient-text">Lunar</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors duration-200 relative
                    ${isActive(link.to)
                      ? 'text-lunar-purple-light'
                      : 'text-lunar-muted hover:text-lunar-text'}
                  `}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-lunar-purple to-lunar-gold rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                id="cart-button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl text-lunar-muted hover:text-lunar-text hover:bg-lunar-border transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-lunar-purple rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                className="md:hidden p-2 rounded-xl text-lunar-muted hover:text-lunar-text hover:bg-lunar-border transition-all duration-200"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden glass border-t border-lunar-border px-4 py-4 flex flex-col gap-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200
                  ${isActive(link.to)
                    ? 'text-lunar-purple-light bg-lunar-purple/10'
                    : 'text-lunar-muted hover:text-lunar-text hover:bg-lunar-border'}
                `}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
