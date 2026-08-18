import { useContext } from 'react';
import { LoyaltyContext, type LoyaltyContextType } from '../context/LoyaltyContext';

export const useLoyalty = (): LoyaltyContextType => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
