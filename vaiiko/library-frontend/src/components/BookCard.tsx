import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const rating = typeof book.average_rating === 'number' ? book.average_rating : 0;
  
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-cover">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} />
        ) : (
          <div className="book-cover-placeholder">
            <span>📚</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">
          <span className="star">⭐</span>
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;