import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Tag, Check, Power, AlertCircle, Copy } from 'lucide-react';
import type { PromoCodeItem } from '../../types';

export const PromoCodesManager: React.FC = () => {
  const [promos, setPromos] = useState<PromoCodeItem[]>([
    {
      id: 'promo-1',
      code: 'LUNAR10',
      discountPct: 10,
      minOrderValue: 0,
      isActive: true,
      usageCount: 42,
    },
    {
      id: 'promo-2',
      code: 'WELCOME10',
      discountPct: 10,
      minOrderValue: 0,
      isActive: true,
      usageCount: 19,
    },
    {
      id: 'promo-3',
      code: 'VIP15',
      discountPct: 15,
      minOrderValue: 50,
      isActive: true,
      usageCount: 8,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [minOrderValue, setMinOrderValue] = useState<number | ''>(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAdminHeaders = () => {
    const token = localStorage.getItem('lunar_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/promos', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.promos && Array.isArray(data.promos) && data.promos.length > 0) {
          setPromos(data.promos);
        }
      }
    } catch (e) {
      console.warn('Could not fetch promos from API:', e);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Promo code name is required.');
      return;
    }

    if (discountValue === '' || Number(discountValue) <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    const newPromo: PromoCodeItem = {
      id: `promo-${Date.now()}`,
      code: cleanCode,
      discountPct: discountType === 'PERCENTAGE' ? Number(discountValue) : 0,
      discountAmount: discountType === 'FIXED' ? Number(discountValue) : null,
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      maxUses: maxUses ? Number(maxUses) : null,
      isActive,
      usageCount: 0,
    };

    setPromos(prev => [newPromo, ...prev]);

    try {
      await fetch('/api/promos?action=create', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'create',
          code: newPromo.code,
          discountPct: newPromo.discountPct,
          discountAmount: newPromo.discountAmount,
          minOrderValue: newPromo.minOrderValue,
          expiresAt: newPromo.expiresAt,
          maxUses: newPromo.maxUses,
          isActive: newPromo.isActive,
        }),
      });
      setSuccess(`Promo code ${cleanCode} created successfully!`);
    } catch (e) {
      console.warn('Create promo API warning:', e);
    }

    // Reset Form
    setCode('');
    setDiscountValue(10);
    setMinOrderValue(0);
    setExpiresAt('');
    setMaxUses('');
    setShowAddForm(false);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    try {
      await fetch(`/api/promos?id=${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isActive: !currentStatus }),
      });
    } catch (e) {
      console.warn('Toggle promo error:', e);
    }
  };

  const handleDeletePromo = async (id: string, codeName: string) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${codeName}"?`)) return;
    setPromos(prev => prev.filter(p => p.id !== id));
    try {
      await fetch(`/api/promos?id=${id}&code=${codeName}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
    } catch (e) {
      console.warn('Delete promo error:', e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1E1E] p-6 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs transition-colors">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl sm:text-3xl font-normal tracking-wider text-[#1A1A1A] dark:text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[#D4AF37]" /> Promotional Discount Codes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
            Manage discount vouchers and promo codes valid across customer bags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{showAddForm ? 'Close Form' : 'New Promo Code'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded flex items-center gap-2.5 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Promo Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePromo} className="bg-white dark:bg-[#1E1E1E] p-6 border-2 border-[#D4AF37]/60 rounded-sm shadow-md space-y-5 animate-fade-in transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white border-b border-gray-100 dark:border-[#2E2E2E] pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#D4AF37] stroke-[2.5]" /> Create New Promo Code
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Promo Code Name (e.g. SUMMER20) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LUNAR25"
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-mono font-bold text-base uppercase focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder={discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 20'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <span className="absolute right-3.5 top-2.5 text-gray-600 dark:text-gray-300 font-bold text-base">
                  {discountType === 'PERCENTAGE' ? '%' : '€'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Min. Order Subtotal (€)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 50 (0 = no minimum)"
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Usage Limit (Max Uses)
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="e.g. 100 (blank = unlimited)"
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-black dark:accent-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Activate immediately in checkout</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[2.5]" /> Create Promo
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Promos Table */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2E2E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200">
            Active Promo Codes ({promos.length})
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Customers can enter these codes in the checkout promo box
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#333333] bg-[#FAF8F5] dark:bg-[#252525] text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                <th className="py-3.5 px-6">Promo Code</th>
                <th className="py-3.5 px-6">Discount</th>
                <th className="py-3.5 px-6">Min. Cart</th>
                <th className="py-3.5 px-6">Uses</th>
                <th className="py-3.5 px-6">Validity</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
              {promos.map((promo) => (
                <tr key={promo.id || promo.code} className="hover:bg-gray-50/80 dark:hover:bg-[#252525]/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] dark:text-white text-base tracking-wider bg-gray-100 dark:bg-[#282828] px-3 py-1 rounded border border-gray-200 dark:border-[#3E3E3E]">
                        {promo.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(promo.code)}
                        title="Copy code"
                        className="text-gray-400 hover:text-black dark:hover:text-white p-1.5 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {copiedCode === promo.code && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 font-bold text-[#1A1A1A] dark:text-white">
                    {promo.discountPct > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
                        -{promo.discountPct}%
                      </span>
                    ) : promo.discountAmount ? (
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
                        -€{promo.discountAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    {promo.minOrderValue > 0 ? `€${promo.minOrderValue.toFixed(2)}` : 'None'}
                  </td>

                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {promo.usageCount || 0} {promo.maxUses ? `/ ${promo.maxUses}` : 'times'}
                  </td>

                  <td className="py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('en-US') : 'Permanent'}
                  </td>

                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(promo.id || '', promo.isActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border ${
                        promo.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                          : 'bg-gray-100 text-gray-600 dark:bg-[#2A2A2A] dark:text-gray-400 border-gray-200 dark:border-[#3E3E3E] hover:bg-gray-200 dark:hover:bg-[#333333]'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{promo.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo.id || '', promo.code)}
                      className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoCodesManager;
