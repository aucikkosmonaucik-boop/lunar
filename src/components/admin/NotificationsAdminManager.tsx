import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Users,
  User,
  Mail,
  Truck,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Tag,
  Check,
  AlertCircle,
  Trash2,
  RefreshCw,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface NotificationHistoryItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  orderNumber: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface TemplatePreset {
  name: string;
  type: 'SHIPPING' | 'ORDER' | 'PAYMENT' | 'PROMO' | 'LOYALTY';
  title: string;
  message: string;
  linkUrl: string;
}

const TEMPLATES: TemplatePreset[] = [
  {
    name: '📦 Paczka nadana (Dispatched)',
    type: 'SHIPPING',
    title: '📦 Twoja przesyłka została nadana',
    message: 'Twoje zamówienie zostało starannie spakowane i przekazane kurierowi. Numer listu przewozowego oraz link do śledzenia trasy znajdziesz w szczegółach zamówienia.',
    linkUrl: '/track-order',
  },
  {
    name: '🚚 Paczka w doręczeniu (Out for delivery)',
    type: 'SHIPPING',
    title: '🚚 Przesyłka w doręczeniu dzisiaj',
    message: 'Kurier odebrał Twoją paczkę i doręczy ją pod wskazany adres dzisiaj w godzinach 9:00 - 17:00. Upewnij się, że ktoś będzie na miejscu, aby odebrać przesyłkę.',
    linkUrl: '/track-order',
  },
  {
    name: '📍 Gotowa do odbioru (Ready for pickup)',
    type: 'SHIPPING',
    title: '📍 Paczka gotowa do odbioru',
    message: 'Twoja paczka dotarła do punktu odbioru / paczkomatu. Możesz ją odebrać za pomocą kodu z wiadomości SMS lub aplikacji przewoźnika.',
    linkUrl: '/track-order',
  },
  {
    name: '✨ Potwierdzenie zamówienia (Order verified)',
    type: 'ORDER',
    title: '✨ Twoje zamówienie jest realizowane',
    message: 'Dziękujemy za zakupy w Lunar Boutique. Twoje zamówienie zostało zweryfikowane i nasi rzemieślnicy przygotowują Twoje kreacje do bezpiecznej wysyłki.',
    linkUrl: '/account',
  },
  {
    name: '🌙 Specjalny rabat VIP (Exclusive Promo)',
    type: 'PROMO',
    title: '🌙 Ekskluzywna oferta specjalna dla Ciebie',
    message: 'Jako nasz ceniony klient otrzymujesz wyjątkowy rabat -15% na najnowszą kolekcję biżuterii. Użyj kodu rabatowego VIP15 podczas finalizacji zamówienia!',
    linkUrl: '/shop',
  },
  {
    name: '✦ Bonusowe punkty Lunar Club (Loyalty)',
    type: 'LOYALTY',
    title: '✦ Przyznano bonusowe punkty Lunar Club',
    message: 'Na Twoje konto trafiły dodatkowe punkty lojalnościowe Lunar VIP! Wymieniaj zebrane punkty na vouchery i zniżki na kolejne zakupy.',
    linkUrl: '/account',
  },
];

