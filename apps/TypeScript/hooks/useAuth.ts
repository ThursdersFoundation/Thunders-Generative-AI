'use client';

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';

export function useAuth() {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    fetchProfile,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [isAuthenticated, profile, fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await storeLogin(email, password);
      } catch (err) {
        throw err;
      }
    },
    [storeLogin],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        await storeRegister(email, password, name);
      } catch (err) {
        throw err;
      }
    },
    [storeRegister],
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  const checkAuth = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    checkAuth,
    clearError,
  };
}
