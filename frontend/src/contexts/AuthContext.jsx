import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { setAuthToken } from '../api/client';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { getMe } from '../api/users';
import { decodeJwtPayload } from '../utils/jwt';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const AuthContext = createContext(null);

function getPermissionNames(user) {
  if (!user) return [];
  if (Array.isArray(user.permissionNames)) return user.permissionNames;
  if (!user.userPermissions) return [];
  return user.userPermissions.map((up) => up.permission?.name).filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const permissionNames = useMemo(() => getPermissionNames(user), [user]);

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return false;
      if (user?.isSuperAdmin) return true;
      return permissionNames.includes(permission);
    },
    [user?.isSuperAdmin, permissionNames]
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

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email, password) => {
      const data = await apiLogin(email, password);
      // Refresh user from /users/me so we have full permissionNames (direct + from groups)
      try {
        const u = await getMe();
        setUser(u);
      } catch {
        setUser(data.user ?? null);
      }
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const setUserFromLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isSuperAdmin: Boolean(user?.isSuperAdmin),
    permissionNames,
    hasPermission,
    login,
    logout,
    setUserFromLogin,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
