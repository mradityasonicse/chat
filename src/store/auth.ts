import { create } from 'zustand';
import { User, Profile, AuthResponse } from '@/types';

interface AuthStore {
  token: string | null;
  user: (User & { profile?: Profile }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  setAuth: (response: AuthResponse) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data: AuthResponse = await response.json();
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true
      });

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(data));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data: AuthResponse = await response.json();
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true
      });

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(data));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  },

  setAuth: (response: AuthResponse) => {
    set({
      token: response.token,
      user: response.user,
      isAuthenticated: true
    });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true
        });
      } catch (error) {
        console.error('Failed to load auth from storage:', error);
      }
    }
  }
}));
