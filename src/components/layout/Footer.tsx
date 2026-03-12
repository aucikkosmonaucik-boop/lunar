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
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-20 border-t border-gray-300 pt-16">
          <Link to="/contact" className="text-[11px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Contact
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
            Terms of Service
          </span>
          <span className="text-[11px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
            Cookies
          </span>
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
