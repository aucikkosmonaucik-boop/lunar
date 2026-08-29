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
          orderNumber: orderNumber.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
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
              Customer Notifications Dispatcher
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
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
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Composer Form */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C1A98F] font-bold block mb-1">
            New Dispatch
          </span>
          <h3 className="text-xl font-bold text-[#1A1A1A] font-serif">
            Notification Composer
          </h3>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
            Quick Message Presets
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
              Target Audience
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
                    <span>Single Customer</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select a registered user from the directory or enter an email address
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
                    <span>All Customers ({customers.length} registered)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Broadcast announcement — delivered to every customer account
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Specific Customer Picker (if single target) */}
          {targetType === 'single' && (
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded space-y-3">
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700">
                Select Target Customer
              </label>

              <div className="relative">
                <div
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5CCC1] rounded text-sm flex items-center justify-between cursor-pointer hover:border-black transition-colors"
                >
                  <div className="truncate">
                    {selectedCustomerObj ? (
                      <span className="font-semibold text-black">
                        {selectedCustomerObj.name || 'Customer'} ({selectedCustomerObj.email || 'No email'})
                      </span>
                    ) : customEmail ? (
                      <span>Manual recipient: <strong>{customEmail}</strong></span>
                    ) : (
                      <span className="text-gray-400">Select a customer from the dropdown list...</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#D5CCC1] rounded shadow-xl max-h-64 overflow-y-auto p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Search by name, email or phone number..."
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
                            <span className="block">{cust.name || 'Unnamed Customer'}</span>
                            <span className="text-[11px] text-gray-500">{cust.email || cust.phone || 'No contact details'}</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {cust.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 p-2 text-center">No matching customers found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Or manual email */}
              <div className="pt-2">
                <span className="text-[11px] text-gray-500 block mb-1">
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
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Type & Order Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                Notification Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none"
              >
                <option value="SHIPPING">📦 SHIPPING (Fulfillment &amp; Courier)</option>
                <option value="ORDER">🛍️ ORDER (Confirmation &amp; Verification)</option>
                <option value="PAYMENT">💳 PAYMENT (Invoice &amp; Transaction)</option>
                <option value="PROMO">🏷️ PROMO (Exclusive Discount / Code)</option>
                <option value="LOYALTY">✨ LOYALTY (Lunar Club &amp; Rewards)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                Order Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. LUNAR-2026-0801"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5 flex justify-between">
              <span>Notification Title *</span>
              <span className="text-gray-400 font-normal">{title.length}/80</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 📦 Your order has been dispatched via DPD Express"
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
              <span>Message Content *</span>
              <span className="text-gray-400 font-normal">{message.length}/500</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type the message content for the customer (e.g. tracking instructions, pickup code, or exclusive discount details)..."
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
              Action URL Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. /track-order or /account or full carrier tracking URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-[#D5CCC1] rounded focus:border-black focus:outline-none font-mono text-xs"
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              When the customer taps or clicks the notification, they will be redirected to this link.
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
                <span>Also dispatch an elegant email copy to the customer's inbox</span>
              </span>
              A bespoke notification styled with Lunar Boutique branding will be sent directly to the customer's verified email.
            </div>
          </label>

          {/* Live Preview Box */}
          <div className="p-4 bg-[#1A1A1A] text-white rounded-sm space-y-2 border border-[#333]">
            <div className="flex items-center justify-between text-[11px] text-[#D4AF37] uppercase tracking-wider font-bold">
              <span>Live Preview (as seen by the customer):</span>
              <span className="text-gray-400 font-normal">Mobile App &amp; Web Notification Center</span>
            </div>

            <div className="bg-[#242424] border border-[#3A3A3A] p-4 rounded-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center shrink-0 mt-0.5">
                {getTypeIcon(type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {title || 'Your Notification Title'}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0">Just now</span>
                </div>
                <p className="text-xs text-gray-300 mt-1 line-clamp-3 leading-relaxed">
                  {message || 'Your custom message content will be displayed here...'}
                </p>
                {orderNumber && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-semibold bg-[#333] text-[#D4AF37] px-2 py-0.5 rounded">
                    Order #{orderNumber}
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
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Notification Now</span>
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
              Activity Audit
            </span>
            <h3 className="text-xl font-bold text-[#1A1A1A] font-serif">
              Recent Notification History ({history.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Stored in cloud database
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading notification history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No notifications dispatched yet. Use the composer above to send your first message!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-[#FAF8F5]">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Title &amp; Message</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Read Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                        {item.user?.name || 'Customer'}
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
                        <span>{new Date(item.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.isRead ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          Read
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          Unread
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete from history"
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
