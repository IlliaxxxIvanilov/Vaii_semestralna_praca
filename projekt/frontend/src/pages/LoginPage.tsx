import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveAuth } from '../services/authService';
import { getCsrfCookie } from '../services/api';   // ←←←← TOTO PRIDAJ!

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await getCsrfCookie();
      const data = await login({ email, password });
      saveAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (error) {
      // 100 % bezpečný catch bez "any"
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
        const msg = axiosError.response?.data?.message
                 || axiosError.response?.data?.errors
                 || 'Login failed';
        setErrors({ form: typeof msg === 'string' ? msg : JSON.stringify(msg) });
      } else {
        setErrors({ form: 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          {errors.form && <div className="error">{errors.form}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
