import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User, UserProfile } from '@/types/user';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: !!user }),

        setProfile: (profile) => set({ profile }),

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login({ email, password });
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            set({ error: message, isLoading: false, isAuthenticated: false });
            throw err;
          }
        },

        register: async (email, password, name) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register({ email, password, name });
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            set({ error: message, isLoading: false, isAuthenticated: false });
            throw err;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authService.logout();
          } finally {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        fetchProfile: async () => {
          if (!get().isAuthenticated) return;
          try {
            const profile = await authService.getProfile();
            set({ profile, user: profile });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch profile';
            set({ error: message });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
