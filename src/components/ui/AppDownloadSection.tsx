import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Download, ShieldCheck, Zap, Bell, Gift, ArrowRight, QrCode } from 'lucide-react';

const AppDownloadSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#FAF6F3] border-y border-[#EDE6DF] overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C1A98F]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C1A98F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-[#1a1a1a] rounded-[48px] p-3.5 shadow-2xl border-4 border-[#2d2d2d] ring-1 ring-black/10">
              
              {/* Dynamic Island / Speaker notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0d0d0d] rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#1c1c1e] mr-2" />
                <div className="w-2 h-2 rounded-full bg-[#0a84ff]/40" />
              </div>

              {/* Phone Screen Container */}
              <div className="w-full h-full bg-[#121212] rounded-[38px] overflow-hidden flex flex-col text-white relative font-sans select-none border border-white/5">
                
                {/* App Status Bar */}
                <div className="pt-8 px-6 pb-2 flex justify-between items-center text-[11px] text-gray-400">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="w-4 h-2 border border-gray-400 rounded-sm p-0.5">
                      <div className="w-full h-full bg-gray-400" />
                    </div>
                  </div>
                </div>

                {/* App Header */}
                <div className="px-5 py-3 flex justify-between items-center border-b border-white/10">
                  <div className="flex flex-col">
                    <span className="font-serif text-lg tracking-[0.25em] font-bold text-[#C1A98F]">L U N A R</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#C1A98F]/20 flex items-center justify-center text-[#C1A98F] text-xs">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* App Content Preview */}
                <div className="p-4 flex-1 overflow-hidden space-y-3.5 text-left">
                  
                  {/* Mini Banner */}
                  <div className="h-28 rounded-2xl bg-gradient-to-r from-[#2A241E] to-[#1E1E1E] p-3.5 flex flex-col justify-end border border-[#C1A98F]/30 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[9px] bg-[#C1A98F] text-black font-bold px-2 py-0.5 rounded uppercase">
                      NEW
                    </div>
                    <span className="font-serif text-sm font-bold text-[#C1A98F]">Bridal Suite 2026</span>
                    <span className="text-[10px] text-gray-300">Hand-finished crystals & 925 silver</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-hidden py-1">
                    <span className="px-3 py-1 bg-[#C1A98F] text-black text-[10px] font-semibold rounded-full">All</span>
                    <span className="px-3 py-1 bg-white/10 text-gray-300 text-[10px] rounded-full">Rings</span>
                    <span className="px-3 py-1 bg-white/10 text-gray-300 text-[10px] rounded-full">Necklaces</span>
                    <span className="px-3 py-1 bg-white/10 text-gray-300 text-[10px] rounded-full">Perfumes</span>
                  </div>

                  {/* Product Cards Preview */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#1e1e1e] p-2.5 rounded-xl border border-white/5 flex flex-col">
                      <div className="h-20 bg-gray-800 rounded-lg overflow-hidden mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400" 
                          alt="Solar Necklace" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold truncate">Solar Necklace</span>
                      <span className="text-[11px] font-bold text-[#C1A98F] mt-0.5">€399.00</span>
                    </div>

                    <div className="bg-[#1e1e1e] p-2.5 rounded-xl border border-white/5 flex flex-col">
                      <div className="h-20 bg-gray-800 rounded-lg overflow-hidden mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" 
                          alt="Solitaire Ring" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold truncate">Solitaire Ring</span>
                      <span className="text-[11px] font-bold text-[#C1A98F] mt-0.5">€189.00</span>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="bg-[#171717] px-6 py-3 border-t border-white/10 flex justify-between items-center text-gray-400 text-[10px]">
                  <span className="text-[#C1A98F] font-bold">Home</span>
                  <span>Shop</span>
                  <span>Wishlist</span>
                  <span>Bag</span>
                  <span>Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy, Features & Download Links */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C1A98F]/20 text-[#8c6d4f] font-semibold text-xs tracking-wider uppercase">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Lunar Mobile Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a] font-bold leading-tight">
              Elegance in Your Pocket. <br />
              <span className="italic font-normal text-[#8c6d4f]">Anytime, anywhere.</span>
            </h2>

            <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
              Elevate your shopping journey with the official Lunar mobile app for Android & iOS. Enjoy instant parcel tracking, one-tap biometric checkout, and exclusive member drops.
            </p>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-[#C1A98F]/20 flex items-center justify-center text-[#8c6d4f] shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">Instant Checkout</h4>
                  <p className="text-xs text-gray-500 mt-0.5">One-click BLIK, Apple Pay & saved addresses.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-[#C1A98F]/20 flex items-center justify-center text-[#8c6d4f] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">Live Order Tracking</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time status alerts from dispatch to doorstep.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-[#C1A98F]/20 flex items-center justify-center text-[#8c6d4f] shrink-0 mt-0.5">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">VIP Club Rewards</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Earn bonus loyalty points on every in-app purchase.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-[#C1A98F]/20 flex items-center justify-center text-[#8c6d4f] shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">Exclusive Drops</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Priority early access to limited jewelry collections.</p>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              {/* Direct APK Download Button */}
              <Link
                to="/app"
                className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-black text-white px-7 py-4 rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5 text-[#C1A98F]" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest leading-tight">Direct Download</span>
                  <span className="font-bold text-sm leading-tight text-[#C1A98F]">Android App (.APK)</span>
                </div>
              </Link>

              {/* Learn More & Guide */}
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1a1a1a] border border-gray-300 px-6 py-4 rounded-xl font-semibold text-sm transition-colors"
              >
                <span>Installation Guide & iOS</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
            </div>

            {/* Micro QR Scan Box for Desktop Viewers */}
            <div className="hidden sm:flex items-center gap-4 pt-2 text-xs text-gray-500">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1.5 text-gray-800">
                <QrCode className="w-full h-full text-[#1a1a1a]" />
              </div>
              <span>Scan QR code or click above to install directly on your device.</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
