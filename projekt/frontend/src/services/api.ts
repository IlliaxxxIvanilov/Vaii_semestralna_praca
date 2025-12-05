import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export default api;

// Attach token automatically from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('api_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
