import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../services/bookService';
import BookCard from '../components/BookCard';

const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBooks();
        setFeatured(data.slice(0, 6));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="home-page">
      <section className="hero fullscreen">
        <div className="hero-inner">
          <h1>Vitaj v digitálnej knižnici</h1>
          <p>Objav knihy, rezervuj a čítaj — všetko online.</p>
          <div className="hero-search">
            <input placeholder="Vyhľadaj knihu, autora alebo žáner..." />
            <button className="btn">Vyhľadať knihu</button>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2>Featured knihy</h2>
        <div className="grid">
          {featured.map(b => <BookCard key={b.id} book={b} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
