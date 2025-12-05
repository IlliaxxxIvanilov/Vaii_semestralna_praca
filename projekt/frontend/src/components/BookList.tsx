import React, { useState, useEffect } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

type Book = {
  id: number;
  title: string;
  author: string;
};

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');

  const loadBooks = async (query = '') => {
    const res = await axios.get('http://localhost:8000/api/books', { params: { search: query } });
    setBooks(res.data);
  };

  const debouncedSearch = React.useMemo(
    () => debounce((q: string) => loadBooks(q), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(search);
    return debouncedSearch.cancel;
  }, [search, debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search books..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="book-list">
        {books.map(book => (
          <div className="card" key={book.id}>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
