import React, { useState } from 'react';

type Props = {
  onSwitch?: (view: 'login' | 'register' | 'main') => void;
};

export default function Login({ onSwitch }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Login failed');
        return;
      }

      if (data.token) {
        localStorage.setItem('api_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Prihlásenie úspešné');
        // navigate to main
        if (onSwitch) onSwitch('main');
      } else {
        setMessage('Prihlásenie: odpoveď bez tokenu');
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
      <h2>Prihlásenie</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Heslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">Prihlásiť</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Nemáš účet? <button onClick={() => onSwitch && onSwitch('register')}>Zaregistruj sa</button>
      </p>
    </div>
  );
}
