import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Book, Rating } from '../types';
import { useAuth } from '../context/AuthContext';
import './BookDetailPage.css';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [reserving, setReserving] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBookDetails();
      fetchRatings();
    }
  }, [id]);

  const fetchBookDetails = async (): Promise<void> => {
    try {
      const response = await api.get<Book>(`/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (): Promise<void> => {
    try {
      const response = await api.get<{ data: Rating[] }>(`/books/${id}/ratings`);
      setRatings(response.data.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleReserve = async (): Promise<void> => {
    if (!isAuthenticated) {
      alert('Musíte sa prihlásiť na rezerváciu knihy');
      navigate('/login');
      return;
    }

    setReserving(true);
    try {
      await api.post('/reservations', { book_id: id });
      alert('Kniha bola úspešne rezervovaná!');
      fetchBookDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Rezervácia zlyhala');
    } finally {
      setReserving(false);
    }
  };

  const handleDownloadPdf = async (): Promise<void> => {
    if (!isAuthenticated) {
      alert('Musíte sa prihlásiť na stiahnutie PDF');
      navigate('/login');
      return;
    }

    try {
      const response = await api.get(`/books/${id}/download-pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book?.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Stiahnutie zlyhalo');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Musíte sa prihlásiť na hodnotenie knihy');
      navigate('/login');
      return;
    }

    if (userRating === 0) {
      alert('Vyberte hodnotenie');
      return;
    }

    try {
      await api.post(`/books/${id}/ratings`, {
        rating: userRating,
        review: userReview,
      });
      alert('Hodnotenie bolo pridané!');
      setUserRating(0);
      setUserReview('');
      fetchBookDetails();
      fetchRatings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Pridanie hodnotenia zlyhalo');
    }
  };

  if (loading) {
    return <div className="loading-page">Nahravam...</div>;
  }

  if (!book) {
    return <div className="error-page">Kniha nebola nájdená</div>;
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        <div className="book-detail-content">
          <div className="book-cover-large">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} />
            ) : (
              <div className="book-cover-placeholder-large">
                <span>📚</span>
              </div>
            )}
          </div>

          <div className="book-info-section">
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">od {book.author}</p>
            
            <div className="book-rating-display">
              <span className="star-large">⭐</span>
              <span className="rating-value-large">
                {book.average_rating.toFixed(1)}
              </span>
              <span className="rating-count">
                ({book.ratings_count} hodnotení)
              </span>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="book-categories">
                {book.categories.map((category) => (
                  <span key={category.id} className="category-badge">
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {book.isbn && (
              <p className="book-isbn">ISBN: {book.isbn}</p>
            )}

            <div className="book-availability">
              <span className={book.is_available ? 'available' : 'unavailable'}>
                {book.is_available 
                  ? `✓ Dostupné (${book.available_copies}/${book.total_copies})`
                  : '✗ Nedostupné'
                }
              </span>
            </div>

            <p className="book-description">{book.description}</p>

            <div className="book-actions">
              <button
                onClick={handleReserve}
                disabled={!book.is_available || reserving}
                className="btn-primary"
              >
                {reserving ? 'Rezervuje sa...' : 'Rezervovať knihu'}
              </button>

              {book.has_pdf && (
                <button
                  onClick={handleDownloadPdf}
                  className="btn-secondary"
                >
                  📥 Stiahnuť PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="rating-section">
            <h2>Ohodnoťte túto knihu</h2>
            <form onSubmit={handleSubmitRating} className="rating-form">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`star-btn ${star <= userRating ? 'active' : ''}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Napíšte recenziu (voliteľné)"
                className="review-textarea"
              />
              <button type="submit" className="btn-submit-rating">
                Odoslať hodnotenie
              </button>
            </form>
          </div>
        )}

        <div className="ratings-list-section">
          <h2>Recenzie ({ratings.length})</h2>
          {ratings.length === 0 ? (
            <p className="no-ratings">Zatiaľ žiadne recenzie</p>
          ) : (
            <div className="ratings-list">
              {ratings.map((rating) => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-header">
                    <span className="rating-user">{rating.user?.name}</span>
                    <span className="rating-stars">
                      {'⭐'.repeat(Math.round(rating.rating))}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="rating-review">{rating.review}</p>
                  )}
                  <span className="rating-date">
                    {new Date(rating.created_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;