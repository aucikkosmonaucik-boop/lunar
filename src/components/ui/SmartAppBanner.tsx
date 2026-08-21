import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Download } from 'lucide-react';

const SmartAppBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile screens and if not dismissed in the last 7 days
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const dismissedAt = localStorage.getItem('lunar_app_banner_dismissed');

    if (isMobile) {
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > 7 * 24 * 60 * 60 * 1000) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('lunar_app_banner_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#1a1a1a] text-white px-4 py-2.5 flex items-center justify-between shadow-md relative z-50 text-xs md:hidden animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#C1A98F] flex items-center justify-center text-black font-serif font-bold text-sm shadow-inner">
          L
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-wide text-white">Lunar Mobile App</span>
          <span className="text-[10px] text-gray-300">Fast checkout & order tracking</span>
        </div>
      </div>

      <Link
        to="/app"
        className="bg-[#C1A98F] hover:bg-[#b0967a] text-black font-semibold px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install</span>
      </Link>
    </div>
  );
};

export default SmartAppBanner;
