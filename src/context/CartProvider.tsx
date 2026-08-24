import React, { useState, useCallback } from 'react';
import type { Product, CartItem } from '../types';
import { CartContext } from './CartContext';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]); // Using any temporarily or should import types

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const isSoldOut = (product.stock !== undefined && product.stock <= 0) || product.badge === 'SOLD OUT' || product.isAvailable === false;
    if (isSoldOut || quantity <= 0) return;

    setItems(prev => {
      const maxStock = product.stock > 0 ? product.stock : 999;
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, maxStock) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, maxStock) }];
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

  const clearCart = useCallback(() => setItems([]), []);

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
