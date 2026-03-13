import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
