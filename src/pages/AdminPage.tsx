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
  ArrowRight,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useLoyalty } from '../hooks/useLoyalty';
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
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useProducts();
  const { rewards } = useLoyalty();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'promos' | 'loyalty' | 'orders'>('overview');

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
    const set = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(productSearch.toLowerCase()));

      const matchCategory =
        selectedCategory === 'ALL' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchBadge =
        selectedBadge === 'ALL' ||
        (selectedBadge === 'NO_BADGE' && !p.badge) ||
        (p.badge && p.badge.toUpperCase() === selectedBadge.toUpperCase());

      return matchSearch && matchCategory && matchBadge;
    });
  }, [products, productSearch, selectedCategory, selectedBadge]);

  // Product Actions
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
      showToast(`Produkt "${productData.name || editingProduct.name}" został pomyślnie zaktualizowany!`);
    } else {
      const created = await addProduct(productData);
      showToast(`Nowy produkt "${created.name}" został dodany do kolekcji!`);
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black pb-24">
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
                    Admin
                  </span>
                </h1>
                <p className="text-xs text-gray-400">
                  Moderacja galerii, opisów, cen, promocji i systemu punktów lojalnościowych
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Pulpit
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              Katalog & Moderacja Produktów ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded transition-all flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-4 h-4 text-[#d4af37]" />
              Kody Rabatowe
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded transition-all flex items-center gap-2 ${
                activeTab === 'loyalty'
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4 text-[#d4af37]" />
              Program Punktowy ({rewards.length} nagród)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Zamówienia ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Alert */}
        {toast && (
          <div className="mb-6 p-4 bg-black text-white border-l-4 border-[#d4af37] rounded shadow-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#d4af37]" />
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Zamknij
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                    Produkty w Sklepie
                  </span>
                  <Package className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black">{products.length}</div>
                <p className="text-xs text-gray-400 mt-1">
                  Łącznie w magazynie: {totalStockCount} sztuk
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                    Aktywne Promocje
                  </span>
                  <Percent className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="text-3xl font-bold text-black">{activePromoProducts}</div>
                <p className="text-xs text-green-700 mt-1 font-medium">
                  Produkty ze zniżką procentową
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                    Program Punktowy
                  </span>
                  <Award className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="text-3xl font-bold text-black">{rewards.length} nagród</div>
                <p className="text-xs text-gray-400 mt-1">
                  Kupony do wykupienia za punkty
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                    Ostatnie Zamówienia
                  </span>
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black">{orders.length}</div>
                <p className="text-xs text-gray-400 mt-1">
                  Łączna wartość: {orders.reduce((a, b) => a + b.total, 0).toFixed(2)}€
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-bold text-black border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" /> Szybkie Narzędzia
                </h3>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-bold text-black group-hover:text-gray-900">
                      + Dodaj Nowy Produkt
                    </p>
                    <p className="text-xs text-gray-500">Wprowadź zdjęcia, opis, cenę i promocje</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('promos')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-bold text-black group-hover:text-gray-900">
                      🏷️ Nowy Kod Rabatowy
                    </p>
                    <p className="text-xs text-gray-500">Utwórz zniżkę na koszyk dla klientów</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('loyalty')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-bold text-black group-hover:text-gray-900">
                      ⭐ Sklep z Kuponami za Punkty
                    </p>
                    <p className="text-xs text-gray-500">Dodaj nagrodę wymienną za punkty</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-black flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-black" /> Ostatnie Zamówienia
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-gray-600 hover:text-black font-bold uppercase tracking-wider"
                  >
                    Zobacz wszystkie →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 border border-gray-100 rounded-lg bg-gray-50/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-black">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              ord.status === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : ord.status === 'Processing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ord.customerName} ({ord.shippingCity}) • {ord.itemsCount} szt.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-black">{ord.total.toFixed(2)}€</p>
                        {ord.discountCode && (
                          <span className="text-[10px] text-green-700 font-mono">
                            Kod: {ord.discountCode} (-{ord.discountAmount?.toFixed(2)}€)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG & MODERATION */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Szukaj po nazwie, opisie lub tagu..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-xs uppercase tracking-wider bg-white font-medium focus:ring-1 focus:ring-black focus:outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      Kategoria: {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-xs uppercase tracking-wider bg-white font-medium focus:ring-1 focus:ring-black focus:outline-none"
                >
                  <option value="ALL">Wszystkie odznaki</option>
                  <option value="SALE">SALE (Wyprzedaż)</option>
                  <option value="NEW">NEW (Nowości)</option>
                  <option value="BESTSELLER">BESTSELLER</option>
                  <option value="READY TO SHIP">READY TO SHIP</option>
                  <option value="NO_BADGE">Bez odznaki</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-[#0d0d0d] text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Dodaj</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                  Lista Produktów ({filteredProducts.length} z {products.length})
                </h3>
                <span className="text-[11px] text-gray-400">
                  Kliknij "Edytuj", aby moderować galerię zdjęć, opis i ceny
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-600">
                      <th className="py-3.5 px-6">Produkt & Galeria</th>
                      <th className="py-3.5 px-6">Kategoria</th>
                      <th className="py-3.5 px-6">Cena Regularna</th>
                      <th className="py-3.5 px-6">Promocja / Zniżka</th>
                      <th className="py-3.5 px-6">Stan (Stock)</th>
                      <th className="py-3.5 px-6">Odznaka</th>
                      <th className="py-3.5 px-6 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProducts.map((item) => {
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const discountPct = hasDiscount
                        ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
                        : 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          {/* Image & Title */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-12 h-14 rounded border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200';
                                  }}
                                />
                                {item.images && item.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] font-bold px-1 rounded-tl">
                                    +{item.images.length - 1}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-serif font-bold text-black text-sm hover:text-gray-700">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-6 text-xs uppercase tracking-wider text-gray-600 font-medium">
                            {item.category}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 font-bold text-black text-sm">
                            {item.price.toFixed(2)}€
                          </td>

                          {/* Discount */}
                          <td className="py-4 px-6">
                            {hasDiscount ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">
                                  {item.originalPrice?.toFixed(2)}€
                                </span>
                                <span className="text-xs font-bold text-green-700">
                                  -{discountPct}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                                (item.stock || 0) > 0
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {(item.stock || 0) > 0 ? `${item.stock} szt.` : 'Brak (0)'}
                            </span>
                          </td>

                          {/* Badge */}
                          <td className="py-4 px-6">
                            {item.badge ? (
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded ${
                                  item.badge === 'SALE'
                                    ? 'bg-red-100 text-red-800'
                                    : item.badge === 'NEW'
                                    ? 'bg-black text-white'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {item.badge}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="px-3 py-1 bg-black text-white text-xs uppercase tracking-wider font-bold rounded hover:bg-gray-800 transition-colors flex items-center gap-1"
                                title="Edytuj produkt i galerię"
                              >
                                <Edit2 className="w-3 h-3 text-[#d4af37]" />
                                <span>Edytuj</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateProduct(item.id)}
                                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                                title="Duplikuj produkt"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
