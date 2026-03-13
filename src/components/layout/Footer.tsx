import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f5eeeb] pt-24 pb-12">
      {/* Centered Content: Logo, Socials, and Links — full viewport width */}
      <div className="w-full flex flex-col items-center justify-center text-center mb-24 px-4">
        <Link to="/" className="flex flex-col items-center group mb-10">
          <span className="font-serif text-5xl md:text-[72px] tracking-widest text-[#1a1a1a] uppercase leading-[0.8] pb-1">Lunar</span>
          <span className="text-[16px] md:text-[20px] tracking-[0.5em] md:tracking-[0.8em] text-[#1a1a1a] pr-[calc(-0.5em)] md:pr-[calc(-0.8em)] mt-2 font-light">2026</span>
        </Link>

        <div className="flex gap-6 md:gap-8 mb-12">
          <a href="https://www.instagram.com/mylunar.ie?igsh=MXJjZjNndm13NHduMQ==" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300">
            <Instagram className="w-5 h-5" />
          </a>

          {/* X (formerly Twitter) */}
          <a href="https://x.com/allkeys4games" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a href="#" className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300">
            <Facebook className="w-5 h-5" />
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <Link to="/contact" className="text-[14px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Contact
          </Link>
          <span className="text-[14px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
            Terms of Service
          </span>
          <span className="text-[14px] uppercase tracking-widest text-[#5e5e5e] cursor-pointer hover:text-black transition-colors font-medium">
            Cookies
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-medium">
            © {new Date().getFullYear()} Lunar Boutique. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-medium">Secure Payment</span>
            <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-[11px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">VISA</span>
              <span className="text-[11px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">MC</span>
              <span className="text-[11px] font-bold border border-gray-400 text-gray-600 px-2 rounded-sm">AMEX</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
