import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const ReservationsPage: React.FC = () => {
  return (
    <div className="page reservations-page">
      <div className="page-header">
        <h2>Reservations</h2>
        <Button onClick={() => alert('Create reservation')}>New Reservation</Button>
      </div>
      <div className="grid">
        <Card>
          <h3>Book: Learn React</h3>
          <p>User: John Doe<br/>From: 2025-12-01 To: 2025-12-10</p>
        </Card>
        <Card>
          <h3>Book: TypeScript Guide</h3>
          <p>User: Jane Smith<br/>From: 2025-12-05 To: 2025-12-12</p>
        </Card>
      </div>
    </div>
  );
};

export default ReservationsPage;
