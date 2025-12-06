import api from './api';
// TYPY – žiadne "any" nikde
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};


export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthResponse> => {
  const res = await api.post('/register', payload);
  return res.data;   // ← toto je kľúčové
};

export const login = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post('/login', payload);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post('/logout');
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
  }
  localStorage.removeItem('api_token');
  localStorage.removeItem('user');
};

export const saveAuth = (user: unknown, token: string) => {
  localStorage.setItem('api_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};
