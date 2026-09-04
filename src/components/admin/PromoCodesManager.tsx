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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 border border-[#EAE3D9] rounded-sm shadow-xs">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl font-light tracking-wider text-[#1A1A1A] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4AF37]" /> Promotional Discount Codes
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage discount vouchers and promo codes valid across customer bags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Promo Code'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Promo Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePromo} className="bg-white p-6 border-2 border-[#D4AF37]/50 rounded-sm shadow-md space-y-5 animate-fade-in">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Create New Promo Code
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Promo Code Name (e.g. SUMMER20) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LUNAR25"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-mono font-bold text-base uppercase focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-gray-500 font-bold">
                  {discountType === 'PERCENTAGE' ? '%' : '€'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Min. Order Subtotal (€)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 50 (0 = no minimum)"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Usage Limit (Max Uses)
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="e.g. 100 (blank = unlimited)"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black"
              />
              <span>Activate immediately in checkout</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4" /> Create Promo
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Promos Table */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
            Active Promo Codes ({promos.length})
          </h3>
          <span className="text-[11px] text-gray-400">
            Customers can enter these codes in the checkout promo box
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#FAF8F5] text-[11px] uppercase tracking-wider font-bold text-gray-600">
                <th className="py-3.5 px-6">Promo Code</th>
                <th className="py-3.5 px-6">Discount</th>
                <th className="py-3.5 px-6">Min. Cart</th>
                <th className="py-3.5 px-6">Uses</th>
                <th className="py-3.5 px-6">Validity</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {promos.map((promo) => (
                <tr key={promo.id || promo.code} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] text-base tracking-wider bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                        {promo.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(promo.code)}
                        title="Copy code"
                        className="text-gray-400 hover:text-black p-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedCode === promo.code && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 font-bold text-[#1A1A1A]">
                    {promo.discountPct > 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        -{promo.discountPct}%
                      </span>
                    ) : promo.discountAmount ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        -€{promo.discountAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-gray-600">
                    {promo.minOrderValue > 0 ? `€${promo.minOrderValue.toFixed(2)}` : 'None'}
                  </td>

                  <td className="py-4 px-6 font-medium text-gray-800">
                    {promo.usageCount || 0} {promo.maxUses ? `/ ${promo.maxUses}` : 'times'}
                  </td>

                  <td className="py-4 px-6 text-xs text-gray-500">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('en-US') : 'Permanent'}
                  </td>

                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(promo.id || '', promo.isActive)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        promo.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{promo.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo.id || '', promo.code)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4" />
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