export const NotificationsAdminManager: React.FC<{
  showToast?: (message: string, type?: 'success' | 'info') => void;
}> = ({ showToast }) => {
  // Audience
  const [targetType, setTargetType] = useState<'all' | 'single'>('single');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Form Fields
  const [type, setType] = useState<'ORDER' | 'SHIPPING' | 'PAYMENT' | 'PROMO' | 'LOYALTY'>('SHIPPING');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sendEmailCopy, setSendEmailCopy] = useState(true);

  // Data & State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Fetch registered customers
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch('/api/notifications/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.warn('Failed to load customers for notifications:', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  // Fetch sent notifications history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/notifications/admin-history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Failed to load notification history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchHistory();
  }, [fetchCustomers, fetchHistory]);

  const applyTemplate = (tpl: TemplatePreset) => {
    setType(tpl.type);
    setTitle(tpl.title);
    setMessage(tpl.message);
    setLinkUrl(tpl.linkUrl);
    setFeedback(null);
  };

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setCustomEmail(cust.email || '');
    setIsCustomerDropdownOpen(false);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ message: 'Tytuł powiadomienia jest wymagany.', isError: true });
      return;
    }

    if (!message.trim()) {
      setFeedback({ message: 'Treść wiadomości jest wymagana.', isError: true });
      return;
    }

    if (targetType === 'single' && !selectedCustomerId && !customEmail.trim()) {
      setFeedback({ message: 'Wybierz klienta z listy lub wpisz jego adres e-mail.', isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetUserId: targetType === 'single' ? selectedCustomerId || undefined : undefined,
          targetEmail: targetType === 'single' ? customEmail.trim() || undefined : undefined,
          title: title.trim(),
          message: message.trim(),
          type,
          orderNumber: orderNumber.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
          sendEmailCopy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Błąd podczas wysyłania powiadomienia');
      }

      setFeedback({
        message:
          data.message ||
          (targetType === 'all'
            ? `Wysłano powiadomienie do ${data.count || 0} klientów!`
            : 'Powiadomienie zostało pomyślnie wysłane!'),
        isError: false,
      });

      if (showToast) {
        showToast(data.message || 'Powiadomienie wysłane!', 'success');
      }

      // Reset form fields
      setTitle('');
      setMessage('');
      setOrderNumber('');
      setLinkUrl('');

      // Refresh log
      await fetchHistory();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setFeedback({ message: errorMsg, isError: true });
      if (showToast) showToast(errorMsg, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis z rejestru powiadomień?')) return;

    try {
      const res = await fetch(`/api/notifications/delete-admin?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (showToast) showToast('Usunięto wpis z rejestru powiadomień', 'info');
      }
    } catch (err) {
      console.warn('Failed to delete notification item:', err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  const getTypeIcon = (notifType: string) => {
    switch (notifType) {
      case 'SHIPPING':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'LOYALTY':
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
      case 'PROMO':
        return <Tag className="w-4 h-4 text-rose-500" />;
      case 'ORDER':
      default:
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FAF7F2] border border-[#D4AF37] rounded-sm flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h2
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-2xl text-[#1A1A1A] font-bold tracking-wide"
            >
              Centrum Powiadomień Klientów (APK &amp; WWW)
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Wysyłaj wiadomości i aktualizacje statusów w czasie rzeczywistym. Powiadomienia pojawią się
              w aplikacji mobilnej (APK) oraz na stronie WWW (pod dzwonkiem), a opcjonalnie także na skrzynce e-mail klienta.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchCustomers();
            fetchHistory();
          }}
          disabled={loadingHistory || loadingCustomers}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Odśwież dane</span>
        </button>
      </div>

      {/* Main Composer Form */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C1A98F] font-bold block mb-1">
            Nowa Wiadomość
          </span>
          <h3 className="text-xl font-bold text-[#1A1A1A] font-serif">
            Formularz nadawczy powiadomienia
          </h3>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
            Szybkie szablony wiadomości
          </label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#EAE3D9] hover:border-[#D4AF37] hover:bg-[#FAF4EC] rounded text-xs font-medium text-[#1A1A1A] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-6">
          {/* Target Audience */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-2">
              Adresat powiadomienia
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setTargetType('single')}
                className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${
                  targetType === 'single'
                    ? 'border-[#1A1A1A] bg-[#FAF8F5] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'single'}
                  onChange={() => setTargetType('single')}
                  className="mt-0.5 text-black focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-600" />
                    <span>Pojedynczy klient</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Wybierz z listy zarejestrowanych użytkowników lub wpisz adres e-mail
                  </p>
                </div>
              </label>

              <label
                onClick={() => setTargetType('all')}
                className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${
                  targetType === 'all'
                    ? 'border-[#1A1A1A] bg-[#FAF8F5] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'all'}
                  onChange={() => setTargetType('all')}
                  className="mt-0.5 text-black focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>Wszyscy klienci ({customers.length} zarejestrowanych)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ogłoszenie masowe (Broadcast) – widoczne dla każdego użytkownika
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Specific Customer Picker (if single target) */}
          {targetType === 'single' && (
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded space-y-3">
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700">
                Wskaż klienta docelowego
              </label>

              <div className="relative">
                <div
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5CCC1] rounded text-sm flex items-center justify-between cursor-pointer hover:border-black transition-colors"
                >
                  <div className="truncate">
                    {selectedCustomerObj ? (
                      <span className="font-semibold text-black">
                        {selectedCustomerObj.name || 'Klient'} ({selectedCustomerObj.email || 'Brak email'})
                      </span>
                    ) : customEmail ? (
                      <span>Wpisano ręcznie: <strong>{customEmail}</strong></span>
                    ) : (
                      <span className="text-gray-400">Wybierz klienta z listy rozwijanej...</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#D5CCC1] rounded shadow-xl max-h-64 overflow-y-auto p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Szukaj po nazwisku, e-mailu lub telefonie..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded mb-2 focus:outline-none focus:border-black"
                    />

                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className={`p-2 rounded text-xs cursor-pointer hover:bg-[#FAF6F0] flex items-center justify-between ${
                            selectedCustomerId === cust.id ? 'bg-[#FAF6F0] font-bold text-black' : 'text-gray-700'
                          }`}
                        >
                          <div>
                            <span className="block">{cust.name || 'Klient bez nazwy'}</span>
                            <span className="text-[11px] text-gray-500">{cust.email || cust.phone || 'Brak kontaktu'}</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {cust.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 p-2 text-center">Brak wyników</p>
                    )}
                  </div>
                )}
              </div>

              {/* Or manual email */}
              <div className="pt-2">
                <span className="text-[11px] text-gray-500 block mb-1">
                  Lub wpisz adres e-mail klienta ręcznie:
                </span>
                <input
                  type="email"
                  placeholder="np. klient@gmail.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    setSelectedCustomerId('');
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Type & Order Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                Kategoria powiadomienia
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none"
              >
                <option value="SHIPPING">📦 SHIPPING (Paczka / Dostawa)</option>
                <option value="ORDER">🛍️ ORDER (Zamówienie / Przyjęcie)</option>
                <option value="PAYMENT">💳 PAYMENT (Płatność / Zwrot)</option>
                <option value="PROMO">🏷️ PROMO (Promocja / Kod rabatowy)</option>
                <option value="LOYALTY">✨ LOYALTY (Klub Lunar / Punkty VIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                Numer zamówienia (opcjonalnie)
              </label>
              <input
                type="text"
                placeholder="np. LUNAR-2026-0801"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5 flex justify-between">
              <span>Tytuł powiadomienia *</span>
              <span className="text-gray-400 font-normal">{title.length}/80</span>
            </label>
            <input
              type="text"
              placeholder="np. 📦 Twoja paczka została nadana kurierem DPD"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none font-medium"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5 flex justify-between">
              <span>Treść wiadomości *</span>
              <span className="text-gray-400 font-normal">{message.length}/500</span>
            </label>
            <textarea
              rows={4}
              placeholder="Wpisz treść, którą klient przeczyta w powiadomieniu (np. numer listu przewozowego, instrukcję odbioru paczki lub kod rabatowy)..."
              value={message}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action Link */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
              Odnośnik po kliknięciu (opcjonalnie)
            </label>
            <input
              type="text"
              placeholder="np. /track-order lub /account lub pełny link kurierski"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none font-mono text-xs"
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              Gdy klient stuknie w powiadomienie, zostanie automatycznie przeniesiony pod ten adres.
            </span>
          </div>

          {/* Send Email Copy */}
          <label className="flex items-start gap-3 p-4 bg-[#FAF6F0] border border-[#E8DFD3] rounded cursor-pointer transition-colors hover:bg-[#F6EFE6]">
            <input
              type="checkbox"
              checked={sendEmailCopy}
              onChange={(e) => setSendEmailCopy(e.target.checked)}
              className="mt-0.5 rounded text-[#1A1A1A] focus:ring-0 cursor-pointer"
            />
            <div className="text-xs text-gray-700">
              <span className="font-semibold text-black block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Wyślij także elegancką wiadomość E-mail na skrzynkę klienta</span>
              </span>
              Wiadomość z logo Lunar Boutique zostanie natychmiast wysłana na adres e-mail odbiorcy za pośrednictwem serwera Resend.
            </div>
          </label>

          {/* Live Preview Box */}
          <div className="p-4 bg-[#1A1A1A] text-white rounded-sm space-y-2 border border-[#333]">
            <div className="flex items-center justify-between text-[11px] text-[#D4AF37] uppercase tracking-wider font-bold">
              <span>Podgląd na żywo (jak zobaczy to klient):</span>
              <span className="text-gray-400 font-normal">Aplikacja APK / Pasek WWW</span>
            </div>

            <div className="bg-[#242424] border border-[#3A3A3A] p-4 rounded-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center shrink-0 mt-0.5">
                {getTypeIcon(type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {title || 'Tytuł Twojego powiadomienia'}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0">Przed chwilą</span>
                </div>
                <p className="text-xs text-gray-300 mt-1 line-clamp-3 leading-relaxed">
                  {message || 'Tutaj wyświetli się wpisana przez Ciebie treść powiadomienia...'}
                </p>
                {orderNumber && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-semibold bg-[#333] text-[#D4AF37] px-2 py-0.5 rounded">
                    Zamówienie #{orderNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Feedback */}
          {feedback && (
            <div
              className={`p-4 border text-xs rounded flex items-center gap-2 ${
                feedback.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-widest rounded transition-all flex items-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Wysyłanie...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Wyślij powiadomienie teraz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Notifications History Log */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C1A98F] font-bold block mb-1">
              Rejestr Działań
            </span>
            <h3 className="text-xl font-bold text-[#1A1A1A] font-serif">
              Ostatnio wysłane powiadomienia ({history.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Zapisane w bazie danych
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Wczytywanie historii powiadomień...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Brak wysłanych powiadomień w historii. Użyj powyższego formularza, aby wysłać pierwsze powiadomienie!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-[#FAF8F5]">
                  <th className="py-3 px-4">Typ</th>
                  <th className="py-3 px-4">Odbiorca</th>
                  <th className="py-3 px-4">Tytuł i Wiadomość</th>
                  <th className="py-3 px-4">Zamówienie</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                        {getTypeIcon(item.type)}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-black block">
                        {item.user?.name || 'Klient'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {item.user?.email || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <strong className="block text-[#1A1A1A] font-semibold truncate">
                        {item.title}
                      </strong>
                      <p className="text-gray-500 text-[11px] line-clamp-1">
                        {item.message}
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {item.orderNumber ? `#${item.orderNumber}` : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(item.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.isRead ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          Odczytano
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          Nieodczytane
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Usuń z rejestru"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
