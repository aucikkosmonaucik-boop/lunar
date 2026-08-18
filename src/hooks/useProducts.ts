import { useContext } from 'react';
import { ProductsContext, type ProductsContextType } from '../context/ProductsContext';

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
