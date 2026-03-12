import { createContext } from 'react';
import type { Product } from '../types';

export interface FavoritesContextType {
  items: Product[];
  totalItems: number;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null);
