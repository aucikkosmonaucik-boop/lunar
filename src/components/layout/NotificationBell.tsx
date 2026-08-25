import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Truck, Sparkles, CreditCard, ShoppingBag, CheckCheck, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'SHIPPING' | 'PAYMENT' | 'LOYALTY' | 'PROMO';
  orderId?: string | null;
  orderNumber?: string | null;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

// Gentle Web Audio API synthesizer for luxury notification chime
function playLuxuryChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Soft two-tone harmonious luxury chime (E6 -> B6)
    const tones = [1318.51, 1975.53];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.7);
    });
  } catch {
    // Silent fail if audio is blocked by browser autoplay policy
  }
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const NotificationBell: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousUnreadCountRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const newUnread = data.unreadCount || 0;
        
        // Play chime only if new unread notifications arrived while viewing page
        if (!isInitial && newUnread > previousUnreadCountRef.current && newUnread > 0) {
          playLuxuryChime();
        }
        previousUnreadCountRef.current = newUnread;

        setNotifications(data.notifications || []);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user]);

  // Initial fetch and poll every 30 seconds
  useEffect(() => {
    if (user) {
      fetchNotifications(true);
      const interval = setInterval(() => {
        fetchNotifications(false);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, linkUrl?: string | null) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch('/api/notifications?action=mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (linkUrl) {
        setIsOpen(false);
        navigate(linkUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;

      await fetch('/api/notifications?action=mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHIPPING':
        return <Truck className="w-4 h-4 text-[#8C6D4F]" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'LOYALTY':
        return <Sparkles className="w-4 h-4 text-[#d4af37]" />;
      case 'ORDER':
      default:
        return <ShoppingBag className="w-4 h-4 text-gray-800" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-[#1a1a1a] hover:text-[#8C6D4F] transition-all p-1.5 rounded-full hover:bg-black/5 focus:outline-none"
        aria-label="Notifications"
        title="Delivery & Order Notifications"
      >
        <Bell className={`${isMobile ? 'w-5 h-5' : 'w-[22px] h-[22px]'} stroke-[1.4] transition-transform ${unreadCount > 0 ? 'animate-bounce-short' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#1a1a1a] text-[#C1A98F] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-black/5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Flyout */}
      {isOpen && (
        <div
          className={`absolute ${
            isMobile ? 'right-[-60px] sm:right-0 w-[320px]' : 'right-0 w-[360px]'
          } top-full mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-semibold text-gray-900 tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FAF6F0] text-[#8C6D4F] border border-[#C1A98F]/40 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-gray-500 hover:text-black font-medium flex items-center gap-1 hover:underline transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50 overscroll-contain">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#8C6D4F]">
                  <Bell className="w-6 h-6 stroke-[1.2]" />
                </div>
                <p className="font-serif text-sm font-medium text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto">
                  Updates on your orders, delivery status, and club points will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id, notif.linkUrl)}
                  className={`px-4 py-3.5 flex items-start gap-3.5 cursor-pointer transition-colors duration-150 group ${
                    notif.isRead ? 'bg-white hover:bg-gray-50/80 opacity-75 hover:opacity-100' : 'bg-[#FAF6F0]/40 hover:bg-[#FAF6F0]/80'
                  }`}
                >
                  {/* Icon badge */}
                  <div
                    className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border ${
                      notif.isRead
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-[#C1A98F]/40 shadow-xs'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          notif.isRead ? 'text-gray-700' : 'text-gray-900 font-bold'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.linkUrl && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#8C6D4F] group-hover:underline">
                        <span>View details</span>
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#d4af37] flex-shrink-0 mt-1.5 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/account');
                }}
                className="text-[11px] font-medium text-gray-600 hover:text-black tracking-wider uppercase"
              >
                Go to Account & Orders
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
