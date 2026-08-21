import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Bell, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  Apple, 
  HelpCircle
} from 'lucide-react';

const MobileAppPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const downloadApkUrl = 'https://github.com/aucikkosmonaucik-boop/lunar/releases/latest/download/lunar-app.apk';

  const faqs = [
    {
      q: 'Is downloading the APK safe for my Android device?',
      a: 'Yes, 100%. The APK is built directly from our official open-source codebase and hosted securely on our servers. Android displays a standard warning for any app installed outside Google Play to protect users, which is completely normal.'
    },
    {
      q: 'How do I update the Lunar app to newer versions?',
      a: 'Whenever an update is released, you will be notified in the app or you can simply download the latest .APK from this page and install it over the existing version without losing your cart or saved data.'
    },
    {
      q: 'How do I install the app on an iPhone (iOS)?',
      a: 'Apple does not allow direct file downloads outside the App Store. We are currently finalizing the official Apple App Store release and TestFlight beta. In the meantime, you can add our web store to your iPhone Home Screen via Safari (Share → Add to Home Screen).'
    },
    {
      q: 'Do I need an account to browse and buy?',
      a: 'No! You can browse our entire catalog, save favorites, and checkout as a guest. However, creating a free Lunar account allows you to earn Club loyalty points and track your past orders.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Header Hero */}
      <section className="bg-[#FAF6F3] border-b border-[#EDE6DF] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C1A98F]/20 text-[#8c6d4f] font-semibold text-xs tracking-wider uppercase">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Lunar Official Mobile Application</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Download the Lunar App
          </h1>

          <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            The ultimate fine jewelry & luxury fragrance shopping companion. Instant checkout with BLIK & Apple Pay, real-time parcel tracking, and exclusive member privileges.
          </p>

          {/* Download Action Box */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={downloadApkUrl}
              download="lunar-app.apk"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              <Download className="w-5 h-5 text-[#C1A98F] group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-300 uppercase tracking-widest leading-tight">Direct Android Download</span>
                <span className="font-bold text-base leading-tight text-[#C1A98F]">Download .APK (v1.0.0)</span>
              </div>
            </a>

            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gray-100 text-gray-500 px-6 py-4 rounded-xl border border-gray-200 cursor-not-allowed">
              <Apple className="w-5 h-5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-widest leading-tight">Apple iOS</span>
                <span className="font-semibold text-sm leading-tight text-gray-700">App Store (Coming Soon)</span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <p className="text-xs text-gray-500 pt-2">
            Compatible with Android 8.0+ • Fast & secure install • Size: ~24 MB
          </p>
        </div>
      </section>

      {/* 2. Step-by-Step Android Installation Guide */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a1a] mb-4">
            How to Install the APK on Android
          </h2>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
            Follow these 3 simple steps to install the Lunar app directly on your smartphone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-[#FAF7F5] p-8 rounded-2xl border border-[#EDE6DF] text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-[#C1A98F] font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Download File</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tap the <strong>Download .APK</strong> button above. If Chrome shows a prompt asking <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAF7F5] p-8 rounded-2xl border border-[#EDE6DF] text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-[#C1A98F] font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Allow Installation</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Open the downloaded file from your notifications. If prompted by Android security, tap <strong>Settings</strong> and enable <strong>Allow from this source</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAF7F5] p-8 rounded-2xl border border-[#EDE6DF] text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-[#C1A98F] font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Install & Enjoy</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong> to start exploring jewelry and enjoy seamless mobile shopping!
            </p>
          </div>

        </div>
      </section>

      {/* 3. Key Feature Highlights */}
      <section className="bg-[#1a1a1a] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C1A98F] font-semibold">Mobile Benefits</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold">Why Shop via the Lunar App?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#242424] p-6 rounded-2xl border border-white/5 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#C1A98F]/20 flex items-center justify-center text-[#C1A98F]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Express Checkout</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Save time with remembered delivery addresses and 1-tap BLIK and card payments.
              </p>
            </div>

            <div className="bg-[#242424] p-6 rounded-2xl border border-white/5 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#C1A98F]/20 flex items-center justify-center text-[#C1A98F]">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Live Tracking</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive instant status updates as your parcel is crafted, packed, and shipped.
              </p>
            </div>

            <div className="bg-[#242424] p-6 rounded-2xl border border-white/5 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#C1A98F]/20 flex items-center justify-center text-[#C1A98F]">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">VIP Club Points</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Collect loyalty points on every single order and unlock exclusive vouchers.
              </p>
            </div>

            <div className="bg-[#242424] p-6 rounded-2xl border border-white/5 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#C1A98F]/20 flex items-center justify-center text-[#C1A98F]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Offline Wishlist</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Heart your favorite chains and rings to view them anytime, even offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#8c6d4f] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1a1a1a]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center bg-[#FAF7F5] hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-sm md:text-base text-[#1a1a1a]">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 py-4 text-sm text-gray-600 bg-white leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom Sticky-Style Download Bar for Mobile */}
      <div className="bg-[#FAF6F3] border-t border-[#EDE6DF] py-12 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#1a1a1a]">Ready to experience Lunar on mobile?</h3>
          <a
            href={downloadApkUrl}
            download="lunar-app.apk"
            className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-black text-[#C1A98F] px-8 py-3.5 rounded-full font-bold text-sm transition-colors shadow-md w-full"
          >
            <Download className="w-4 h-4" />
            <span>Download Android App (.APK)</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default MobileAppPage;
