import api from './api';

export const register = async (payload: { name: string; email: string; password: string; password_confirmation: string; role?: string }) => {
  const res = await api.post('/register', payload);
  return res.data;
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await api.post('/login', payload);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post('/logout');
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('api_token');
  localStorage.removeItem('user');
};

export const saveAuth = (user: any, token: string) => {
  localStorage.setItem('api_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};
