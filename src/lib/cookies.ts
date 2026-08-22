export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentState {
  hasConsented: boolean;
  date: string;
  preferences: CookiePreferences;
}

const CONSENT_COOKIE_KEY = 'lunar_cookie_consent';
const CONSENT_STORAGE_KEY = 'lunar_cookie_consent_v1';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = isHttps ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
}

export function getCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const fromStorage = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (fromStorage) {
      return JSON.parse(fromStorage) as CookieConsentState;
    }
    const fromCookie = getCookie(CONSENT_COOKIE_KEY);
    if (fromCookie) {
      return JSON.parse(fromCookie) as CookieConsentState;
    }
  } catch (e) {
    console.error('Error reading cookie consent state:', e);
  }
  return null;
}

export function updateGoogleConsent(analytics: boolean, marketing: boolean): void {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
    });
  }
}

export function saveCookieConsent(prefs: Partial<CookiePreferences>): CookieConsentState {
  const finalPrefs: CookiePreferences = {
    necessary: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    preferences: Boolean(prefs.preferences),
  };

  const state: CookieConsentState = {
    hasConsented: true,
    date: new Date().toISOString(),
    preferences: finalPrefs,
  };

  try {
    const jsonStr = JSON.stringify(state);
    localStorage.setItem(CONSENT_STORAGE_KEY, jsonStr);
    setCookie(CONSENT_COOKIE_KEY, jsonStr, 365);
    updateGoogleConsent(finalPrefs.analytics, finalPrefs.marketing);
    window.dispatchEvent(new CustomEvent('lunar_cookie_consent_change', { detail: state }));
  } catch (e) {
    console.error('Error saving cookie consent state:', e);
  }

  return state;
}

export function acceptAllCookies(): CookieConsentState {
  return saveCookieConsent({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

export function acceptNecessaryCookies(): CookieConsentState {
  return saveCookieConsent({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
}

export function resetCookieConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    deleteCookie(CONSENT_COOKIE_KEY);
    updateGoogleConsent(false, false);
    window.dispatchEvent(new CustomEvent('lunar_cookie_consent_change', { detail: null }));
  } catch (e) {
    console.error('Error resetting cookie consent:', e);
  }
}
