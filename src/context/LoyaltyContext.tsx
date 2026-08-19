import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LoyaltyReward, UserCoupon, LoyaltyHistoryItem } from '../types';
import { useAuth } from '../hooks/useAuth';

export interface LoyaltyTier {
  name: string;
  badge: string;
  color: string;
  minPoints: number;
  nextTierPoints: number;
  progress: number;
  multiplier: number;
}

export interface LoyaltyContextType {
  loyaltyPoints: number;
  tier: LoyaltyTier;
  rewards: LoyaltyReward[];
  userCoupons: UserCoupon[];
  history: LoyaltyHistoryItem[];
  loading: boolean;
  pointsRate: number; // e.g. 10 points per 1 EUR/PLN
  redeemReward: (rewardId: string) => Promise<{ success: boolean; coupon?: UserCoupon; message: string }>;
  calculatePointsToEarn: (orderAmount: number) => number;
  refreshLoyaltyData: () => Promise<void>;
  applyUserCoupon: (couponCode: string) => UserCoupon | undefined;
  adminAdjustPoints: (targetUserId: string, points: number, reason: string) => Promise<boolean>;
  adminSaveReward: (reward: Partial<LoyaltyReward>) => Promise<boolean>;
  adminDeleteReward: (rewardId: string) => Promise<boolean>;
}

export const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

const LOCAL_COUPONS_KEY = 'lunar_local_user_coupons_v3';
const LOCAL_HISTORY_KEY = 'lunar_local_points_history_v3';
const LOCAL_REWARDS_KEY = 'lunar_local_rewards_catalog_v3';

const INITIAL_REWARDS: LoyaltyReward[] = [
  {
    id: 'reward-1',
    title: '€2.50 Discount Voucher',
    description: 'Discount on any fine jewelry or perfume order.',
    pointsCost: 100,
    discountType: 'FIXED',
    discountValue: 2.5,
    minOrderValue: 20,
    isActive: true,
  },
  {
    id: 'reward-2',
    title: '10% Off Entire Order',
    description: '10% discount on your entire cart with no order limit.',
    pointsCost: 200,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 30,
    isActive: true,
  },
  {
    id: 'reward-3',
    title: 'VIP €6.00 Gift Voucher',
    description: 'Exclusive luxury discount for loyal Club patrons.',
    pointsCost: 350,
    discountType: 'FIXED',
    discountValue: 6.0,
    minOrderValue: 40,
    isActive: true,
  },
  {
    id: 'reward-4',
    title: 'Golden 20% Off Privilege',
    description: 'Maximum 20% discount across the entire Lunar collection.',
    pointsCost: 500,
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 50,
    isActive: true,
  },
];

