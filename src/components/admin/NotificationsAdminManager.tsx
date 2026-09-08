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
    name: '📦 Order Dispatched',
    type: 'SHIPPING',
    title: '📦 Your order has been dispatched',
    message: 'Your Lunar order has been carefully packaged and handed over to our courier. You can find your tracking number and live shipment status in your order details.',
    linkUrl: '/track-order',
  },
  {
    name: '🚚 Out for Delivery',
    type: 'SHIPPING',
    title: '🚚 Your order is out for delivery today',
    message: 'Our courier is on the way and scheduled to deliver your parcel today. Please ensure someone is available at your delivery address to receive your order.',
    linkUrl: '/track-order',
  },
  {
    name: '📍 Ready for Pickup',
    type: 'SHIPPING',
    title: '📍 Your parcel is ready for pickup',
    message: 'Your parcel has arrived at your selected pickup point / locker. You can retrieve it using the pickup code from your carrier message or app.',
    linkUrl: '/track-order',
  },
  {
    name: '✨ Order Verified',
    type: 'ORDER',
    title: '✨ Your order is being handcrafted & prepared',
    message: 'Thank you for choosing Lunar Boutique. Your order has been verified and our master jewelers are preparing your pieces for secure dispatch.',
    linkUrl: '/account',
  },
  {
    name: '🌙 Exclusive VIP Offer',
    type: 'PROMO',
    title: '🌙 An exclusive privilege for you',
    message: 'As a valued Lunar collector, enjoy an exclusive 15% privilege on our newest haute joaillerie arrivals. Apply code VIP15 at checkout!',
    linkUrl: '/shop',
  },
  {
    name: '✦ Lunar Club Bonus Points',
    type: 'LOYALTY',
    title: '✦ Bonus Lunar Club Points Awarded',
    message: 'Complimentary loyalty reward points have been credited to your Lunar Club account! Redeem your points for exclusive vouchers and bespoke rewards.',
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('lunar_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch registered customers
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch('/api/notifications/customers', {
        headers: getAuthHeaders(),
      });
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
      const res = await fetch('/api/notifications/admin-history', {
        headers: getAuthHeaders(),
      });
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

  const handleOrderNumberChange = (val: string) => {
    setOrderNumber(val);
    const clean = val.trim().toUpperCase();
    if (!linkUrl || linkUrl.startsWith('/track-order')) {
      setLinkUrl(clean ? `/track-order?orderNumber=${clean}` : '/track-order');
    }
  };

  const applyTemplate = (tpl: TemplatePreset) => {
    setType(tpl.type);
    setTitle(tpl.title);
    setMessage(tpl.message);
    const cleanOrd = orderNumber.trim().toUpperCase();
    if (tpl.linkUrl.startsWith('/track-order') && cleanOrd) {
      setLinkUrl(`/track-order?orderNumber=${cleanOrd}`);
    } else {
      setLinkUrl(tpl.linkUrl);
    }
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
      setFeedback({ message: 'Notification title is required.', isError: true });
      return;
    }

    if (!message.trim()) {
      setFeedback({ message: 'Notification message content is required.', isError: true });
      return;
    }

    if (targetType === 'single' && !selectedCustomerId && !customEmail.trim()) {
      setFeedback({ message: 'Please select a registered customer or enter an email address.', isError: true });
      return;
    }

    const cleanOrder = orderNumber.trim().toUpperCase();
    let finalLinkUrl = linkUrl.trim();
    if (!finalLinkUrl) {
      finalLinkUrl = cleanOrder ? `/track-order?orderNumber=${cleanOrder}` : '/track-order';
    } else if (cleanOrder && finalLinkUrl.startsWith('/track-order') && !finalLinkUrl.includes('orderNumber=')) {
      finalLinkUrl = `${finalLinkUrl}${finalLinkUrl.includes('?') ? '&' : '?'}orderNumber=${cleanOrder}`;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          targetType,
          targetUserId: targetType === 'single' ? selectedCustomerId || undefined : undefined,
          targetEmail: targetType === 'single' ? customEmail.trim() || undefined : undefined,
          title: title.trim(),
          message: message.trim(),
          type,
          orderNumber: cleanOrder || undefined,
          linkUrl: finalLinkUrl || undefined,
          sendEmailCopy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch notification');
      }

      setFeedback({
        message:
          data.message ||
          (targetType === 'all'
            ? `Notification successfully broadcasted to ${data.count || 0} customers!`
            : 'Notification sent successfully!'),
        isError: false,
      });

      if (showToast) {
        showToast(data.message || 'Notification sent successfully!', 'success');
      }

      // Reset form fields
      setTitle('');
      setMessage('');
      setOrderNumber('');
      setLinkUrl('');

      // Refresh log
      await fetchHistory();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setFeedback({ message: errorMsg, isError: true });
      if (showToast) showToast(errorMsg, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this notification record from history?')) return;

    try {
      const res = await fetch(`/api/notifications/delete-admin?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (showToast) showToast('Notification record deleted from history', 'info');
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
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FAF7F2] dark:bg-[#252525] border border-[#D4AF37] rounded-sm flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h2
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-2xl sm:text-3xl text-[#1A1A1A] dark:text-white font-normal tracking-wide"
            >
              Customer Notifications Dispatcher
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1 max-w-2xl leading-relaxed">
              Send real-time updates and announcements to customers. Notifications will appear instantly in the Mobile App (APK),
              on the Web Portal (bell icon), and optionally deliver a branded email copy directly to the customer's inbox.
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
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold border border-gray-300 dark:border-[#3E3E3E] text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Composer Form */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="border-b border-gray-100 dark:border-[#2E2E2E] pb-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C1A98F] dark:text-[#D4AF37] font-bold block mb-1">
            New Dispatch
          </span>
          <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white font-serif">
            Notification Composer
          </h3>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
            Quick Message Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#383838] hover:border-[#D4AF37] hover:bg-[#FAF4EC] dark:hover:bg-[#2E2E2E] rounded text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-6">
          {/* Target Audience */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setTargetType('single')}
                className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${
                  targetType === 'single'
                    ? 'border-[#1A1A1A] dark:border-[#D4AF37] bg-[#FAF8F5] dark:bg-[#252525] shadow-xs'
                    : 'border-gray-200 dark:border-[#2E2E2E] hover:border-gray-300 dark:hover:border-[#3E3E3E] bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'single'}
                  onChange={() => setTargetType('single')}
                  className="mt-0.5 text-black dark:accent-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                />
                <div>
                  <div className="text-base font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span>Single Customer</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Select a registered user from the directory or enter an email address
                  </p>
                </div>
              </label>

              <label
                onClick={() => setTargetType('all')}
                className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${
                  targetType === 'all'
                    ? 'border-[#1A1A1A] dark:border-[#D4AF37] bg-[#FAF8F5] dark:bg-[#252525] shadow-xs'
                    : 'border-gray-200 dark:border-[#2E2E2E] hover:border-gray-300 dark:hover:border-[#3E3E3E] bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'all'}
                  onChange={() => setTargetType('all')}
                  className="mt-0.5 text-black dark:accent-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                />
                <div>
                  <div className="text-base font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>All Customers ({customers.length} registered)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Broadcast announcement — delivered to every customer account
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Specific Customer Picker (if single target) */}
          {targetType === 'single' && (
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded space-y-3 transition-colors">
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200">
                Select Target Customer
              </label>

              <div className="relative">
                <div
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E1E1E] border border-[#D5CCC1] dark:border-[#3E3E3E] rounded text-base flex items-center justify-between cursor-pointer hover:border-black dark:hover:border-[#D4AF37] transition-colors"
                >
                  <div className="truncate">
                    {selectedCustomerObj ? (
                      <span className="font-semibold text-black dark:text-white">
                        {selectedCustomerObj.name || 'Customer'} ({selectedCustomerObj.email || 'No email'})
                      </span>
                    ) : customEmail ? (
                      <span className="text-[#1A1A1A] dark:text-white">Manual recipient: <strong>{customEmail}</strong></span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">Select a customer from the dropdown list...</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 ml-2" />
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-[#1E1E1E] border border-[#D5CCC1] dark:border-[#3E3E3E] rounded shadow-xl max-h-64 overflow-y-auto p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Search by name, email or phone number..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#3E3E3E] text-gray-900 dark:text-white rounded mb-2 focus:outline-none focus:border-[#D4AF37]"
                    />

                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className={`p-2.5 rounded text-sm cursor-pointer hover:bg-[#FAF6F0] dark:hover:bg-[#2A2A2A] flex items-center justify-between transition-colors ${
                            selectedCustomerId === cust.id ? 'bg-[#FAF6F0] dark:bg-[#2E2E2E] font-bold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div>
                            <span className="block font-semibold">{cust.name || 'Unnamed Customer'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cust.email || cust.phone || 'No contact details'}</span>
                          </div>
                          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2A2A2A] px-2 py-0.5 rounded font-bold">
                            {cust.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 p-2 text-center">No matching customers found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Or manual email */}
              <div className="pt-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium block mb-1">
                  Or enter the customer's email address manually:
                </span>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    setSelectedCustomerId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-base bg-white dark:bg-[#1E1E1E] border border-[#D5CCC1] dark:border-[#3E3E3E] text-gray-900 dark:text-white rounded focus:border-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          {/* Type & Order Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Notification Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-base font-semibold bg-white dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="SHIPPING">📦 SHIPPING (Fulfillment &amp; Courier)</option>
                <option value="ORDER">🛍️ ORDER (Confirmation &amp; Verification)</option>
                <option value="PAYMENT">💳 PAYMENT (Invoice &amp; Transaction)</option>
                <option value="PROMO">🏷️ PROMO (Exclusive Discount / Code)</option>
                <option value="LOYALTY">✨ LOYALTY (Lunar Club &amp; Rewards)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Order Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. LUNAR-2026-0801"
                value={orderNumber}
                onChange={(e) => handleOrderNumberChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold bg-white dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded focus:border-[#D4AF37] focus:outline-none uppercase placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-1.5 flex justify-between">
              <span>Notification Title *</span>
              <span className="text-gray-500 dark:text-gray-400 font-normal">{title.length}/80</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 📦 Your order has been dispatched via DPD Express"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-base bg-white dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded focus:border-[#D4AF37] focus:outline-none font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-1.5 flex justify-between">
              <span>Message Content *</span>
              <span className="text-gray-500 dark:text-gray-400 font-normal">{message.length}/500</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type the message content for the customer (e.g. tracking instructions, pickup code, or exclusive discount details)..."
              value={message}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-base bg-white dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded focus:border-[#D4AF37] focus:outline-none leading-relaxed font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Action Link */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Action URL Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. /track-order or /account or full carrier tracking URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded focus:border-[#D4AF37] focus:outline-none font-mono placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block mt-1">
              When the customer taps or clicks the notification, they will be redirected to this link.
            </span>
          </div>

          {/* Send Email Copy */}
          <label className="flex items-start gap-3 p-4 bg-[#FAF6F0] dark:bg-[#252525] border border-[#E8DFD3] dark:border-[#383838] rounded cursor-pointer transition-colors hover:bg-[#F6EFE6] dark:hover:bg-[#2A2A2A]">
            <input
              type="checkbox"
              checked={sendEmailCopy}
              onChange={(e) => setSendEmailCopy(e.target.checked)}
              className="mt-0.5 rounded text-[#1A1A1A] dark:accent-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
            />
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-bold text-black dark:text-white block flex items-center gap-1.5 text-sm">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>Also dispatch an elegant email copy to the customer's inbox</span>
              </span>
              <p className="mt-1 font-medium">A bespoke notification styled with Lunar Boutique branding will be sent directly to the customer's verified email.</p>
            </div>
          </label>

          {/* Live Preview Box */}
          <div className="p-4 bg-[#151515] dark:bg-[#121212] text-white rounded-sm space-y-2 border border-[#333] dark:border-[#2E2E2E]">
            <div className="flex items-center justify-between text-xs text-[#D4AF37] uppercase tracking-wider font-bold">
              <span>Live Preview (as seen by the customer):</span>
              <span className="text-gray-400 font-medium">Mobile App &amp; Web Notification Center</span>
            </div>

            <div className="bg-[#242424] border border-[#3A3A3A] p-4 rounded-md flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center shrink-0 mt-0.5">
                {getTypeIcon(type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-white break-words leading-snug">
                    {title || 'Your Notification Title'}
                  </h4>
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5 font-medium">Just now</span>
                </div>
                <p className="text-sm text-gray-300 mt-1.5 leading-relaxed break-words whitespace-pre-wrap font-medium">
                  {message || 'Your custom message content will be displayed here...'}
                </p>
                {orderNumber && (
                  <span className="inline-block mt-2 text-xs font-mono font-bold bg-[#333] text-[#D4AF37] px-2.5 py-1 rounded">
                    Order #{orderNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Feedback */}
          {feedback && (
            <div
              className={`p-4 border text-sm font-semibold rounded flex items-center gap-2.5 ${
                feedback.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 stroke-[2.5]" />
              ) : (
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] font-bold text-xs uppercase tracking-widest rounded transition-all flex items-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Dispatch Notification Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Notifications History Log */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E2E2E] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C1A98F] dark:text-[#D4AF37] font-bold block mb-1">
              Activity Audit
            </span>
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white font-serif">
              Recent Notification History ({history.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Stored in cloud database
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading notification history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            No notifications dispatched yet. Use the composer above to send your first message!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#333333] text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 font-bold bg-[#FAF8F5] dark:bg-[#252525]">
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Title &amp; Message</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Dispatched At</th>
                  <th className="py-3.5 px-4">Read Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#252525]/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-gray-100 dark:bg-[#282828] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#3E3E3E]">
                        {getTypeIcon(item.type)}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-base text-[#1A1A1A] dark:text-white block">
                        {item.user?.name || 'Customer'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {item.user?.email || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <strong className="block text-[#1A1A1A] dark:text-white font-bold text-sm break-words">
                        {item.title}
                      </strong>
                      <p className="text-gray-600 dark:text-gray-300 text-xs font-medium leading-relaxed break-words mt-0.5">
                        {item.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {item.orderNumber ? `#${item.orderNumber}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(item.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.isRead ? (
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded font-bold">
                          Read
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded font-bold">
                          Unread
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
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
