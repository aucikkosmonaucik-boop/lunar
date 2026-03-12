import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f5eeeb] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Logo and Socials Centered */}
        <div className="flex flex-col items-center justify-center mb-24">
          <Link to="/" className="flex flex-col items-center group mb-12">
            <span className="font-serif text-3xl md:text-[56px] tracking-widest text-[#1a1a1a] uppercase leading-[0.8] pb-1">Lunar</span>
            <span className="text-[14px] md:text-[18px] tracking-[0.5em] md:tracking-[0.8em] text-[#1a1a1a] pr-[calc(-0.5em)] md:pr-[calc(-0.8em)] mt-2 font-light">2026</span>
          </Link>

          <div className="flex gap-6 md:gap-8 bg-transparent">
            {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
              <a href="#" key={i} className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 mb-20 border-t border-gray-300 pt-16">
          {/* Shop */}
          <div className="text-center">
            <h3 className="text-[11px] font-bold text-gray-900 mb-6 uppercase tracking-[0.2em]">Shop</h3>
            <ul className="space-y-4">
              {[
                { to: '/sklep?category=perfumes-women', label: "Women's Perfumes" },
                { to: '/sklep?category=perfumes-men', label: "Men's Perfumes" },
                { to: '/sklep?category=jewelry', label: 'Jewelry By Agatha G.' },
                { to: '/sklep?category=sets', label: 'Gift Sets' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[10px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique */}
          <div className="text-center">
            <h3 className="text-[11px] font-bold text-gray-900 mb-6 uppercase tracking-[0.2em]">Boutique</h3>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Store Locator', 'Careers'].map(item => (
                <li key={item}>
                  <span className="text-[10px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="text-center">
            <h3 className="text-[11px] font-bold text-gray-900 mb-6 uppercase tracking-[0.2em]">Customer Care</h3>
            <ul className="space-y-4">
              {['Shipping & Returns', 'Privacy Policy', 'Terms of Service', 'FAQ'].map(item => (
                <li key={item}>
                  <span className="text-[10px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-medium">
            © {new Date().getFullYear()} Lunar Boutique. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-medium">Secure Payment</span>
            <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-[9px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">VISA</span>
              <span className="text-[9px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">MC</span>
              <span className="text-[9px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">AMEX</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
