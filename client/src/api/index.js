const API_URL = window.location.hostname === 'localhost' ? '/api' : 'https://novacart-api-j9um.onrender.com/api';

const getToken = () => localStorage.getItem('novacart_token');

const getHeaders = (withAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || 'Something went wrong' };
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
};

export const api = {
  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${query}`);
    return handleResponse(res);
  },
  getProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(res);
  },
  getCategories: async () => {
    const res = await fetch(`${API_URL}/products/categories`);
    return handleResponse(res);
  },
  getFlashDeals: async () => {
    const res = await fetch(`${API_URL}/products/flash-deals`);
    return handleResponse(res);
  },
  createProduct: async (data) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateProduct: async (id, data) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  // User
  getProfile: async () => {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  addToWishlist: async (id) => {
    const res = await fetch(`${API_URL}/users/wishlist/${id}`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Orders
  createOrder: async (order) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(order),
    });
    return handleResponse(res);
  },
  getMyOrders: async () => {
    const res = await fetch(`${API_URL}/orders/myorders`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getOrderById: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Admin - Stats & Users
  getAdminStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getUserById: async (id) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  updateUser: async (id, data) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Admin - Orders
  getAllOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/orders?${query}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getOrderByIdAdmin: async (id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  cancelOrder: async (id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_URL}/admin/analytics`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Banners
  getBanners: async () => {
    const res = await fetch(`${API_URL}/banners`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getActiveBanners: async (position) => {
    const res = await fetch(`${API_URL}/banners/active/${position}`);
    return handleResponse(res);
  },
  createBanner: async (data) => {
    const res = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateBanner: async (id, data) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteBanner: async (id) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  reorderBanners: async (items) => {
    const res = await fetch(`${API_URL}/banners/reorder`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  // Categories (admin)
  getCategoriesTree: async () => {
    const res = await fetch(`${API_URL}/categories`);
    return handleResponse(res);
  },
  createCategory: async (data) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateCategory: async (id, data) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteCategory: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  reorderCategories: async (items) => {
    const res = await fetch(`${API_URL}/categories/reorder`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  // Navigation
  getNavigation: async () => {
    const res = await fetch(`${API_URL}/navigation`);
    return handleResponse(res);
  },
  createNavigation: async (data) => {
    const res = await fetch(`${API_URL}/navigation`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateNavigation: async (id, data) => {
    const res = await fetch(`${API_URL}/navigation/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteNavigation: async (id) => {
    const res = await fetch(`${API_URL}/navigation/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  reorderNavigation: async (items) => {
    const res = await fetch(`${API_URL}/navigation/reorder`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  // Promotions
  getPromotions: async () => {
    const res = await fetch(`${API_URL}/promotions`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  getActivePromotions: async () => {
    const res = await fetch(`${API_URL}/promotions/active`);
    return handleResponse(res);
  },
  createPromotion: async (data) => {
    const res = await fetch(`${API_URL}/promotions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updatePromotion: async (id, data) => {
    const res = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deletePromotion: async (id) => {
    const res = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  validatePromotion: async (code, cartTotal) => {
    const res = await fetch(`${API_URL}/promotions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal }),
    });
    return handleResponse(res);
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_URL}/settings`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
  updateSettings: async (section, data) => {
    const res = await fetch(`${API_URL}/settings/${section}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
