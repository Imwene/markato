import { CONFIG } from '../config/config';

const api = {
  fetch: async (endpoint, options = {}) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const headers = {
        'Content-Type': 'application/json',
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        ...options.headers,
      };

      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get: (endpoint) => {
    return api.fetch(endpoint, { method: 'GET' });
  },

  post: (endpoint, data) => {
    return api.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put: (endpoint, data) => {
    return api.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: (endpoint) => {
    return api.fetch(endpoint, { method: 'DELETE' });
  }
};

export default api;