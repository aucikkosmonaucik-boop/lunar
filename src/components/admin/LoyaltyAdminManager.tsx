import React, { useState } from 'react';
import { Award, Plus, Trash2, Edit2, Check, Sparkles, Coins, Users } from 'lucide-react';
import { useLoyalty } from '../../hooks/useLoyalty';
import type { LoyaltyReward } from '../../types';

interface DemoUserRecord {
  id: string;
  name: string;
  email: string;
  points: number;
  ordersCount: number;
  couponsCount: number;
}

export const LoyaltyAdminManager: React.FC = () => {
  const { rewards, adminSaveReward, adminDeleteReward, adminAdjustPoints } = useLoyalty();

  const [activeSubtab, setActiveSubtab] = useState<'rewards' | 'users' | 'settings'>('rewards');
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reward Form State
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardCost, setRewardCost] = useState<number | ''>(100);
  const [rewardType, setRewardType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [rewardValue, setRewardValue] = useState<number | ''>(5.0);
  const [rewardMinOrder, setRewardMinOrder] = useState<number | ''>(30);
  const [rewardActive, setRewardActive] = useState(true);

  // User Adjust State
  const [usersList, setUsersList] = useState<DemoUserRecord[]>([
    { id: 'usr-1', name: 'Caroline Taylor', email: 'caroline.t@example.com', points: 450, ordersCount: 5, couponsCount: 3 },
    { id: 'usr-2', name: 'Peter Vance', email: 'peter.v@example.com', points: 280, ordersCount: 2, couponsCount: 1 },
    { id: 'usr-3', name: 'Eleanor Dubois', email: 'eleanor.d@example.com', points: 1250, ordersCount: 12, couponsCount: 6 },
    { id: 'usr-4', name: 'Marcus Wright', email: 'marcus.w@example.com', points: 90, ordersCount: 1, couponsCount: 0 },
  ]);

  const [selectedUser, setSelectedUser] = useState<DemoUserRecord | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number | ''>(50);
  const [adjustReason, setAdjustReason] = useState('Customer appreciation bonus');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Settings State
  const [pointsPerCurrency, setPointsPerCurrency] = useState(10);
  const [signupBonus, setSignupBonus] = useState(150);

  const openCreateModal = () => {
    setEditingReward(null);
    setRewardTitle('');
    setRewardDesc('');
    setRewardCost(150);
    setRewardType('PERCENTAGE');
    setRewardValue(10);
    setRewardMinOrder(30);
    setRewardActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setRewardTitle(reward.title);
    setRewardDesc(reward.description || '');
    setRewardCost(reward.pointsCost);
    setRewardType(reward.discountType);
    setRewardValue(reward.discountValue);
    setRewardMinOrder(reward.minOrderValue);
    setRewardActive(reward.isActive);
    setIsModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!rewardTitle.trim()) {
      setErrorMessage('Reward title is required');
      return;
    }

    if (rewardCost === '' || Number(rewardCost) <= 0) {
      setErrorMessage('Points cost must be greater than 0');
      return;
    }

    if (rewardValue === '' || Number(rewardValue) <= 0) {
      setErrorMessage('Discount value must be greater than 0');
      return;
    }

    await adminSaveReward({
      ...(editingReward ? { id: editingReward.id } : {}),
      title: rewardTitle.trim(),
      description: rewardDesc.trim(),
      pointsCost: Number(rewardCost),
      discountType: rewardType,
      discountValue: Number(rewardValue),
      minOrderValue: rewardMinOrder !== '' ? Number(rewardMinOrder) : 0,
      isActive: rewardActive,
    });

    setIsModalOpen(false);
    setSuccessMessage(`Reward coupon "${rewardTitle}" saved successfully!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteReward = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete reward "${title}"?`)) return;
    await adminDeleteReward(id);
    setSuccessMessage(`Reward deleted successfully.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUserAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || adjustPointsValue === '') return;

    const diff = Number(adjustPointsValue);
    await adminAdjustPoints(selectedUser.id, diff, adjustReason);

    setUsersList(prev =>
      prev.map(u =>
        u.id === selectedUser.id ? { ...u, points: Math.max(0, u.points + diff) } : u
      )
    );

    setIsAdjustModalOpen(false);
    setSuccessMessage(`Updated points for ${selectedUser.name} (${diff > 0 ? `+${diff}` : diff} pts)!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI */}
      <div className="bg-white text-[#1A1A1A] p-6 rounded-sm shadow-xs border border-[#EAE3D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-1">
            <Coins className="w-4 h-4" /> LUNAR Club • Loyalty Program
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl font-light tracking-wider text-[#1A1A1A]">
            Purchase Points & Rewards Management
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Customers earn points automatically on every checkout ({pointsPerCurrency} pts per €1 spent) and redeem them into unique discount coupons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Points Reward</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Subtabs */}
      <div className="flex border-b border-gray-200 bg-[#FAF8F5] px-4 rounded-t-sm">
        <button
          type="button"
          onClick={() => setActiveSubtab('rewards')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'rewards'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Award className="w-4 h-4 text-[#D4AF37]" />
          1. Rewards Catalog ({rewards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubtab('users')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'users'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" />
          2. Customer Points Balances
        </button>
        <button
          type="button"
          onClick={() => setActiveSubtab('settings')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'settings'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          3. Program Rules & Multipliers
        </button>
      </div>

      {/* SUBTAB 1: REWARDS CATALOG */}
      {activeSubtab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-white border rounded-sm p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                reward.isActive ? 'border-[#EAE3D9]' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#f3e5ab]" />

              <div>
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full">
                    <Coins className="w-3 h-3 text-[#D4AF37]" /> {reward.pointsCost} PTS
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      reward.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {reward.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#1A1A1A] mb-1">
                  {reward.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {reward.description || 'Voucher coupon generated upon points redemption.'}
                </p>

                <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded p-2.5 text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount:</span>
                    <span className="font-bold text-emerald-700">
                      {reward.discountType === 'PERCENTAGE' ? `-${reward.discountValue}%` : `-€${reward.discountValue.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min. order:</span>
                    <span className="font-medium text-gray-800">
                      {reward.minOrderValue > 0 ? `€${reward.minOrderValue.toFixed(2)}` : 'No minimum'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => openEditModal(reward)}
                  className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReward(reward.id, reward.title)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: USERS POINTS & ADJUSTMENTS */}
      {activeSubtab === 'users' && (
        <div className="bg-white border border-[#EAE3D9] rounded-sm shadow-xs overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                Customer Balances & Points Ledger
              </h3>
              <p className="text-xs text-gray-400">
                Manually adjust customer points with an audit ledger reason.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-[#FAF8F5] text-[11px] uppercase tracking-wider font-bold text-gray-600">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Points Balance</th>
                  <th className="py-3.5 px-6">Member Tier</th>
                  <th className="py-3.5 px-6">Orders & Coupons</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#1A1A1A]">{usr.name}</td>
                    <td className="py-4 px-6 text-gray-600">{usr.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 font-bold text-black bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs">
                        <Coins className="w-3.5 h-3.5 text-[#D4AF37]" /> {usr.points} PTS
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        usr.points >= 1000 ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        usr.points >= 400 ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {usr.points >= 1000 ? 'Diamond VIP' : usr.points >= 400 ? 'Gold Member' : 'Silver Club'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {usr.ordersCount} orders ({usr.couponsCount} coupons)
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(usr);
                          setAdjustPointsValue(50);
                          setAdjustReason('Loyalty appreciation bonus');
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs font-bold rounded transition-colors"
                      >
                        ± Adjust Points
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SETTINGS */}
      {activeSubtab === 'settings' && (
        <div className="bg-white border border-[#EAE3D9] rounded-sm p-6 space-y-6 max-w-2xl animate-fade-in">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Loyalty Program Rate Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Points Rate Multiplier (Points earned per €1 spent)
              </label>
              <input
                type="number"
                min="1"
                value={pointsPerCurrency}
                onChange={(e) => setPointsPerCurrency(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Default 10: An order of €100 earns 1,000 loyalty points for the customer.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Welcome Bonus Points on Registration
              </label>
              <input
                type="number"
                min="0"
                value={signupBonus}
                onChange={(e) => setSignupBonus(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Credited automatically to new customer accounts upon sign-up.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setSuccessMessage('Loyalty program parameters saved successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT REWARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D9] shadow-2xl rounded-sm w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE3D9] text-[#1A1A1A]">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-lg tracking-wider flex items-center gap-2 font-light">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                {editingReward ? 'Edit Points Reward Coupon' : 'Create Points Reward Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Reward Title *
                </label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. 15% Off Entire Boutique Order"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Customer Description
                </label>
                <textarea
                  rows={2}
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="e.g. Valid for 90 days across fine jewelry and extracted perfumes."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Cost in Points (PTS) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 200"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Min. Cart (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rewardMinOrder}
                    onChange={(e) => setRewardMinOrder(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 30 (0 = no minimum)"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={rewardActive}
                    onChange={(e) => setRewardActive(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Reward available for customer points redemption</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER POINTS */}
      {isAdjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D9] shadow-2xl rounded-sm w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE3D9] text-[#1A1A1A]">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-lg tracking-wider flex items-center gap-2 font-light">
                <Coins className="w-4 h-4 text-[#D4AF37]" /> Adjust Customer Points
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserAdjustSubmit} className="p-6 space-y-4">
              <div className="bg-[#FAF8F5] p-3.5 rounded-sm border border-[#EAE3D9] text-sm">
                <p className="font-bold text-[#1A1A1A]">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                <p className="text-xs text-[#1A1A1A] font-semibold mt-1">
                  Current Balance: <span className="text-[#D4AF37] font-bold">{selectedUser.points} PTS</span>
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Points Adjustment Amount (+ / -)
                </label>
                <input
                  type="number"
                  required
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. +100 or -50"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-base focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Audit Ledger Reason Note
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. VIP loyalty bonus, compensation, etc."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyAdminManager;
