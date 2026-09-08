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
      <div className="bg-white dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-white p-6 rounded-sm shadow-xs border border-[#EAE3D9] dark:border-[#2E2E2E] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-1">
            <Coins className="w-4 h-4 stroke-[2.5]" /> LUNAR Club • Loyalty Program
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl sm:text-3xl font-normal tracking-wider text-[#1A1A1A] dark:text-white">
            Purchase Points & Rewards Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1 max-w-xl">
            Customers earn points automatically on every checkout ({pointsPerCurrency} pts per €1 spent) and redeem them into unique discount coupons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Points Reward</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded flex items-center gap-2.5 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Subtabs */}
      <div className="flex border-b border-gray-200 dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#181818] px-4 rounded-t-sm gap-2 transition-colors">
        <button
          type="button"
          onClick={() => setActiveSubtab('rewards')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'rewards'
              ? 'border-black dark:border-[#D4AF37] text-black dark:text-white bg-white dark:bg-[#1E1E1E]'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
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
              ? 'border-black dark:border-[#D4AF37] text-black dark:text-white bg-white dark:bg-[#1E1E1E]'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
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
              ? 'border-black dark:border-[#D4AF37] text-black dark:text-white bg-white dark:bg-[#1E1E1E]'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
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
              className={`bg-white dark:bg-[#1E1E1E] border rounded-sm p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                reward.isActive
                  ? 'border-[#EAE3D9] dark:border-[#2E2E2E]'
                  : 'border-gray-200 dark:border-[#2A2A2A] opacity-60 bg-gray-50 dark:bg-[#181818]'
              }`}
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#f3e5ab]" />

              <div>
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full">
                    <Coins className="w-3.5 h-3.5 text-[#D4AF37]" /> {reward.pointsCost} PTS
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                      reward.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60'
                        : 'bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-[#3E3E3E]'
                    }`}
                  >
                    {reward.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-white mb-1.5">
                  {reward.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4 line-clamp-2">
                  {reward.description || 'Voucher coupon generated upon points redemption.'}
                </p>

                <div className="bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] rounded p-3 text-sm space-y-1.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Discount:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {reward.discountType === 'PERCENTAGE' ? `-${reward.discountValue}%` : `-€${reward.discountValue.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Min. order:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {reward.minOrderValue > 0 ? `€${reward.minOrderValue.toFixed(2)}` : 'No minimum'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2E2E2E]">
                <button
                  type="button"
                  onClick={() => openEditModal(reward)}
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReward(reward.id, reward.title)}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 flex items-center gap-1.5 transition-colors"
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
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs overflow-hidden animate-fade-in transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2E2E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200">
                Customer Balances & Points Ledger
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Manually adjust customer points with an audit ledger reason.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#333333] bg-[#FAF8F5] dark:bg-[#252525] text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-200">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Points Balance</th>
                  <th className="py-3.5 px-6">Member Tier</th>
                  <th className="py-3.5 px-6">Orders & Coupons</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-50/80 dark:hover:bg-[#252525]/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-base text-[#1A1A1A] dark:text-white">{usr.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{usr.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 font-bold text-black dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-sm">
                        <Coins className="w-3.5 h-3.5 text-[#D4AF37]" /> {usr.points} PTS
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                        usr.points >= 1000
                          ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : usr.points >= 400
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-gray-100 text-gray-700 dark:bg-[#2A2A2A] dark:text-gray-300 border border-gray-200 dark:border-[#3E3E3E]'
                      }`}>
                        {usr.points >= 1000 ? 'Diamond VIP' : usr.points >= 400 ? 'Gold Member' : 'Silver Club'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 font-medium">
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
                        className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs font-bold uppercase tracking-wider rounded transition-colors"
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
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm p-6 space-y-6 max-w-2xl animate-fade-in transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white border-b border-gray-100 dark:border-[#2E2E2E] pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Loyalty Program Rate Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Points Rate Multiplier (Points earned per €1 spent)
              </label>
              <input
                type="number"
                min="1"
                value={pointsPerCurrency}
                onChange={(e) => setPointsPerCurrency(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                Default 10: An order of €100 earns 1,000 loyalty points for the customer.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                Welcome Bonus Points on Registration
              </label>
              <input
                type="number"
                min="0"
                value={signupBonus}
                onChange={(e) => setSignupBonus(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                Credited automatically to new customer accounts upon sign-up.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-[#2E2E2E]">
            <button
              type="button"
              onClick={() => {
                setSuccessMessage('Loyalty program parameters saved successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" /> Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT REWARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] shadow-2xl rounded-sm w-full max-w-lg overflow-hidden animate-fade-in transition-colors">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F5] dark:bg-[#252525] border-b border-[#EAE3D9] dark:border-[#2E2E2E] text-[#1A1A1A] dark:text-white">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-xl tracking-wider flex items-center gap-2 font-normal">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                {editingReward ? 'Edit Points Reward Coupon' : 'Create Points Reward Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                  Reward Title *
                </label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. 15% Off Entire Boutique Order"
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                  Customer Description
                </label>
                <textarea
                  rows={2}
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="e.g. Valid for 90 days across fine jewelry and extracted perfumes."
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                    Min. Cart (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rewardMinOrder}
                    onChange={(e) => setRewardMinOrder(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 30 (0 = no minimum)"
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={rewardActive}
                    onChange={(e) => setRewardActive(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:accent-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Reward available for customer points redemption</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E2E2E]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER POINTS */}
      {isAdjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] shadow-2xl rounded-sm w-full max-w-md overflow-hidden animate-fade-in transition-colors">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F5] dark:bg-[#252525] border-b border-[#EAE3D9] dark:border-[#2E2E2E] text-[#1A1A1A] dark:text-white">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-xl tracking-wider flex items-center gap-2 font-normal">
                <Coins className="w-5 h-5 text-[#D4AF37]" /> Adjust Customer Points
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserAdjustSubmit} className="p-6 space-y-4">
              <div className="bg-[#FAF8F5] dark:bg-[#252525] p-4 rounded-sm border border-[#EAE3D9] dark:border-[#333333] text-sm">
                <p className="font-bold text-base text-[#1A1A1A] dark:text-white">{selectedUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedUser.email}</p>
                <p className="text-sm text-[#1A1A1A] dark:text-gray-200 font-semibold mt-1.5">
                  Current Balance: <span className="text-[#D4AF37] font-bold">{selectedUser.points} PTS</span>
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                  Points Adjustment Amount (+ / -)
                </label>
                <input
                  type="number"
                  required
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. +100 or -50"
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded font-bold text-base focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                  Audit Ledger Reason Note
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. VIP loyalty bonus, compensation, etc."
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#3E3E3E] bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded text-base font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E2E2E]">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E5C158] text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Apply Adjustment
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
