import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📖</span>
          <span className="logo-text">Library Management System</span>
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/catalog">Katalog</Link>
          </li>
          <li>
            <Link to="/new">Novinky</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard">Moje rezervacie</Link>
              </li>
              
              {user?.role.name === 'librarian' && (
                <li>
                  <Link to="/librarian">Knihovnik</Link>
                </li>
              )}
              
              {user?.role.name === 'admin' && (
                <li>
                  <Link to="/admin">Admin</Link>
                </li>
              )}
              
              <li>
                <span className="user-name">{user?.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Odhlasit sa
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn-login">
                  Prihlasit sa
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn-register">
                  Registrovat sa
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;