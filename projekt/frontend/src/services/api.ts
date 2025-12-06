import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',   // ← /api musí byť!
  withCredentials: true,                  // ← nutné pre cookies
});

// Toto je najdôležitejšie – automaticky pridá X-XSRF-TOKEN header
api.defaults.withXSRFToken = true;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('api_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// CSRF cookie – volá sa na http://localhost:8000/sanctum/csrf-cookie (bez /api!)
export const getCsrfCookie = () => {
  return axios.get('http://localhost:8000/sanctum/csrf-cookie', {
    withCredentials: true,
  });
};