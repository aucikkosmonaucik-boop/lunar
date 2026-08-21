import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f5eeeb] pt-24 pb-12">
      {/* Centered Content: Logo, Socials, and Links — full viewport width */}
      <div className="w-full flex flex-col items-center justify-center text-center mb-24 px-4">
        <Link to="/" className="flex flex-col items-center group mb-10 select-none">
          <span className="font-serif font-light text-2xl md:text-3xl tracking-[0.35em] text-[#1a1a1a] uppercase leading-none pl-[0.35em] transition-opacity duration-300 group-hover:opacity-75">
            Lunar
          </span>
          <span className="text-[10px] md:text-[11px] font-light tracking-[0.5em] text-[#78716c] uppercase pl-[0.5em] mt-2 transition-opacity duration-300 group-hover:opacity-75">
            2026
          </span>
        </Link>

        <div className="flex justify-center items-center gap-6 md:gap-8 mb-12">
          <a href="https://www.instagram.com/mylunar.ie?igsh=MXJjZjNndm13NHduMQ==" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300"
            aria-label="Instagram">
            <Instagram className="w-5 h-5" />
          </a>

          {/* X (formerly Twitter) */}
          <a href="https://x.com/allkeys4games" target="_blank" rel="noreferrer"
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300"
            aria-label="X (formerly Twitter)">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a href="#" className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all duration-300"
            aria-label="Facebook">
            <Facebook className="w-5 h-5" />
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
          <Link to="/app" className="text-[14px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Mobile App
          </Link>
          <Link to="/contact" className="text-[14px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Contact
          </Link>
          <Link to="/terms" className="text-[14px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Terms of Service
          </Link>
          <Link to="/cookies" className="text-[14px] uppercase tracking-widest text-[#5e5e5e] hover:text-black transition-colors font-medium">
            Cookies
          </Link>
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('lunar_open_cookie_settings'))}
            className="text-[14px] uppercase tracking-widest text-[#8C6D4F] hover:text-[#1a1a1a] transition-colors font-medium cursor-pointer"
          >
            Cookie Settings
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-medium">
            © {new Date().getFullYear()} Lunar Jewellery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
