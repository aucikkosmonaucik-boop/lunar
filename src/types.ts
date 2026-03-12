export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
