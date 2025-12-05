import React, { useEffect, useMemo, useState } from 'react';
import BookCard from '../components/BookCard';
import { fetchBooks } from '../services/bookService';
import debounce from 'lodash.debounce';

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');

  const load = async (q = '') => {
    const data = await fetchBooks(q);
    setBooks(data);
  };

  const debounced = useMemo(() => debounce((q: string) => load(q), 300), []);

  useEffect(() => {
    debounced(search);
    return debounced.cancel;
  }, [search, debounced]);

  useEffect(() => { load(); }, []);

  const filtered = books.filter(b => author ? b.author?.toLowerCase().includes(author.toLowerCase()) : true);

  return (
    <div className="catalog-page">
      <div className="page-header">
        <h2>Katalóg kníh</h2>
        <div className="filters">
          <input placeholder="Hľadaj podľa názvu..." value={search} onChange={e => setSearch(e.target.value)} />
          <input placeholder="Autor" value={author} onChange={e => setAuthor(e.target.value)} />
        </div>
      </div>
      <div className="grid">
        {filtered.map(b => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
};

export default BooksPage;
