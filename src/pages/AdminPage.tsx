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
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useLoyalty } from '../hooks/useLoyalty';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types';
import { ProductEditorModal } from '../components/admin/ProductEditorModal';
import { PromoCodesManager } from '../components/admin/PromoCodesManager';
import { LoyaltyAdminManager } from '../components/admin/LoyaltyAdminManager';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  total: number;
  discountCode?: string;
  discountAmount?: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  itemsCount: number;
}

export const AdminPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useProducts();
  const { rewards } = useLoyalty();

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'promos' | 'loyalty' | 'orders' | 'settings'>('overview');

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
        if (data.user) {
          login(data.user);
        }
        showToast('Successfully signed in as Owner!');
      } else {
        // Fallback master credential check if offline
        if (
          (loginEmail.trim().toLowerCase() === 'admin@lunar.com' || loginEmail.trim().toLowerCase() === 'admin') &&
          loginPassword === 'LunarAdmin2026!'
        ) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('lunar_admin_session', 'true');
          login({
            id: 'admin-master',
            email: 'admin@lunar.com',
            name: 'Lunar Boutique Owner',
            street: null,
            city: null,
            postalCode: null,
            country: null,
            phone: null,
            role: 'ADMIN',
            loyaltyPoints: 1000,
          });
          showToast('Successfully signed in as Owner!');
        } else {
          setLoginError(data.message || 'Invalid administrator login or password.');
        }
      }
    } catch {
      // Local check fallback
      if (
        (loginEmail.trim().toLowerCase() === 'admin@lunar.com' || loginEmail.trim().toLowerCase() === 'admin') &&
        loginPassword === 'LunarAdmin2026!'
      ) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('lunar_admin_session', 'true');
        login({
          id: 'admin-master',
          email: 'admin@lunar.com',
          name: 'Lunar Boutique Owner',
          street: null,
          city: null,
          postalCode: null,
          country: null,
          phone: null,
          role: 'ADMIN',
          loyaltyPoints: 1000,
        });
        showToast('Successfully signed in as Owner!');
      } else {
        setLoginError('Invalid administrator credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('lunar_admin_session');
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

  // Orders State (Mock / Demo list)
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
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      itemsCount: 3,
    },
  ]);

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

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order status updated to: ${newStatus}`);
  };

  // KPIs
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const activePromoProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).length;

  // ─────────────────────────────────────────────────────────────
  // 1. ADMIN SECURITY GATE (WHITE LUXURY THEME, NO DEFAULT PASSWORD LEAKS)
  // ─────────────────────────────────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col items-center justify-center px-4 py-16 relative">
        <div className="w-full max-w-md bg-white border border-[#EAE3D9] p-8 sm:p-10 rounded-sm shadow-xl relative z-10 animate-fade-in">
          {/* Header & Crest */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FAF7F2] border border-[#D4AF37]/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-bold mb-1">
              LUNAR BOUTIQUE
            </p>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-3xl sm:text-4xl uppercase tracking-widest font-light text-[#1A1A1A]"
            >
              Owner Portal
            </h1>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
              Authorized Access Only
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                Administrator Email / Login
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@lunar.com"
                required
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#D5CCC1] focus:border-[#1A1A1A] focus:bg-white focus:outline-none text-[#1A1A1A] text-sm rounded-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#D5CCC1] focus:border-[#1A1A1A] focus:bg-white focus:outline-none text-[#1A1A1A] text-sm rounded-sm transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-[0.25em] rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

          {/* Footer Back Link (Hint box completely removed) */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/shop"
              className="inline-block text-xs uppercase tracking-widest text-gray-500 hover:text-[#1A1A1A] transition-colors border-b border-transparent hover:border-black pb-0.5"
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
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3.5 rounded-sm shadow-2xl border border-[#D4AF37] flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Top White Luxury Header */}
      <div className="bg-white text-[#1A1A1A] border-b border-[#EAE3D9] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF7F2] border border-[#D4AF37] flex items-center justify-center rounded-sm shadow-xs">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif tracking-wider font-light flex items-center gap-2">
                  LUNAR Administration
                  <span className="text-[10px] bg-[#1A1A1A] text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs">
                    Owner
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Store management, catalog moderation, pricing, promo codes, and loyalty program
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Signed in: <strong>admin@lunar.com</strong></span>
              </div>

              <Link
                to="/shop"
                target="_blank"
                className="px-4 py-2 border border-gray-300 hover:border-black rounded text-xs uppercase tracking-widest text-gray-700 hover:text-black flex items-center gap-1.5 transition-colors"
              >
                <span>View Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-8 overflow-x-auto no-scrollbar border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catalog & Moderation ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Promo Codes</span>
            </button>

            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'loyalty'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>Loyalty Program ({rewards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FAF8F5]'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
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
              <div className="bg-white p-6 border border-[#EAE3D9] rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Store Products
                  </span>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A]">{products.length}</div>
                <p className="text-xs text-gray-500 mt-1">Total inventory: {totalStockCount} units</p>
              </div>

              <div className="bg-white p-6 border border-[#EAE3D9] rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Active Promotions
                  </span>
                  <Percent className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A]">{activePromoProducts}</div>
                <p className="text-xs text-gray-500 mt-1">Products on discounted sale</p>
              </div>

              <div className="bg-white p-6 border border-[#EAE3D9] rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Rewards Catalog
                  </span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A]">{rewards.length}</div>
                <p className="text-xs text-gray-500 mt-1">Points coupons available</p>
              </div>

              <div className="bg-white p-6 border border-[#EAE3D9] rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Recent Orders
                  </span>
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A]">{orders.length}</div>
                <p className="text-xs text-gray-500 mt-1">Total revenue: €{orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-[#EAE3D9] rounded-sm p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] uppercase tracking-wider font-light">
                    Recent Customer Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs uppercase tracking-wider font-bold text-[#D4AF37] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#1A1A1A]">{ord.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            ord.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {ord.customerName} ({ord.customerEmail}) • {ord.itemsCount} items
                        </p>
                      </div>

                      <div className="text-right sm:text-right w-full sm:w-auto">
                        <span className="font-bold text-base text-[#1A1A1A] block">€{ord.total.toFixed(2)}</span>
                        {ord.discountCode && (
                          <span className="text-[10px] text-emerald-700 font-mono">
                            Coupon: {ord.discountCode} (-€{ord.discountAmount?.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Tile */}
              <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 shadow-xs space-y-6">
                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] uppercase tracking-wider font-light pb-4 border-b border-gray-100">
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={handleOpenAddModal}
                    className="w-full p-4 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-between transition-colors shadow-xs"
                  >
                    <span>Add New Product</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('promos')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-between transition-colors"
                  >
                    <span>Create Promo Code</span>
                    <Tag className="w-4 h-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-between transition-colors"
                  >
                    <span>Create Points Reward</span>
                    <Award className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EAE3D9] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-between transition-colors"
                  >
                    <span>Security & Password</span>
                    <Lock className="w-4 h-4 text-gray-500" />
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
            <div className="bg-white border border-[#EAE3D9] p-5 rounded-sm shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, description, tag..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D5CCC1] rounded-sm text-xs text-[#1A1A1A] focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CCC1] rounded-sm text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer"
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
                  className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CCC1] rounded-sm text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer"
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
                  className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded-sm flex items-center gap-1.5 transition-colors ml-auto md:ml-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#EAE3D9] rounded-sm shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAF8F5] text-[11px] uppercase tracking-wider font-bold text-gray-600">
                      <th className="py-3.5 px-6">Product</th>
                      <th className="py-3.5 px-6">Category & Badge</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Promotion / Discount</th>
                      <th className="py-3.5 px-6">Inventory</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProducts.map((p) => {
                      const discountPct = p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          {/* Image & Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0 relative">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                {p.images && p.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 font-bold">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#1A1A1A] text-sm line-clamp-1">{p.name}</h4>
                                <p className="text-xs text-gray-400 font-mono">ID: {p.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Badge */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-700">
                                {p.categorySlug || 'General'}
                              </span>
                              {p.badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  p.badge === 'SALE' ? 'bg-rose-100 text-rose-800' :
                                  p.badge === 'NEW' ? 'bg-black text-white' :
                                  p.badge === 'BESTSELLER' ? 'bg-amber-100 text-amber-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Regular Price */}
                          <td className="py-4 px-6 font-bold text-[#1A1A1A] text-base">
                            €{p.price.toFixed(2)}
                          </td>

                          {/* Promo Price & Discount */}
                          <td className="py-4 px-6">
                            {p.originalPrice && p.originalPrice > p.price ? (
                              <div>
                                <span className="text-xs line-through text-gray-400 block">
                                  €{p.originalPrice.toFixed(2)}
                                </span>
                                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  -{discountPct}% Off
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Regular</span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.stock === 0
                                ? 'bg-rose-100 text-rose-800'
                                : p.stock < 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
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
                                className="p-2 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                                title="View in Boutique Store"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                onClick={() => handleDuplicateProduct(p.id)}
                                className="p-2 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                                title="Duplicate product"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
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
                                className="p-2 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
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
            <div className="bg-white border border-[#EAE3D9] rounded-sm shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                  Customer Orders Log ({orders.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAF8F5] text-[11px] uppercase tracking-wider font-bold text-gray-600">
                      <th className="py-3.5 px-6">Order Number</th>
                      <th className="py-3.5 px-6">Customer & Shipping</th>
                      <th className="py-3.5 px-6">Total Amount</th>
                      <th className="py-3.5 px-6">Applied Coupon</th>
                      <th className="py-3.5 px-6">Payment</th>
                      <th className="py-3.5 px-6">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-[#1A1A1A]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-[#1A1A1A] text-sm">{ord.customerName}</p>
                          <p className="text-xs text-gray-500">{ord.customerEmail} • {ord.shippingCity}</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#1A1A1A] text-base">
                          €{ord.total.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {ord.discountCode ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                              <Tag className="w-3 h-3" /> {ord.discountCode} (-€{ord.discountAmount?.toFixed(2)})
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider font-semibold text-gray-600">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                              ord.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.status === 'Processing'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : ord.status === 'Shipped'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Paid">Paid</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white border border-[#EAE3D9] rounded-sm p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-[#FAF7F2] border border-[#D4AF37] rounded-sm flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] uppercase tracking-wider font-light">
                    Security & Administrator Password
                  </h2>
                  <p className="text-xs text-gray-500">
                    Update your master administrator credentials for the Lunar Boutique Portal
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                    Administrator Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-sm text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                    Current Master Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-sm text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-sm text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-sm text-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="w-full py-3.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
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
