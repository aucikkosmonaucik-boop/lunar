import React, { useState, useCallback } from 'react';
import type { Product } from '../types';
import { FavoritesContext } from './FavoritesContext';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addToFavorites = useCallback((product: Product) => {
    setItems(prev => prev.some(p => p.id === product.id) ? prev : [...prev, product]);
  }, []);

  const removeFromFavorites = useCallback((productId: string) => {
    setItems(prev => prev.filter(p => p.id !== productId));
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    setItems(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => items.some(p => p.id === productId),
    [items]
  );

  return (
    <FavoritesContext.Provider value={{
      items,
      totalItems: items.length,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
