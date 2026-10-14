// API client utility for HTTP requests to Express backend

const BASE_URL = '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('inventory_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If 401 Unauthorized, notify or handle logout
      if (response.status === 401) {
        if (localStorage.getItem('inventory_token')) {
          localStorage.removeItem('inventory_token');
          localStorage.removeItem('inventory_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  // Auth endpoints
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),

  register: (userData) =>
    apiRequest('/auth/register', { method: 'POST', body: userData }),

  getMe: () =>
    apiRequest('/auth/me', { method: 'GET' }),

  // Product endpoints
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/products${queryString}`, { method: 'GET' });
  },

  getProductStats: () =>
    apiRequest('/products/stats', { method: 'GET' }),

  getProductById: (id) =>
    apiRequest(`/products/${id}`, { method: 'GET' }),

  createProduct: (productData) =>
    apiRequest('/products', { method: 'POST', body: productData }),

  updateProduct: (id, productData) =>
    apiRequest(`/products/${id}`, { method: 'PUT', body: productData }),

  deleteProduct: (id) =>
    apiRequest(`/products/${id}`, { method: 'DELETE' }),
};
