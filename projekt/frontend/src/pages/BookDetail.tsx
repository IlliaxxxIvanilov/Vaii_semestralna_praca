import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBook } from '../services/bookService';

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const [book, setBook] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchBook(Number(id));
        setBook(data);
      } catch (e) { console.error(e); }
    })();
  }, [id]);

  if (!book) return <div>Loading...</div>;

  return (
    <div className="book-detail">
      <div className="detail-grid">
        <div className="cover-large">📗</div>
        <div>
          <h1>{book.title}</h1>
          <h4>{book.author}</h4>
          <p>{book.description}</p>
          <div className="detail-actions">
            <button className="btn">Rezervovať</button>
            <button className="btn ghost">Stiahnuť PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
