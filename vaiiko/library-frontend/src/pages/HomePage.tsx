import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Book } from '../types';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularBooks();
  }, []);

  const fetchPopularBooks = async () => {
    try {
      const response = await api.get('/books/popular');
      if (Array.isArray(response.data)) {
        setPopularBooks(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setPopularBooks(response.data.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setPopularBooks([]);
      }
    } catch (error) {
      console.error('Error fetching popular books:', error);
      setPopularBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Online knižnica</h1>
          <p className="hero-subtitle">
            Čítajte tisíce kníh online — jednoducho, prehľadne a zadarmo
          </p>
          <div className="hero-search">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      <section className="popular-section">
        <div className="section-container">
          <h2 className="section-title">Populárne knihy</h2>
          
          {loading ? (
            <div className="loading">Nahrávam...</div>
          ) : popularBooks.length === 0 ? (
            <div className="loading">Žiadne knihy k dispozícii</div>
          ) : (
            <div className="books-grid">
              {popularBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;