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
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
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
  register: async (email, password) => {
    const response = await api.post('/auth/register/', { email, password, password2: password });
    return response.data;
  },
  login: async (email, password) => {
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
  getProfile: async () => (await api.get('/profiles/me/')).data,
  createProfile: async (data) => (await api.post('/profiles/', data)).data,
  updateProfile: async (data) => (await api.patch('/profiles/me/', data)).data,
};

// Medical Conditions APIs
export const medicalConditionsAPI = {
  list: async () => (await api.get('/medical-conditions/')).data,
  create: async (data) => (await api.post('/medical-conditions/', data)).data,
  delete: async (id) => api.delete(`/medical-conditions/${id}/`),
};

// Preferences APIs
export const preferencesAPI = {
  get: async () => (await api.get('/preferences/')).data,
  update: async (data) => (await api.patch('/preferences/', data)).data,
};

// Diet Goals APIs
export const dietGoalsAPI = {
  list: async () => (await api.get('/diet-goals/')).data,
  create: async (data) => (await api.post('/diet-goals/', data)).data,
};

// Diet Plans APIs
export const dietPlansAPI = {
  list: async () => (await api.get('/diet-plans/')).data,
  get: async (id) => (await api.get(`/diet-plans/${id}/`)).data,
  generate: async (data) => (await api.post('/diet-plans/generate/', data)).data,
  generateFromNL: async (input) => (await api.post('/diet-plans/generate-from-nl/', { input })).data,
  update: async (id, data) => (await api.patch(`/diet-plans/${id}/`, data)).data,
  delete: async (id) => api.delete(`/diet-plans/${id}/`),
};

// AI Services APIs
export const aiAPI = {
  parseNaturalLanguage: async (input) => (await api.post('/ai/parse-natural-language/', { input })).data,
};

// Ingredients APIs
export const ingredientsAPI = {
  list: async (params) => (await api.get('/ingredients/', { params })).data,
  get: async (id) => (await api.get(`/ingredients/${id}/`)).data,
};

export default api;
