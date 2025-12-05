import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  book: { id: number; title: string; author: string; description?: string };
};

const BookCard: React.FC<Props> = ({ book }) => {
  return (
    <article className="book-card">
      <div className="cover-placeholder">📘</div>
      <div className="book-meta">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-desc">{book.description?.slice(0, 120) ?? 'No description'}</p>
        <div className="book-actions">
          <Link className="btn small" to={`/books/${book.id}`}>Details</Link>
          <button className="btn small ghost">Reserve</button>
          <button className="btn small ghost">Download</button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
