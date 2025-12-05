import React from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../services/authService';

const Sidebar: React.FC = () => {
  const user = getUser();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <h4>Quick</h4>
        <ul>
          <li><Link to="/books">All Books</Link></li>
          <li><Link to="/reservations">Reservations</Link></li>
          {user && user.role === 'admin' && (
            <li><Link to="/users">Users</Link></li>
          )}
        </ul>
      </div>
      <div className="sidebar-section">
        <h4>Filters</h4>
        <input className="sidebar-input" placeholder="Search title" />
      </div>
    </aside>
  );
};

export default Sidebar;
