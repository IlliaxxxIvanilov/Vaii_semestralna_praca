import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const UsersPage: React.FC = () => {
  return (
    <div className="page users-page">
      <div className="page-header">
        <h2>Users</h2>
        <Button onClick={() => alert('Create user flow')}>Create User</Button>
      </div>
      <div className="grid">
        <Card>
          <h3>John Doe</h3>
          <p>john@example.com</p>
        </Card>
        <Card>
          <h3>Jane Smith</h3>
          <p>jane@example.com</p>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;
