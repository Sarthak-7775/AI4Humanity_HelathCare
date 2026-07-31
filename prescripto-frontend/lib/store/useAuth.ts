import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar_url?: string | null;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'prescripto-auth',
    }
  )
);
