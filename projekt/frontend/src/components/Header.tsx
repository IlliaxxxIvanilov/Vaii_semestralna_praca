import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <Link to="/" className="brand-link">
            <div className="logo-placeholder">📚</div>
            <span className="brand-title">Library</span>
          </Link>
        </div>
        <nav className="top-nav">
          <Link to="/books">Katalóg</Link>
          <Link to="/reservations">Rezervácie</Link>
          {user ? (
            <>
              <Link to="/dashboard">{user.name}</Link>
              <button onClick={handleLogout} className="btn small">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Prihlásenie</Link>
              <Link to="/register">Registrácia</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
