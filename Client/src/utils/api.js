import {CONFIG} from "../config/config.js";

const api = {
  fetch: async (endpoint, options = {}) => {
    try {
      let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Only add authentication if it's not a public endpoint
      if (!options.public) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) {
          throw new Error('No authentication token available');
        }
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && !options.public) {
        localStorage.removeItem('user');
        throw new Error('Authentication token invalid');
      }

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

  get: (endpoint, options = {}) => {
    return api.fetch(endpoint, { method: 'GET', ...options });
  },

  post: (endpoint, data, options = {}) => {
    return api.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  put: (endpoint, data, options = {}) => {
    return api.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete: (endpoint, options = {}) => {
    return api.fetch(endpoint, { method: 'DELETE', ...options });
  },
};

export default api;