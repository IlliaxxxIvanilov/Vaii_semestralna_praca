import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Reservation } from '../types';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyReservations();
  }, [isAuthenticated]);

  const fetchMyReservations = async (): Promise<void> => {
    try {
      const response = await api.get<Reservation[]>('/reservations/my');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: number): Promise<void> => {
    if (!window.confirm('Naozaj chcete zrušiť túto rezerváciu?')) {
      return;
    }

    try {
      await api.put(`/reservations/${id}/cancel`);
      alert('Rezervácia bola zrušená');
      fetchMyReservations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Zrušenie zlyhalo');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; text: string }> = {
      pending: { class: 'status-pending', text: 'Čaká sa' },
      approved: { class: 'status-approved', text: 'Schválené' },
      rejected: { class: 'status-rejected', text: 'Zamietnuté' },
      returned: { class: 'status-returned', text: 'Vrátené' },
    };

    const statusInfo = statusMap[status] || { class: '', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading-page">Nahrávam...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Môj dashboard</h1>
          <p className="user-greeting">Vitajte, {user?.name}!</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">
              {reservations.filter(r => r.status === 'pending').length}
            </div>
            <div className="stat-label">Čakajúce</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {reservations.filter(r => r.status === 'approved').length}
            </div>
            <div className="stat-label">Schválené</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {reservations.length}
            </div>
            <div className="stat-label">Celkom</div>
          </div>
        </div>

        <div className="reservations-section">
          <h2>Moje rezervácie</h2>
          
          {reservations.length === 0 ? (
            <div className="no-reservations">
              <p>Nemáte žiadne rezervácie</p>
              <button onClick={() => navigate('/catalog')} className="btn-browse">
                Prehľadať katalóg
              </button>
            </div>
          ) : (
            <div className="reservations-table">
              <table>
                <thead>
                  <tr>
                    <th>Kniha</th>
                    <th>Autor</th>
                    <th>Dátum rezervácie</th>
                    <th>Termín vrátenia</th>
                    <th>Stav</th>
                    <th>Akcie</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <div className="book-cell">
                          {reservation.book?.cover_url && (
                            <img 
                              src={reservation.book.cover_url} 
                              alt={reservation.book.title}
                              className="book-thumbnail"
                            />
                          )}
                          <span>{reservation.book?.title}</span>
                        </div>
                      </td>
                      <td>{reservation.book?.author}</td>
                      <td>{new Date(reservation.reserved_at).toLocaleDateString('sk-SK')}</td>
                      <td>
                        {reservation.due_date 
                          ? new Date(reservation.due_date).toLocaleDateString('sk-SK')
                          : '-'
                        }
                      </td>
                      <td>{getStatusBadge(reservation.status)}</td>
                      <td>
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="btn-cancel"
                          >
                            Zrušiť
                          </button>
                        )}
                        {reservation.status === 'approved' && reservation.book?.has_pdf && (
                          <button
                            onClick={() => navigate(`/books/${reservation.book_id}`)}
                            className="btn-view"
                          >
                            Zobraziť
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;