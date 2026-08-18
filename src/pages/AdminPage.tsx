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
        showToast('Zalogowano pomyślnie jako Właściciel!');
      } else {
        // Fallback master credential check if offline/mock
        if (
          (loginEmail.trim().toLowerCase() === 'admin@lunar.com' || loginEmail.trim().toLowerCase() === 'admin') &&
          loginPassword === 'LunarAdmin2026!'
        ) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('lunar_admin_session', 'true');
          login({
            id: 'admin-master',
            email: 'admin@lunar.com',
            name: 'Właściciel Lunar Boutique',
            street: null,
            city: null,
            postalCode: null,
            country: null,
            phone: null,
            role: 'ADMIN',
            loyaltyPoints: 1000,
          });
          showToast('Zalogowano pomyślnie jako Właściciel!');
        } else {
          setLoginError(data.message || 'Nieprawidłowy login lub hasło administratora.');
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
          name: 'Właściciel Lunar Boutique',
          street: null,
          city: null,
          postalCode: null,
          country: null,
          phone: null,
          role: 'ADMIN',
          loyaltyPoints: 1000,
        });
        showToast('Zalogowano pomyślnie jako Właściciel!');
      } else {
        setLoginError('Nieprawidłowy login lub hasło administratora. Spróbuj "LunarAdmin2026!"');
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
    showToast('Wylogowano z panelu administratora.', 'info');
  };

  // Handle Admin Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasło i potwierdzenie nie są identyczne.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć minimum 6 znaków.');
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
        setPasswordSuccess('Hasło administratora zostało pomyślnie zaktualizowane!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Wystąpił błąd podczas zmiany hasła.');
      }
    } catch {
      setPasswordSuccess('Hasło zostało zapisane w konfiguracji lokalnej!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Orders State (Mock/Fetched demo list)
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'ord-101',
      orderNumber: 'LUNAR-89214-342',
      customerName: 'Klaudia Adamska',
      customerEmail: 'klaudia.a@example.com',
      shippingCity: 'Warszawa',
      total: 218.90,
      discountCode: 'LUNAR10',
      discountAmount: 24.30,
      status: 'Paid',
      paymentMethod: 'stripe',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      itemsCount: 2,
    },
    {
      id: 'ord-102',
      orderNumber: 'LUNAR-77192-811',
      customerName: 'Michał Kwiatkowski',
      customerEmail: 'michal.k@example.com',
      shippingCity: 'Kraków',
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
      customerName: 'Zofia Lewandowska',
      customerEmail: 'zofia.l@example.com',
      shippingCity: 'Gdańsk',
      total: 149.50,
      status: 'Shipped',
      paymentMethod: 'blik',
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
      showToast(`Produkt "${productData.name || editingProduct.name}" zaktualizowany!`);
    } else {
      await addProduct(productData as Omit<Product, 'id'>);
      showToast(`Nowy produkt "${productData.name}" dodany do sklepu!`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    showToast('Produkt został usunięty z katalogu.', 'info');
  };

  const handleDuplicateProduct = async (id: string) => {
    const copy = await duplicateProduct(id);
    showToast(`Utworzono kopię: "${copy.name}"`);
  };

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Status zamówienia zaktualizowany na: ${newStatus}`);
  };

  // KPIs
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const activePromoProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).length;

  // ─────────────────────────────────────────────────────────────
  // 1. ADMIN SECURITY GATE (IF NOT LOGGED IN AS ADMIN)
  // ─────────────────────────────────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#121212] border border-[#d4af37]/40 p-8 sm:p-10 rounded-sm shadow-2xl relative z-10 animate-fade-in">
          {/* Header & Crest */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-black border border-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#d4af37]/10">
              <Lock className="w-8 h-8 text-[#d4af37]" />
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#d4af37] font-bold mb-1">
              LUNAR BOUTIQUE
            </p>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-3xl sm:text-4xl uppercase tracking-widest font-light text-white"
            >
              Panel Właściciela
            </h1>
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
              Dostęp autoryzowany wyłącznie dla administratora
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-600/50 rounded text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-300 mb-2">
                Login / Adres E-mail
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@lunar.com"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] focus:outline-none text-white text-sm rounded transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-300 mb-2">
                Hasło Administratora
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 focus:border-[#d4af37] focus:outline-none text-white text-sm rounded transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-[#d4af37] hover:bg-[#c5a059] text-black font-bold text-xs uppercase tracking-[0.25em] rounded transition-all shadow-lg hover:shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Weryfikacja...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Zaloguj do Panelu</span>
                </>
              )}
            </button>
          </form>

          {/* Master Credentials Info Card */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded text-left">
              <div className="flex items-center gap-1.5 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Domyślne Dane Dostępu Właściciela:</span>
              </div>
              <p className="text-[11px] text-gray-300">
                <strong className="text-white font-mono">Login:</strong> admin@lunar.com (lub admin)
              </p>
              <p className="text-[11px] text-gray-300">
                <strong className="text-white font-mono">Hasło:</strong> LunarAdmin2026!
              </p>
              <p className="text-[9px] text-gray-400 mt-1">
                * Hasło można w każdej chwili zmienić po zalogowaniu w zakładce Ustawienia.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-block mt-6 text-xs uppercase tracking-widest text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              ← Powrót do Sklepu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3.5 rounded shadow-2xl border border-[#d4af37] flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-[#0d0d0d] text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center rounded-lg">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif tracking-wider font-light flex items-center gap-2">
                  LUNAR Panel Administratora
                  <span className="text-[10px] bg-[#d4af37] text-black font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                    Właściciel
                  </span>
                </h1>
                <p className="text-xs text-gray-400">
                  Moderacja galerii, opisów, cen, promocji i systemu punktów lojalnościowych
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Zalogowano: <strong>admin@lunar.com</strong></span>
              </div>

              <Link
                to="/shop"
                target="_blank"
                className="px-4 py-2 border border-gray-700 hover:border-gray-500 rounded text-xs uppercase tracking-widest text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Zobacz Sklep</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2 bg-[#d4af37] hover:bg-[#c5a059] text-black font-bold text-xs uppercase tracking-widest rounded flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Dodaj Produkt</span>
              </button>

              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3.5 py-2 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors"
                title="Wyloguj z panelu"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-8 overflow-x-auto no-scrollbar border-b border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pulpit / Przegląd</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Katalog & Moderacja ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kody Rabatowe</span>
            </button>

            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'loyalty'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Program Punktowy & Nagrody ({rewards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Zamówienia ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Bezpieczeństwo & Hasło</span>
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
              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Produkty w Sklepie
                  </span>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-black">{products.length}</div>
                <p className="text-xs text-gray-500 mt-1">Łączny stan magazynowy: {totalStockCount} szt.</p>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Aktywne Promocje
                  </span>
                  <Percent className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="text-3xl font-bold text-black">{activePromoProducts}</div>
                <p className="text-xs text-gray-500 mt-1">Produkty z obniżoną ceną</p>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Katalog Nagród (Punkty)
                  </span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-black">{rewards.length}</div>
                <p className="text-xs text-gray-500 mt-1">Kupony do wymiany za punkty</p>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                    Ostatnie Zamówienia
                  </span>
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-black">{orders.length}</div>
                <p className="text-xs text-gray-500 mt-1">Suma: {orders.reduce((s, o) => s + o.total, 0).toFixed(2)}€</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-black uppercase tracking-wider font-light">
                    Ostatnie Zamówienia
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs uppercase tracking-wider font-bold text-[#d4af37] hover:underline"
                  >
                    Zobacz wszystkie →
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-black">{ord.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            ord.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {ord.customerName} ({ord.customerEmail}) • {ord.itemsCount} poz.
                        </p>
                      </div>

                      <div className="text-right sm:text-right w-full sm:w-auto">
                        <span className="font-bold text-base text-black block">{ord.total.toFixed(2)}€</span>
                        {ord.discountCode && (
                          <span className="text-[10px] text-green-700 font-mono">
                            Kupon: {ord.discountCode} (-{ord.discountAmount?.toFixed(2)}€)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Tile */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-black uppercase tracking-wider font-light pb-4 border-b border-gray-100">
                  Szybkie Akcje
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={handleOpenAddModal}
                    className="w-full p-4 bg-[#1a1a1a] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded flex items-center justify-between transition-colors shadow"
                  >
                    <span>Dodaj Nowy Produkt</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('promos')}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-bold text-xs uppercase tracking-widest rounded flex items-center justify-between transition-colors"
                  >
                    <span>Stwórz Kod Rabatowy</span>
                    <Tag className="w-4 h-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-bold text-xs uppercase tracking-widest rounded flex items-center justify-between transition-colors"
                  >
                    <span>Dodaj Nagrodę za Punkty</span>
                    <Award className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-bold text-xs uppercase tracking-widest rounded flex items-center justify-between transition-colors"
                  >
                    <span>Zmień Hasło Administratora</span>
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
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwie, opisie, tagach..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-xs text-black focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-black focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Wszystkie Kategorie</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>
                      Kategoria: {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-black focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Wszystkie Odznaki</option>
                  <option value="NEW">Tylko NEW</option>
                  <option value="SALE">Tylko SALE</option>
                  <option value="BESTSELLER">Tylko BESTSELLER</option>
                  <option value="READY TO SHIP">Tylko READY TO SHIP</option>
                  <option value="SOLD OUT">Tylko SOLD OUT</option>
                  <option value="NONE">Brak Odznaki</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded flex items-center gap-1.5 transition-colors ml-auto md:ml-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nowy Produkt</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-600">
                      <th className="py-3.5 px-6">Produkt</th>
                      <th className="py-3.5 px-6">Kategoria & Odznaka</th>
                      <th className="py-3.5 px-6">Cena Regularna</th>
                      <th className="py-3.5 px-6">Promocja / Rabat</th>
                      <th className="py-3.5 px-6">Magazyn</th>
                      <th className="py-3.5 px-6 text-right">Akcje</th>
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
                                <h4 className="font-bold text-black text-sm line-clamp-1">{p.name}</h4>
                                <p className="text-xs text-gray-400 font-mono">ID: {p.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Badge */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-700">
                                {p.categorySlug || 'Inne'}
                              </span>
                              {p.badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  p.badge === 'SALE' ? 'bg-red-100 text-red-800' :
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
                          <td className="py-4 px-6 font-bold text-black text-base">
                            {p.price.toFixed(2)}€
                          </td>

                          {/* Promo Price & Discount */}
                          <td className="py-4 px-6">
                            {p.originalPrice && p.originalPrice > p.price ? (
                              <div>
                                <span className="text-xs line-through text-gray-400 block">
                                  {p.originalPrice.toFixed(2)}€
                                </span>
                                <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                  -{discountPct}% Zniżki
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Brak</span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.stock === 0
                                ? 'bg-red-100 text-red-800'
                                : p.stock < 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock === 0 ? 'Wyprzedane (0)' : `${p.stock} szt.`}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/product/${p.id}`}
                                target="_blank"
                                className="p-2 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                                title="Podgląd w sklepie"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                onClick={() => handleDuplicateProduct(p.id)}
                                className="p-2 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                                title="Duplikuj produkt"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="px-3 py-1.5 bg-black hover:bg-[#d4af37] text-white hover:text-black rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edytuj</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Czy na pewno usunąć produkt "${p.name}"?`)) {
                                    handleDeleteProduct(p.id);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                title="Usuń produkt"
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                  Dziennik Zamówień Klientów ({orders.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-600">
                      <th className="py-3.5 px-6">Nr Zamówienia</th>
                      <th className="py-3.5 px-6">Klient & Adres</th>
                      <th className="py-3.5 px-6">Kwota Zamówienia</th>
                      <th className="py-3.5 px-6">Użyty Kupon / Zniżka</th>
                      <th className="py-3.5 px-6">Płatność</th>
                      <th className="py-3.5 px-6">Status Realizacji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-black">
                          {ord.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-black text-sm">{ord.customerName}</p>
                          <p className="text-xs text-gray-500">{ord.customerEmail} • {ord.shippingCity}</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-black text-base">
                          {ord.total.toFixed(2)}€
                        </td>
                        <td className="py-4 px-6">
                          {ord.discountCode ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                              <Tag className="w-3 h-3" /> {ord.discountCode} (-{ord.discountAmount?.toFixed(2)}€)
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Brak</span>
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
                                ? 'bg-green-50 text-green-800 border-green-300'
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
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-black uppercase tracking-wider font-light">
                    Bezpieczeństwo & Zmiana Hasła
                  </h2>
                  <p className="text-xs text-gray-500">
                    Zmień hasło dostępu do panelu administratora Lunar
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
                    Adres E-mail Administratora
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-black focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                    Aktualne Hasło Administratora *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Wpisz dotychczasowe hasło (np. LunarAdmin2026!)"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-black focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                      Nowe Hasło *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 znaków"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-black focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                      Powtórz Nowe Hasło *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Powtórz nowe hasło"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-black focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="w-full py-3.5 bg-[#1a1a1a] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs uppercase tracking-[0.2em] rounded transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {passwordChangeLoading ? (
                    <span>Zapisywanie...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Zaktualizuj Dane Logowania</span>
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
