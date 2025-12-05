import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="page admin-page">
      <div className="page-header">
        <h2>Admin Panel</h2>
        <button className="btn">+ Pridať knihu</button>
      </div>
      <table className="table">
        <thead>
          <tr><th>Titul</th><th>Autor</th><th>Akcie</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Example Book</td>
            <td>Author</td>
            <td>
              <button className="btn small ghost">Edit</button>
              <button className="btn small">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
