export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  categorySlug?: string;
  subcategory?: string;
  badge?: string; // "NEW" | "BESTSELLER" | "SALE" | "READY TO SHIP" | "SOLD OUT" | "GIFT SET" | "BRIDAL" | custom
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  features: string[];
  isAvailable?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface LoyaltyReward {
  id: string;
  title: string;
  description?: string;
  pointsCost: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  createdAt?: string;
}

export interface UserCoupon {
  id: string;
  userId: string;
  rewardId?: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  isUsed: boolean;
  usedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface LoyaltyHistoryItem {
  id: string;
  userId: string;
  points: number; // + or -
  type: 'PURCHASE' | 'REDEEM' | 'ADMIN_ADJUST' | 'SIGNUP_BONUS';
  description: string;
  orderId?: string | null;
  createdAt: string;
}

export interface PromoCodeItem {
  id?: string;
  code: string;
  discountPct: number;
  discountAmount?: number | null;
  minOrderValue: number;
  isActive: boolean;
  expiresAt?: string | null;
  usageCount?: number;
  maxUses?: number | null;
  createdAt?: string;
}
