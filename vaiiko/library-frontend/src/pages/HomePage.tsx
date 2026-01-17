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
      setPopularBooks(response.data);
    } catch (error) {
      console.error('Error fetching popular books:', error);
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
          <h1 className="hero-title">Online kniznica</h1>
          <p className="hero-subtitle">
            Citajte tisic knih online — lahko a zadarmo
          </p>
          <div className="hero-search">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      <section className="popular-section">
        <div className="section-container">
          <h2 className="section-title">Popularne knihu</h2>
          
          {loading ? (
            <div className="loading">Nahravam...</div>
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