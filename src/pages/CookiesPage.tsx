import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, RotateCcw, Sparkles } from 'lucide-react';
import { 
  getCookieConsent, 
  saveCookieConsent, 
  resetCookieConsent, 
  acceptAllCookies 
} from '../lib/cookies';
import type { CookieConsentState } from '../lib/cookies';

const CookiesPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<boolean>(true);
  const [marketing, setMarketing] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setAnalytics(consent.preferences.analytics);
      setMarketing(consent.preferences.marketing);
      setPreferences(consent.preferences.preferences);
      setConsentDate(new Date(consent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    }

    const handleConsentChange = (e: CustomEvent<CookieConsentState | null>) => {
      if (e.detail) {
        setAnalytics(e.detail.preferences.analytics);
        setMarketing(e.detail.preferences.marketing);
        setPreferences(e.detail.preferences.preferences);
        setConsentDate(new Date(e.detail.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
      } else {
        setConsentDate(null);
      }
    };

    window.addEventListener('lunar_cookie_consent_change', handleConsentChange as EventListener);
    return () => window.removeEventListener('lunar_cookie_consent_change', handleConsentChange as EventListener);
  }, []);

  const handleSave = () => {
    const state = saveCookieConsent({
      necessary: true,
      analytics,
      marketing,
      preferences,
    });
    setConsentDate(new Date(state.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleAcceptAll = () => {
    const state = acceptAllCookies();
    setAnalytics(true);
    setMarketing(true);
    setPreferences(true);
    setConsentDate(new Date(state.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReset = () => {
    resetCookieConsent();
    setAnalytics(false);
    setMarketing(false);
    setPreferences(false);
    setConsentDate(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="bg-white min-h-screen px-6 pt-2 md:pt-4 pb-20 animate-fade-in flex flex-col items-center w-full">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <p className="text-[11px] text-[#8C6D4F] font-bold uppercase tracking-[0.45em] mb-4">
            Privacy Preference &amp; Cookies
          </p>
          <h1 
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl md:text-6xl tracking-widest text-[#1a1a1a] uppercase font-light mb-6"
          >
            Cookies Policy
          </h1>
          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto" />
        </div>

        {/* Interactive Consent Management Card */}
        <div className="bg-[#FAF7F5] border border-[#EDE6DF] rounded-2xl p-6 md:p-8 mb-16 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDE6DF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#C1A98F] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Your Cookie Preferences
                </h2>
                <p className="text-xs text-gray-500">
                  {consentDate ? `Last updated: ${consentDate}` : 'Default privacy settings applied'}
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preferences saved successfully!</span>
              </div>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="py-6 space-y-6">
            
            {/* 1. Necessary */}
            <div className="flex items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                    Strictly Necessary &amp; Security
                  </span>
                  <span className="text-[10px] bg-[#C1A98F]/20 text-[#8C6D4F] px-2 py-0.5 rounded font-semibold uppercase">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                  Crucial for proper shop functionality: customer authentication, shopping bag persistence, navigation security, and encrypted Stripe checkout processing.
                </p>
              </div>
              <div className="opacity-75 cursor-not-allowed pt-1 md:pt-0">
                <div className="w-11 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#1A1A1A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Analytics */}
            <div className="flex items-start md:items-center justify-between gap-4 pt-4 border-t border-gray-200/60">
              <div>
                <span className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                  Performance &amp; Analytics
                </span>
                <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                  Allow us to count visits and traffic sources to measure and refine the performance, reliability, and speed of our luxury boutique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalytics(!analytics)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 pt-1 md:pt-0 ${
                  analytics ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={analytics}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* 3. Preferences */}
            <div className="flex items-start md:items-center justify-between gap-4 pt-4 border-t border-gray-200/60">
              <div>
                <span className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                  Preferences &amp; Functionality
                </span>
                <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                  Enable the website to remember your personal settings, such as your Wishlist items, viewing history, and regional preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences(!preferences)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 pt-1 md:pt-0 ${
                  preferences ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={preferences}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* 4. Marketing */}
            <div className="flex items-start md:items-center justify-between gap-4 pt-4 border-t border-gray-200/60">
              <div>
                <span className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                  Marketing &amp; Targeted Advertising
                </span>
                <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                  Used to tailor promotional announcements and showcase personalized new arrivals and fine jewelry recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMarketing(!marketing)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 pt-1 md:pt-0 ${
                  marketing ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={marketing}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#EDE6DF]">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Preferences</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-[#1A1A1A] border border-[#C1A98F] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Save My Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-[#FAF6F3] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                Accept All Cookies
              </button>
            </div>
          </div>

        </div>

        {/* Detailed Informational Sections */}
        <div className="space-y-12 text-[#1a1a1a] leading-relaxed font-light text-center">
          
          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-4 text-center">
              1. What are Cookies?
            </h2>
            <p className="text-[15px] text-gray-600 max-w-2xl mx-auto text-center">
              Cookies are small data files stored on your browser or device when you visit https://mylunar.shop. They enable the website to identify your browser, remember your session state, and deliver a smooth, tailored luxury experience.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-4 text-center">
              2. How Lunar Uses Cookies
            </h2>
            <p className="text-[15px] text-gray-600 max-w-2xl mx-auto mb-4 text-center">
              At Lunar, we treat your privacy and data security with utmost care. We utilize cookies for the following objectives:
            </p>
            <ul className="list-none text-[15px] text-gray-600 space-y-2 max-w-lg mx-auto">
              <li className="text-center">• Maintaining active authentication sessions and shopping cart contents</li>
              <li className="text-center">• Secure and encrypted transaction handling via Stripe</li>
              <li className="text-center">• Fast asset caching and seamless mobile optimization</li>
              <li className="text-center">• Anonymous statistical insights to refine collections and service</li>
            </ul>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-4 text-center">
              3. Managing Cookies in Your Browser
            </h2>
            <p className="text-[15px] text-gray-600 max-w-2xl mx-auto text-center">
              You can adjust your cookie settings at any time using the control panel above or via your browser settings (Chrome, Safari, Firefox, Edge). Please note that disabling essential cookies may impact account access and checkout functionality.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 mt-20 w-full text-center">
            <p className="text-[11px] uppercase tracking-widest text-gray-400">
              Last updated: August 2026 &bull; Lunar Jewellery
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CookiesPage;
