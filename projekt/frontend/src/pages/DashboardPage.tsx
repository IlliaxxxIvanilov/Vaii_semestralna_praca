import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="page dashboard-page">
      <h2>Moje rezervácie</h2>
      <table className="table">
        <thead>
          <tr><th>Kniha</th><th>Stav</th><th>Dátum</th><th>Akcia</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Duna</td>
            <td className="status success">SCHVÁLENÁ</td>
            <td>12.5.2025</td>
            <td><button className="btn ghost">Zrušiť</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DashboardPage;
