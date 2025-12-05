import React from 'react';
import './App.css'

type Props = {
  onLogout?: () => void;
};

export default function MainPage({ onLogout }: Props) {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  async function handleLogout() {
    const token = localStorage.getItem('api_token');
    try {
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Logout error:', e.message);
      } else {
        console.error('Logout error:', e);
      }
    }

    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h1>Hlavná stránka</h1>
      {user ? (
        <div>
          <p>Vitaj, {user.name} ({user.email})</p>
          <p>Rola: {user.role}</p>
        </div>
      ) : (
        <p>Nie ste prihlásený.</p>
      )}

      <button onClick={handleLogout}>Odhlásiť</button>
    </div>
  );
}
