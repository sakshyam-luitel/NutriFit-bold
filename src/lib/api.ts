/**
 * Django API Client for NutriFit
 * Handles all HTTP requests to the Django backend with JWT authentication
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register/', {
      email,
      password,
      password2: password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/profiles/me/');
    return response.data;
  },
};

// Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profiles/me/');
    return response.data;
  },

  createProfile: async (data: any) => {
    const response = await api.post('/profiles/', data);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/profiles/me/', data);
    return response.data;
  },
};

// Medical Conditions APIs
export const medicalConditionsAPI = {
  list: async () => {
    const response = await api.get('/medical-conditions/');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/medical-conditions/', data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/medical-conditions/${id}/`);
  },
};

// Preferences APIs
export const preferencesAPI = {
  get: async () => {
    const response = await api.get('/preferences/');
    return response.data;
  },

  update: async (data: any) => {
    const response = await api.patch('/preferences/', data);
    return response.data;
  },
};

// Diet Goals APIs
export const dietGoalsAPI = {
  list: async () => {
    const response = await api.get('/diet-goals/');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/diet-goals/', data);
    return response.data;
  },
};

// Diet Plans APIs
export const dietPlansAPI = {
  list: async () => {
    const response = await api.get('/diet-plans/');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/diet-plans/${id}/`);
    return response.data;
  },

  generate: async (data: any) => {
    const response = await api.post('/diet-plans/generate/', data);
    return response.data;
  },

  generateFromNL: async (input: string) => {
    const response = await api.post('/diet-plans/generate-from-nl/', { input });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/diet-plans/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/diet-plans/${id}/`);
  },
};

// AI Services APIs
export const aiAPI = {
  parseNaturalLanguage: async (input: string) => {
    const response = await api.post('/ai/parse-natural-language/', { input });
    return response.data;
  },
};

// Ingredients APIs
export const ingredientsAPI = {
  list: async (params?: { search?: string; category?: string }) => {
    const response = await api.get('/ingredients/', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/ingredients/${id}/`);
    return response.data;
  },
};

export default api;