export const LoyaltyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(user?.loyaltyPoints || 150); // Default friendly demo balance
  const [rewards, setRewards] = useState<LoyaltyReward[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_REWARDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REWARDS;
  });
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COUPONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'hist-welcome',
        userId: user?.id || 'demo-user',
        points: 150,
        type: 'SIGNUP_BONUS',
        description: 'LUNAR Club Welcome Bonus Points',
        createdAt: new Date().toISOString(),
      },
    ];
  });
  const [loading, setLoading] = useState(false);
  const pointsRate = 10; // 10 points per 1 EUR / PLN spent

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REWARDS_KEY, JSON.stringify(rewards));
      localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(userCoupons));
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Loyalty localStorage sync error:', e);
    }
  }, [rewards, userCoupons, history]);

  // Sync with Auth User
  useEffect(() => {
    if (user && user.loyaltyPoints !== undefined) {
      setPoints(user.loyaltyPoints);
    }
  }, [user]);

  // Fetch from API
  const refreshLoyaltyData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch rewards catalog
      const resRewards = await fetch('/api/loyalty/rewards');
      if (resRewards.ok) {
        const data = await resRewards.json();
        if (data.rewards && data.rewards.length > 0) {
          setRewards(data.rewards);
        }
      }

      // 2. Fetch user profile if logged in
      if (user) {
        const resUser = await fetch('/api/loyalty/user');
        if (resUser.ok) {
          const userData = await resUser.json();
          if (userData.loyaltyPoints !== undefined) setPoints(userData.loyaltyPoints);
          if (userData.coupons) setUserCoupons(userData.coupons);
          if (userData.history && userData.history.length > 0) setHistory(userData.history);
        }
      }
    } catch (e) {
      console.warn('Could not sync loyalty data with backend:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLoyaltyData();
  }, [refreshLoyaltyData]);

  // Tier calculation
  const calculateTier = (pts: number): LoyaltyTier => {
    if (pts >= 1000) {
      return {
        name: 'Diamond VIP',
        badge: 'DIAMOND',
        color: '#d4af37',
        minPoints: 1000,
        nextTierPoints: 2000,
        progress: Math.min(100, Math.round(((pts - 1000) / 1000) * 100)),
        multiplier: 2.0,
      };
    }
    if (pts >= 400) {
      return {
        name: 'Gold Member',
        badge: 'GOLD',
        color: '#c5a059',
        minPoints: 400,
        nextTierPoints: 1000,
        progress: Math.min(100, Math.round(((pts - 400) / 600) * 100)),
        multiplier: 1.5,
      };
    }
    return {
      name: 'Silver Club',
      badge: 'SILVER',
      color: '#94a3b8',
      minPoints: 0,
      nextTierPoints: 400,
      progress: Math.min(100, Math.round((pts / 400) * 100)),
      multiplier: 1.0,
    };
  };

  const tier = calculateTier(points);

  const calculatePointsToEarn = (orderAmount: number): number => {
    return Math.max(10, Math.floor(orderAmount * pointsRate * tier.multiplier));
  };

  // Customer Redeem points for coupon
  const redeemReward = async (rewardId: string): Promise<{ success: boolean; coupon?: UserCoupon; message: string }> => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Selected reward was not found' };
    }

    if (points < reward.pointsCost) {
      return {
        success: false,
        message: `Insufficient points. You currently have ${points} pts, while ${reward.pointsCost} pts are required.`,
      };
    }

    // Try backend API first
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.coupon) {
          setPoints(data.remainingPoints !== undefined ? data.remainingPoints : points - reward.pointsCost);
          setUserCoupons(prev => [data.coupon, ...prev]);
          setHistory(prev => [
            {
              id: `hist-${Date.now()}`,
              userId: user?.id || 'demo-user',
              points: -reward.pointsCost,
              type: 'REDEEM',
              description: `Redeemed points for: ${reward.title} (Code: ${data.coupon.code})`,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
          return { success: true, coupon: data.coupon, message: 'Reward coupon generated successfully!' };
        }
      }
    } catch (e) {
      console.warn('Backend redeem failed, fallback to local redeem:', e);
    }

    // Local / Offline fallback execution
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `LUNAR-${reward.discountType === 'PERCENTAGE' ? `${reward.discountValue}PCT` : `${reward.discountValue}EUR`}-${randomSuffix}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const newCoupon: UserCoupon = {
      id: `coupon-${Date.now()}`,
      userId: user?.id || 'demo-user',
      rewardId: reward.id,
      code,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      minOrderValue: reward.minOrderValue,
      isUsed: false,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    setPoints(prev => Math.max(0, prev - reward.pointsCost));
    setUserCoupons(prev => [newCoupon, ...prev]);
    setHistory(prev => [
      {
        id: `hist-${Date.now()}`,
        userId: user?.id || 'demo-user',
        points: -reward.pointsCost,
        type: 'REDEEM',
        description: `Redeemed points for: ${reward.title} (Code: ${code})`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      coupon: newCoupon,
      message: 'Reward coupon generated successfully!',
    };
  };

  const applyUserCoupon = (couponCode: string): UserCoupon | undefined => {
    return userCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && !c.isUsed);
  };

  // Admin adjustments
  const adminAdjustPoints = async (targetUserId: string, diff: number, reason: string): Promise<boolean> => {
    try {
      await fetch('/api/loyalty/admin-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, points: diff, reason }),
      });
    } catch (e) {
      console.warn('Admin adjust API error:', e);
    }

    if (user && user.id === targetUserId) {
      setPoints(prev => Math.max(0, prev + diff));
      setHistory(prev => [
        {
          id: `hist-${Date.now()}`,
          userId: targetUserId,
          points: diff,
          type: 'ADMIN_ADJUST',
          description: reason || `Korekta administratora: ${diff > 0 ? `+${diff}` : diff} pkt`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return true;
  };

  const adminSaveReward = async (rewardData: Partial<LoyaltyReward>): Promise<boolean> => {
    if (rewardData.id) {
      // Update
      setRewards(prev => prev.map(r => r.id === rewardData.id ? { ...r, ...rewardData } as LoyaltyReward : r));
    } else {
      // Create
      const newReward: LoyaltyReward = {
        id: `reward-${Date.now()}`,
        title: rewardData.title || 'New Voucher Reward',
        description: rewardData.description || '',
        pointsCost: Number(rewardData.pointsCost || 100),
        discountType: rewardData.discountType || 'FIXED',
        discountValue: Number(rewardData.discountValue || 10),
        minOrderValue: Number(rewardData.minOrderValue || 0),
        isActive: rewardData.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      setRewards(prev => [...prev, newReward]);
    }

    try {
      await fetch('/api/loyalty/admin-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData),
      });
    } catch (e) {
      console.warn('Admin reward API error:', e);
    }

    return true;
  };

  const adminDeleteReward = async (rewardId: string): Promise<boolean> => {
    setRewards(prev => prev.filter(r => r.id !== rewardId));
    try {
      await fetch('/api/loyalty/admin-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rewardId, _action: 'delete' }),
      });
    } catch (e) {
      console.warn('Admin delete reward API error:', e);
    }
    return true;
  };

  return (
    <LoyaltyContext.Provider
      value={{
        loyaltyPoints: points,
        tier,
        rewards,
        userCoupons,
        history,
        loading,
        pointsRate,
        redeemReward,
        calculatePointsToEarn,
        refreshLoyaltyData,
        applyUserCoupon,
        adminAdjustPoints,
        adminSaveReward,
        adminDeleteReward,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};
