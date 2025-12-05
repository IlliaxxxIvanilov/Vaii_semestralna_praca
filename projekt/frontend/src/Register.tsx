import React, { useState } from 'react';

type Props = {
  onSwitch?: (view: 'login' | 'register' | 'main') => void;
};

export default function Register({ onSwitch }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirm }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(JSON.stringify(data.errors || data.message || 'Registration failed'));
        return;
      }

      
      if (data.token) {
        localStorage.setItem('api_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Registrácia úspešná — prihlásený');
        if (onSwitch) onSwitch('main');
      } else {
        setMessage('Registrácia úspešná — používateľ uložený do databázy');
      }
    } catch (err: unknown) {
      let msg = 'Chyba sieťového spojenia';
      if (typeof err === 'string') {
        msg = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any).message ?? msg;
      }
      setMessage(msg);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2>Registrácia</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Meno</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Heslo</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Potvrď heslo</label>
          <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {/* Role selection removed from public registration - server enforces role */}
        <button type="submit">Registrovať</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Máš účet? <button onClick={() => onSwitch && onSwitch('login')}>Prihlás sa</button>
      </p>
    </div>
  );
}
