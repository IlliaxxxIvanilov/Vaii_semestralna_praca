import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveAuth } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: any = {};
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
      const data = await login({ email, password });
      saveAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || 'Login failed' });
    } finally { setLoading(false); }
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
