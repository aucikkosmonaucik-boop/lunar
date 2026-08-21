import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cookie as CookieIcon, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Settings2, 
  X 
} from 'lucide-react';
import { 
  getCookieConsent, 
  acceptAllCookies, 
  acceptNecessaryCookies, 
  saveCookieConsent 
} from '../../lib/cookies';
import type { CookieConsentState } from '../../lib/cookies';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<boolean>(true);
  const [marketing, setMarketing] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<boolean>(true);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Small timeout for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    } else {
      setAnalytics(consent.preferences.analytics);
      setMarketing(consent.preferences.marketing);
      setPreferences(consent.preferences.preferences);
    }
  }, []);

  useEffect(() => {
    const handleOpenSettings = () => {
      const consent = getCookieConsent();
      if (consent) {
        setAnalytics(consent.preferences.analytics);
        setMarketing(consent.preferences.marketing);
        setPreferences(consent.preferences.preferences);
      }
      setShowCustomizer(true);
      setIsVisible(true);
    };

    const handleConsentChange = (e: CustomEvent<CookieConsentState | null>) => {
      if (!e.detail) {
        setIsVisible(true);
      }
    };

    window.addEventListener('lunar_open_cookie_settings', handleOpenSettings as EventListener);
    window.addEventListener('lunar_cookie_consent_change', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('lunar_open_cookie_settings', handleOpenSettings as EventListener);
      window.removeEventListener('lunar_cookie_consent_change', handleConsentChange as EventListener);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessaryCookies();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    saveCookieConsent({
      necessary: true,
      analytics,
      marketing,
      preferences,
    });
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => {
          setShowCustomizer(true);
          setIsVisible(true);
        }}
        className="fixed bottom-4 left-4 z-40 p-2.5 bg-white/90 hover:bg-white text-[#1A1A1A] border border-[#EDE6DF] hover:border-[#C1A98F] rounded-full shadow-md backdrop-blur transition-all duration-300 group flex items-center gap-2"
        aria-label="Ustawienia plików cookies"
        title="Ustawienia plików cookies"
      >
        <CookieIcon className="w-4 h-4 text-[#8C6D4F] group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-medium tracking-wider uppercase text-[#78716C] group-hover:text-[#1A1A1A] hidden sm:inline-block pr-1">
          Cookies
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pointer-events-none flex justify-center">
      <div className="w-full max-w-3xl bg-white/98 backdrop-blur-md border border-[#EDE6DF] shadow-2xl rounded-2xl p-5 sm:p-7 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
        
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF6F3] border border-[#C1A98F]/40 flex items-center justify-center text-[#8C6D4F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#8C6D4F] block">
                Prywatność i transparentność
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A]">
                Ustawienia plików cookies w Lunar
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-[#1A1A1A] transition-colors p-1"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
          Używamy plików cookies (ciasteczek), aby zapewnić prawidłowe działanie naszego sklepu, zapamiętać zawartość koszyka, bezpiecznie przetwarzać płatności oraz dostosować ofertę biżuterii i zapachów do Twoich preferencji. Dowiedz się więcej w naszej{' '}
          <Link to="/cookies" className="text-[#8C6D4F] underline hover:text-[#1A1A1A] transition-colors">
            Polityce Cookies
          </Link>
          .
        </p>

        {/* Customization Details (Accordion) */}
        {showCustomizer && (
          <div className="bg-[#FAF7F5] border border-[#EDE6DF] rounded-xl p-4 sm:p-5 mb-5 space-y-4 animate-in fade-in duration-200">
            
            {/* 1. Necessary */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                    Niezbędne i techniczne
                  </span>
                  <span className="text-[9px] bg-[#C1A98F]/20 text-[#8C6D4F] px-2 py-0.5 rounded font-semibold uppercase">
                    Wymagane
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Umożliwiają logowanie, sesję koszyka, nawigację oraz bezpieczne płatności Stripe.
                </p>
              </div>
              <div className="relative inline-flex items-center cursor-not-allowed opacity-75">
                <div className="w-10 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#1A1A1A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Analytics */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider block">
                  Wydajnościowe i analityczne
                </span>
                <p className="text-xs text-gray-500">
                  Pomagają nam badać ruch w sklepie oraz ulepszać szybkość i działanie witryny.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalytics(!analytics)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  analytics ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={analytics}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* 3. Preferences */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider block">
                  Preferencje i personalizacja
                </span>
                <p className="text-xs text-gray-500">
                  Zapamiętują wybraną walutę, ulubione produkty na liście życzeń oraz historię przeglądania.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences(!preferences)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  preferences ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={preferences}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* 4. Marketing */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider block">
                  Marketingowe i reklamowe
                </span>
                <p className="text-xs text-gray-500">
                  Umożliwiają wyświetlanie spersonalizowanych rekomendacji i promocji w sieci.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMarketing(!marketing)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  marketing ? 'bg-[#1A1A1A] justify-end' : 'bg-gray-300 justify-start'
                }`}
                aria-pressed={marketing}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

          </div>
        )}

        {/* Buttons Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-[#78716C] hover:text-[#1A1A1A] font-medium py-2 transition-colors order-last sm:order-first"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#8C6D4F]" />
            <span>{showCustomizer ? 'Ukryj szczegóły' : 'Dostosuj preferencje'}</span>
            {showCustomizer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {showCustomizer ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF6F3] hover:bg-[#F2ECE6] text-[#1A1A1A] border border-[#C1A98F] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Zapisz wybrane
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Tylko niezbędne
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-[#FAF6F3] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow"
            >
              Zaakceptuj wszystkie
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CookieConsentBanner;
