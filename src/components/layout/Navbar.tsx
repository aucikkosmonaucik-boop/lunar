import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '../../hooks/useAuth';
import FavoritesDrawer from '../ui/FavoritesDrawer';

interface DropdownItem {
  label: string;
  to: string;
  badge?: string;
  subitems?: { label: string; to: string }[];
}

const shopCategories: DropdownItem[] = [
  { label: 'Shop All', to: '/shop' },
  { label: 'LATEST ARRIVALS', to: '/shop?tag=new-arrivals', badge: 'NEW' },
  { label: 'EARRINGS', to: '/shop?category=earrings' },
  {
    label: 'RINGS',
    to: '/shop?category=rings',
    subitems: [
      { label: 'All Rings', to: '/shop?category=rings' },
      { label: 'Statement Rings', to: '/shop?category=rings' },
      { label: 'Stacking & Minimalist', to: '/shop?category=rings' },
      { label: '18K Gold Plated', to: '/shop?category=rings' },
      { label: '925 Sterling Silver', to: '/shop?category=rings' },
    ],
  },
  { label: 'NECKLACES', to: '/shop?category=necklaces' },
  { label: 'BRACELETS', to: '/shop?category=bracelets' },
  {
    label: 'PERFUMES',
    to: '/shop?category=perfumes',
    subitems: [
      { label: 'All Fragrances', to: '/shop?category=perfumes' },
      { label: 'Women\'s Perfumes', to: '/shop?category=perfumes-women' },
      { label: 'Men\'s Perfumes', to: '/shop?category=perfumes-men' },
    ],
  },
  { label: 'GIFT SETS', to: '/shop?category=sets' },
  { label: 'BRIDAL', to: '/shop?category=bridal' },
];

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const [favOpen, setFavOpen] = useState(false);
  const location = useLocation();
  const { totalItems: favCount } = useFavorites();

  // Desktop Hover & Dropdown states with grace timeout
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyoutCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterShop = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsShopHovered(true);
  };

  const handleMouseLeaveShop = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsShopHovered(false);
      setActiveFlyout(null);
    }, 200);
  };

  const handleMouseEnterItem = (label: string, hasSubitems: boolean) => {
    if (flyoutCloseTimeoutRef.current) {
      clearTimeout(flyoutCloseTimeoutRef.current);
      flyoutCloseTimeoutRef.current = null;
    }
    if (hasSubitems) {
      setActiveFlyout(label);
    } else {
      setActiveFlyout(null);
    }
  };

  const handleMouseLeaveDropdown = () => {
    handleMouseLeaveShop();
  };

  const isShopActive = location.pathname.startsWith('/shop');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* Announcement Bar */}
      <div className="bg-[#fcdde5] py-2 overflow-hidden">
        <div className="text-center text-[12px] md:text-[13px] text-gray-900 font-medium tracking-[0.25em] uppercase flex items-center justify-center gap-2">
          <span>FREE DELIVERY OVER 50€</span>
          <span className="text-[10px] font-bold">&gt;&gt;</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between relative min-h-[160px] md:min-h-[190px]">
        
        {/* Left: Mobile Menu Trigger */}
        <div className="w-full md:w-auto flex justify-between items-center md:hidden mb-4">
          <button 
            className="p-2 text-gray-800 focus:outline-none" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} className="text-[#1a1a1a]" aria-label="Search">
              <Search className="w-6 h-6 stroke-[1.2]" />
            </button>
            <Link to="/cart" className="relative" aria-label="Shopping Cart">
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
        <div className="flex flex-col items-center justify-center w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:top-4">
          <Link to="/" className="flex flex-col items-center group mb-4">
            <div className="flex flex-col items-center select-none">
              <span 
                className="text-4xl md:text-[56px] text-[#1a1a1a] transition-transform duration-500 group-hover:scale-105"
                style={{ fontFamily: "'Alex Brush', cursive" }}
              >
                My
              </span>
              <span 
                className="font-serif text-xl md:text-[28px] tracking-[0.4em] text-[#1a1a1a] uppercase -mt-4 md:-mt-6 transition-transform duration-500 group-hover:scale-105"
              >
                Lunar.ie
              </span>
            </div>
          </Link>
          
          {/* Desktop Main Navigation */}
          <nav className="hidden md:flex items-center gap-10 lg:gap-12">
            
            {/* 1. Home */}
            <Link
              to="/"
              className="text-[14px] lg:text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group"
            >
              <span>Home</span>
              <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* 2. Shop with Dropdown Hover Menu (MyLunar luxury styling) */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterShop}
              onMouseLeave={handleMouseLeaveShop}
            >
              <Link
                to="/shop"
                className="text-[14px] lg:text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group"
              >
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <span>Shop</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isShopHovered ? 'rotate-180 text-black' : 'text-gray-500'
                    }`}
                  />
                </div>
                <div
                  className={`h-[1px] bg-black mt-1 transition-all duration-300 ${
                    isShopActive || isShopHovered ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>

              {/* Dropdown Container */}
              {isShopHovered && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                  onMouseEnter={handleMouseEnterShop}
                  onMouseLeave={handleMouseLeaveDropdown}
                >
                  {/* Invisible Hover Bridge */}
                  <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

                  {/* Main Dropdown Panel (Styled in MyLunar warm linen / boutique tone) */}
                  <div className="bg-[#FAF7F2] border border-[#E8DFD3] shadow-2xl shadow-black/10 min-w-[260px] py-3 animate-fade-in relative">
                    <div className="flex flex-col">
                      {shopCategories.map((item) => {
                        const hasSub = !!item.subitems;
                        const isFlyoutOpen = activeFlyout === item.label;

                        return (
                          <div
                            key={item.label}
                            className="relative group/item"
                            onMouseEnter={() => handleMouseEnterItem(item.label, hasSub)}
                          >
                            <Link
                              to={item.to}
                              onClick={() => setIsShopHovered(false)}
                              className={`px-6 py-2.5 flex items-center justify-between text-[#1a1a1a] transition-all duration-200 hover:bg-[#EFE7DE] hover:translate-x-1 ${
                                item.label === 'Shop All'
                                  ? 'font-serif text-[15px] border-b border-[#E8DFD3]/60 mb-1 pb-3 pt-1 text-black font-semibold'
                                  : 'font-serif text-[14px] tracking-[0.18em] uppercase text-[#2b2b2b] hover:text-black'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 bg-[#1a1a1a] text-white tracking-widest uppercase rounded-none">
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {hasSub && (
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isFlyoutOpen ? 'rotate-90 text-black' : 'text-gray-400 group-hover/item:text-black'
                                  }`}
                                />
                              )}
                            </Link>

                            {/* Nested Submenu Flyout (e.g. for RINGS / PERFUMES) */}
                            {hasSub && isFlyoutOpen && (
                              <div 
                                className="absolute left-full top-0 pl-1 z-50"
                                onMouseEnter={() => {
                                  if (flyoutCloseTimeoutRef.current) {
                                    clearTimeout(flyoutCloseTimeoutRef.current);
                                  }
                                  setActiveFlyout(item.label);
                                }}
                              >
                                <div className="bg-[#FAF7F2] border border-[#E8DFD3] shadow-2xl shadow-black/10 min-w-[240px] py-3 animate-fade-in">
                                  <div className="px-5 pb-2 mb-2 border-b border-[#E8DFD3]/60 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#8c7e70] font-sans font-semibold">
                                    <Sparkles className="w-3 h-3 text-[#c1a98f]" />
                                    <span>{item.label} Collection</span>
                                  </div>
                                  {item.subitems?.map((sub) => (
                                    <Link
                                      key={sub.label}
                                      to={sub.to}
                                      onClick={() => {
                                        setIsShopHovered(false);
                                        setActiveFlyout(null);
                                      }}
                                      className="px-5 py-2 block font-serif text-[13px] tracking-[0.16em] uppercase text-[#333] hover:text-black hover:bg-[#EFE7DE] hover:translate-x-1 transition-all duration-200"
                                    >
                                      {sub.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Ready to Ship */}
            <Link
              to="/shop?tag=ready-to-ship"
              className="text-[14px] lg:text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group"
            >
              <span>Ready to Ship</span>
              <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.search.includes('ready-to-ship') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* 4. Jewelry By Agatha G. */}
            <Link
              to="/shop?category=jewelry"
              className="text-[14px] lg:text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group"
            >
              <span>Jewelry By Agatha G.</span>
              <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.search.includes('jewelry') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

            {/* 5. Contact */}
            <Link
              to="/contact"
              className="text-[14px] lg:text-[15px] tracking-widest text-[#1a1a1a] font-medium uppercase hover:text-gray-500 transition-colors flex flex-col items-center group"
            >
              <span>Contact</span>
              <div className={`h-[1px] bg-black mt-1 transition-all duration-300 ${location.pathname === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>

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
            <Link
              to="/account"
              className="text-[#1a1a1a] hover:text-gray-600 transition-colors"
              aria-label="My Account"
            >
              <User className="w-[24px] h-[24px] stroke-[1.2]" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-[#1a1a1a] hover:text-gray-600 transition-colors"
              aria-label="Account"
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
          <Link to="/cart" className="flex items-center gap-2 group relative text-[#1a1a1a] hover:text-gray-600 transition-colors">
            <ShoppingBag className="w-[24px] h-[24px] stroke-[1.2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-black rounded-full text-[11px] flex items-center justify-center text-white font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile Menu Slide-down Drawer with Accordion */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-b border-gray-200 py-4 px-6 gap-2 animate-fade-in shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Home */}
          <Link
            to="/"
            className="text-base tracking-widest uppercase font-medium py-2.5 border-b border-gray-100 text-[#1a1a1a]"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          {/* Shop Accordion */}
          <div className="border-b border-gray-100 py-1">
            <div className="flex items-center justify-between py-2">
              <Link
                to="/shop"
                className="text-base tracking-widest uppercase font-medium text-[#1a1a1a]"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>
              <button
                type="button"
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="p-2 text-gray-700 hover:text-black focus:outline-none"
                aria-label="Toggle Shop Submenu"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    mobileShopOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Mobile Shop Accordion Content */}
            {mobileShopOpen && (
              <div className="pl-4 pr-2 py-2 flex flex-col gap-1 bg-[#FAF7F2] border border-[#E8DFD3] my-2">
                {shopCategories.map((item) => {
                  const hasSub = !!item.subitems;
                  const isSubOpen = mobileSubmenuOpen === item.label;

                  return (
                    <div key={item.label} className="flex flex-col">
                      <div className="flex items-center justify-between py-1.5">
                        <Link
                          to={item.to}
                          className="font-serif text-sm tracking-widest uppercase text-[#333] hover:text-black"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {hasSub && (
                          <button
                            type="button"
                            onClick={() =>
                              setMobileSubmenuOpen(isSubOpen ? null : item.label)
                            }
                            className="p-1 text-gray-500"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isSubOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Nested mobile subcategories */}
                      {hasSub && isSubOpen && (
                        <div className="pl-4 pb-2 flex flex-col gap-1.5 border-l-2 border-[#E8DFD3] ml-1 my-1">
                          {item.subitems?.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              className="text-xs uppercase tracking-wider text-[#666] hover:text-black py-1"
                              onClick={() => setMenuOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ready to Ship */}
          <Link
            to="/shop?tag=ready-to-ship"
            className="text-base tracking-widest uppercase font-medium py-2.5 border-b border-gray-100 text-[#1a1a1a]"
            onClick={() => setMenuOpen(false)}
          >
            Ready to Ship
          </Link>

          {/* Jewelry By Agatha G. */}
          <Link
            to="/shop?category=jewelry"
            className="text-base tracking-widest uppercase font-medium py-2.5 border-b border-gray-100 text-[#1a1a1a]"
            onClick={() => setMenuOpen(false)}
          >
            Jewelry By Agatha G.
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className="text-base tracking-widest uppercase font-medium py-2.5 text-[#1a1a1a]"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          {/* Mobile Account / Wishlist actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-around">
            <button
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-700"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                setFavOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-700"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({favCount})</span>
            </button>

            <Link
              to={user ? '/account' : '/login'}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-700"
            >
              <User className="w-4 h-4" />
              <span>{user ? 'Account' : 'Login'}</span>
            </Link>
          </div>
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
