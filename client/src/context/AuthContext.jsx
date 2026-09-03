import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext();

const CACHED_USER_KEY = 'novacart_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('novacart_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const cached = localStorage.getItem(CACHED_USER_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.token === token && parsed.role) {
          setUser({ ...parsed, token });
        }
      } catch {}
    }

    api.getProfile()
      .then((profile) => {
        const merged = { ...profile, token };
        setUser(merged);
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(merged));
      })
      .catch((err) => {
        const isAuth = err?.status === 401 || err?.status === 403 || 
          (err?.message && (err.message.includes('Not authorized') || err.message.includes('token failed')));
        if (isAuth) {
          localStorage.removeItem('novacart_token');
          localStorage.removeItem(CACHED_USER_KEY);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('novacart_token', data.token);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data));
    setUser({ ...data, token: data.token });
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('novacart_token', data.token);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data));
    const profile = await api.getProfile();
    setUser({ ...profile, token: data.token });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('novacart_token');
    localStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await api.getProfile();
    setUser((prev) => {
      const merged = { ...prev, ...profile };
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(merged));
      return merged;
    });
    return profile;
  };

  const toggleWishlist = async (productId) => {
    const data = await api.addToWishlist(productId);
    setUser((prev) => ({ ...prev, wishlist: data.wishlist }));
    return data;
  };

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return (user.permissions || []).includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((...perms) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return perms.some((p) => (user.permissions || []).includes(p));
  }, [user]);

  const isAdminRole = user?.role && user.role !== 'customer';
  const isAdmin = user?.isAdmin || (user?.role && user.role !== 'customer');

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshProfile, toggleWishlist,
      isAdmin,
      role: user?.role,
      permissions: user?.permissions || [],
      hasPermission,
      hasAnyPermission,
      isAdminRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};
