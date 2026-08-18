import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, ShieldCheck, AlertTriangle, Loader2, MapPin, User, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

interface VerifiedSession {
  id: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  shippingPhone?: string;
  amountTotal: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
}

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true';
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<VerifiedSession | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  useEffect(() => {
    // Clear cart immediately upon reaching success page
    clearCart();

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const addressParam = searchParams.get('address');
        const url = `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}${
          addressParam ? `&address=${encodeURIComponent(addressParam)}` : ''
        }`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Nie udało się zweryfikować sesji płatności.');
        }

        if (data.demoMode || isDemo) {
          setDemoNotice(true);
        }

        if (data.session) {
          setSessionData(data.session);
        } else if (data.order) {
          setSessionData({
            id: data.order.id,
            paymentStatus: data.order.status,
            customerEmail: data.order.customerEmail,
            customerName: data.order.customerName,
            shippingPhone: data.order.shippingPhone,
            amountTotal: data.order.total,
            currency: data.order.currency || 'EUR',
            shippingAddress: data.order.shippingAddress,
          });
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setError(err instanceof Error ? err.message : 'Weryfikacja nie powiodła się');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, isDemo, searchParams]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1A98F] mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#1A1A1A] font-medium">
          Weryfikacja Płatności i Zamówienia...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Error banner if verification had issues */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 mb-6 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Informacja
              </span>
              {error}. Jeśli płatność została zrealizowana, zamówienie zostało zarejestrowane.
            </div>
          </div>
        )}

        {/* Demo Mode Alert if keys not yet configured */}
        {demoNotice && (
          <div className="bg-[#FFF8F0] border border-[#F5DFC8] text-[#8A532B] p-4 mb-6 text-xs flex items-start gap-3 rounded-none">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                Zamówienie Testowe / Tryb Demonstracyjny
              </span>
              Zamówienie zostało złożone w trybie demonstracyjnym Stripe. Wszystkie dane wysyłki zostały pomyślnie przetworzone.
            </div>
          </div>
        )}

        {/* Main Success Card */}
        <div className="bg-white border border-[#EAE3D9] p-8 sm:p-12 text-center shadow-xs">
          
          {/* Check Icon */}
          <div className="w-20 h-20 rounded-full bg-[#FAF6F0] border border-[#E8DFD3] flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>

          <p className="text-[10px] text-[#C1A98F] font-bold uppercase tracking-[0.35em] mb-2">
            Zamówienie Przyjęte do Realizacji
          </p>

          <h1
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-4xl sm:text-5xl text-[#1A1A1A] uppercase font-light tracking-wide mb-3"
          >
            Dziękujemy za Zakupy
          </h1>

          <div className="w-12 h-[1px] bg-[#C1A98F] mx-auto mb-6" />

          <p className="text-gray-600 text-sm font-light leading-relaxed max-w-md mx-auto mb-8">
            Płatność została pomyślnie zautoryzowana. Przygotowujemy Twoją biżuterię Lunar z najwyższą dbałością o każdy detal rzemiosła.
          </p>

          {/* Account Creation Welcome Alert if logged in */}
          {user && (
            <div className="mb-6 p-4 bg-[#FAF6F0] border border-[#E8DFD3] text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-black uppercase tracking-wider block mb-0.5">
                  Konto Lunar jest aktywne
                </span>
                Jesteś zalogowany jako <span className="font-medium text-black">{user.email}</span>. Możesz śledzić status swoich zamówień i edytować adres w panelu klienta.
              </div>
            </div>
          )}

          {/* Details Box */}
          <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-6 text-left space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D9] gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block font-medium">
                  Numer Referencyjny
                </span>
                <span className="text-xs font-mono font-medium text-[#1A1A1A] break-all">
                  {sessionId ? (sessionId.length > 25 ? `${sessionId.slice(0, 22)}...` : sessionId) : `ORD-${Date.now().toString().slice(-6)}`}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block font-medium">
                  Status Płatności
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Opłacone i Potwierdzone
                </span>
              </div>
            </div>

            {sessionData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                {sessionData.customerEmail && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Potwierdzenie Wysłane Na
                    </span>
                    <span className="font-medium text-[#1A1A1A]">{sessionData.customerEmail}</span>
                  </div>
                )}

                {sessionData.amountTotal && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Łączna Kwota
                    </span>
                    <span className="font-semibold text-base text-[#1A1A1A]">
                      €{sessionData.amountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {(sessionData.shippingAddress || sessionData.customerName) && (
                  <div className="sm:col-span-2 pt-3 border-t border-[#EAE3D9] space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-1">
                      Adres Dostawy Kurierskiej
                    </span>
                    {sessionData.customerName && (
                      <div className="font-medium text-[#1A1A1A] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C1A98F]" />
                        <span>{sessionData.customerName}</span>
                      </div>
                    )}
                    {sessionData.shippingAddress && (
                      <div className="text-gray-700 flex items-start gap-1.5 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C1A98F] shrink-0 mt-0.5" />
                        <span>
                          {[
                            sessionData.shippingAddress.line1,
                            sessionData.shippingAddress.city,
                            sessionData.shippingAddress.postal_code,
                            sessionData.shippingAddress.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {(sessionData.shippingPhone || sessionData.shippingAddress?.phone) && (
                      <div className="text-gray-600 text-[11px] flex items-center gap-1.5 pt-0.5">
                        <Phone className="w-3 h-3 text-[#C1A98F]" />
                        <span>Tel: {sessionData.shippingPhone || sessionData.shippingAddress?.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery & Assurance Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Czas Dostawy
                </span>
                <span className="text-[11px] text-gray-500 font-light">2–4 dni robocze</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <Package className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Opakowanie
                </span>
                <span className="text-[11px] text-gray-500 font-light">Pudełko jubilerskie</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#C1A98F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Gwarancja
                </span>
                <span className="text-[11px] text-gray-500 font-light">30 dni na zwrot</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1A1A1A] text-white text-[12px] uppercase tracking-[0.25em] py-4 px-8 hover:bg-[#333333] transition-colors font-medium group"
            >
              <span>Wróć do Sklepu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {user ? (
              <Link
                to="/account"
                className="w-full sm:w-auto inline-flex items-center justify-center text-[12px] uppercase tracking-[0.25em] py-4 px-8 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors font-medium"
              >
                Panel Klienta i Zamówienia
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center text-[12px] uppercase tracking-[0.25em] py-4 px-8 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors font-medium"
              >
                Zaloguj się
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
