import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as doRegister, saveAuth } from '../services/authService';
import { getCsrfCookie } from '../services/api';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    if (password !== passwordConfirm) e.passwordConfirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);

  try {
    // 1. Najprv získaj CSRF cookie
    await getCsrfCookie();

    // 2. Potom pošli registráciu
    const payload = {
      name,
      email,
      password,
      password_confirmation: passwordConfirm,   // ← presne takto!
    };

    const data = await doRegister(payload);
    saveAuth(data.user, data.token);
    navigate('/dashboard');
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
        const msg = axiosError.response?.data?.message
                 || axiosError.response?.data?.errors
                 || 'Register failed';
        setErrors({ form: typeof msg === 'string' ? msg : JSON.stringify(msg) });
      } else {
        setErrors({ form: 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
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
          <div>
            <label>Confirm Password</label>
            <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            {errors.passwordConfirm && <div className="error">{errors.passwordConfirm}</div>}
          </div>
          {errors.form && <div className="error">{String(errors.form)}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
