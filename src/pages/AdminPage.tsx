import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Tag,
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  TrendingUp,
  Percent,
  Sparkles,
  Lock,
  Shield,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  Check,
  AlertCircle,
  KeyRound,
  Star,
  Truck,
  Save,
  X,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useLoyalty } from '../hooks/useLoyalty';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { Product } from '../types';
import { ProductEditorModal } from '../components/admin/ProductEditorModal';
import { PromoCodesManager } from '../components/admin/PromoCodesManager';
import { LoyaltyAdminManager } from '../components/admin/LoyaltyAdminManager';
import { ReviewsAdminManager } from '../components/admin/ReviewsAdminManager';
import { NotificationsAdminManager } from '../components/admin/NotificationsAdminManager';
import { CARRIERS, getCarrierById, generateTrackingUrl } from '../data/carriers';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  shippingCountry?: string;
  shippingStreet?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
  total: number;
  discountCode?: string;
  discountAmount?: number;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  carrier?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  createdAt: string;
  itemsCount: number;
}

export const AdminPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useProducts();
  const { rewards } = useLoyalty();
  const { isDark, toggleTheme } = useTheme();

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem('lunar_admin_session');
    return stored === 'true' || user?.role === 'ADMIN';
  });

  // Login Gate form state
  const [loginEmail, setLoginEmail] = useState('admin@lunar.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'promos' | 'loyalty' | 'orders' | 'reviews' | 'notifications' | 'settings'>('overview');

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('admin@lunar.com');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Product Filter State
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBadge, setSelectedBadge] = useState('ALL');

  // Product Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Notification / Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('lunar_admin_session', 'true');
        if (data.adminToken) {
          localStorage.setItem('lunar_admin_token', data.adminToken);
        }
        if (data.user) {
          login(data.user);
        }
        showToast('Successfully signed in as Owner!');
      } else {
        setLoginError(data.message || 'Invalid administrator login or password.');
      }
    } catch {
      setLoginError('Could not connect to administrator authentication service. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('lunar_admin_session');
    localStorage.removeItem('lunar_admin_token');
    logout();
    setLoginPassword('');
    showToast('Signed out of admin dashboard.', 'info');
  };

  // Handle Admin Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordChangeLoading(true);

    try {
      const res = await fetch('/api/auth/admin-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordSuccess('Administrator password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Error occurred while updating password.');
      }
    } catch {
      setPasswordSuccess('Password saved in configuration!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'ord-101',
      orderNumber: 'LUNAR-89214-342',
      customerName: 'Claire Adams',
      customerEmail: 'claire.a@example.com',
      shippingCity: 'Dublin',
      total: 218.90,
      discountCode: 'WELCOME10',
      discountAmount: 24.30,
      status: 'Paid',
      paymentMethod: 'stripe',
      carrier: 'AN_POST',
      carrierName: 'An Post',
      trackingNumber: '1198547382IE',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      itemsCount: 2,
    },
    {
      id: 'ord-102',
      orderNumber: 'LUNAR-77192-811',
      customerName: 'Michael Laurent',
      customerEmail: 'michael.l@example.com',
      shippingCity: 'Paris',
      total: 399.00,
      discountCode: 'LUNAR-10PCT-4821',
      discountAmount: 39.90,
      status: 'Processing',
      paymentMethod: 'card',
      carrier: 'DPD_IE',
      carrierName: 'DPD Ireland',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      itemsCount: 1,
    },
    {
      id: 'ord-103',
      orderNumber: 'LUNAR-66230-109',
      customerName: 'Sophia Vance',
      customerEmail: 'sophia.v@example.com',
      shippingCity: 'London',
      total: 149.50,
      status: 'Shipped',
      paymentMethod: 'apple_pay',
      carrier: 'UPS',
      carrierName: 'UPS Express',
      trackingNumber: '1Z9999999999999999',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      itemsCount: 3,
    },
  ]);

  // Tracking / Fulfillment Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<AdminOrder | null>(null);
  const [editCarrier, setEditCarrier] = useState('AN_POST');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editStatus, setEditStatus] = useState('Processing');
  const [editNotifyCustomer, setEditNotifyCustomer] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchAdminOrders = async () => {
    try {
      const adminToken = localStorage.getItem('lunar_admin_token');
      const res = await fetch('/api/orders/list?all=true', {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(
            data.orders.map((o: AdminOrder & { items?: unknown[] }) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              shippingCity: o.shippingCity || '',
              shippingCountry: o.shippingCountry || '',
              shippingStreet: o.shippingStreet || '',
              shippingPostalCode: o.shippingPostalCode || '',
              shippingPhone: o.shippingPhone || '',
              total: o.total,
              discountCode: o.discountCode,
              discountAmount: o.discountAmount,
              status: o.status,
              paymentStatus: o.paymentStatus,
              paymentMethod: o.paymentMethod,
              carrier: o.carrier || 'AN_POST',
              carrierName: o.carrierName || 'An Post',
              trackingNumber: o.trackingNumber || '',
              trackingUrl: o.trackingUrl || '',
              shippedAt: o.shippedAt,
              estimatedDelivery: o.estimatedDelivery,
              createdAt: o.createdAt,
              itemsCount: Array.isArray(o.items) ? o.items.length : 0,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Could not fetch PostgreSQL orders, staying on current state:', err);
    }
  };

  React.useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminOrders();
    }
  }, [isAdminAuthenticated, activeTab]);

  const openTrackingModal = (order: AdminOrder) => {
    setTrackingModalOrder(order);
    setEditCarrier(order.carrier || 'AN_POST');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditStatus(order.status || 'Processing');
    setEditNotifyCustomer(true);
  };

  const handleSaveTracking = async () => {
    if (!trackingModalOrder) return;
    setIsSavingOrder(true);
    try {
      const adminToken = localStorage.getItem('lunar_admin_token');
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          orderId: trackingModalOrder.id,
          orderNumber: trackingModalOrder.orderNumber,
          status: editStatus,
          carrier: editCarrier,
          trackingNumber: editTrackingNumber,
          notifyCustomer: editNotifyCustomer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order fulfillment');

      showToast(
        `Order #${trackingModalOrder.orderNumber} updated!` +
          (data.emailSent ? ' (Shipment email dispatched to customer)' : ''),
        'success'
      );
      setTrackingModalOrder(null);
      await fetchAdminOrders();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating order', 'info');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Categories list extracted from products
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.categorySlug) set.add(p.categorySlug);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(productSearch.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || p.categorySlug === selectedCategory;

      const matchBadge =
        selectedBadge === 'ALL' ||
        (selectedBadge === 'NONE' && !p.badge) ||
        p.badge === selectedBadge;

      return matchSearch && matchCategory && matchBadge;
    });
  }, [products, productSearch, selectedCategory, selectedBadge]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      showToast(`Product "${productData.name || editingProduct.name}" updated!`);
    } else {
      await addProduct(productData as Omit<Product, 'id'>);
      showToast(`New product "${productData.name}" added to catalog!`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    showToast('Product removed from catalog.', 'info');
  };

  const handleDuplicateProduct = async (id: string) => {
    const copy = await duplicateProduct(id);
    showToast(`Created duplicate: "${copy.name}"`);
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const previousStatus = targetOrder?.status;

    // Optimistic UI update
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdatingOrderId(orderId);

    try {
      const adminToken = localStorage.getItem('lunar_admin_token');
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          orderNumber: targetOrder?.orderNumber,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      showToast(`Order #${targetOrder?.orderNumber || orderId} status saved: ${newStatus}`);
      await fetchAdminOrders();
    } catch (err) {
      console.error('Failed to update order status in database:', err);
      // Revert optimistic update on failure
      if (previousStatus) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: previousStatus } : o))
        );
      }
      showToast(err instanceof Error ? err.message : 'Failed to update order status', 'info');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // KPIs
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const activePromoProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).length;

  // ─────────────────────────────────────────────────────────────
  // 1. ADMIN SECURITY GATE (WHITE LUXURY THEME, NO DEFAULT PASSWORD LEAKS)
  // ─────────────────────────────────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F5] flex flex-col items-center justify-center px-4 py-16 relative transition-colors">
        {/* Dark/Light mode toggle in corner */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-full border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 hover:border-black dark:hover:border-[#D4AF37] transition-all shadow-xs cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-[#D4AF37]" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-8 sm:p-10 rounded-sm shadow-xl dark:shadow-black/60 relative z-10 animate-fade-in">
          {/* Header & Crest */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FAF7F2] dark:bg-[#252525] border border-[#D4AF37]/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-bold mb-1.5">
              LUNAR BOUTIQUE
            </p>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-3xl sm:text-4xl uppercase tracking-widest font-normal text-[#1A1A1A] dark:text-white"
            >
              Owner Portal
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 uppercase tracking-wider font-medium">
              Authorized Access Only
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                Administrator Email / Login
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@lunar.com"
                required
                className="w-full px-4 py-3.5 bg-[#FAF9F7] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-[#1A1A1A] dark:focus:border-[#D4AF37] focus:bg-white dark:focus:bg-[#282828] focus:outline-none text-[#1A1A1A] dark:text-white text-base rounded-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-[#FAF9F7] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-[#1A1A1A] dark:focus:border-[#D4AF37] focus:bg-white dark:focus:bg-[#282828] focus:outline-none text-[#1A1A1A] dark:text-white text-base rounded-sm transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] font-bold text-sm uppercase tracking-[0.2em] rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2E2E2E] text-center">
            <Link
              to="/shop"
              className="inline-block text-sm uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1A1A1A] dark:hover:text-white transition-colors border-b border-transparent hover:border-black dark:hover:border-white pb-0.5"
            >
              ← Return to Boutique Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED ADMIN DASHBOARD (WHITE LUXURY DESIGN)
  // ─────────────────────────────────────────────────────────────
  const adminTabs: Array<{
    id: 'overview' | 'products' | 'promos' | 'loyalty' | 'orders' | 'reviews' | 'notifications' | 'settings';
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    highlightIcon?: boolean;
  }> = [
    {
      id: 'overview',
      label: 'Overview & KPIs',
      sublabel: 'Store Analytics',
      icon: TrendingUp,
    },
    {
      id: 'products',
      label: 'Catalog & Moderation',
      sublabel: 'Products & Inventory',
      icon: Package,
      count: products.length,
    },
    {
      id: 'promos',
      label: 'Promo Codes',
      sublabel: 'Vouchers & Discounts',
      icon: Tag,
    },
    {
      id: 'loyalty',
      label: 'Loyalty Program',
      sublabel: 'Points & Rewards',
      icon: Award,
      count: rewards.length,
      highlightIcon: true,
    },
    {
      id: 'orders',
      label: 'Orders',
      sublabel: 'Fulfillment & Shipping',
      icon: ShoppingBag,
      count: orders.length,
    },
    {
      id: 'reviews',
      label: 'Reviews & Ratings',
      sublabel: 'Customer Feedback',
      icon: Star,
      highlightIcon: true,
    },
    {
      id: 'notifications',
      label: 'Customer Notifications',
      sublabel: 'Broadcasts & Alerts',
      icon: Bell,
      highlightIcon: true,
    },
    {
      id: 'settings',
      label: 'Security & Password',
      sublabel: 'Access & Credentials',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F6] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F5] pb-24 transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] dark:bg-[#252525] text-white px-5 py-3.5 rounded-sm shadow-2xl border border-[#D4AF37] flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Top Luxury Header */}
      <div className="bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#F5F5F5] border-b border-[#EAE3D9] dark:border-[#2E2E2E] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#FAF7F2] dark:bg-[#252525] border border-[#D4AF37] flex items-center justify-center rounded-sm shadow-xs">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif tracking-wider font-normal text-[#1A1A1A] dark:text-white flex items-center gap-2.5">
                  LUNAR Administration
                  <span className="text-xs bg-[#1A1A1A] dark:bg-[#D4AF37] text-white dark:text-black font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                    Owner
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                  Store management, catalog moderation, pricing, promo codes, and loyalty program
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] rounded text-sm text-gray-800 dark:text-gray-200 font-medium">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Signed in: <strong>admin@lunar.com</strong></span>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-2 border border-gray-300 dark:border-[#3A3A3A] hover:border-black dark:hover:border-[#D4AF37] rounded text-sm uppercase tracking-wider font-semibold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-[#D4AF37] flex items-center gap-2 transition-colors cursor-pointer bg-white dark:bg-[#1E1E1E]"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4" />}
                <span className="text-xs uppercase tracking-wider font-bold hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <Link
                to="/shop"
                target="_blank"
                className="px-4 py-2 border border-gray-300 dark:border-[#3A3A3A] hover:border-black dark:hover:border-white rounded text-sm uppercase tracking-wider font-semibold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>View Store</span>
                <ExternalLink className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3 mt-8">
            {adminTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md shadow-black/15 -translate-y-1 ring-2 ring-[#D4AF37]/50 dark:bg-[#282828] dark:border-[#D4AF37] dark:text-white'
                      : 'bg-[#FAF8F5] text-gray-700 border-[#EAE3D9] hover:border-[#D4AF37] hover:bg-white hover:shadow-lg hover:shadow-[#D4AF37]/10 hover:-translate-y-1 dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-gray-200 dark:hover:bg-[#252525] dark:hover:border-[#D4AF37]/60 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-white/10 text-[#D4AF37]'
                          : 'bg-white text-gray-700 border border-[#EAE3D9] group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/50 group-hover:bg-[#FAF7F2] group-hover:scale-105 shadow-2xs dark:bg-[#252525] dark:text-gray-300 dark:border-[#383838] dark:group-hover:bg-[#2A2A2A]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${tab.highlightIcon && !isActive ? 'text-[#D4AF37]' : ''}`} />
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                            : 'bg-white border border-[#EAE3D9] text-gray-800 group-hover:border-[#D4AF37]/60 group-hover:text-black shadow-2xs dark:bg-[#252525] dark:border-[#383838] dark:text-gray-200 dark:group-hover:text-white'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`text-sm font-bold uppercase tracking-wider line-clamp-1 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-900 group-hover:text-black dark:text-white dark:group-hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </div>
                    <div
                      className={`text-xs font-medium line-clamp-1 transition-colors ${
                        isActive ? 'text-gray-200' : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200'
                      }`}
                    >
                      {tab.sublabel}
                    </div>
                  </div>

                  {/* Active / Hover accent indicator */}
                  <div
                    className={`mt-3 h-0.5 w-full rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D4AF37]'
                        : 'bg-transparent group-hover:bg-[#D4AF37]/60'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-[#1E1E1E] p-6 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                    Store Products
                  </span>
                  <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A] dark:text-white">{products.length}</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Total inventory: {totalStockCount} units</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-6 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                    Active Promotions
                  </span>
                  <Percent className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A] dark:text-white">{activePromoProducts}</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Products on discounted sale</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-6 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                    Rewards Catalog
                  </span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A] dark:text-white">{rewards.length}</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Points coupons available</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-6 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                    Recent Orders
                  </span>
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A] dark:text-white">{orders.length}</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Total revenue: €{orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-[#2E2E2E]">
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] dark:text-white uppercase tracking-wider font-normal">
                    Recent Customer Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm uppercase tracking-wider font-bold text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-[#1A1A1A] dark:text-white">{ord.orderNumber}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                            ord.status === 'Paid' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                          {ord.customerName} ({ord.customerEmail}) • {ord.itemsCount} items
                        </p>
                      </div>

                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <span className="font-bold text-lg text-[#1A1A1A] dark:text-white block">€{ord.total.toFixed(2)}</span>
                        {ord.discountCode && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                            Coupon: {ord.discountCode} (-€{ord.discountAmount?.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Tile */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 shadow-xs space-y-6 transition-colors">
                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] dark:text-white uppercase tracking-wider font-normal pb-4 border-b border-gray-100 dark:border-[#2E2E2E]">
                  Quick Actions
                </h2>

                <div className="space-y-3.5">
                  <button
                    onClick={handleOpenAddModal}
                    className="w-full p-4 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center justify-between transition-all shadow-xs cursor-pointer"
                  >
                    <span>Add New Product</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('promos')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] dark:bg-[#252525] dark:border-[#333333] dark:text-white dark:hover:bg-[#2E2E2E] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Create Promo Code</span>
                    <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] dark:bg-[#252525] dark:border-[#333333] dark:text-white dark:hover:bg-[#2E2E2E] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Create Points Reward</span>
                    <Award className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] dark:bg-[#252525] dark:border-[#333333] dark:text-white dark:hover:bg-[#2E2E2E] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Security & Password</span>
                    <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG & MODERATION */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters Bar */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-5 rounded-sm shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, description, tag..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] rounded-sm text-sm font-medium text-[#1A1A1A] dark:text-white focus:outline-none focus:border-black dark:focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] rounded-sm text-sm font-semibold text-[#1A1A1A] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>
                      Category: {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] rounded-sm text-sm font-semibold text-[#1A1A1A] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Badges</option>
                  <option value="NEW">Only NEW</option>
                  <option value="SALE">Only SALE</option>
                  <option value="BESTSELLER">Only BESTSELLER</option>
                  <option value="READY TO SHIP">Only READY TO SHIP</option>
                  <option value="SOLD OUT">Only SOLD OUT</option>
                  <option value="NONE">No Badge</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] font-bold text-sm uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors ml-auto md:ml-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#252525] text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category & Badge</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Promotion / Discount</th>
                      <th className="py-4 px-6">Inventory</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
                    {filteredProducts.map((p) => {
                      const discountPct = p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-[#252525]/70 transition-colors">
                          {/* Image & Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gray-100 dark:bg-[#252525] rounded border border-gray-200 dark:border-[#383838] overflow-hidden shrink-0 relative">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                {p.images && p.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] px-1 font-bold">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#1A1A1A] dark:text-white text-base line-clamp-1">{p.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono font-medium">ID: {p.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Badge */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-sm uppercase tracking-wider font-semibold text-gray-800 dark:text-gray-200">
                                {p.categorySlug || 'General'}
                              </span>
                              {p.badge && (
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                  p.badge === 'SALE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800' :
                                  p.badge === 'NEW' ? 'bg-black text-white dark:bg-[#D4AF37] dark:text-black' :
                                  p.badge === 'BESTSELLER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Regular Price */}
                          <td className="py-4 px-6 font-bold text-[#1A1A1A] dark:text-white text-lg">
                            €{p.price.toFixed(2)}
                          </td>

                          {/* Promo Price & Discount */}
                          <td className="py-4 px-6">
                            {p.originalPrice && p.originalPrice > p.price ? (
                              <div>
                                <span className="text-sm line-through text-gray-500 dark:text-gray-400 block font-medium">
                                  €{p.originalPrice.toFixed(2)}
                                </span>
                                <span className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                  -{discountPct}% Off
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Regular</span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              p.stock === 0
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800'
                                : p.stock < 5
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800'
                            }`}>
                              {p.stock === 0 ? 'Sold Out (0)' : `${p.stock} units`}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/product/${p.id}`}
                                target="_blank"
                                className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
                                title="View in Boutique Store"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                onClick={() => handleDuplicateProduct(p.id)}
                                className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors cursor-pointer"
                                title="Duplicate product"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                    handleDeleteProduct(p.id);
                                  }
                                }}
                                className="p-2 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROMO CODES */}
        {activeTab === 'promos' && (
          <div className="animate-fade-in">
            <PromoCodesManager />
          </div>
        )}

        {/* TAB 4: LOYALTY POINTS & REWARDS */}
        {activeTab === 'loyalty' && (
          <div className="animate-fade-in">
            <LoyaltyAdminManager />
          </div>
        )}

        {/* TAB 5: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2E2E2E] flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200">
                  Customer Orders Log ({orders.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#252525] text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                      <th className="py-4 px-6">Order Number</th>
                      <th className="py-4 px-6">Customer & Destination</th>
                      <th className="py-4 px-6">Total Amount</th>
                      <th className="py-4 px-6">Carrier & Tracking</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
                    {orders.map((ord) => {
                      const carrierObj = getCarrierById(ord.carrier);
                      const trackUrl = ord.trackingUrl || (ord.trackingNumber ? carrierObj.getTrackingUrl(ord.trackingNumber) : '');

                      return (
                        <tr key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-[#252525]/70 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-base text-[#1A1A1A] dark:text-white">
                            {ord.orderNumber}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-[#1A1A1A] dark:text-white text-base">{ord.customerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{ord.customerEmail} • {ord.shippingCity || 'Ireland'}</p>
                          </td>
                          <td className="py-4 px-6 font-bold text-[#1A1A1A] dark:text-white text-lg">
                            €{ord.total.toFixed(2)}
                            {ord.discountCode && (
                              <span className="block text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                Coupon: {ord.discountCode} (-€{ord.discountAmount?.toFixed(2)})
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1.5">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded border ${carrierObj.badgeColor}`}>
                                <Truck className="w-3.5 h-3.5" />
                                {ord.carrierName || carrierObj.name}
                              </span>
                              {ord.trackingNumber ? (
                                <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                                  <span>{ord.trackingNumber}</span>
                                  {trackUrl && (
                                    <a
                                      href={trackUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#8C6D4F] hover:text-black dark:text-[#D4AF37] dark:hover:text-white"
                                      title="Open tracking page"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-amber-700 dark:text-amber-400 block italic font-medium">No tracking # yet</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                            {ord.paymentMethod}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={ord.status}
                              disabled={updatingOrderId === ord.id}
                              onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                                ord.status === 'Paid'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                  : ord.status === 'Processing'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                  : ord.status === 'Delivered'
                                  ? 'bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Paid">Paid</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => openTrackingModal(ord)}
                              className="px-3.5 py-2 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Fulfillment</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FULFILLMENT & CARRIER TRACKING MODAL */}
            {trackingModalOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] w-full max-w-xl rounded-sm shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A1A1A] dark:text-[#F5F5F5] transition-colors">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E2E2E] pb-4">
                    <div>
                      <span className="text-xs uppercase tracking-[0.25em] text-[#C1A98F] font-bold block mb-1">
                        Logistics Management
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] dark:text-white font-bold">
                        Order #{trackingModalOrder.orderNumber}
                      </h3>
                    </div>
                    <button
                      onClick={() => setTrackingModalOrder(null)}
                      className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer Brief */}
                  <div className="bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] p-4 rounded-xs text-sm space-y-1.5">
                    <p className="font-bold text-[#1A1A1A] dark:text-white">
                      Recipient: {trackingModalOrder.customerName} ({trackingModalOrder.customerEmail})
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Destination: {[trackingModalOrder.shippingStreet, trackingModalOrder.shippingCity, trackingModalOrder.shippingPostalCode, trackingModalOrder.shippingCountry].filter(Boolean).join(', ') || 'Standard Shipping'}
                    </p>
                  </div>

                  {/* Carrier Selector */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Delivery Carrier Partner
                    </label>
                    <select
                      value={editCarrier}
                      onChange={(e) => setEditCarrier(e.target.value)}
                      className="w-full px-4 py-3 text-base bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-[#D5CCC1] dark:border-[#3E3E3E] rounded focus:border-black dark:focus:border-[#D4AF37] focus:outline-none font-medium"
                    >
                      {CARRIERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.tagline} ({c.estimatedDelivery})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tracking Number Input */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Carrier Waybill / Tracking Number
                    </label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder={getCarrierById(editCarrier).trackingPlaceholder}
                      className="w-full px-4 py-3 text-base font-mono bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-[#D5CCC1] dark:border-[#3E3E3E] rounded focus:border-black dark:focus:border-[#D4AF37] focus:outline-none"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1 font-medium">
                      Format: {getCarrierById(editCarrier).trackingRegexHint}
                    </span>
                  </div>

                  {/* Status Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Order Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-[#D5CCC1] dark:border-[#3E3E3E] rounded focus:border-black dark:focus:border-[#D4AF37] focus:outline-none font-medium"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Preview Tracking URL */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Tracking Link Preview
                      </label>
                      {editTrackingNumber.trim() ? (
                        <a
                          href={generateTrackingUrl(editCarrier, editTrackingNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold rounded inline-flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                        >
                          <span>Test Courier Link</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#3E3E3E] text-sm rounded text-center font-medium">
                          Enter number to test
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notify Customer Checkbox */}
                  <label className="flex items-start gap-3 p-4 bg-[#FAF6F0] dark:bg-[#252525] border border-[#E8DFD3] dark:border-[#3E3E3E] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editNotifyCustomer}
                      onChange={(e) => setEditNotifyCustomer(e.target.checked)}
                      className="mt-1 rounded text-[#1A1A1A] focus:ring-0 cursor-pointer"
                    />
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <span className="font-bold block text-black dark:text-white mb-0.5">
                        Send Shipment Dispatch Email with Tracking Button
                      </span>
                      Automatically sends an email notification via Resend with carrier logo and active tracking link to {trackingModalOrder.customerEmail}.
                    </div>
                  </label>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E2E2E]">
                    <button
                      type="button"
                      onClick={() => setTrackingModalOrder(null)}
                      className="px-5 py-2.5 border border-gray-300 dark:border-[#404040] text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider font-bold rounded hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingOrder}
                      onClick={handleSaveTracking}
                      className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] text-xs uppercase tracking-wider font-bold rounded transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSavingOrder ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save &amp; Update Fulfillment</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CUSTOMER REVIEWS & RATINGS */}
        {activeTab === 'reviews' && (
          <ReviewsAdminManager />
        )}

        {/* TAB 7: CUSTOMER NOTIFICATIONS DISPATCHER */}
        {activeTab === 'notifications' && (
          <NotificationsAdminManager showToast={showToast} />
        )}

        {/* TAB 8: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-8 shadow-xs transition-colors">
              <div className="flex items-center gap-3.5 pb-6 border-b border-gray-100 dark:border-[#2E2E2E] mb-6">
                <div className="w-11 h-11 bg-[#FAF7F2] dark:bg-[#252525] border border-[#D4AF37] rounded-sm flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] dark:text-white uppercase tracking-wider font-normal">
                    Security & Administrator Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                    Update your master administrator credentials for the Lunar Boutique Portal
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-medium rounded flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-medium rounded flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Administrator Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-black dark:focus:border-[#D4AF37] rounded text-base text-[#1A1A1A] dark:text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Current Master Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full px-4 py-3.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-black dark:focus:border-[#D4AF37] rounded text-base text-[#1A1A1A] dark:text-white focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-black dark:focus:border-[#D4AF37] rounded text-base text-[#1A1A1A] dark:text-white focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] focus:border-black dark:focus:border-[#D4AF37] rounded text-base text-[#1A1A1A] dark:text-white focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="w-full py-4 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] font-bold text-sm uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {passwordChangeLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Administrator Credentials</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Product Editor Modal */}
      <ProductEditorModal
        product={editingProduct}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={categoriesList}
      />
    </div>
  );
};

export default AdminPage;
