import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { setAuthToken } from '../api/client';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { getMe } from '../api/users';
import { decodeJwtPayload } from '../utils/jwt';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const accessCodes = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user.accessCodes)) return user.accessCodes;
    return [];
  }, [user]);

  const hasAccess = useCallback(
    (code) => {
      if (!code) return false;
      if (user?.isSuperAdmin) return true;
      return accessCodes.includes(code);
    },
    [user?.isSuperAdmin, accessCodes]
  );

  const loadUser = useCallback(async () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const payload = decodeJwtPayload(token);
    if (!payload?.sub) {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      const u = await getMe();
      setUser(u);
      return data;
    } catch {
      // Do not trust login response for auth state. If /users/me fails, treat login as failed.
      setAuthToken(null);
      setUser(null);
      throw new Error('Login failed. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isSuperAdmin: Boolean(user?.isSuperAdmin),
    accessCodes,
    hasAccess,
    login,
    logout,
    refreshUser: loadUser,
  }), [user, loading, login, logout, loadUser, accessCodes, hasAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
