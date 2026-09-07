import React, { useState, useCallback, useEffect } from 'react';
import type { Product, CartItem } from '../types';
import { CartContext } from './CartContext';

const CART_STORAGE_KEY = 'lunar_cart_items';

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (i): i is CartItem =>
          i &&
          typeof i === 'object' &&
          i.product &&
          typeof i.product.id === 'string' &&
          typeof i.quantity === 'number' &&
          i.quantity > 0
      );
    }
  } catch (err) {
    console.warn('Failed to parse cart from localStorage:', err);
  }
  return [];
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Save to localStorage on any cart modification
  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  // Synchronize cart across different tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setItems(loadCartFromStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, selectedOptions?: string) => {
    const isSoldOut =
      (product.stock !== undefined && product.stock <= 0) ||
      product.badge === 'SOLD OUT' ||
      product.isAvailable === false;
    if (isSoldOut || quantity <= 0) return;

    setItems(prev => {
      const maxStock = product.stock > 0 ? product.stock : 999;
      const existingIndex = prev.findIndex(
        i => i.product.id === product.id && i.selectedOptions === selectedOptions
      );

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxStock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, maxStock), selectedOptions }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.product.id !== productId) return i;
        const maxStock = i.product.stock > 0 ? i.product.stock : 999;
        return { ...i, quantity: Math.min(quantity, maxStock) };
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear cart storage:', err);
    }
  }, []);

  const isInCart = useCallback((productId: string) =>
    items.some(i => i.product.id === productId), [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      addToCart, removeFromCart, updateQuantity, clearCart, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
