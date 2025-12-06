// src/pages/AdminUsersPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getUser } from '../services/authService'; // ← potrebujeme aktuálneho admina

type User = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string; // napr. "user", "librarian", "admin"
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Aktuálne prihlásený admin (aby sa nemohol zmazať sám seba)
  const currentUser = getUser();
  const currentUserId = currentUser?.id;

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      alert('Nepodarilo sa načítať používateľov');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleLibrarian = async (userId: number) => {
  if (!confirm('Zmeniť rolu na knihovníka / späť na používateľa?')) return;

  try {
    const res = await api.post(`/users/${userId}/toggle-librarian`);

    // Toto je jediný riadok, ktorý sa spolieha na správnu odpoveď z backendu
    setUsers(users.map(u =>
      u.id === userId
        ? {
            ...u,
            role_id: res.data.user.role_id,
            role_name: res.data.role_name   // ← tu sa aktualizuje text aj farba
          }
        : u
    ));
  } catch (error) {
    alert('Chyba: ' + error + 'Nepodarilo sa zmeniť rolu');
  }
};

  const deleteUser = async (id: number) => {
    if (!confirm('Naozaj chceš zmazať tohto používateľa?')) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Chyba pri mazaní používateľa');
      console.error(error);
    }
  };

  if (loading) return <div>Načítavam používateľov...</div>;

  return (
    <div className="page">
      <h2>Správa používateľov</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Meno</th>
            <th>Email</th>
            <th>Rola</th>
            <th>Akcie</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>

              <td>
                {user.role_name === 'librarian' ? (
                  <span style={{ color: '#27ae60', fontWeight: 600 }}>Knihovník</span>
                ) : user.role_name === 'admin' ? (
                  <span style={{ color: '#c0392b', fontWeight: 600 }}>Admin</span>
                ) : (
                  <span>Používateľ</span>
                )}
              </td>

              <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Tlačidlo na prepnutie user ↔ librarian */}
                {user.role_name !== 'admin' && (
                  <button
                    onClick={() => toggleLibrarian(user.id)}
                    className="btn small"
                    style={{
                      background: user.role_name === 'librarian' ? '#27ae60' : '#3498db',
                      color: 'white'
                    }}
                  >
                    {user.role_name === 'librarian' ? 'Odobrať knihovníka' : 'Urobiť knihovníkom'}
                  </button>
                )}

                {/* Tlačidlo na zmazanie (okrem seba a adminov) */}
                {user.role_name !== 'admin' && user.id !== currentUserId && (
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="btn small"
                    style={{ background: '#e74c3c', color: 'white' }}
                  >
                    Zmazať
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;