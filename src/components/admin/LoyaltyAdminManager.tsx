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
  const [rewardValue, setRewardValue] = useState<number | ''>(2.5);
  const [rewardMinOrder, setRewardMinOrder] = useState<number | ''>(20);
  const [rewardActive, setRewardActive] = useState(true);

  // User Adjust State
  const [usersList, setUsersList] = useState<DemoUserRecord[]>([
    { id: 'usr-1', name: 'Karolina Kowalska', email: 'karolina.k@example.com', points: 450, ordersCount: 5, couponsCount: 3 },
    { id: 'usr-2', name: 'Piotr Nowak', email: 'piotr.nowak@example.com', points: 280, ordersCount: 2, couponsCount: 1 },
    { id: 'usr-3', name: 'Anna Wiśniewska', email: 'anna.wisniewska@example.com', points: 1250, ordersCount: 12, couponsCount: 6 },
    { id: 'usr-4', name: 'Marek Wójcik', email: 'marek.wojcik@example.com', points: 90, ordersCount: 1, couponsCount: 0 },
  ]);

  const [selectedUser, setSelectedUser] = useState<DemoUserRecord | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number | ''>(50);
  const [adjustReason, setAdjustReason] = useState('Premia za aktywność / konkurs');
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
    setRewardMinOrder(25);
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
      setErrorMessage('Tytuł nagrody jest wymagany');
      return;
    }

    if (rewardCost === '' || Number(rewardCost) <= 0) {
      setErrorMessage('Koszt punktowy musi być większy od 0');
      return;
    }

    if (rewardValue === '' || Number(rewardValue) <= 0) {
      setErrorMessage('Wartość zniżki musi być większa od 0');
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
    setSuccessMessage(`Kupon nagrodowy "${rewardTitle}" został zapisany!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteReward = async (id: string, title: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć nagrodę "${title}"?`)) return;
    await adminDeleteReward(id);
    setSuccessMessage(`Nagroda została usunięta.`);
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
    setSuccessMessage(`Zaktualizowano punkty dla użytkownika ${selectedUser.name} (${diff > 0 ? `+${diff}` : diff} pkt)!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI */}
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#1a1a1a] to-[#262626] text-white p-6 rounded-lg shadow-lg border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-1">
            <Coins className="w-4 h-4" /> LUNAR Club • Program Lojalnościowy
          </div>
          <h2 className="text-2xl font-serif tracking-wider">
            Zarządzanie Punktami za Zakupy i Sklepem Kuponów
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Klienci zdobywają punkty za każde zakupy ({pointsPerCurrency} pkt za 1€/PLN), a następnie wymieniają je na unikalne kupony rabatowe.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#c5a059] transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Nowy Kupon za Punkty</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Subtabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-lg">
        <button
          type="button"
          onClick={() => setActiveSubtab('rewards')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'rewards'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Award className="w-4 h-4 text-[#d4af37]" />
          1. Katalog Nagród & Kuponów ({rewards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubtab('users')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'users'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" />
          2. Salda Klientów & Korekta Punktów
        </button>
        <button
          type="button"
          onClick={() => setActiveSubtab('settings')}
          className={`py-3.5 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubtab === 'settings'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          3. Zasady Programu & Mnożniki
        </button>
      </div>

      {/* SUBTAB 1: REWARDS CATALOG */}
      {activeSubtab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                reward.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#c5a059]" />

              <div>
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full">
                    <Coins className="w-3 h-3 text-[#d4af37]" /> {reward.pointsCost} PKT
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      reward.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {reward.isActive ? 'Aktywny' : 'Wyłączony'}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-black mb-1">
                  {reward.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {reward.description || 'Kupon rabatowy generowany automatycznie po wymianie punktów.'}
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded p-2.5 text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Wartość rabatu:</span>
                    <span className="font-bold text-green-700">
                      {reward.discountType === 'PERCENTAGE' ? `-${reward.discountValue}%` : `-${reward.discountValue.toFixed(2)}€`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min. koszyk:</span>
                    <span className="font-medium text-gray-800">
                      {reward.minOrderValue > 0 ? `${reward.minOrderValue.toFixed(2)}€` : 'Brak limitu'}
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
                  <Edit2 className="w-3.5 h-3.5" /> Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReward(reward.id, reward.title)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: USERS POINTS & ADJUSTMENTS */}
      {activeSubtab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                Konta Klientów & Salda Punktowe
              </h3>
              <p className="text-xs text-gray-400">
                Możesz ręcznie korygować punkty lojalnościowe z notatką audytową.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-600">
                  <th className="py-3.5 px-6">Klient</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Saldo Punktów</th>
                  <th className="py-3.5 px-6">Poziom Klienta</th>
                  <th className="py-3.5 px-6">Zamówienia</th>
                  <th className="py-3.5 px-6 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-black">{usr.name}</td>
                    <td className="py-4 px-6 text-gray-600">{usr.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 font-bold text-black bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs">
                        <Coins className="w-3.5 h-3.5 text-[#d4af37]" /> {usr.points} PKT
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
                      {usr.ordersCount} zam. ({usr.couponsCount} kuponów)
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(usr);
                          setAdjustPointsValue(50);
                          setAdjustReason('Bonus lojalnościowy');
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#0d0d0d] text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                      >
                        ± Koryguj Punkty
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl animate-fade-in">
          <h3 className="text-sm uppercase tracking-widest font-bold text-black border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" /> Parametry Programu Punktowego
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Mnożnik punktów za wydaną kwotę (Punkty / 1€ lub 1 PLN)
              </label>
              <input
                type="number"
                min="1"
                value={pointsPerCurrency}
                onChange={(e) => setPointsPerCurrency(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Przy wartości 10: Za zamówienie o wartości 100€ klient otrzymuje 1000 punktów.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                Punkty powitalne za rejestrację konta
              </label>
              <input
                type="number"
                min="0"
                value={signupBonus}
                onChange={(e) => setSignupBonus(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Przyznawane automatycznie po utworzeniu konta użytkownika.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setSuccessMessage('Zasady programu lojalnościowego zostały zapisane!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-6 py-2.5 bg-[#0d0d0d] text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-800 transition-all flex items-center gap-2 shadow"
            >
              <Check className="w-4 h-4 text-[#d4af37]" /> Zapisz Konfigurację
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT REWARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] text-white">
              <h3 className="font-serif text-base tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d4af37]" />
                {editingReward ? 'Edytuj Kupon za Punkty' : 'Nowy Kupon do Sklepu Punktowego'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Tytuł Kuponu *
                </label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="np. Zniżka 15% na całe zakupy"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Opis dla Klienta
                </label>
                <textarea
                  rows={2}
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="np. Ważny na całą biżuterię i perfumy przez 90 dni od wymiany."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Koszt w Punktach (PKT) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="np. 200"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Typ Zniżki
                  </label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="PERCENTAGE">Procentowa (%)</option>
                    <option value="FIXED">Kwotowa (€ / PLN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Wartość Zniżki *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="np. 15"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-sm focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                    Min. Koszyk (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rewardMinOrder}
                    onChange={(e) => setRewardMinOrder(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="np. 30 (0 = brak)"
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
                  <span>Nagroda dostępna do zakupu dla klientów</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0d0d0d] text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-800 transition-all flex items-center gap-2 shadow"
                >
                  <Check className="w-4 h-4 text-[#d4af37]" /> Zapisz Nagrodę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER POINTS */}
      {isAdjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] text-white">
              <h3 className="font-serif text-base tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#d4af37]" /> Korekta Punktów Klienta
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserAdjustSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                <p className="font-bold text-black">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                <p className="text-xs text-black font-semibold mt-1">
                  Aktualne saldo: <span className="text-[#d4af37] font-bold">{selectedUser.points} pkt</span>
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Liczba Punktów do Dodania / Odjęcia (+/-)
                </label>
                <input
                  type="number"
                  required
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="np. +100 lub -50"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded font-bold text-base focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">
                  Uzasadnienie / Notatka Audytowa
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="np. Bonus za recenzję, Rekompensata itp."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0d0d0d] text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-800 transition-all flex items-center gap-2 shadow"
                >
                  <Check className="w-4 h-4 text-[#d4af37]" /> Zastosuj Korektę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
