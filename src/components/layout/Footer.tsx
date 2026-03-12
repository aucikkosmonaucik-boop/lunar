import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-wonders-border pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex flex-col items-center md:items-start group mb-8">
              <span className="font-serif text-3xl italic leading-none">My</span>
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold mt-[-4px]">Wonders</span>
            </Link>
            <p className="text-[11px] text-wonders-muted uppercase tracking-[0.2em] leading-loose mb-8 max-w-xs">
              Curating moments of beauty through exceptional scents and artisanal jewelry.
            </p>
            <div className="flex gap-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="text-wonders-dark hover:text-wonders-gold transition-colors">
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="text-center md:text-left">
            <h3 className="text-xs font-bold text-wonders-dark mb-8 uppercase tracking-[0.2em]">Shop</h3>
            <ul className="space-y-4">
              {[
                { to: '/sklep?category=perfumes-women', label: "Women's Perfumes" },
                { to: '/sklep?category=perfumes-men', label: "Men's Perfumes" },
                { to: '/sklep?category=jewelry', label: 'Jewelry' },
                { to: '/sklep?category=sets', label: 'Gift Sets' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[10px] uppercase tracking-widest text-wonders-muted hover:text-wonders-dark transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique */}
          <div className="text-center md:text-left">
            <h3 className="text-xs font-bold text-wonders-dark mb-8 uppercase tracking-[0.2em]">Boutique</h3>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Store Locator', 'Careers'].map(item => (
                <li key={item}>
                  <span className="text-[10px] uppercase tracking-widest text-wonders-muted cursor-pointer hover:text-wonders-dark transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="text-center md:text-left">
            <h3 className="text-xs font-bold text-wonders-dark mb-8 uppercase tracking-[0.2em]">Customer Care</h3>
            <ul className="space-y-4">
              {['Shipping & Returns', 'Privacy Policy', 'Terms of Service', 'FAQ'].map(item => (
                <li key={item}>
                  <span className="text-[10px] uppercase tracking-widest text-wonders-muted cursor-pointer hover:text-wonders-dark transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t border-wonders-border flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[9px] uppercase tracking-[0.3em] text-wonders-muted">
            © {new Date().getFullYear()} My Wonders Boutique. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] uppercase tracking-[0.3em] text-wonders-muted">Secure Payment</span>
            <div className="flex gap-4 opacity-40 grayscale">
              <span className="text-[9px] font-bold border border-wonders-dark px-2 rounded-sm">VISA</span>
              <span className="text-[9px] font-bold border border-wonders-dark px-2 rounded-sm">MC</span>
              <span className="text-[9px] font-bold border border-wonders-dark px-2 rounded-sm">AMEX</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
