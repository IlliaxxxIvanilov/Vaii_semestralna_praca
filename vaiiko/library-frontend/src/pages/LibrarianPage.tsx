import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Reservation } from '../types';
import { useAuth } from '../context/AuthContext';
import './LibrarianPage.css';

const LibrarianPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || (user?.role.name !== 'librarian' && user?.role.name !== 'admin')) {
      navigate('/');
      return;
    }
    fetchReservations();
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterReservations();
  }, [filter, reservations]);

  const fetchReservations = async (): Promise<void> => {
    try {
      const response = await api.get<{ data: Reservation[] }>('/reservations');
      setReservations(response.data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = (): void => {
    if (filter === 'all') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(r => r.status === filter));
    }
  };

  const handleUpdateStatus = async (
    id: number, 
    status: 'approved' | 'rejected' | 'returned',
    dueDate?: string
  ): Promise<void> => {
    try {
      const payload: any = { status };
      if (status === 'approved' && dueDate) {
        payload.due_date = dueDate;
      }

      await api.put(`/reservations/${id}/status`, payload);
      alert(`Rezervácia bola ${status === 'approved' ? 'schválená' : status === 'rejected' ? 'zamietnutá' : 'označená ako vrátená'}`);
      fetchReservations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Aktualizácia zlyhala');
    }
  };

  const handleApprove = (id: number): void => {
    const dueDate = prompt('Zadajte termín vrátenia (YYYY-MM-DD):');
    if (dueDate) {
      handleUpdateStatus(id, 'approved', dueDate);
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
    <div className="librarian-page">
      <div className="librarian-container">
        <div className="librarian-header">
          <h1>Knihovník Dashboard</h1>
          <p>Správa rezervácií a výpožičiek</p>
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Všetky ({reservations.length})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Čakajúce ({reservations.filter(r => r.status === 'pending').length})
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Schválené ({reservations.filter(r => r.status === 'approved').length})
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Zamietnuté ({reservations.filter(r => r.status === 'rejected').length})
          </button>
          <button
            className={filter === 'returned' ? 'active' : ''}
            onClick={() => setFilter('returned')}
          >
            Vrátené ({reservations.filter(r => r.status === 'returned').length})
          </button>
        </div>

        <div className="reservations-section">
          {filteredReservations.length === 0 ? (
            <div className="no-reservations">
              <p>Žiadne rezervácie na zobrazenie</p>
            </div>
          ) : (
            <div className="reservations-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Používateľ</th>
                    <th>Kniha</th>
                    <th>Autor</th>
                    <th>Dátum rezervácie</th>
                    <th>Termín vrátenia</th>
                    <th>Stav</th>
                    <th>Akcie</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.id}</td>
                      <td>{reservation.user?.name}</td>
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
                        <div className="action-buttons">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(reservation.id)}
                                className="btn-approve"
                              >
                                ✓ Schváliť
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(reservation.id, 'rejected')}
                                className="btn-reject"
                              >
                                ✗ Zamietnuť
                              </button>
                            </>
                          )}
                          {reservation.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(reservation.id, 'returned')}
                              className="btn-return"
                            >
                              ↩ Vrátiť
                            </button>
                          )}
                        </div>
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

export default LibrarianPage;