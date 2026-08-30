import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('novacart_token');
    if (token) {
      api.getProfile()
        .then((profile) => { setUser({ ...profile, token }); })
        .catch(() => {
          localStorage.removeItem('novacart_token');
          localStorage.removeItem('novacart_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('novacart_token', data.token);
    localStorage.setItem('novacart_user', JSON.stringify(data));
    setUser({ ...data, token: data.token });
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('novacart_token', data.token);
    localStorage.setItem('novacart_user', JSON.stringify(data));
    const profile = await api.getProfile();
    setUser({ ...profile, token: data.token });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('novacart_token');
    localStorage.removeItem('novacart_user');
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await api.getProfile();
    setUser((prev) => ({ ...prev, ...profile }));
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

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshProfile, toggleWishlist,
      isAdmin: user?.isAdmin,
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
